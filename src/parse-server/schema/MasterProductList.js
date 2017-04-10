import {
  Maybe,
} from 'monet';

class MasterProductList extends Parse.Object {
  constructor(object) {
    super('MasterProductList');

    this.object = object;

    this.getObject = this.getObject.bind(this);
    this.getId = this.getId.bind(this);
    this.getName = this.getName.bind(this);
    this.getBarcode = this.getBarcode.bind(this);
    this.getImageUrl = this.getImageUrl.bind(this);
    this.getCategory = this.getCategory.bind(this);
  }

  static spawn(
    name,
    barcode,
    imageUrl,
    category,
  ) {
    const object = new MasterProductList();

    object.set('name', name);
    object.set('barcode', barcode);
    object.set('imageUrl', imageUrl);
    object.set('category', category);

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
    return Maybe.fromNull(this.getObject()
      .get('name'));
  }

  getBarcode() {
    return Maybe.fromNull(this.getObject()
      .get('barcode'));
  }

  getImageUrl() {
    return Maybe.fromNull(this.getObject()
      .get('imageUrl'));
  }

  getCategory() {
    return Maybe.fromNull(this.getObject()
      .get('category'));
  }
}

export default MasterProductList;
