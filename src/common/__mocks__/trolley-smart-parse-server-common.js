// @flow

import uuid from 'uuid/v4';

const trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
let finalSessionInfo;
let finalSessionInfos;
let finalStoreInfo;
let finalStoreInfos;

class ServiceBase {
  create = async () => uuid();
}

class CrawlSessionService extends ServiceBase {
  read = async () => finalSessionInfo;
  search = async () => finalSessionInfos;
}

class StoreService extends ServiceBase {
  read = async () => finalStoreInfo;
  search = async () => finalStoreInfos;
}

const setupCrawlSessionService = ({ sessionInfo, sessionInfos } = {}) => {
  finalSessionInfo = sessionInfo;
  finalSessionInfos = sessionInfos;
};

const setupStoreService = ({ storeInfo, storeInfos } = {}) => {
  finalStoreInfo = storeInfo;
  finalStoreInfos = storeInfos;
};

trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;
trolleySmartParseServerCommon.CrawlSessionService = CrawlSessionService;
trolleySmartParseServerCommon.StoreService = StoreService;

module.exports = trolleySmartParseServerCommon;
