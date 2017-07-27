// @flow

import Immutable, { List, Map, Range } from 'immutable';
import { Exception, ParseWrapperService } from 'micro-business-parse-server-common';
import {
  CrawlResultService,
  CrawlSessionService,
  MasterProductPriceService,
  StoreService,
  StoreMasterProductService,
  StoreTagService,
} from 'smart-grocery-parse-server-common';

export default class ServiceBase {
  constructor({ logVerboseFunc, logInfoFunc, logErrorFunc }) {
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;
  }

  splitIntoChunks = (list, chunkSize) => Range(0, list.count(), chunkSize).map(chunkStart => list.slice(chunkStart, chunkStart + chunkSize));

  getConfig = async (key) => {
    const configs = await ParseWrapperService.getConfig();
    const config = configs.get(key);

    if (config) {
      return Immutable.fromJS(config);
    }

    throw new Exception(`No config found called ${key}.`);
  };

  createNewCrawlSessionAndGetConfig = async (sessionKey, config, storeName, sessionToken) => {
    const sessionInfo = Map({
      sessionKey,
      startDateTime: new Date(),
    });
    const sessionId = await CrawlSessionService.create(sessionInfo, null, sessionToken);
    const finalConfig = config || (await this.getConfig(storeName));

    if (!finalConfig) {
      throw new Exception(`Failed to retrieve configuration for ${storeName} store crawler.`);
    }

    this.logInfo(finalConfig, () => `Created session and retrieved config. Session Id: ${sessionId}`);
    this.logVerbose(finalConfig, () => `Config: ${JSON.stringify(finalConfig)}`);

    return Map({
      sessionInfo: sessionInfo.set('id', sessionId),
      config: finalConfig,
    });
  };

  getStore = async (key, sessionToken) => {
    const criteria = Map({
      conditions: Map({
        key,
      }),
    });

    const results = await StoreService.search(criteria, sessionToken);

    if (results.isEmpty()) {
      return StoreService.read(await StoreService.create(Map({ key }, null, sessionToken), null, sessionToken));
    } else if (results.count() === 1) {
      return results.first();
    }

    throw new Exception(`Multiple store found with provided key: ${key}.`);
  };

  getMostRecentCrawlSessionInfo = async (sessionKey, sessionToken) => {
    const crawlSessionInfos = await CrawlSessionService.search(
      Map({
        conditions: Map({
          sessionKey,
        }),
        topMost: true,
      }),
      sessionToken,
    );

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

  createOrUpdateStoreMasterProduct = async (productCategory, productInfo, storeId, sessionToken) => {
    const storeMasterProducts = await StoreMasterProductService.search(
      Map({
        conditions: Map({
          productPageUrl: productInfo.get('productPageUrl'),
          storeId,
        }),
      }),
      sessionToken,
    );

    if (storeMasterProducts.isEmpty()) {
      await StoreMasterProductService.create(
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
      const updatedStoreMasterProduct = storeMasterProduct.set('productPageUrl', productInfo.get('productPageUrl'));

      await StoreMasterProductService.update(updatedStoreMasterProduct, sessionToken);
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

  getAllStoreMasterProducts = async (storeId, sessionToken) => {
    const criteria = Map({
      conditions: Map({
        storeId,
      }),
    });

    const result = StoreMasterProductService.searchAll(criteria, sessionToken);

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

  getAllStoreMasterProductsWithoutMasterProduct = async (storeId, sessionToken) => {
    const criteria = Map({
      conditions: Map({
        storeId,
        without_masterProduct: true,
      }),
    });

    const result = StoreMasterProductService.searchAll(criteria, sessionToken);

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

  getStoreMasterProductsWithMasterProductCriteria = (storeId, lastCrawlDateTime) =>
    Map({
      conditions: Map({
        storeId,
        with_masterProduct: true,
        lessThanOrEqualTo_lastCrawlDateTime: lastCrawlDateTime,
      }),
    });

  getStoreMasterProductsWithMasterProduct = async (storeId, lastCrawlDateTime, sessionToken) =>
    StoreMasterProductService.search(
      this.getStoreMasterProductsWithMasterProductCriteria(storeId, lastCrawlDateTime).set('limit', 1000),
      sessionToken,
    );

  getAllStoreMasterProductsWithMasterProduct = async (storeId, lastCrawlDateTime, sessionToken) => {
    const result = StoreMasterProductService.searchAll(
      this.getStoreMasterProductsWithMasterProductCriteria(storeId, lastCrawlDateTime),
      sessionToken,
    );

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

    return MasterProductPriceService.search(criteria, sessionToken);
  };

  createOrUpdateMasterProductPrice = async (masterProductId, storeId, masterProductPrice, priceDetails, sessionToken) => {
    const masterProductPrices = await this.getActiveMasterProductPrices(masterProductId, storeId, sessionToken);

    if (!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice')) {
      if (!masterProductPrices.isEmpty()) {
        await Promise.all(masterProductPrices.map(_ => MasterProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray());
      }

      return;
    }

    if (masterProductPrices.isEmpty()) {
      await MasterProductPriceService.create(masterProductPrice.set('firstCrawledDate', new Date()), null, sessionToken);
    } else {
      const notMatchedMasterProductPrices = masterProductPrices.filterNot(_ => _.get('priceDetails').equals(priceDetails));

      if (!notMatchedMasterProductPrices.isEmpty()) {
        await Promise.all(notMatchedMasterProductPrices.map(_ => MasterProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray());
      }

      const matchedMasterProductPrices = masterProductPrices.filter(_ => _.get('priceDetails').equals(priceDetails));

      if (matchedMasterProductPrices.count() > 1) {
        await Promise.all(
          matchedMasterProductPrices.skip(1).map(_ => MasterProductPriceService.update(_.set('status', 'I'), sessionToken)).toArray(),
        );
      } else if (matchedMasterProductPrices.count() === 0) {
        await MasterProductPriceService.create(masterProductPrice.set('firstCrawledDate', new Date()), null, sessionToken);
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
