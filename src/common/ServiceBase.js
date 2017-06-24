// @flow

import { List, Map } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlSessionService, StoreCrawlerConfigurationService } from 'smart-grocery-parse-server-common';

export default class ServiceBase {
  constructor({ logVerboseFunc, logInfoFunc, logErrorFunc }) {
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;
  }

  createNewSessionAndGetConfig = async (sessionKey, config, storeName) => {
    const sessionInfo = Map({
      sessionKey,
      startDateTime: new Date(),
    });

    let promises = List.of(CrawlSessionService.create(sessionInfo));

    if (!config) {
      promises = promises.push(
        StoreCrawlerConfigurationService.search(
          Map({
            conditions: Map({
              key: storeName,
            }),
            topMost: true,
          }),
        ),
      );
    }

    let finalConfig = config;

    const results = await Promise.all(promises.toArray());
    const sessionId = results[0];

    if (!finalConfig) {
      finalConfig = results[1].first().get('config');
    }

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
