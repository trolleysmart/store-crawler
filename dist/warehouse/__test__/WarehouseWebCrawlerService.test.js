'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

require('../../../bootstrap');

var _WarehouseWebCrawlerService = require('../WarehouseWebCrawlerService');

var _WarehouseWebCrawlerService2 = _interopRequireDefault(_WarehouseWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var createConfig = function createConfig() {
  return _immutable2.default.fromJS({
    baseUrl: 'http://www.thewarehouse.co.nz/',
    rateLimit: 1,
    maxConnections: 1,
    logLevel: 2,
    categoryKeysToExclude: ['specials', 'electronicsgaming-apple']
  });
};

describe('crawlProductCategories', function () {
  test('should crawl all product categories', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return new _WarehouseWebCrawlerService2.default({
              logVerboseFunc: function logVerboseFunc(message) {
                return console.log(message);
              },
              logInfoFunc: function logInfoFunc(message) {
                return console.log(message);
              },
              logErrorFunc: function logErrorFunc(message) {
                return console.log(message);
              }
            }).crawlProductCategories(createConfig());

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));
});

describe('syncProductCategoriesToStoreTags', function () {
  test('should sync tags to store tag table', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return new _WarehouseWebCrawlerService2.default({
              logVerboseFunc: function logVerboseFunc(message) {
                return console.log(message);
              },
              logInfoFunc: function logInfoFunc(message) {
                return console.log(message);
              },
              logErrorFunc: function logErrorFunc(message) {
                return console.log(message);
              }
            }).syncProductCategoriesToStoreTags(createConfig());

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));
});

describe('crawlProducts', function () {
  test('should crawl all products', _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return new _WarehouseWebCrawlerService2.default({
              logVerboseFunc: function logVerboseFunc(message) {
                return console.log(message);
              },
              logInfoFunc: function logInfoFunc(message) {
                return console.log(message);
              },
              logErrorFunc: function logErrorFunc(message) {
                return console.log(message);
              }
            }).crawlProducts(createConfig());

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));
});