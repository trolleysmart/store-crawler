// @flow

export default class StoreCrawlerServiceBaseMockTracker {
  constructor() {
    this.getConfig = jest.fn();
    this.getStoreTags = jest.fn();
    this.createOrUpdateLevelOneProductCategory = jest.fn();
    this.createOrUpdateLevelTwoProductCategory = jest.fn();
    this.createOrUpdateLevelThreeProductCategory = jest.fn();
  }
}
