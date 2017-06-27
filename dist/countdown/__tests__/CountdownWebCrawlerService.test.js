'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

require('../../../bootstrap');

var _CountdownWebCrawlerService = require('../CountdownWebCrawlerService');

var _CountdownWebCrawlerService2 = _interopRequireDefault(_CountdownWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var createConfig = function createConfig() {
  return _immutable2.default.fromJS({
    baseUrl: 'https://shop.countdown.co.nz',
    baseImageUrl: 'https://shop.countdown.co.nz',
    rateLimit: 2000,
    maxConnections: 1,
    categoryKeysToExclude: _immutable.List.of('restricted-items', 'christmas')
  });
};

describe('crawlProductCategories', function () {
  test('should crawl product categories and save to database', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return new _CountdownWebCrawlerService2.default({
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

describe('crawlProducts', function () {
  test('should crawl products and save to database', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return new _CountdownWebCrawlerService2.default({
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
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));
});