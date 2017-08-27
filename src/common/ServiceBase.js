// @flow

import Immutable, { List, Map } from 'immutable';
import { Exception } from 'micro-business-common-javascript';
import { ParseWrapperService } from 'micro-business-parse-server-common';
import {
  CrawlResultService,
  CrawlSessionService,
  ProductPriceService,
  StoreService,
  StoreProductService,
  StoreTagService,
} from 'trolley-smart-parse-server-common';

export default class ServiceBase {
  constructor(storeName, { sessionToken, logVerboseFunc, logInfoFunc, logErrorFunc } = {}) {
    this.storeName = storeName;
    this.sessionToken = sessionToken;
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;
    this.config = null;
  }

  getConfig = async () => {
    if (this.config) {
      return this.config;
    }

    const configs = await ParseWrapperService.getConfig();
    const config = configs.get(this.storeName);

    if (config) {
      this.config = Immutable.fromJS(config);

      return this.config;
    }

    throw new Exception(`Failed to retrieve configuration for ${this.storeName} store crawler.`);
  };

  createNewCrawlSession = async (sessionKey) => {
    const config = await this.getConfig();
    const crawlSessionService = new CrawlSessionService();
    const sessionId = await crawlSessionService.create(Map({ sessionKey, startDateTime: new Date() }), null, this.sessionToken);

    this.logInfo(config, () => `Created session. Session Id: ${sessionId}`);

    return crawlSessionService.read(sessionId, null, this.sessionToken);
  };

  getStore = async () => {
    const criteria = Map({
      conditions: Map({
        key: this.storeName,
      }),
    });

    const storeService = new StoreService();
    const results = await storeService.search(criteria, this.sessionToken);

    if (results.isEmpty()) {
      return storeService.read(
        await storeService.create(Map({ key: this.storeName }, null, this.sessionToken), null, this.sessionToken),
        null,
        this.sessionToken,
      );
    } else if (results.count() === 1) {
      return results.first();
    }

    throw new Exception(`Multiple store found with store key: ${this.storeName}.`);
  };

  getMostRecentCrawlSessionInfo = async (sessionKey) => {
    const crawlSessionService = new CrawlSessionService();

    const crawlSessionInfos = await crawlSessionService.search(
      Map({
        conditions: Map({
          sessionKey,
        }),
        topMost: true,
      }),
      this.sessionToken,
    );

    if (crawlSessionInfos.isEmpty()) {
      throw new Exception(`No crawl session found with session key: ${sessionKey}.`);
    } else if (crawlSessionInfos.count() > 1) {
      throw new Exception(`Multiple crawl session found with session key: ${sessionKey}.`);
    }

    return crawlSessionInfos.first();
  };

  getMostRecentCrawlResults = async (sessionKey, mapFunc, sessionToken) => {
    const crawlSessionInfo = await this.getMostRecentCrawlSessionInfo(sessionKey, sessionToken);
    const crawlSessionId = crawlSessionInfo.get('id');
    let results = List();
    const result = CrawlResultService.searchAll(
      Map({
        conditions: Map({
          crawlSessionId,
        }),
      }),
      sessionToken,
    );

    try {
      result.event.subscribe((info) => {
        results = results.push(mapFunc ? mapFunc(info) : info);
      });

      await result.promise;
    } finally {
      result.event.unsubscribeAll();
    }

    return results;
  };

