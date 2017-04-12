'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _monet = require('monet');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CountdownMasterProductList = function (_Parse$Object) {
  _inherits(CountdownMasterProductList, _Parse$Object);

  function CountdownMasterProductList(object) {
    _classCallCheck(this, CountdownMasterProductList);

    var _this = _possibleConstructorReturn(this, (CountdownMasterProductList.__proto__ || Object.getPrototypeOf(CountdownMasterProductList)).call(this, 'CountdownMasterProductList'));

    _this.object = object;

    _this.getObject = _this.getObject.bind(_this);
    _this.getId = _this.getId.bind(_this);
    _this.getDescription = _this.getDescription.bind(_this);
    _this.getBarcode = _this.getBarcode.bind(_this);
    _this.getImageUrl = _this.getImageUrl.bind(_this);
    return _this;
  }

  _createClass(CountdownMasterProductList, [{
    key: 'getObject',
    value: function getObject() {
      return this.object || this;
    }
  }, {
    key: 'getId',
    value: function getId() {
      return this.getObject().id;
    }
  }, {
    key: 'getDescription',
    value: function getDescription() {
      return this.getObject().get('description');
    }
  }, {
    key: 'getBarcode',
    value: function getBarcode() {
      return _monet.Maybe.fromNull(this.getObject().get('barcode'));
    }
  }, {
    key: 'getImageUrl',
    value: function getImageUrl() {
      return _monet.Maybe.fromNull(this.getObject().get('imageUrl'));
    }
  }], [{
    key: 'spawn',
    value: function spawn(description, barcode, imageUrl) {
      var object = new CountdownMasterProductList();

      object.set('description', description);
      object.set('barcode', barcode);
      object.set('imageUrl', imageUrl);

      return object;
    }
  }]);

  return CountdownMasterProductList;
}(Parse.Object);

exports.default = CountdownMasterProductList;