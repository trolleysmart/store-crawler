"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FuncCallTrack = function FuncCallTrack() {
  _classCallCheck(this, FuncCallTrack);

  this.create = jest.fn();
  this.read = jest.fn();
  this.update = jest.fn();
  this.delete = jest.fn();
  this.search = jest.fn();
  this.searchAll = jest.fn();
  this.count = jest.fn();
  this.exists = jest.fn();
};

exports.default = FuncCallTrack;