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
    key: 'getProductDetails',
    value: function getProductDetails(config, $) {
      var products = (0, _immutable.List)();

      $('#product-list').filter(function filterProductListCallback() {
        // eslint-disable-line array-callback-return
        var data = $(this);

        data.find('.product-stamp .details-container').each(function onNewProductExtracted() {
          var product = $(this);
          var imageUrl = config.baseImageUrl + product.find('.product-stamp-thumbnail img').attr('src');
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
  }, {
    key: 'getBarcodeFromImageUrl',
    value: function getBarcodeFromImageUrl(imageUrl) {
      var str = imageUrl.substr(imageUrl.indexOf('big/') + 4);
      var barcode = str.substr(0, str.indexOf('.jpg'));

      return barcode;
    }
  }]);

  function CountdownWebCrawlerService(_ref) {
    var config = _ref.config,
        logVerboseFunc = _ref.logVerboseFunc,
        logInfoFunc = _ref.logInfoFunc,
        logErrorFunc = _ref.logErrorFunc;

    _classCallCheck(this, CountdownWebCrawlerService);

    this.config = config;
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;

    this.crawl = this.crawl.bind(this);
    this.getProductCategoriesPagingInfo = this.getProductCategoriesPagingInfo.bind(this);
    this.crawlProductsAndSaveDetails = this.crawlProductsAndSaveDetails.bind(this);
    this.logVerbose = this.logVerbose.bind(this);
    this.logInfo = this.logInfo.bind(this);
    this.logError = this.logError.bind(this);
  }

  _createClass(CountdownWebCrawlerService, [{
    key: 'crawl',
    value: function crawl() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var promises = [_smartGroceryParseServerCommon2.default.CrawlService.createNewCrawlSession('Countdown', new Date())];

        if (!_this.config) {
          promises = [].concat(_toConsumableArray(promises), [_smartGroceryParseServerCommon2.default.CrawlService.getStoreCrawlerConfig('Countdown')]);
        }

        var sessionId = void 0;
        var config = _this.config;

        return Promise.all(promises).then(function (results) {
          sessionId = results[0];

          if (!config) {
            config = results[1];
          }

          _this.logInfo(config, 'Start fetching product categories paging info...');

          return _this.getProductCategoriesPagingInfo(config);
        }).then(function (productsCategoriesPagingInfo) {
          _this.logInfo(config, 'Finished fetching product categories paging info.');
          _this.logVerbose(config, 'Fetched product categories paging info: ' + productsCategoriesPagingInfo);

          _this.logInfo(config, 'Start crawling products and save the details...');

          return _this.crawlProductsAndSaveDetails(sessionId, config, productsCategoriesPagingInfo);
        }).then(function () {
          _this.logInfo(config, 'Crawling product successfully completed. Updating crawl session info...');

          _smartGroceryParseServerCommon2.default.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success'
          }).then(function () {
            _this.logInfo(config, 'Updating crawl session info successfully completed.');

            resolve();
          }).catch(function (error) {
            _this.logError(config, 'Updating crawl session info ended in error. Error: ' + error);

            reject(error);
          });
        }).catch(function (error) {
          _this.logInfo(config, 'Crawling product ended in error. Updating crawl session info...');
          _smartGroceryParseServerCommon2.default.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success',
            error: error
          }).then(function () {
            _this.logInfo(config, 'Updating crawl session info successfully completed.');

            reject(error);
          }).catch(function (err) {
            _this.logError(config, 'Updating crawl session info ended in error. Error: ' + err);

            reject(error + ' - ' + err);
          });
        });
      });
    }
  }, {
    key: 'getProductCategoriesPagingInfo',
    value: function getProductCategoriesPagingInfo(config) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var productsCategoriesPagingInfo = (0, _immutable.List)();

        var crawler = new _crawler2.default({
          rateLimit: config.rateLimit,
          maxConnections: config.maxConnections,
          callback: function callback(error, res, done) {
            _this2.logInfo(config, 'Received response for: ' + res.request.uri.href);
            _this2.logVerbose(config, 'Received response for: ' + res);

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
    key: 'crawlProductsAndSaveDetails',
    value: function crawlProductsAndSaveDetails(sessionId, config, productsCategoriesPagingInfo) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var crawler = new _crawler2.default({
          rateLimit: config.rateLimit,
          maxConnections: config.maxConnections,
          callback: function callback(error, res, done) {
            _this3.logInfo(config, 'Received response for: ' + res.request.uri.href);
            _this3.logVerbose(config, 'Received response for: ' + res);

            if (error) {
              done();
              reject('Failed to receive products for Url: ' + res.request.uri.href + ' - Error: ' + error);

              return;
            }

            var productCategoryAndPage = res.request.uri.href.replace(config.baseUrl, '');
            var productCategory = productCategoryAndPage.substring(0, productCategoryAndPage.indexOf('?'));
            var products = CountdownWebCrawlerService.getProductDetails(config, res.$).toJS();

            _this3.logVerbose(config, 'Received products for: ' + res + ' - ' + productCategory + ' - ' + products);
            _smartGroceryParseServerCommon2.default.CountdownCrawlService.addResultSet(sessionId, {
              productCategory: productCategory,
              products: products
            }).then(function () {
              _this3.logInfo(config, 'Successfully added products for: ' + productCategory + '.');

              done();
            }).catch(function (err) {
              _this3.logError(config, 'Failed to save products for: ' + productCategory + '. Error: ' + error);

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
            return crawler.queue(config.baseUrl + productCategoryInfo.get('productCategory') + '?page=' + (pageNumber + 1));
          });
        });
      });
    }
  }, {
    key: 'logVerbose',
    value: function logVerbose(config, message) {
      if (this.logVerboseFunc && config.logLevel >= 3) {
        this.logVerboseFunc(message);
      }
    }
  }, {
    key: 'logInfo',
    value: function logInfo(config, message) {
      if (this.logInfoFunc && config.logLevel >= 2) {
        this.logInfoFunc(message);
      }
    }
  }, {
    key: 'logError',
    value: function logError(config, message) {
      if (this.logErrorFunc && config.logLevel >= 1) {
        this.logErrorFunc(message);
      }
    }
  }]);

  return CountdownWebCrawlerService;
}();

exports.default = CountdownWebCrawlerService;