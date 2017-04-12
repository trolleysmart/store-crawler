import {
  Maybe,
} from 'monet';

class CountdownMasterProductList extends Parse.Object {
  constructor(object) {
    super('CountdownMasterProductList');

    this.object = object;

    this.getObject = this.getObject.bind(this);
    this.getId = this.getId.bind(this);
    this.getDescription = this.getDescription.bind(this);
    this.getBarcode = this.getBarcode.bind(this);
    this.getImageUrl = this.getImageUrl.bind(this);
  }

  static spawn(
    description,
    barcode,
    imageUrl,
  ) {
    const object = new CountdownMasterProductList();

    object.set('description', description);
    object.set('barcode', barcode);
    object.set('imageUrl', imageUrl);

    return object;
  }

  getObject() {
    return this.object || this;
  }

  getId() {
    return this.getObject()
      .id;
  }

  getDescription() {
    return this.getObject()
      .get('description');
  }

  getBarcode() {
    return Maybe.fromNull(this.getObject()
      .get('barcode'));
  }

  getImageUrl() {
    return Maybe.fromNull(this.getObject()
      .get('imageUrl'));
  }
}

export default CountdownMasterProductList;
