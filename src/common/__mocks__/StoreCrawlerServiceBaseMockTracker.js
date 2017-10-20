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
    this.createOrUpdateStoreProduct = jest.fn();
    this.getStoreProducts = jest.fn();
    this.createOrUpdateProductPrice = jest.fn();
    this.updateExistingStoreProduct = jest.fn();
  }
}
