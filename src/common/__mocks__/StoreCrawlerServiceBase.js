// @flow

import StoreCrawlerServiceBaseMockTracker from './StoreCrawlerServiceBaseMockTracker';

let storeCrawlerServiceBaseMockTracker;
let finalConfig;
let finalStore;
let finalStoreTags;
let finalCrawledStoreProducts;

export const resetAllMockTrackers = () => {
  storeCrawlerServiceBaseMockTracker = new StoreCrawlerServiceBaseMockTracker();
};

export const getAllMockTrackers = () => ({ storeCrawlerServiceBaseMockTracker });

export const setupStoreCrawlerServiceBase = ({
  config, store, storeTags, crawledStoreProducts,
} = {}) => {
  finalConfig = config;
  finalStore = store;
  finalStoreTags = storeTags;
  finalCrawledStoreProducts = crawledStoreProducts;
};

export default class StoreCrawlerServiceBase {
  static safeGetUri = res => (res && res.request && res.request.uri ? res.request.uri.href : '');

  static removeDollarSignFromPrice = priceWithDollarSign =>
    parseFloat(priceWithDollarSign
      .substring(priceWithDollarSign.indexOf('$') + 1)
      .trim()
      .replace(',', ''));

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

  createOrUpdateCrawledStoreProduct = async (productCategory, productInfo) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createOrUpdateCrawledStoreProduct(productCategory, productInfo);
    }
  };

  getCrawledStoreProducts = async (inputArgument) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.getCrawledStoreProducts(inputArgument);
    }

    return finalCrawledStoreProducts;
  };

  createOrUpdateCrawledProductPrice = async (crawledStoreProductId, crawledProductPrice, priceDetails) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.createOrUpdateCrawledProductPrice(crawledStoreProductId, crawledProductPrice, priceDetails);
    }
  };

  updateExistingCrawledStoreProduct = async (crawledStoreProduct) => {
    if (storeCrawlerServiceBaseMockTracker) {
      storeCrawlerServiceBaseMockTracker.updateExistingCrawledStoreProduct(crawledStoreProduct);
    }
  };

  logVerbose = async () => {};

  logInfo = async () => {};

  logError = async () => {};
}
