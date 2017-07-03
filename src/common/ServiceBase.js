// @flow

import Immutable, { List, Map, Range } from 'immutable';
import { Exception, ParseWrapperService } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService, StoreService, StoreMasterProductService, StoreTagService } from 'smart-grocery-parse-server-common';

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

  createNewCrawlSessionAndGetConfig = async (sessionKey, config, storeName) => {
    const sessionInfo = Map({
      sessionKey,
      startDateTime: new Date(),
    });
    const sessionId = await CrawlSessionService.create(sessionInfo);
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

  getStore = async (name) => {
    const criteria = Map({
      conditions: Map({
        name,
      }),
    });

    const results = await StoreService.search(criteria);

    if (results.isEmpty()) {
      return StoreService.read(await StoreService.create(Map({ name })));
    } else if (results.count() === 1) {
      return results.first();
    }
    throw new Exception(`Multiple store found called ${name}.`);
  };

  getMostRecentCrawlSessionInfo = async (sessionKey) => {
    const crawlSessionInfos = await CrawlSessionService.search(
      Map({
        conditions: Map({
          sessionKey,
        }),
        topMost: true,
      }),
    );

    return crawlSessionInfos.first();
  };

  getMostRecentCrawlResults = async (sessionKey, mapFunc) => {
    const crawlSessionInfo = await this.getMostRecentCrawlSessionInfo(sessionKey);
    const crawlSessionId = crawlSessionInfo.get('id');
    let results = List();
    const result = CrawlResultService.searchAll(
      Map({
        conditions: Map({
          crawlSessionId,
        }),
      }),
    );

    try {
      result.event.subscribe(info => (results = results.push(mapFunc ? mapFunc(info) : info)));

      await result.promise;
    } finally {
      result.event.unsubscribeAll();
    }

    return results;
  };

  getExistingStoreTags = async (storeId) => {
    const result = StoreTagService.searchAll(Map({ conditions: Map({ storeId }) }));

    try {
      let storeTags = List();

      result.event.subscribe(info => (storeTags = storeTags.push(info)));

      await result.promise;

      return storeTags;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  createOrUpdateStoreMasterProduct = async (productCategory, productInfo, storeId) => {
    const storeMasterProducts = await StoreMasterProductService.search(
      Map({
        conditions: Map({
          productPageUrl: productInfo.get('productPageUrl'),
          storeId,
        }),
      }),
    );

    if (storeMasterProducts.isEmpty()) {
      await StoreMasterProductService.create(
        Map({
          productPageUrl: productInfo.get('productPageUrl'),
          storeId,
        }),
      );
    } else if (storeMasterProducts.count() > 1) {
      throw new Exception(`Multiple store master product found for store Id: ${storeId} and productPageUrl: ${productInfo.get('productPageUrl')}`);
    } else {
      const storeMasterProduct = storeMasterProducts.first();
      const updatedStoreMasterProduct = storeMasterProduct.set('productPageUrl', productInfo.get('productPageUrl'));

      await StoreMasterProductService.update(updatedStoreMasterProduct);
    }
  };

  createOrUpdateLevelOneProductCategory = async (productCategory, storeTags, storeId) => {
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
      );
    }
  };

  createOrUpdateLevelTwoProductCategory = async (productCategory, storeTags, storeId) => {
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
      );
    }
  };

  createOrUpdateLevelThreeProductCategory = async (productCategory, storeTags, storeId) => {
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
      );
    }
  };

  getProducts = async (config, storeId, withoutMasterProductLinkSet) => {
    const criteria = Map({
      conditions: Map({
        storeId,
        without_masterProduct: withoutMasterProductLinkSet,
      }),
    });

    let products = List();
    const result = StoreMasterProductService.searchAll(criteria);

    try {
      result.event.subscribe(info => (products = products.push(info)));

      await result.promise;
    } finally {
      result.event.unsubscribeAll();
    }

    return products;
  };

  removeDollarSignFromPrice = priceWithDollarSign => parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());

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
