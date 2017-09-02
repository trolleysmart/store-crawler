// @flow

import StoreCrawlerServiceBaseMockTracker from './StoreCrawlerServiceBaseMockTracker';

let storeCrawlerServiceBaseMockTracker;
let finalConfig;
let finalSessionInfo;

export const resetAllMockTrackers = () => {
  storeCrawlerServiceBaseMockTracker = new StoreCrawlerServiceBaseMockTracker();
};

export const getAllMockTrackers = () => ({ storeCrawlerServiceBaseMockTracker });

export const setupStoreCrawlerServiceBase = ({ config, sessionInfo } = {}) => {
  finalConfig = config;
  finalSessionInfo = sessionInfo;
};

export default class StoreCrawlerServiceBase {
  static safeGetUri = res => res;

  getConfig = async () => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.getConfig();
    }

    return finalConfig;
  };

  createNewCrawlSession = async (sessionKey) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createNewCrawlSession(sessionKey);
    }

    return finalSessionInfo;
  };

  updateExistingCrawlSession = async (sessionInfo) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.updateExistingCrawlSession(sessionInfo);
    }
  };

  createNewCrawlResult = async (crawlSessionId, resultSet) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createNewCrawlResult(crawlSessionId, resultSet);
    }
  };

  logVerbose = async () => {};

  logInfo = async () => {};

  logError = async () => {};
}
