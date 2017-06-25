// @flow

import Immutable, { List, Map, Range, Set } from 'immutable';
import { Exception, ParseWrapperService } from 'micro-business-parse-server-common';
import {
  CrawlResultService,
  CrawlSessionService,
  StoreCrawlerConfigurationService,
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

  getJobConfig = async () => {
    const config = await ParseWrapperService.getConfig();
    const jobConfig = config.get('Job');

    if (jobConfig) {
      return Immutable.fromJS(jobConfig);
    }

    throw new Exception('No config found called Job.');
  };

  getStoreCrawlerConfig = async (storeName) => {
    const configs = await StoreCrawlerConfigurationService.search(
      Map({
        conditions: Map({
          key: storeName,
        }),
        topMost: true,
      }),
    );

    return configs.first();
  };

  createNewCrawlSessionAndGetStoreCrawlerConfig = async (sessionKey, config, storeName) => {
    const sessionInfo = Map({
      sessionKey,
      startDateTime: new Date(),
    });
    const sessionId = await CrawlSessionService.create(sessionInfo);
    const finalConfig = config || (await this.getStoreCrawlerConfig(storeName)).get('config');

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

  createOrUpdateStoreMasterProduct = async (productCategory, productInfo, storeId, storeTags) => {
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0);

    if (!foundStoreTag) {
      throw new Exception(`Failed to retrieve store tag for ${productCategory.get('categoryKey')}`);
    }

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
          description: productInfo.get('description'),
          productPageUrl: productInfo.get('productPageUrl'),
          imageUrl: productInfo.get('imageUrl'),
          storeTagIds: Set([foundStoreTag.get('id')]),
          storeId,
        }),
      );
    } else if (storeMasterProducts.count() > 1) {
      throw new Exception(`Multiple store master product found for ${productInfo.get('description')} and store Id: ${storeId}`);
    } else {
      const storeMasterProduct = storeMasterProducts.first();
      const updatedStoreMasterProduct = storeMasterProduct
        .update('storeTagIds', storeTagIds => storeTagIds.toSet().add(foundStoreTag.get('id')))
        .set('productPageUrl', productInfo.get('productPageUrl'))
        .set('imageUrl', productInfo.get('imageUrl'));

      await StoreMasterProductService.update(updatedStoreMasterProduct);
    }
  };

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
