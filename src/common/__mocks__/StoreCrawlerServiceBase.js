// @flow

import StoreCrawlerServiceBaseMockTracker from './StoreCrawlerServiceBaseMockTracker';

let storeCrawlerServiceBaseMockTracker;
let finalConfig;
let finalStoreTags;

export const resetAllMockTrackers = () => {
  storeCrawlerServiceBaseMockTracker = new StoreCrawlerServiceBaseMockTracker();
};

export const getAllMockTrackers = () => ({ storeCrawlerServiceBaseMockTracker });

export const setupStoreCrawlerServiceBase = ({ config, storeTags } = {}) => {
  finalConfig = config;
  finalStoreTags = storeTags;
};

export default class StoreCrawlerServiceBase {
  static safeGetUri = res => (res && res.request && res.request.uri ? res.request.uri.href : '');

  getConfig = async () => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.getConfig();
    }

    return finalConfig;
  };

  getStoreTags = async (includeTag) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.getStoreTags(includeTag);
    }

    return finalStoreTags;
  };

  createOrUpdateLevelOneProductCategory = async (productCategory, storeTags) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createOrUpdateLevelOneProductCategory(productCategory, storeTags);
    }
  };

  createOrUpdateLevelTwoProductCategory = async (productCategory, storeTags) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createOrUpdateLevelTwoProductCategory(productCategory, storeTags);
    }
  };

  createOrUpdateLevelThreeProductCategory = async (productCategory, storeTags) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createOrUpdateLevelThreeProductCategory(productCategory, storeTags);
    }
  };

  createOrUpdateStoreProduct = async (productCategory, productInfo) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createOrUpdateStoreProduct(productCategory, productInfo);
    }
  };

  logVerbose = async () => {};

  logInfo = async () => {};

  logError = async () => {};
}
