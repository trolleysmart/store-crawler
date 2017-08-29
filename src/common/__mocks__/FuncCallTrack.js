// @flow

export default class FuncCallTrack {
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

  getCreate = () => this.create;
  getRead = () => this.read;
  getUpdate = () => this.update;
  getDelete = () => this.delete;
  getSearch = () => this.search;
  getSearchAll = () => this.searchAll;
  getCount = () => this.count;
  getExists = () => this.exists;
}
