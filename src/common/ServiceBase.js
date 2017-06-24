// @flow

import { List, Map } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService, StoreCrawlerConfigurationService, StoreService } from 'smart-grocery-parse-server-common';

export default class ServiceBase {
  constructor({ logVerboseFunc, logInfoFunc, logErrorFunc }) {
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;
  }

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
