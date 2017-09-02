// @flow

export default class TrolleySmartParseServerCommonMockTrackerBase {
  constructor() {
    this.create = jest.fn();
    this.read = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
    this.search = jest.fn();
    this.searchAll = jest.fn();
    this.count = jest.fn();
    this.exists = jest.fn();
  }
}
