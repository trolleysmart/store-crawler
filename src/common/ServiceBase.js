// @flow

import { Map } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlSessionService, StoreCrawlerConfigurationService } from 'smart-grocery-parse-server-common';

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
