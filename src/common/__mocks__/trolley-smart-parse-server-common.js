// @flow

import uuid from 'uuid/v4';

const trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
let sessionInfo;
let storeInfo;
let storeInfos;

class ServiceBase {
  create = async () => uuid();
}

class CrawlSessionService extends ServiceBase {
  read = async () => sessionInfo;
}

class StoreService extends ServiceBase {
  read = async () => storeInfo;
  search = async () => storeInfos;
}

const setupCrawlSessionService = (arg) => {
  sessionInfo = arg;
};

const setupStoreService = (arg1, arg2) => {
  storeInfo = arg1;
  storeInfos = arg2;
};

trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;
trolleySmartParseServerCommon.CrawlSessionService = CrawlSessionService;
trolleySmartParseServerCommon.StoreService = StoreService;

module.exports = trolleySmartParseServerCommon;
