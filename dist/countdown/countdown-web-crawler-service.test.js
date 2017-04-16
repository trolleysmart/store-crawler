'use strict';

require('../../bootstrap');

var _countdownWebCrawlerService = require('./countdown-web-crawler-service');

var _countdownWebCrawlerService2 = _interopRequireDefault(_countdownWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('getProductCategoriesPagingInfo', function () {
  test('should capture paging info for product categories with multiple page', function () {
    var config = {
      "baseUrl": "https://shop.countdown.co.nz/Shop/Browse/",
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery']
    };

    return new _countdownWebCrawlerService2.default({}).getProductCategoriesPagingInfo(config).then(function (productsCategoriesPagingInfo) {
      expect(productsCategoriesPagingInfo).toBeDefined();

      var bakeryPagingInfo = productsCategoriesPagingInfo.find(function (_) {
        return _.get('productCategory').localeCompare(config.productCategories[0]) === 0;
      });
      expect(bakeryPagingInfo).toBeDefined();
      expect(bakeryPagingInfo.get('totalPageNumber')).toBeDefined();
    });
  });

  test('should capture paging info for product categories with single page', function () {
    var config = {
      "baseUrl": "https://shop.countdown.co.nz/Shop/Browse/",
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery/desserts-pies']
    };
    return new _countdownWebCrawlerService2.default({}).getProductCategoriesPagingInfo(config).then(function (productsCategoriesPagingInfo) {
      expect(productsCategoriesPagingInfo).toBeDefined();

      var bakeryPagingInfo = productsCategoriesPagingInfo.find(function (_) {
        return _.get('productCategory').localeCompare(config.productCategories[0]) === 0;
      });
      expect(bakeryPagingInfo).toBeDefined();
      expect(bakeryPagingInfo.get('totalPageNumber')).toBeDefined();
    });
  });
});

describe('crawl', function () {
  test('should crawl and save to database', function () {
    var config = {
      "baseUrl": "https://shop.countdown.co.nz/Shop/Browse/",
      rateLimit: 2000,
      maxConnections: 1,
      logLevel: 1,
      productCategories: ['bakery/desserts-pies']
    };
    return new _countdownWebCrawlerService2.default({
      config: config,
      logVerboseFunc: function logVerboseFunc(message) {
        return console.log(message);
      },
      logInfoFunc: function logInfoFunc(message) {
        return console.log(message);
      },
      logErrorFunc: function logErrorFunc(message) {
        return console.log(message);
      }
    }).crawl();
  });
});