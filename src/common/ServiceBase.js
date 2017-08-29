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
  constructor(storeKey, { sessionToken, logVerboseFunc, logInfoFunc, logErrorFunc } = {}) {
    this.storeKey = storeKey;
    this.sessionToken = sessionToken;
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;
    this.config = null;
    this.store = null;
  }

  getConfig = async () => {
    if (this.config) {
      return this.config;
    }

    const configs = await ParseWrapperService.getConfig();
    const config = configs.get(this.storeKey);

    if (config) {
      this.config = Immutable.fromJS(config);

      return this.config;
    }

    throw new Exception(`Failed to retrieve configuration for ${this.storeKey} store crawler.`);
  };

  createNewCrawlSession = async (sessionKey) => {
    const config = await this.getConfig();
    const crawlSessionService = new CrawlSessionService();
    const sessionId = await crawlSessionService.create(Map({ sessionKey, startDateTime: new Date() }), null, this.sessionToken);

    this.logInfo(config, () => `Created session. Session Id: ${sessionId}`);

    return crawlSessionService.read(sessionId, null, this.sessionToken);
  };

  getStore = async () => {
    if (this.store) {
      return this.store;
    }

    const criteria = Map({
      conditions: Map({
        key: this.storeKey,
      }),
    });

    const storeService = new StoreService();
    const results = await storeService.search(criteria, this.sessionToken);

    if (results.count() > 1) {
      throw new Exception(`Multiple store found with store key: ${this.storeKey}.`);
    }

    this.store = results.isEmpty()
      ? await storeService.read(
        await storeService.create(Map({ key: this.storeKey }, null, this.sessionToken), null, this.sessionToken),
        null,
        this.sessionToken,
      )
      : results.first();

    return this.store;
  };

  getStoreId = async () => (await this.getStore()).get('id');

  getMostRecentCrawlSessionInfo = async (sessionKey) => {
    const crawlSessionInfos = await new CrawlSessionService().search(
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

  getMostRecentCrawlResults = async (sessionKey, mapFunc) => {
    const crawlSessionInfo = await this.getMostRecentCrawlSessionInfo(sessionKey, this.sessionToken);
    const crawlSessionId = crawlSessionInfo.get('id');
    let results = List();
    const result = new CrawlResultService().searchAll(
      Map({
        conditions: Map({
          crawlSessionId,
        }),
      }),
      this.sessionToken,
    );

    try {
      result.event.subscribe((info) => {
        results = results.push(mapFunc ? mapFunc(info) : info);
      });

      await result.promise;

      return results;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  getStoreTags = async (includeTag) => {
    const storeId = await this.getStoreId();
    const result = new StoreTagService().searchAll(Map({ includeTag, conditions: Map({ storeId }) }), this.sessionToken);

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

  createOrUpdateStoreProduct = async (productCategory, productInfo) => {
    const storeId = await this.getStoreId();
    const storeProductService = new StoreProductService();
    const storeProducts = await storeProductService.search(
      Map({
        conditions: Map({
          productPageUrl: productInfo.get('productPageUrl'),
          storeId,
        }),
      }),
      this.sessionToken,
    );

    if (storeProducts.isEmpty()) {
      await StoreProductService.create(
        Map({
          productPageUrl: productInfo.get('productPageUrl'),
          lastCrawlDateTime: new Date(1970, 1, 1),
          storeId,
        }),
        null,
        this.sessionToken,
      );
    } else if (storeProducts.count() > 1) {
      throw new Exception(`Multiple store product found for store Id: ${storeId} and productPageUrl: ${productInfo.get('productPageUrl')}`);
    } else {
      const storeProduct = storeProducts.first();
      const updatedStoreProduct = storeProduct.set('productPageUrl', productInfo.get('productPageUrl'));

      await storeProductService.update(updatedStoreProduct, this.sessionToken);
    }
  };

  createOrUpdateLevelOneProductCategory = async (productCategory, storeTags) => {
    const storeId = await this.getStoreId();
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0);
    const storeTagService = StoreTagService();

    if (foundStoreTag) {
      await storeTagService.update(
        foundStoreTag.merge(
          Map({
            name: productCategory.get('name'),
            level: productCategory.get('level'),
            url: productCategory.get('url'),
          }),
        ),
        this.sessionToken,
      );
    } else {
      await storeTagService.create(
        Map({
          key: productCategory.get('categoryKey'),
          storeId,
          name: productCategory.get('name'),
          level: 1,
          url: productCategory.get('url'),
        }),
        null,
        this.sessionToken,
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
      includeProduct: true,
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

  getAllStoreProductsWithoutProduct = async (storeId, sessionToken) => {
    const criteria = Map({
      conditions: Map({
        storeId,
        without_product: true,
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

  getStoreProductsWithProductCriteria = (storeId, lastCrawlDateTime) =>
    Map({
      includeProduct: true,
      conditions: Map({
        storeId,
        with_product: true,
        lessThanOrEqualTo_lastCrawlDateTime: lastCrawlDateTime,
      }),
    });

  getStoreProductsWithProduct = async (storeId, lastCrawlDateTime, sessionToken) =>
    StoreProductService.search(this.getStoreProductsWithProductCriteria(storeId, lastCrawlDateTime).set('limit', 1000), sessionToken);

  getAllStoreProductsWithProduct = async (storeId, lastCrawlDateTime, sessionToken) => {
    const result = StoreProductService.searchAll(this.getStoreProductsWithProductCriteria(storeId, lastCrawlDateTime), sessionToken);

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

  getActiveProductPrices = async (productId, storeId, sessionToken) => {
    const criteria = Map({
      conditions: Map({
        productId,
        storeId,
        status: 'A',
      }),
    });

    return ProductPriceService.search(criteria, sessionToken);
  };

  createOrUpdateProductPrice = async (productId, storeId, productPrice, priceDetails, sessionToken) => {
    const productPrices = await this.getActiveProductPrices(productId, storeId, sessionToken);

    if (!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice')) {
      if (!productPrices.isEmpty()) {
        await Promise.all(productPrices.map(_ => ProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray());
      }

      return;
    }

    if (productPrices.isEmpty()) {
      await ProductPriceService.create(productPrice.set('firstCrawledDate', new Date()), null, sessionToken);
    } else {
      const notMatchedProductPrices = productPrices.filterNot(_ => _.get('priceDetails').equals(priceDetails));

      if (!notMatchedProductPrices.isEmpty()) {
        await Promise.all(notMatchedProductPrices.map(_ => ProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray());
      }

      const matchedProductPrices = productPrices.filter(_ => _.get('priceDetails').equals(priceDetails));

      if (matchedProductPrices.count() > 1) {
        await Promise.all(matchedProductPrices.skip(1).map(_ => ProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray());
      } else if (matchedProductPrices.count() === 0) {
        await ProductPriceService.create(productPrice.set('firstCrawledDate', new Date()), null, sessionToken);
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
