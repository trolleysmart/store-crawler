'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

require('../../../bootstrap');

var _CountdownWebCrawlerService = require('../CountdownWebCrawlerService');

var _CountdownWebCrawlerService2 = _interopRequireDefault(_CountdownWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

describe('getProductCategoriesPagingInfo', function () {
  test('should capture paging info for product categories with multiple page', function () {
    var config = _immutable2.default.fromJS({
      baseUrl: 'https://shop.countdown.co.nz/Shop/Browse/',
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery']
    });

    return new _CountdownWebCrawlerService2.default({}).getProductCategoriesPagingInfo(config).then(function (productsCategoriesPagingInfo) {
      expect(productsCategoriesPagingInfo).toBeDefined();

      var bakeryPagingInfo = productsCategoriesPagingInfo.find(function (_) {
        return _.get('productCategory').localeCompare(config.get('productCategories').first()) === 0;
      });
      expect(bakeryPagingInfo).toBeDefined();
      expect(bakeryPagingInfo.get('totalPageNumber')).toBeDefined();
    });
  });

  test('should capture paging info for product categories with single page', function () {
    var config = _immutable2.default.fromJS({
      baseUrl: 'https://shop.countdown.co.nz/Shop/Browse/',
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery/desserts-pies']
    });

    return new _CountdownWebCrawlerService2.default({}).getProductCategoriesPagingInfo(config).then(function (productsCategoriesPagingInfo) {
      expect(productsCategoriesPagingInfo).toBeDefined();

      var bakeryPagingInfo = productsCategoriesPagingInfo.find(function (_) {
        return _.get('productCategory').localeCompare(config.get('productCategories').first()) === 0;
      });
      expect(bakeryPagingInfo).toBeDefined();
      expect(bakeryPagingInfo.get('totalPageNumber')).toBeDefined();
    });
  });
});

describe('crawlHighLevelProductCategories', function () {
  test('should crawl product high level categories and save to database', function () {
    var config = _immutable2.default.fromJS({
      baseUrl: 'https://shop.countdown.co.nz/Shop/Browse/',
      rateLimit: 2000,
      maxConnections: 1,
      logLevel: 1,
      highLevelProductCategoriesFilterList: ['restricted-items']
    });

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
    }).crawlHighLevelProductCategories(config);
  });
});

describe('crawlProducts', function () {
  test('should crawl products and save to database', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var config;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            config = _immutable2.default.fromJS({
              baseUrl: 'https://shop.countdown.co.nz',
              baseImageUrl: 'https://shop.countdown.co.nz',
              rateLimit: 2000,
              maxConnections: 1,
              categoryKeysToExclude: _immutable.List.of('restricted-items', 'christmas')
            });
            _context.next = 3;
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
            }).crawlProductCategories(config);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));
});