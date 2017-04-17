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
    key: 'getHighLevelProductCategoriesDetails',
    value: function getHighLevelProductCategoriesDetails(config, $) {
      var highLevelProductCategories = (0, _immutable.List)();

      $('#BrowseSlideBox').filter(function filterHighLevelProductCategoriesCallback() {
        // eslint-disable-line array-callback-return
        var data = $(this);

        data.find('.toolbar-slidebox-item').each(function onNewProductExtracted() {
          var highLevelProductCategory = $(this).find('.toolbar-slidebox-link').attr('href');

          highLevelProductCategories = highLevelProductCategories.push(highLevelProductCategory.substring(highLevelProductCategory.lastIndexOf('/') + 1, highLevelProductCategory.length));
        });
      });

      return config.highLevelProductCategoriesFilterList ? highLevelProductCategories.filterNot(function (_) {
        return config.highLevelProductCategoriesFilterList.find(function (item) {
          return item.trim().toLowerCase().localeCompare(_.trim().toLowerCase()) === 0;
        });
      }) : highLevelProductCategories;
    }
  }, {
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
          var description = product.find('.description').text().trim();
          var productTagSource = product.find('.product-tag-desktop img').attr('src');
          var special = productTagSource ? productTagSource.toLowerCase().includes('badge-special') : undefined;
          var lockdownPrice = productTagSource ? productTagSource.toLowerCase().includes('badge-pricelockdown') : undefined;
          var lowPriceEveryDay = productTagSource ? productTagSource.toLowerCase().includes('low_price') : undefined;
          var glutenFree = productTagSource ? productTagSource.toLowerCase().includes('badge-gluten-free') : undefined;
          var newItem = productTagSource ? productTagSource.toLowerCase().includes('badge-new') : undefined;
          var onecard = productTagSource ? productTagSource.toLowerCase().includes('badge-onecard') : undefined;
          var viewNutritionInfo = productTagSource ? productTagSource.toLowerCase().includes('view-nutrition-info') : undefined;
          var fairTradePromotion = productTagSource ? productTagSource.toLowerCase().includes('fairtrade-promo') : undefined;
          var multipleBuyTextLink = product.find('.product-tag-desktop .visible-phone .multi-buy-text-link');
          var multiBuyText = multipleBuyTextLink ? multipleBuyTextLink.attr('title') : undefined;
          var price = product.find('.price').text().trim();
          var wasPrice = product.find('.was-price').text().trim();

          products = products.push((0, _immutable.Map)({
            description: description,
            barcode: barcode.length > 0 ? barcode : undefined,
            imageUrl: imageUrl.length > 0 ? imageUrl : undefined,
            special: special ? true : undefined,
            lowPriceEveryDay: lowPriceEveryDay ? true : undefined,
            lockdownPrice: lockdownPrice ? true : undefined,
            glutenFree: glutenFree ? true : undefined,
            newItem: newItem ? true : undefined,
            onecard: onecard ? true : undefined,
            viewNutritionInfo: viewNutritionInfo ? true : undefined,
            fairTradePromotion: fairTradePromotion ? true : undefined,
            multiBuyText: multiBuyText,
            price: price.length > 0 ? price : undefined,
            wasPrice: wasPrice.length > 0 ? wasPrice : undefined
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
    var logVerboseFunc = _ref.logVerboseFunc,
        logInfoFunc = _ref.logInfoFunc,
        logErrorFunc = _ref.logErrorFunc;

    _classCallCheck(this, CountdownWebCrawlerService);

    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;

    this.crawlHighLevelProductCategories = this.crawlHighLevelProductCategories.bind(this);
    this.crawlProducts = this.crawlProducts.bind(this);
    this.getProductCategoriesPagingInfo = this.getProductCategoriesPagingInfo.bind(this);
    this.crawlHighLevelProductCategoriesAndSaveDetails = this.crawlHighLevelProductCategoriesAndSaveDetails.bind(this);
    this.crawlProductsAndSaveDetails = this.crawlProductsAndSaveDetails.bind(this);
    this.logVerbose = this.logVerbose.bind(this);
    this.logInfo = this.logInfo.bind(this);
    this.logError = this.logError.bind(this);
  }

  _createClass(CountdownWebCrawlerService, [{
    key: 'crawlHighLevelProductCategories',
    value: function crawlHighLevelProductCategories(config) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var sessionId = void 0;
        var finalConfig = void 0;

        return _this.createNewSessionAndGetConfig('Countdown High Level Product Categories', config).then(function (result) {
          sessionId = result.get('sessionId');
          finalConfig = result.get('config');

          _this.logInfo(finalConfig, function () {
            return 'Start fetching product categories paging info...';
          });

          return _this.crawlHighLevelProductCategoriesAndSaveDetails(sessionId, finalConfig);
        }).then(function () {
          _this.logInfo(finalConfig, function () {
            return 'Crawling high level product categories successfully completed. Updating crawl session info...';
          });

          _smartGroceryParseServerCommon2.default.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success'
          }).then(function () {
            _this.logInfo(finalConfig, function () {
              return 'Updating crawl session info successfully completed.';
            });

            resolve();
          }).catch(function (error) {
            _this.logError(finalConfig, function () {
              return 'Updating crawl session info ended in error. Error: ' + error;
            });

            reject(error);
          });
        }).catch(function (error) {
          if (!sessionId) {
            _this.logError(finalConfig, function () {
              return 'Crawling product high level categories ended in error. Error: ' + error;
            });
            reject(error);

            return;
          }

          _this.logError(finalConfig, function () {
            return 'Crawling product high level categories ended in error. Updating crawl session info... Error: ' + error;
          });

          _smartGroceryParseServerCommon2.default.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success',
            error: error
          }).then(function () {
            _this.logInfo(finalConfig, function () {
              return 'Updating crawl session info successfully completed.';
            });

            reject(error);
          }).catch(function (err) {
            _this.logError(finalConfig, function () {
              return 'Updating crawl session info ended in error. Error: ' + err;
            });

            reject(error + ' - ' + err);
          });
        });
      });
    }
  }, {
    key: 'crawlProducts',
    value: function crawlProducts(config) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var sessionId = void 0;
        var finalConfig = void 0;

        return _this2.createNewSessionAndGetConfig('Countdown Products', config).then(function (result) {
          sessionId = result.get('sessionId');
          finalConfig = result.get('config');

          _this2.logInfo(finalConfig, function () {
            return 'Start fetching product categories paging info...';
          });

          return _this2.getProductCategoriesPagingInfo(finalConfig);
        }).then(function (productsCategoriesPagingInfo) {
          _this2.logInfo(finalConfig, function () {
            return 'Finished fetching product categories paging info.';
          });
          _this2.logVerbose(finalConfig, function () {
            return 'Fetched product categories paging info: ' + productsCategoriesPagingInfo;
          });

          _this2.logInfo(finalConfig, function () {
            return 'Start crawling products and save the details...';
          });

          return _this2.crawlProductsAndSaveDetails(sessionId, finalConfig, productsCategoriesPagingInfo);
        }).then(function () {
          _this2.logInfo(finalConfig, function () {
            return 'Crawling product successfully completed. Updating crawl session info...';
          });

          _smartGroceryParseServerCommon2.default.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success'
          }).then(function () {
            _this2.logInfo(finalConfig, function () {
              return 'Updating crawl session info successfully completed.';
            });

            resolve();
          }).catch(function (error) {
            _this2.logError(finalConfig, function () {
              return 'Updating crawl session info ended in error. Error: ' + error;
            });

            reject(error);
          });
        }).catch(function (error) {
          if (!sessionId) {
            _this2.logError(finalConfig, function () {
              return 'Crawling product ended in error. Error: ' + error;
            });
            reject(error);

            return;
          }

          _this2.logError(finalConfig, function () {
            return 'Crawling product ended in error. Updating crawl session info... Error: ' + error;
          });

          _smartGroceryParseServerCommon2.default.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success',
            error: error
          }).then(function () {
            _this2.logInfo(finalConfig, function () {
              return 'Updating crawl session info successfully completed.';
            });

            reject(error);
          }).catch(function (err) {
            _this2.logError(finalConfig, function () {
              return 'Updating crawl session info ended in error. Error: ' + err;
            });

            reject(error + ' - ' + err);
          });
        });
      });
    }
  }, {
    key: 'createNewSessionAndGetConfig',
    value: function createNewSessionAndGetConfig(sessionKey, config) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var promises = [_smartGroceryParseServerCommon2.default.CrawlService.createNewCrawlSession(sessionKey, new Date())];

        if (!config) {
          promises = [].concat(_toConsumableArray(promises), [_smartGroceryParseServerCommon2.default.CrawlService.getStoreCrawlerConfig('Countdown')]);
        }

        var sessionId = void 0;
        var finalConfig = config;

        return Promise.all(promises).then(function (results) {
          sessionId = results[0];

          if (!finalConfig) {
            finalConfig = results[1];
          }

          if (!finalConfig) {
            reject('Failed to retrieve configuration for Countdown store crawler.');

            return;
          }

          _this3.logInfo(finalConfig, function () {
            return 'Created session and retrieved config. Session Id: ' + sessionId;
          });
          _this3.logVerbose(finalConfig, function () {
            return 'Config: ' + JSON.stringify(finalConfig);
          });

          resolve((0, _immutable.Map)({
            sessionId: sessionId,
            config: finalConfig
          }));
        }).catch(function (error) {
          _this3.logError(finalConfig, function () {
            return 'Failed to create session and/or retrieving config. Error: ' + error;
          });
          reject(error);
        });
      });
    }
  }, {
    key: 'getProductCategoriesPagingInfo',
    value: function getProductCategoriesPagingInfo(config) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var productsCategoriesPagingInfo = (0, _immutable.List)();

        var crawler = new _crawler2.default({
          rateLimit: config.rateLimit,
          maxConnections: config.maxConnections,
          callback: function callback(error, res, done) {
            _this4.logInfo(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });
            _this4.logVerbose(config, function () {
              return 'Received response for: ' + JSON.stringify(res);
            });

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
    key: 'crawlHighLevelProductCategoriesAndSaveDetails',
    value: function crawlHighLevelProductCategoriesAndSaveDetails(sessionId, config) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        var crawler = new _crawler2.default({
          rateLimit: config.rateLimit,
          maxConnections: config.maxConnections,
          callback: function callback(error, res, done) {
            _this5.logInfo(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });
            _this5.logVerbose(config, function () {
              return 'Received response for: ' + JSON.stringify(res);
            });

            if (error) {
              done();
              reject('Failed to receive high level product categories for Url: ' + res.request.uri.href + ' - Error: ' + error);

              return;
            }

            var highLevelProductCategories = CountdownWebCrawlerService.getHighLevelProductCategoriesDetails(config, res.$).toJS();

            _this5.logVerbose(config, function () {
              return 'Received high level product categories: ' + JSON.stringify(highLevelProductCategories);
            });

            _smartGroceryParseServerCommon2.default.CrawlService.addResultSet(sessionId, {
              highLevelProductCategories: highLevelProductCategories
            }).then(function () {
              _this5.logInfo(config, function () {
                return 'Successfully added high level product categories.';
              });

              done();
            }).catch(function (err) {
              _this5.logError(config, function () {
                return 'Failed to save high level product categories. Error: ' + err;
              });

              done();
              reject('Failed to save high level product categories. Error: ' + err);
            });
          }
        });

        crawler.on('drain', function () {
          resolve();
        });

        crawler.queue(config.baseUrl);
      });
    }
  }, {
    key: 'crawlProductsAndSaveDetails',
    value: function crawlProductsAndSaveDetails(sessionId, config, productsCategoriesPagingInfo) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        var crawler = new _crawler2.default({
          rateLimit: config.rateLimit,
          maxConnections: config.maxConnections,
          callback: function callback(error, res, done) {
            _this6.logInfo(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });
            _this6.logVerbose(config, function () {
              return 'Received response for: ' + JSON.stringify(res);
            });

            if (error) {
              done();
              reject('Failed to receive products for Url: ' + res.request.uri.href + ' - Error: ' + error);

              return;
            }

            var productCategoryAndPage = res.request.uri.href.replace(config.baseUrl, '');
            var productCategory = productCategoryAndPage.substring(0, productCategoryAndPage.indexOf('?'));
            var products = CountdownWebCrawlerService.getProductDetails(config, res.$).toJS();

            _this6.logVerbose(config, function () {
              return 'Received products for: ' + JSON.stringify(res) + ' - ' + productCategory + ' - ' + JSON.stringify(products);
            });

            _smartGroceryParseServerCommon2.default.CrawlService.addResultSet(sessionId, {
              productCategory: productCategory,
              products: products
            }).then(function () {
              _this6.logInfo(config, function () {
                return 'Successfully added products for: ' + productCategory + '.';
              });

              done();
            }).catch(function (err) {
              _this6.logError(config, function () {
                return 'Failed to save products for: ' + productCategory + '. Error: ' + err;
              });

              done();
              reject('Failed to save products for: ' + productCategory + '. Error: ' + err);
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
    value: function logVerbose(config, messageFunc) {
      if (this.logVerboseFunc && config && config.logLevel && config.logLevel >= 3 && messageFunc) {
        this.logVerboseFunc(messageFunc());
      }
    }
  }, {
    key: 'logInfo',
    value: function logInfo(config, messageFunc) {
      if (this.logInfoFunc && config && config.logLevel && config.logLevel >= 2 && messageFunc) {
        this.logInfoFunc(messageFunc());
      }
    }
  }, {
    key: 'logError',
    value: function logError(config, messageFunc) {
      if (this.logErrorFunc && config && config.logLevel && config.logLevel >= 1 && messageFunc) {
        this.logErrorFunc(messageFunc());
      }
    }
  }]);

  return CountdownWebCrawlerService;
}();

exports.default = CountdownWebCrawlerService;