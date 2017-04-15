'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _smartGroceryParseServerCommon = require('smart-grocery-parse-server-common');

var _smartGroceryParseServerCommon2 = _interopRequireDefault(_smartGroceryParseServerCommon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CountdownWebCrawlerService = function () {
  _createClass(CountdownWebCrawlerService, null, [{
    key: 'getProductCategoriesPagingInfoUsingProvidedConfig',
    value: function getProductCategoriesPagingInfoUsingProvidedConfig(config) {
      return new Promise(function (resolve, reject) {
        var productsCategoriesPagingInfo = (0, _immutable.List)();

        var crawler = new _crawler2.default({
          rateLimit: config.rateLimit,
          maxConnections: config.maxConnections,
          callback: function callback(error, res, done) {
            if (error) {
              done();
              reject('Failed to receive page information for Url: ' + res.request.uri.href + ' - Error: ' + error);

              return;
            }

            var totalPageNumber = parseInt(res.$('.paging-container .paging .page-number').last().text(), 10);

            productsCategoriesPagingInfo = productsCategoriesPagingInfo.push((0, _immutable.Map)({
              productCategory: res.request.uri.href.replace(config.baseUrl, ''),
              totalPageNumber: totalPageNumber || 1
            }));

            done();
          }
        });

        crawler.on('drain', function () {
          return resolve(productsCategoriesPagingInfo);
        });

        config.productCategories.forEach(function (productCategory) {
          return crawler.queue(config.baseUrl + productCategory);
        });
      });
    }
  }, {
    key: 'getBarcodeFromImageUrl',
    value: function getBarcodeFromImageUrl(imageUrl) {
      var str = imageUrl.substr(imageUrl.indexOf('big/') + 4);
      var barcode = str.substr(0, str.indexOf('.jpg'));

      return barcode;
    }
  }]);

  function CountdownWebCrawlerService(config) {
    _classCallCheck(this, CountdownWebCrawlerService);

    this.config = config;

    this.crawl = this.crawl.bind(this);
    this.getProductCategoriesPagingInfo = this.getProductCategoriesPagingInfo.bind(this);
    this.saveDetails = this.saveDetails.bind(this);
    this.getProductDetails = this.getProductDetails.bind(this);
  }

  _createClass(CountdownWebCrawlerService, [{
    key: 'crawl',
    value: function crawl() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var sessionId = void 0;
        return Promise.all([_smartGroceryParseServerCommon2.default.CrawlService.createNewCrawlSession('Countdown', new Date()), _this.getProductCategoriesPagingInfo()]).then(function (results) {
          sessionId = results[0];

          return _this.saveDetails(sessionId, results[1]);
        }).then(function () {
          _smartGroceryParseServerCommon2.default.CrawlService.updateCrawlSessionEndDateTime(sessionId, new Date());
          resolve();
        }).catch(function (error) {
          _smartGroceryParseServerCommon2.default.CrawlService.updateCrawlSessionEndDateTime(sessionId, new Date());
          reject(error);
        });
      });
    }
  }, {
    key: 'getProductCategoriesPagingInfo',
    value: function getProductCategoriesPagingInfo() {
      return this.config ? CountdownWebCrawlerService.getProductCategoriesPagingInfoUsingProvidedConfig(this.config) : _smartGroceryParseServerCommon2.default.CrawlService.getStoreCrawlerConfig('Countdown').then(CountdownWebCrawlerService.getProductCategoriesPagingInfoUsingProvidedConfig);
    }
  }, {
    key: 'saveDetails',
    value: function saveDetails(sessionId, productsCategoriesPagingInfo) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var crawler = new _crawler2.default({
          rateLimit: _this2.config.rateLimit,
          maxConnections: _this2.config.maxConnections,
          callback: function callback(error, res, done) {
            if (error) {
              done();
              reject('Failed to receive products for Url: ' + res.request.uri.href + ' - Error: ' + error);

              return;
            }

            var productCategoryAndPage = res.request.uri.href.replace(_this2.config.baseUrl, '');
            var productCategory = productCategoryAndPage.substring(0, productCategoryAndPage.indexOf('?'));

            _smartGroceryParseServerCommon2.default.CountdownCrawlService.addResultSet(sessionId, {
              productCategory: productCategory,
              products: _this2.getProductDetails(res.$).toJS()
            }).then(function () {
              return done();
            }).catch(function (err) {
              done();
              reject('Failed to receive products for Url: ' + res.request.uri.href + ' - Error: ' + err);
            });
          }
        });

        crawler.on('drain', function () {
          resolve();
        });

        productsCategoriesPagingInfo.forEach(function (productCategoryInfo) {
          return [].concat(_toConsumableArray(Array(productCategoryInfo.get('totalPageNumber')).keys())).forEach(function (pageNumber) {
            return crawler.queue(_this2.config.baseUrl + productCategoryInfo.get('productCategory') + '?page=' + (pageNumber + 1));
          });
        });
      });
    }
  }, {
    key: 'getProductDetails',
    value: function getProductDetails($) {
      var self = this;
      var products = (0, _immutable.List)();

      $('#product-list').filter(function filterProductListCallback() {
        // eslint-disable-line array-callback-return
        var data = $(this);

        data.find('.product-stamp .details-container').each(function onNewProductExtracted() {
          var product = $(this);
          var imageUrl = self.config.baseImageUrl + product.find('.product-stamp-thumbnail img').attr('src');
          var barcode = CountdownWebCrawlerService.getBarcodeFromImageUrl(imageUrl);
          var description = product.find('.description').text();

          products = products.push((0, _immutable.Map)({
            description: description,
            barcode: barcode,
            imageUrl: imageUrl
          }));
        });
      });

      return products;
    }
  }]);

  return CountdownWebCrawlerService;
}();

exports.default = CountdownWebCrawlerService;