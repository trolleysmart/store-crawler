'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var StoreCrawlerServiceBaseMockTracker = function StoreCrawlerServiceBaseMockTracker() {
  _classCallCheck(this, StoreCrawlerServiceBaseMockTracker);

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
};

exports.default = StoreCrawlerServiceBaseMockTracker;
