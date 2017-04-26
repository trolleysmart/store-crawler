'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CountdownWebCrawlerService = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _monet = require('monet');

var _smartGroceryParseServerCommon = require('smart-grocery-parse-server-common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

      return config.get('highLevelProductCategoriesFilterList') ? highLevelProductCategories.filterNot(function (_) {
        return config.get('highLevelProductCategoriesFilterList').find(function (item) {
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
          var imageUrl = config.get('baseImageUrl') + product.find('.product-stamp-thumbnail img').attr('src');
          var barcode = CountdownWebCrawlerService.getBarcodeFromImageUrl(imageUrl);
          var description = product.find('.description').text().trim();
          var productTagSource = product.find('.product-tag-desktop img').attr('src');
          var productTagSourceString = productTagSource ? productTagSource.toLowerCase().trim() : '';
          var special = productTagSourceString.includes('badge-special');
          var lockdownPrice = productTagSourceString.includes('badge-pricelockdown');
          var lowPriceEveryDay = productTagSourceString.includes('low_price');
          var glutenFree = productTagSourceString.includes('badge-gluten-free');
          var newItem = productTagSourceString.includes('badge-new');
          var onecard = productTagSourceString.includes('badge-onecard');
          var viewNutritionInfo = productTagSourceString.includes('view-nutrition-info');
          var fairTradePromotion = productTagSourceString.includes('fairtrade-promo');
          var specialMultiBuyIconUrl = productTagSourceString.match(/\dfor\d/);
          var specialMultiBuyText = specialMultiBuyIconUrl ? productTagSourceString.substring(productTagSourceString.lastIndexOf('/') + 1, productTagSourceString.indexOf('.')) : '';
          var multipleBuyTextLink = product.find('.product-tag-desktop .visible-phone .multi-buy-text-link');
          var multiBuyText = multipleBuyTextLink ? multipleBuyTextLink.attr('title') : undefined;
          var price = product.find('.price').text().trim();
          var wasPrice = product.find('.was-price').text().trim();
          var clubPriceTag = product.find('.club-price-wrapper');
          var clubPrice = clubPriceTag ? clubPriceTag.text().trim() : undefined;
          var nonClubPriceTag = product.find('.grid-non-club-price');
          var nonClubPrice = nonClubPriceTag ? nonClubPriceTag.text().trim() : undefined;

          products = products.push((0, _immutable.Map)({
            description: CountdownWebCrawlerService.convertStringValToObjectProperty(description),
            barcode: CountdownWebCrawlerService.convertStringValToObjectProperty(barcode),
            imageUrl: CountdownWebCrawlerService.convertStringValToObjectProperty(imageUrl),
            special: CountdownWebCrawlerService.convertBoolValToObjectProperty(special),
            lowPriceEveryDay: CountdownWebCrawlerService.convertBoolValToObjectProperty(lowPriceEveryDay),
            lockdownPrice: CountdownWebCrawlerService.convertBoolValToObjectProperty(lockdownPrice),
            glutenFree: CountdownWebCrawlerService.convertBoolValToObjectProperty(glutenFree),
            newItem: CountdownWebCrawlerService.convertBoolValToObjectProperty(newItem),
            onecard: CountdownWebCrawlerService.convertBoolValToObjectProperty(onecard),
            viewNutritionInfo: CountdownWebCrawlerService.convertBoolValToObjectProperty(viewNutritionInfo),
            fairTradePromotion: CountdownWebCrawlerService.convertBoolValToObjectProperty(fairTradePromotion),
            specialMultiBuyText: CountdownWebCrawlerService.convertStringValToObjectProperty(specialMultiBuyText),
            multiBuyText: CountdownWebCrawlerService.convertStringValToObjectProperty(multiBuyText),
            price: CountdownWebCrawlerService.convertStringValToObjectProperty(price),
            wasPrice: CountdownWebCrawlerService.convertStringValToObjectProperty(wasPrice),
            clubPrice: CountdownWebCrawlerService.convertStringValToObjectProperty(clubPrice),
            nonClubPrice: CountdownWebCrawlerService.convertStringValToObjectProperty(nonClubPrice)
          }));
        });
      });

      return products;
    }
  }, {
    key: 'convertBoolValToObjectProperty',
    value: function convertBoolValToObjectProperty(val) {
      if (val) {
        return val ? true : undefined;
      }
      return undefined;
    }
  }, {
    key: 'convertStringValToObjectProperty',
    value: function convertStringValToObjectProperty(val) {
      if (val) {
        return val.length > 0 ? val : undefined;
      }
      return undefined;
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
        var sessionInfo = void 0;
        var finalConfig = void 0;

        return _this.createNewSessionAndGetConfig('Countdown High Level Product Categories', config).then(function (result) {
          sessionInfo = result.get('sessionInfo');
          finalConfig = result.get('config');

          _this.logInfo(finalConfig, function () {
            return 'Start fetching product categories paging info...';
          });

          return _this.crawlHighLevelProductCategoriesAndSaveDetails(sessionInfo.get('id'), finalConfig);
        }).then(function () {
          _this.logInfo(finalConfig, function () {
            return 'Crawling high level product categories successfully completed. Updating crawl session info...';
          });

          var updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
            endDateTime: _monet.Maybe.Some(new Date()),
            additionalInfo: _monet.Maybe.Some((0, _immutable.Map)({
              status: 'success'
            }))
          }));

          _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo).then(function () {
            _this.logInfo(finalConfig, function () {
              return 'Updating crawl session info successfully completed.';
            });

            resolve();
          }).catch(function (error) {
            _this.logError(finalConfig, function () {
              return 'Updating crawl session info ended in error. Error: ' + JSON.stringify(error);
            });

            reject(error);
          });
        }).catch(function (error) {
          if (!sessionInfo) {
            _this.logError(finalConfig, function () {
              return 'Crawling product high level categories ended in error. Error: ' + JSON.stringify(error);
            });
            reject(error);

            return;
          }

          _this.logError(finalConfig, function () {
            return 'Crawling product high level categories ended in error. Updating crawl session info... Error: ' + JSON.stringify(error);
          });

          var updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
            endDateTime: _monet.Maybe.Some(new Date()),
            additionalInfo: _monet.Maybe.Some((0, _immutable.Map)({
              status: 'failed',
              error: error
            }))
          }));

          _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo).then(function () {
            _this.logInfo(finalConfig, function () {
              return 'Updating crawl session info successfully completed.';
            });

            reject(error);
          }).catch(function (err) {
            _this.logError(finalConfig, function () {
              return 'Updating crawl session info ended in error. Error: ' + JSON.stringify(err);
            });

            reject(JSON.stringify(error) + ' - ' + JSON.stringify(err));
          });
        });
      });
    }
  }, {
    key: 'crawlProducts',
    value: function crawlProducts(config) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var sessionInfo = void 0;
        var finalConfig = void 0;

        return _this2.createNewSessionAndGetConfig('Countdown Products', config).then(function (result) {
          sessionInfo = result.get('sessionInfo');
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

          return _this2.crawlProductsAndSaveDetails(sessionInfo.get('id'), finalConfig, productsCategoriesPagingInfo);
        }).then(function () {
          _this2.logInfo(finalConfig, function () {
            return 'Crawling product successfully completed. Updating crawl session info...';
          });

          var updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
            endDateTime: _monet.Maybe.Some(new Date()),
            additionalInfo: _monet.Maybe.Some((0, _immutable.Map)({
              status: 'success'
            }))
          }));

          _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo).then(function () {
            _this2.logInfo(finalConfig, function () {
              return 'Updating crawl session info successfully completed.';
            });

            resolve();
          }).catch(function (error) {
            _this2.logError(finalConfig, function () {
              return 'Updating crawl session info ended in error. Error: ' + JSON.stringify(error);
            });

            reject(error);
          });
        }).catch(function (error) {
          if (!sessionInfo) {
            _this2.logError(finalConfig, function () {
              return 'Crawling product ended in error. Error: ' + JSON.stringify(error);
            });
            reject(error);

            return;
          }

          _this2.logError(finalConfig, function () {
            return 'Crawling product ended in error. Updating crawl session info... Error: ' + JSON.stringify(error);
          });

          var updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
            endDateTime: _monet.Maybe.Some(new Date()),
            additionalInfo: _monet.Maybe.Some((0, _immutable.Map)({
              status: 'failed',
              error: error
            }))
          }));

          _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo).then(function () {
            _this2.logInfo(finalConfig, function () {
              return 'Updating crawl session info successfully completed.';
            });

            reject(error);
          }).catch(function (err) {
            _this2.logError(finalConfig, function () {
              return 'Updating crawl session info ended in error. Error: ' + JSON.stringify(err);
            });

            reject(JSON.stringify(error) + ' - ' + JSON.stringify(err));
          });
        });
      });
    }
  }, {
    key: 'createNewSessionAndGetConfig',
    value: function createNewSessionAndGetConfig(sessionKey, config) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var sessionInfo = (0, _immutable.Map)({
          sessionKey: sessionKey,
          startDateTime: _monet.Maybe.Some(new Date()),
          endDateTime: _monet.Maybe.None(),
          additionalInfo: _monet.Maybe.None()
        });
        var promises = _immutable.List.of(_smartGroceryParseServerCommon.CrawlSessionService.create(sessionInfo));

        if (!config) {
          promises = promises.push(_smartGroceryParseServerCommon.StoreCrawlerConfigurationService.search((0, _immutable.Map)({
            key: 'Countdown',
            latest: true
          })));
        }

        var sessionId = void 0;
        var finalConfig = config;

        return Promise.all(promises.toArray()).then(function (results) {
          sessionId = results[0];

          if (!finalConfig) {
            finalConfig = results[1].first().get('config');
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
            sessionInfo: sessionInfo.set('id', sessionId),
            config: finalConfig
          }));
        }).catch(function (error) {
          _this3.logError(finalConfig, function () {
            return 'Failed to create session and/or retrieving config. Error: ' + JSON.stringify(error);
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
          rateLimit: config.get('rateLimit'),
          maxConnections: config.get('maxConnections'),
          callback: function callback(error, res, done) {
            _this4.logInfo(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });
            _this4.logVerbose(config, function () {
              return 'Received response for: ' + JSON.stringify(res);
            });

            if (error) {
              done();
              reject('Failed to receive page information for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var totalPageNumber = parseInt(res.$('.paging-container .paging .page-number').last().text(), 10);

            productsCategoriesPagingInfo = productsCategoriesPagingInfo.push((0, _immutable.Map)({
              productCategory: res.request.uri.href.replace(config.get('baseUrl'), ''),
              totalPageNumber: totalPageNumber || 1
            }));

            done();
          }
        });

        crawler.on('drain', function () {
          return resolve(productsCategoriesPagingInfo);
        });

        config.get('productCategories').forEach(function (productCategory) {
          return crawler.queue(config.get('baseUrl') + productCategory);
        });
      });
    }
  }, {
    key: 'crawlHighLevelProductCategoriesAndSaveDetails',
    value: function crawlHighLevelProductCategoriesAndSaveDetails(sessionId, config) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        var crawler = new _crawler2.default({
          rateLimit: config.get('rateLimit'),
          maxConnections: config.get('maxConnections'),
          callback: function callback(error, res, done) {
            _this5.logInfo(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });
            _this5.logVerbose(config, function () {
              return 'Received response for: ' + JSON.stringify(res);
            });

            if (error) {
              done();
              reject('Failed to receive high level product categories for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var highLevelProductCategories = CountdownWebCrawlerService.getHighLevelProductCategoriesDetails(config, res.$);

            _this5.logVerbose(config, function () {
              return 'Received high level product categories: ' + JSON.stringify(highLevelProductCategories.toJS());
            });

            var crawlResult = (0, _immutable.Map)({
              crawlSessionId: sessionId,
              resultSet: (0, _immutable.Map)({
                highLevelProductCategories: highLevelProductCategories
              })
            });

            _smartGroceryParseServerCommon.CrawlResultService.create(crawlResult).then(function () {
              _this5.logInfo(config, function () {
                return 'Successfully added high level product categories.';
              });

              done();
            }).catch(function (err) {
              _this5.logError(config, function () {
                return 'Failed to save high level product categories. Error: ' + JSON.stringify(err);
              });

              done();
              reject('Failed to save high level product categories. Error: ' + JSON.stringify(err));
            });
          }
        });

        crawler.on('drain', function () {
          resolve();
        });

        crawler.queue(config.get('baseUrl'));
      });
    }
  }, {
    key: 'crawlProductsAndSaveDetails',
    value: function crawlProductsAndSaveDetails(sessionId, config, productsCategoriesPagingInfo) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        var crawler = new _crawler2.default({
          rateLimit: config.get('rateLimit'),
          maxConnections: config.get('maxConnections'),
          callback: function callback(error, res, done) {
            _this6.logInfo(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });
            _this6.logVerbose(config, function () {
              return 'Received response for: ' + JSON.stringify(res);
            });

            if (error) {
              done();
              reject('Failed to receive products for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var productCategoryAndPage = res.request.uri.href.replace(config.get('baseUrl'), '');
            var productCategory = productCategoryAndPage.substring(0, productCategoryAndPage.indexOf('?'));
            var products = CountdownWebCrawlerService.getProductDetails(config, res.$);

            _this6.logVerbose(config, function () {
              return 'Received products for: ' + JSON.stringify(res) + ' - ' + productCategory + ' - ' + JSON.stringify(products.toJS());
            });

            var crawlResult = (0, _immutable.Map)({
              crawlSessionId: sessionId,
              resultSet: (0, _immutable.Map)({
                productCategory: productCategory,
                products: products
              })
            });

            _smartGroceryParseServerCommon.CrawlResultService.create(crawlResult).then(function () {
              _this6.logInfo(config, function () {
                return 'Successfully added products for: ' + productCategory + '.';
              });

              done();
            }).catch(function (err) {
              _this6.logError(config, function () {
                return 'Failed to save products for: ' + productCategory + '. Error: ' + JSON.stringify(err);
              });

              done();
              reject('Failed to save products for: ' + productCategory + '. Error: ' + JSON.stringify(err));
            });
          }
        });

        crawler.on('drain', function () {
          resolve();
        });

        productsCategoriesPagingInfo.forEach(function (productCategoryInfo) {
          return (0, _immutable.Range)(0, productCategoryInfo.get('totalPageNumber')).forEach(function (pageNumber) {
            return crawler.queue(config.get('baseUrl') + productCategoryInfo.get('productCategory') + '?page=' + (pageNumber + 1));
          });
        });
      });
    }
  }, {
    key: 'logVerbose',
    value: function logVerbose(config, messageFunc) {
      if (this.logVerboseFunc && config && config.get('logLevel') && config.get('logLevel') >= 3 && messageFunc) {
        this.logVerboseFunc(messageFunc());
      }
    }
  }, {
    key: 'logInfo',
    value: function logInfo(config, messageFunc) {
      if (this.logInfoFunc && config && config.get('logLevel') && config.get('logLevel') >= 2 && messageFunc) {
        this.logInfoFunc(messageFunc());
      }
    }
  }, {
    key: 'logError',
    value: function logError(config, messageFunc) {
      if (this.logErrorFunc && config && config.get('logLevel') && config.get('logLevel') >= 1 && messageFunc) {
        this.logErrorFunc(messageFunc());
      }
    }
  }]);

  return CountdownWebCrawlerService;
}();

exports.CountdownWebCrawlerService = CountdownWebCrawlerService;
exports.default = CountdownWebCrawlerService;