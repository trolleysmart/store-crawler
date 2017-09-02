'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

var _FuncCallTrack2 = require('./FuncCallTrack');

var _FuncCallTrack3 = _interopRequireDefault(_FuncCallTrack2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, enumerable: false, writable: true, configurable: true },
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
}

var CrawlSessionServiceFuncCallTrack = (function(_FuncCallTrack) {
  _inherits(CrawlSessionServiceFuncCallTrack, _FuncCallTrack);

  function CrawlSessionServiceFuncCallTrack() {
    _classCallCheck(this, CrawlSessionServiceFuncCallTrack);

    return _possibleConstructorReturn(
      this,
      (CrawlSessionServiceFuncCallTrack.__proto__ || Object.getPrototypeOf(CrawlSessionServiceFuncCallTrack)).apply(this, arguments),
    );
  }

  return CrawlSessionServiceFuncCallTrack;
})(_FuncCallTrack3.default);

exports.default = CrawlSessionServiceFuncCallTrack;
