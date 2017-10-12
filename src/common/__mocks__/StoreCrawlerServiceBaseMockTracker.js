// @flow

export default class StoreCrawlerServiceBaseMockTracker {
  constructor() {
    this.getConfig = jest.fn();
    this.getStore = jest.fn();
    this.getStoreId = jest.fn();
    this.getStoreTags = jest.fn();
    this.createOrUpdateLevelOneProductCategory = jest.fn();
    this.createOrUpdateLevelTwoProductCategory = jest.fn();
    this.createOrUpdateLevelThreeProductCategory = jest.fn();
    this.createOrUpdateCrawledStoreProduct = jest.fn();
    this.getCrawledStoreProducts = jest.fn();
    this.createOrUpdateCrawledProductPrice = jest.fn();
    this.updateExistingCrawledStoreProduct = jest.fn();
  }
}
