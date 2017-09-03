// @flow

import StoreCrawlerServiceBaseMockTracker from './StoreCrawlerServiceBaseMockTracker';

let storeCrawlerServiceBaseMockTracker;
let finalConfig;
let finalStore;
let finalStoreTags;
let finalStoreProducts;

export const resetAllMockTrackers = () => {
  storeCrawlerServiceBaseMockTracker = new StoreCrawlerServiceBaseMockTracker();
};

export const getAllMockTrackers = () => ({ storeCrawlerServiceBaseMockTracker });

export const setupStoreCrawlerServiceBase = ({ config, store, storeTags, storeProducts } = {}) => {
  finalConfig = config;
  finalStore = store;
  finalStoreTags = storeTags;
  finalStoreProducts = storeProducts;
};

export default class StoreCrawlerServiceBase {
  static safeGetUri = res => (res && res.request && res.request.uri ? res.request.uri.href : '');

  static removeDollarSignFromPrice = priceWithDollarSign => parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());

  getConfig = async () => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.getConfig();
    }

    return finalConfig;
  };

  getStore = async () => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.getStore();
    }

    return finalStore;
  };

  getStoreId = async () => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.getStoreId();
    }

    return finalStore.get('id');
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

  getStoreProducts = async (inputArgument) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.getStoreProducts(inputArgument);
    }

    return finalStoreProducts;
  };

  createOrUpdateProductPrice = async (storeProductId, productPrice, priceDetails) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createOrUpdateProductPrice(storeProductId, productPrice, priceDetails);
    }
  };

  updateExistingStoreProduct = async (storeProduct) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.updateExistingStoreProduct(storeProduct);
    }
  };

  logVerbose = async () => {};

  logInfo = async () => {};

  logError = async () => {};
}
