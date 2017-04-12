'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StoreCrawlerConfiguration = function (_Parse$Object) {
  _inherits(StoreCrawlerConfiguration, _Parse$Object);

  function StoreCrawlerConfiguration(object) {
    _classCallCheck(this, StoreCrawlerConfiguration);

    var _this = _possibleConstructorReturn(this, (StoreCrawlerConfiguration.__proto__ || Object.getPrototypeOf(StoreCrawlerConfiguration)).call(this, 'StoreCrawlerConfiguration'));

    _this.object = object;

    _this.getObject = _this.getObject.bind(_this);
    _this.getId = _this.getId.bind(_this);
    _this.getName = _this.getName.bind(_this);
    _this.getConfigParameters = _this.getConfigParameters.bind(_this);
    return _this;
  }

  _createClass(StoreCrawlerConfiguration, [{
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
    key: 'getName',
    value: function getName() {
      return this.getObject().get('name');
    }
  }, {
    key: 'getConfigParameters',
    value: function getConfigParameters() {
      return this.getObject().get('configParameters');
    }
  }], [{
    key: 'spawn',
    value: function spawn(name, configParameters) {
      var object = new StoreCrawlerConfiguration();

      object.set('name', name);
      object.set('configParameters', configParameters);

      return object;
    }
  }]);

  return StoreCrawlerConfiguration;
}(Parse.Object);

exports.default = StoreCrawlerConfiguration;