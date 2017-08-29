// @flow

import uuid from 'uuid/v4';

const trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
let finalCrawlSessionInfo;
let finalCrawlSessionInfos;
let finalStoreInfo;
let finalStoreInfos;

class ServiceBase {
  create = async () => uuid();
}

class CrawlSessionService extends ServiceBase {
  read = async () => finalCrawlSessionInfo;
  search = async () => finalCrawlSessionInfos;
}

class StoreService extends ServiceBase {
  read = async () => finalStoreInfo;
  search = async () => finalStoreInfos;
}

const setupCrawlSessionService = ({ crawlSessionInfo, crawlSessionInfos } = {}) => {
  finalCrawlSessionInfo = crawlSessionInfo;
  finalCrawlSessionInfos = crawlSessionInfos;
};

const setupStoreService = ({ storeInfo, storeInfos } = {}) => {
  finalStoreInfo = storeInfo;
  finalStoreInfos = storeInfos;
};

trolleySmartParseServerCommon.CrawlSessionService = CrawlSessionService;
trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;

trolleySmartParseServerCommon.StoreService = StoreService;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;

module.exports = trolleySmartParseServerCommon;
