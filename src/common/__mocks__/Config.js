// @flow

export default class Config {
  constructor(keyValues) {
    this.keyValues = keyValues;
  }

  get = key => (this.keyValues.has(key) ? this.keyValues.get(key).toJS() : undefined);
}
