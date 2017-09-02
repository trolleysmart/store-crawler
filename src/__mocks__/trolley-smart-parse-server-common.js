// @flow

import uuid from 'uuid/v4';
import CrawlSessionServiceMockTracker from './CrawlSessionServiceMockTracker';
import StoreServiceMockTracker from './StoreServiceMockTracker';

const trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
let crawlSessionServiceMockTracker;
let storeServiceMockTracker;
let finalCrawlSessionInfo;
let finalCrawlSessionInfos;
let finalStoreInfo;
let finalStoreInfos;

class CrawlSessionService {
  create = async (info, acl, sessionToken) => {
    if (crawlSessionServiceMockTracker) {
      crawlSessionServiceMockTracker.create(info, acl, sessionToken);
    }

    return uuid();
  };

  read = async (id, criteria, sessionToken) => {
    if (crawlSessionServiceMockTracker) {
      crawlSessionServiceMockTracker.read(id, criteria, sessionToken);
    }

    return finalCrawlSessionInfo;
  };

  search = async (criteria, sessionToken) => {
    if (crawlSessionServiceMockTracker) {
      crawlSessionServiceMockTracker.search(criteria, sessionToken);
    }

    return finalCrawlSessionInfos;
  };
}

class StoreService {
  create = async (info, acl, sessionToken) => {
    if (storeServiceMockTracker) {
      storeServiceMockTracker.create(info, acl, sessionToken);
    }

    return uuid();
  };

  read = async (id, criteria, sessionToken) => {
    if (storeServiceMockTracker) {
      storeServiceMockTracker.read(id, criteria, sessionToken);
    }

    return finalStoreInfo;
  };

  search = async (criteria, sessionToken) => {
    if (storeServiceMockTracker) {
      storeServiceMockTracker.search(criteria, sessionToken);
    }

    return finalStoreInfos;
  };
}

const resetAllMockTrackers = () => {
  crawlSessionServiceMockTracker = new CrawlSessionServiceMockTracker();
  storeServiceMockTracker = new StoreServiceMockTracker();
};

const getAllMockTrackers = () => ({ crawlSessionServiceMockTracker, storeServiceMockTracker });

const setupCrawlSessionService = ({ crawlSessionInfo, crawlSessionInfos } = {}) => {
  finalCrawlSessionInfo = crawlSessionInfo;
  finalCrawlSessionInfos = crawlSessionInfos;
};

const setupStoreService = ({ storeInfo, storeInfos } = {}) => {
  finalStoreInfo = storeInfo;
  finalStoreInfos = storeInfos;
};

trolleySmartParseServerCommon.resetAllMockTrackers = resetAllMockTrackers;
trolleySmartParseServerCommon.getAllMockTrackers = getAllMockTrackers;

trolleySmartParseServerCommon.CrawlSessionService = CrawlSessionService;
trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;

trolleySmartParseServerCommon.StoreService = StoreService;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;

module.exports = trolleySmartParseServerCommon;
