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
    crawlSessionServiceFuncCallTrack.getCreate()(info, acl, sessionToken);

    return uuid();
  };

  read = async (id, criteria, sessionToken) => {
    crawlSessionServiceFuncCallTrack.getRead()(id, criteria, sessionToken);

    return finalCrawlSessionInfo;
  };

  search = async (criteria, sessionToken) => {
    crawlSessionServiceFuncCallTrack.getSearch()(criteria, sessionToken);

    return finalCrawlSessionInfos;
  };
}

class StoreService {
  create = async (info, acl, sessionToken) => {
    storeServiceFuncCallTrack.getCreate()(info, acl, sessionToken);

    return uuid();
  };

  read = async (id, criteria, sessionToken) => {
    storeServiceFuncCallTrack.getRead()(id, criteria, sessionToken);

    return finalStoreInfo;
  };

  search = async (criteria, sessionToken) => {
    storeServiceFuncCallTrack.getSearch()(criteria, sessionToken);

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
trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;

trolleySmartParseServerCommon.StoreService = StoreService;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;

module.exports = trolleySmartParseServerCommon;
