// @flow

import StoreCrawlerServiceBaseFuncsCallTrack from './StoreCrawlerServiceBaseFuncsCallTrack';

let storeCrawlerServiceBaseFuncsCallTrack;
let finalConfig;
let finalSessionInfo;

export const resetAllMockTrackers = () => {
  storeCrawlerServiceBaseFuncsCallTrack = new StoreCrawlerServiceBaseFuncsCallTrack();
};

export const getAllMockTrackers = () => ({ storeCrawlerServiceBaseFuncsCallTrack });

export const setupStoreCrawlerServiceBase = ({ config, sessionInfo } = {}) => {
  finalConfig = config;
  finalSessionInfo = sessionInfo;
};

export default class StoreCrawlerServiceBase {
  static safeGetUri = res => res;

  getConfig = async () => {
    if (storeCrawlerServiceBaseFuncsCallTrack) {
      storeCrawlerServiceBaseFuncsCallTrack.getConfig();
    }

    return finalConfig;
  };

  createNewCrawlSession = async (sessionKey) => {
    if (storeCrawlerServiceBaseFuncsCallTrack) {
      storeCrawlerServiceBaseFuncsCallTrack.createNewCrawlSession(sessionKey);
    }

    return finalSessionInfo;
  };

  updateExistingCrawlSession = async (sessionInfo) => {
    if (storeCrawlerServiceBaseFuncsCallTrack) {
      storeCrawlerServiceBaseFuncsCallTrack.updateExistingCrawlSession(sessionInfo);
    }
  };

  createNewCrawlResult = async (crawlSessionId, resultSet) => {
    if (storeCrawlerServiceBaseFuncsCallTrack) {
      storeCrawlerServiceBaseFuncsCallTrack.createNewCrawlResult(crawlSessionId, resultSet);
    }
  };

  logVerbose = async () => {};

  logInfo = async () => {};

  logError = async () => {};
}
