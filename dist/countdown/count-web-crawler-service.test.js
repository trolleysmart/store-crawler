'use strict';

var _countdownWebCrawlerService = require('./countdown-web-crawler-service');

var _countdownWebCrawlerService2 = _interopRequireDefault(_countdownWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function logInfo(message) {
  console.log(message);
}

function logError(message) {
  console.log(message);
}

describe('crawlProductCategoriesPagingInfo', function () {
  test('should capture all product categories', function () {
    var config = {
      "baseUrl": "https://shop.countdown.co.nz/Shop/Browse/",
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery']
    };
    var service = new _countdownWebCrawlerService2.default(logError, logInfo);

    return service.crawlProductCategoriesPagingInfo(config).then(function (result) {
      expect(result.get('config')).toBeDefined();

      var productsCategoriesPagingInfo = result.get('productsCategoriesPagingInfo');
      expect(productsCategoriesPagingInfo).toBeDefined();

      var bakeryPagingInfo = result.get('productsCategoriesPagingInfo').find(function (_) {
        return _.get('productCategory').localeCompare('bakery') === 0;
      });
      expect(bakeryPagingInfo).toBeDefined();
      expect(bakeryPagingInfo.get('totalPageNumber')).toBeDefined();
    });
  });
});