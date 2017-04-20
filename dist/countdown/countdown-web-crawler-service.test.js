'use strict';

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

require('../../bootstrap');

var _countdownWebCrawlerService = require('./countdown-web-crawler-service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('getProductCategoriesPagingInfo', function () {
  test('should capture paging info for product categories with multiple page', function () {
    var config = _immutable2.default.fromJS({
      baseUrl: 'https://shop.countdown.co.nz/Shop/Browse/',
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery']
    });

    return new _countdownWebCrawlerService.CountdownWebCrawlerService({}).getProductCategoriesPagingInfo(config).then(function (productsCategoriesPagingInfo) {
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

    return new _countdownWebCrawlerService.CountdownWebCrawlerService({}).getProductCategoriesPagingInfo(config).then(function (productsCategoriesPagingInfo) {
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

    return new _countdownWebCrawlerService.CountdownWebCrawlerService({
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
  test('should crawl products and save to database', function () {
    var config = _immutable2.default.fromJS({
      baseUrl: 'https://shop.countdown.co.nz/Shop/Browse/',
      baseImageUrl: 'https://shop.countdown.co.nz',
      rateLimit: 2000,
      maxConnections: 1,
      logLevel: 1,
      productCategories: ['bakery/desserts-pies']
    });

    return new _countdownWebCrawlerService.CountdownWebCrawlerService({
      logVerboseFunc: function logVerboseFunc(message) {
        return console.log(message);
      },
      logInfoFunc: function logInfoFunc(message) {
        return console.log(message);
      },
      logErrorFunc: function logErrorFunc(message) {
        return console.log(message);
      }
    }).crawlProducts(config);
  });
});