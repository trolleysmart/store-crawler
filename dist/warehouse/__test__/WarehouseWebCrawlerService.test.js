'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

require('../../../bootstrap');

var _WarehouseWebCrawlerService = require('../WarehouseWebCrawlerService');

var _WarehouseWebCrawlerService2 = _interopRequireDefault(_WarehouseWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

describe('crawlProductCategories', function () {
  test('should crawl all product categories', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var config;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            config = _immutable2.default.fromJS({
              baseUrl: 'http://www.thewarehouse.co.nz/',
              rateLimit: 2000,
              maxConnections: 1
            });
            _context.next = 3;
            return new _WarehouseWebCrawlerService2.default({}).crawlProductCategories(config);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));
});