  getStoreTags = async (storeId, includeTag, sessionToken) => {
    const result = StoreTagService.searchAll(Map({ includeTag, conditions: Map({ storeId }) }), sessionToken);

    try {
      let storeTags = List();

      result.event.subscribe((info) => {
        storeTags = storeTags.push(info);
      });

      await result.promise;

      return storeTags;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  createOrUpdateStoreProduct = async (productCategory, productInfo, storeId, sessionToken) => {
    const storeMasterProducts = await StoreProductService.search(
      Map({
        conditions: Map({
          productPageUrl: productInfo.get('productPageUrl'),
          storeId,
        }),
      }),
      sessionToken,
    );

    if (storeMasterProducts.isEmpty()) {
      await StoreProductService.create(
        Map({
          productPageUrl: productInfo.get('productPageUrl'),
          lastCrawlDateTime: new Date(1970, 1, 1),
          storeId,
        }),
        null,
        sessionToken,
      );
    } else if (storeMasterProducts.count() > 1) {
      throw new Exception(`Multiple store master product found for store Id: ${storeId} and productPageUrl: ${productInfo.get('productPageUrl')}`);
    } else {
      const storeMasterProduct = storeMasterProducts.first();
      const updatedStoreProduct = storeMasterProduct.set('productPageUrl', productInfo.get('productPageUrl'));

      await StoreProductService.update(updatedStoreProduct, sessionToken);
    }
  };

  createOrUpdateLevelOneProductCategory = async (productCategory, storeTags, storeId, sessionToken) => {
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0);

    if (foundStoreTag) {
      await StoreTagService.update(
        foundStoreTag.merge(
          Map({
            name: productCategory.get('name'),
            weight: productCategory.get('weigth'),
            url: productCategory.get('url'),
          }),
        ),
        sessionToken,
      );
    } else {
      await StoreTagService.create(
        Map({
          key: productCategory.get('categoryKey'),
          storeId,
          name: productCategory.get('name'),
          weight: 1,
          url: productCategory.get('url'),
        }),
        null,
        sessionToken,
      );
    }
  };

  createOrUpdateLevelTwoProductCategory = async (productCategory, storeTags, storeId, sessionToken) => {
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.first().get('categoryKey')) === 0);
    const parentStoreTagIds = productCategory
      .map(_ => _.get('parent'))
      .map(parent => storeTags.find(storeTag => storeTag.get('key').localeCompare(parent) === 0))
      .map(_ => _.get('id'));

