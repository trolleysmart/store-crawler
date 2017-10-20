"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = function Config(keyValues) {
  var _this = this;

  _classCallCheck(this, Config);

  this.get = function (key) {
    return _this.keyValues.has(key) ? _this.keyValues.get(key).toJS() : undefined;
  };

  this.keyValues = keyValues;
};

exports.default = Config;