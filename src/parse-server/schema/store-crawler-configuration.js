class StoreCrawlerConfiguration extends Parse.Object {
  constructor(object) {
    super('StoreCrawlerConfiguration');

    this.object = object;

    this.getObject = this.getObject.bind(this);
    this.getId = this.getId.bind(this);
    this.getName = this.getName.bind(this);
    this.getConfigParameters = this.getConfigParameters.bind(this);
  }

  static spawn(
    name,
    configParameters,
  ) {
    const object = new StoreCrawlerConfiguration();

    object.set('name', name);
    object.set('configParameters', configParameters);

    return object;
  }

  getObject() {
    return this.object || this;
  }

  getId() {
    return this.getObject()
      .id;
  }

  getName() {
    return this.getObject()
      .get('name');
  }

  getConfigParameters() {
    return this.getObject()
      .get('configParameters');
  }
}

export default StoreCrawlerConfiguration;