    if (foundStoreTag) {
      await StoreTagService.update(
        foundStoreTag.merge(
          Map({
            storeTagIds: parentStoreTagIds,
            name: productCategory.first().get('name'),
            weight: productCategory.first().get('weigth'),
            url: productCategory.first().get('url'),
          }),
        ),
        sessionToken,
      );
    } else {
      await StoreTagService.create(
        Map({
          key: productCategory.first().get('categoryKey'),
          storeId,
          storeTagIds: parentStoreTagIds,
          name: productCategory.first().get('name'),
          weight: 2,
          url: productCategory.first().get('url'),
        }),
        null,
        sessionToken,
      );
    }
  };

  createOrUpdateLevelThreeProductCategory = async (productCategory, storeTags, storeId, sessionToken) => {
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.first().get('categoryKey')) === 0);
    const parentStoreTagIds = productCategory
      .map(_ => _.get('parent'))
      .map(parent => storeTags.find(storeTag => storeTag.get('key').localeCompare(parent) === 0))
      .map(_ => _.get('id'));

    if (foundStoreTag) {
      await StoreTagService.update(
        foundStoreTag.merge(
          Map({
            storeTagIds: parentStoreTagIds,
            name: productCategory.first().get('name'),
            weight: productCategory.first().get('weigth'),
            url: productCategory.first().get('url'),
          }),
        ),
        sessionToken,
      );
    } else {
      await StoreTagService.create(
        Map({
          key: productCategory.first().get('categoryKey'),
          storeId,
          storeTagIds: parentStoreTagIds,
          name: productCategory.first().get('name'),
          weight: 3,
          url: productCategory.first().get('url'),
        }),
        null,
        sessionToken,
      );
    }
  };

  getAllStoreProducts = async (storeId, sessionToken) => {
    const criteria = Map({
      includeMasterProduct: true,
      conditions: Map({
        storeId,
      }),
    });

    const result = StoreProductService.searchAll(criteria, sessionToken);

    try {
      let products = List();

      result.event.subscribe((info) => {
        products = products.push(info);
      });

      await result.promise;

      return products;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  getAllStoreProductsWithoutMasterProduct = async (storeId, sessionToken) => {
    const criteria = Map({
      conditions: Map({
        storeId,
        without_masterProduct: true,
      }),
    });

    const result = StoreProductService.searchAll(criteria, sessionToken);

    try {
      let products = List();

      result.event.subscribe((info) => {
        products = products.push(info);
      });

      await result.promise;

      return products;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  getStoreProductsWithMasterProductCriteria = (storeId, lastCrawlDateTime) =>
    Map({
      includeMasterProduct: true,
      conditions: Map({
        storeId,
        with_masterProduct: true,
        lessThanOrEqualTo_lastCrawlDateTime: lastCrawlDateTime,
      }),
    });

  getStoreProductsWithMasterProduct = async (storeId, lastCrawlDateTime, sessionToken) =>
    StoreProductService.search(this.getStoreProductsWithMasterProductCriteria(storeId, lastCrawlDateTime).set('limit', 1000), sessionToken);

  getAllStoreProductsWithMasterProduct = async (storeId, lastCrawlDateTime, sessionToken) => {
    const result = StoreProductService.searchAll(this.getStoreProductsWithMasterProductCriteria(storeId, lastCrawlDateTime), sessionToken);

    try {
      let products = List();

      result.event.subscribe((info) => {
        products = products.push(info);
      });

      await result.promise;

      return products;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  removeDollarSignFromPrice = priceWithDollarSign => parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());

  getActiveMasterProductPrices = async (masterProductId, storeId, sessionToken) => {
    const criteria = Map({
      conditions: Map({
        masterProductId,
        storeId,
        status: 'A',
      }),
    });

    return ProductPriceService.search(criteria, sessionToken);
  };

  createOrUpdateMasterProductPrice = async (masterProductId, storeId, masterProductPrice, priceDetails, sessionToken) => {
    const masterProductPrices = await this.getActiveMasterProductPrices(masterProductId, storeId, sessionToken);

    if (!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice')) {
      if (!masterProductPrices.isEmpty()) {
        await Promise.all(masterProductPrices.map(_ => ProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray());
      }

      return;
    }

    if (masterProductPrices.isEmpty()) {
      await ProductPriceService.create(masterProductPrice.set('firstCrawledDate', new Date()), null, sessionToken);
    } else {
      const notMatchedMasterProductPrices = masterProductPrices.filterNot(_ => _.get('priceDetails').equals(priceDetails));

      if (!notMatchedMasterProductPrices.isEmpty()) {
        await Promise.all(notMatchedMasterProductPrices.map(_ => ProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray());
      }

      const matchedMasterProductPrices = masterProductPrices.filter(_ => _.get('priceDetails').equals(priceDetails));

      if (matchedMasterProductPrices.count() > 1) {
        await Promise.all(matchedMasterProductPrices.skip(1).map(_ => ProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray());
      } else if (matchedMasterProductPrices.count() === 0) {
        await ProductPriceService.create(masterProductPrice.set('firstCrawledDate', new Date()), null, sessionToken);
      }
    }
  };

  safeGetUri = res => (res && res.request && res.request.uri ? res.request.uri.href : '');

  logVerbose = (config, messageFunc) => {
    if (this.logVerboseFunc && config && config.get('logLevel') && config.get('logLevel') >= 3 && messageFunc) {
      this.logVerboseFunc(messageFunc());
    }
  };

  logInfo = (config, messageFunc) => {
    if (this.logInfoFunc && config && config.get('logLevel') && config.get('logLevel') >= 2 && messageFunc) {
      this.logInfoFunc(messageFunc());
    }
  };

  logError = (config, messageFunc) => {
    if (this.logErrorFunc && config && config.get('logLevel') && config.get('logLevel') >= 1 && messageFunc) {
      this.logErrorFunc(messageFunc());
    }
  };
}
