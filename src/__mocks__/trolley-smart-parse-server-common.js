// @flow

import uuid from 'uuid/v4';
import CrawlSessionServiceFuncCallTrack from './CrawlSessionServiceFuncCallTrack';
import StoreServiceFuncCallTrack from './StoreServiceFuncCallTrack';

const trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
let crawlSessionServiceFuncCallTrack;
let storeServiceFuncCallTrack;
let finalCrawlSessionInfo;
let finalCrawlSessionInfos;
let finalStoreInfo;
let finalStoreInfos;

class CrawlSessionService {
  create = async (info, acl, sessionToken) => {
    if (crawlSessionServiceFuncCallTrack) {
      crawlSessionServiceFuncCallTrack.create(info, acl, sessionToken);
    }

    return uuid();
  };

  read = async (id, criteria, sessionToken) => {
    if (crawlSessionServiceFuncCallTrack) {
      crawlSessionServiceFuncCallTrack.read(id, criteria, sessionToken);
    }

    return finalCrawlSessionInfo;
  };

  search = async (criteria, sessionToken) => {
    if (crawlSessionServiceFuncCallTrack) {
      crawlSessionServiceFuncCallTrack.search(criteria, sessionToken);
    }

    return finalCrawlSessionInfos;
  };
}

class StoreService {
  create = async (info, acl, sessionToken) => {
    if (storeServiceFuncCallTrack) {
      storeServiceFuncCallTrack.create(info, acl, sessionToken);
    }

    return uuid();
  };

  read = async (id, criteria, sessionToken) => {
    if (storeServiceFuncCallTrack) {
      storeServiceFuncCallTrack.read(id, criteria, sessionToken);
    }

    return finalStoreInfo;
  };

  search = async (criteria, sessionToken) => {
    if (storeServiceFuncCallTrack) {
      storeServiceFuncCallTrack.search(criteria, sessionToken);
    }

    return finalStoreInfos;
  };
}

const resetAllMockTracks = () => {
  crawlSessionServiceFuncCallTrack = new CrawlSessionServiceFuncCallTrack();
  storeServiceFuncCallTrack = new StoreServiceFuncCallTrack();
};

const setupCrawlSessionService = ({ crawlSessionInfo, crawlSessionInfos } = {}) => {
  finalCrawlSessionInfo = crawlSessionInfo;
  finalCrawlSessionInfos = crawlSessionInfos;
};

const setupStoreService = ({ storeInfo, storeInfos } = {}) => {
  finalStoreInfo = storeInfo;
  finalStoreInfos = storeInfos;
};

trolleySmartParseServerCommon.resetAllMockTracks = resetAllMockTracks;

trolleySmartParseServerCommon.CrawlSessionService = CrawlSessionService;
trolleySmartParseServerCommon.crawlSessionServiceFuncCallTrack = () => crawlSessionServiceFuncCallTrack;
trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;

trolleySmartParseServerCommon.StoreService = StoreService;
trolleySmartParseServerCommon.storeServiceFuncCallTrack = () => storeServiceFuncCallTrack;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;

module.exports = trolleySmartParseServerCommon;
