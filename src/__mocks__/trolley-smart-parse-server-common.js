// @flow

import uuid from 'uuid/v4';
import StoreServiceMockTracker from './StoreServiceMockTracker';

const trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
let crawlSessionServiceMockTracker;
let storeServiceMockTracker;
let finalStoreInfo;
let finalStoreInfos;

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
  storeServiceMockTracker = new StoreServiceMockTracker();
};

const getAllMockTrackers = () => ({ crawlSessionServiceMockTracker, storeServiceMockTracker });

const setupStoreService = ({ storeInfo, storeInfos } = {}) => {
  finalStoreInfo = storeInfo;
  finalStoreInfos = storeInfos;
};

trolleySmartParseServerCommon.resetAllMockTrackers = resetAllMockTrackers;
trolleySmartParseServerCommon.getAllMockTrackers = getAllMockTrackers;

trolleySmartParseServerCommon.StoreService = StoreService;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;

module.exports = trolleySmartParseServerCommon;
