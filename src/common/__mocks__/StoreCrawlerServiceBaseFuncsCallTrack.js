// @flow

export default class StoreCrawlerServiceBaseFuncsCallTrack {
  constructor() {
    this.getConfig = jest.fn();
    this.createNewCrawlSession = jest.fn();
    this.updateExistingCrawlSession = jest.fn();
    this.createNewCrawlResult = jest.fn();
  }
}
