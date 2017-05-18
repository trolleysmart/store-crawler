'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _smartGroceryParseServerCommon = require('smart-grocery-parse-server-common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CountdownWebCrawlerService = function CountdownWebCrawlerService(_ref) {
  var _this = this;

  var logVerboseFunc = _ref.logVerboseFunc,
      logInfoFunc = _ref.logInfoFunc,
      logErrorFunc = _ref.logErrorFunc;

  _classCallCheck(this, CountdownWebCrawlerService);

  this.crawlHighLevelProductCategories = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(config) {
      var result, sessionInfo, finalConfig, updatedSessionInfo, _updatedSessionInfo;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this.createNewSessionAndGetConfig('Countdown High Level Product Categories', config);

            case 2:
              result = _context.sent;
              sessionInfo = result.get('sessionInfo');
              finalConfig = result.get('config');
              _context.prev = 5;

              _this.logInfo(finalConfig, function () {
                return 'Start fetching product categories paging info...';
              });

              _context.next = 9;
              return _this.crawlHighLevelProductCategoriesAndSaveDetails(sessionInfo.get('id'), finalConfig);

            case 9:

              _this.logInfo(finalConfig, function () {
                return 'Crawling high level product categories successfully completed.';
              });
              _context.next = 17;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context['catch'](5);
              updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                endDateTime: new Date(),
                additionalInfo: (0, _immutable.Map)({
                  status: 'failed',
                  error: _context.t0.getErrorMessage()
                })
              }));
              _context.next = 17;
              return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

            case 17:
              _context.prev = 17;
              _updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                endDateTime: new Date(),
                additionalInfo: (0, _immutable.Map)({
                  status: 'success'
                })
              }));
              _context.next = 21;
              return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo);

            case 21:
              return _context.finish(17);

            case 22:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[5, 12, 17, 22]]);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.crawlProducts = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(config) {
      var result, sessionInfo, finalConfig, productsCategoriesPagingInfo, updatedSessionInfo, _updatedSessionInfo2;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.createNewSessionAndGetConfig('Countdown Products', config);

            case 2:
              result = _context2.sent;
              sessionInfo = result.get('sessionInfo');
              finalConfig = result.get('config');
              _context2.prev = 5;

              _this.logInfo(finalConfig, function () {
                return 'Start fetching product categories paging info...';
              });

              _context2.next = 9;
              return _this.getProductCategoriesPagingInfo(finalConfig);

            case 9:
              productsCategoriesPagingInfo = _context2.sent;

              _this.logInfo(finalConfig, function () {
                return 'Finished fetching product categories paging info.';
              });
              _this.logVerbose(finalConfig, function () {
                return 'Fetched product categories paging info: ' + productsCategoriesPagingInfo;
              });

              _this.logInfo(finalConfig, function () {
                return 'Start crawling products and save the details...';
              });

              _context2.next = 15;
              return _this.crawlProductsAndSaveDetails(sessionInfo.get('id'), finalConfig, productsCategoriesPagingInfo);

            case 15:

              _this.logInfo(finalConfig, function () {
                return 'Crawling product successfully completed.';
              });
              _context2.next = 24;
              break;

            case 18:
              _context2.prev = 18;
              _context2.t0 = _context2['catch'](5);
              updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                endDateTime: new Date(),
                additionalInfo: (0, _immutable.Map)({
                  status: 'failed',
                  error: _context2.t0.getErrorMessage()
                })
              }));
              _context2.next = 23;
              return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

            case 23:
              throw _context2.t0;

            case 24:
              _context2.prev = 24;
              _updatedSessionInfo2 = sessionInfo.merge((0, _immutable.Map)({
                endDateTime: new Date(),
                additionalInfo: (0, _immutable.Map)({
                  status: 'success'
                })
              }));
              _context2.next = 28;
              return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo2);

            case 28:
              return _context2.finish(24);

            case 29:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this, [[5, 18, 24, 29]]);
    }));

    return function (_x2) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.createNewSessionAndGetConfig = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(sessionKey, config) {
      var sessionInfo, promises, finalConfig, results, sessionId;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              sessionInfo = (0, _immutable.Map)({
                sessionKey: sessionKey,
                startDateTime: new Date()
              });
              promises = _immutable.List.of(_smartGroceryParseServerCommon.CrawlSessionService.create(sessionInfo));


              if (!config) {
                promises = promises.push(_smartGroceryParseServerCommon.StoreCrawlerConfigurationService.search((0, _immutable.Map)({
                  conditions: (0, _immutable.Map)({
                    key: 'Countdown'
                  }),
                  topMost: true
                })));
              }

              finalConfig = config;
              _context3.next = 6;
              return Promise.all(promises.toArray());

            case 6:
              results = _context3.sent;
              sessionId = results[0];


              if (!finalConfig) {
                finalConfig = results[1].first().get('config');
              }

              if (finalConfig) {
                _context3.next = 11;
                break;
              }

              throw new _microBusinessParseServerCommon.Exception('Failed to retrieve configuration for Countdown store crawler.');

            case 11:

              _this.logInfo(finalConfig, function () {
                return 'Created session and retrieved config. Session Id: ' + sessionId;
              });
              _this.logVerbose(finalConfig, function () {
                return 'Config: ' + JSON.stringify(finalConfig);
              });

              return _context3.abrupt('return', (0, _immutable.Map)({
                sessionInfo: sessionInfo.set('id', sessionId),
                config: finalConfig
              }));

            case 14:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x3, _x4) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.getProductCategoriesPagingInfo = function (config) {
    return new Promise(function (resolve, reject) {
      var productsCategoriesPagingInfo = (0, _immutable.List)();

      var crawler = new _crawler2.default({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: function callback(error, res, done) {
          _this.logInfo(config, function () {
            return 'Received response for: ' + res.request.uri.href;
          });
          _this.logVerbose(config, function () {
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
  };

  this.crawlHighLevelProductCategoriesAndSaveDetails = function (sessionId, config) {
    return new Promise(function (resolve, reject) {
      var crawler = new _crawler2.default({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: function callback(error, res, done) {
          _this.logInfo(config, function () {
            return 'Received response for: ' + res.request.uri.href;
          });
          _this.logVerbose(config, function () {
            return 'Received response for: ' + JSON.stringify(res);
          });

          if (error) {
            done();
            reject('Failed to receive high level product categories for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

            return;
          }

          var highLevelProductCategories = CountdownWebCrawlerService.getHighLevelProductCategoriesDetails(config, res.$);

          _this.logVerbose(config, function () {
            return 'Received high level product categories: ' + JSON.stringify(highLevelProductCategories.toJS());
          });

          var crawlResult = (0, _immutable.Map)({
            crawlSessionId: sessionId,
            resultSet: (0, _immutable.Map)({
              highLevelProductCategories: highLevelProductCategories
            })
          });

          _smartGroceryParseServerCommon.CrawlResultService.create(crawlResult).then(function () {
            _this.logInfo(config, function () {
              return 'Successfully added high level product categories.';
            });

            done();
          }).catch(function (err) {
            _this.logError(config, function () {
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
  };

  this.crawlProductsAndSaveDetails = function (sessionId, config, productsCategoriesPagingInfo) {
    return new Promise(function (resolve, reject) {
      var crawler = new _crawler2.default({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: function callback(error, res, done) {
          _this.logInfo(config, function () {
            return 'Received response for: ' + res.request.uri.href;
          });
          _this.logVerbose(config, function () {
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

          _this.logVerbose(config, function () {
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
            _this.logInfo(config, function () {
              return 'Successfully added products for: ' + productCategory + '.';
            });

            done();
          }).catch(function (err) {
            _this.logError(config, function () {
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
  };

  this.logVerbose = function (config, messageFunc) {
    if (_this.logVerboseFunc && config && config.get('logLevel') && config.get('logLevel') >= 3 && messageFunc) {
      _this.logVerboseFunc(messageFunc());
    }
  };

  this.logInfo = function (config, messageFunc) {
    if (_this.logInfoFunc && config && config.get('logLevel') && config.get('logLevel') >= 2 && messageFunc) {
      _this.logInfoFunc(messageFunc());
    }
  };

  this.logError = function (config, messageFunc) {
    if (_this.logErrorFunc && config && config.get('logLevel') && config.get('logLevel') >= 1 && messageFunc) {
      _this.logErrorFunc(messageFunc());
    }
  };

  this.logVerboseFunc = logVerboseFunc;
  this.logInfoFunc = logInfoFunc;
  this.logErrorFunc = logErrorFunc;
};

CountdownWebCrawlerService.getHighLevelProductCategoriesDetails = function (config, $) {
  var highLevelProductCategories = (0, _immutable.List)();

  $('#BrowseSlideBox').filter(function filterHighLevelProductCategoriesCallback() {
    // eslint-disable-line array-callback-return
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
};

CountdownWebCrawlerService.getProductDetails = function (config, $) {
  var products = (0, _immutable.List)();

  $('#product-list').filter(function filterProductListCallback() {
    // eslint-disable-line array-callback-return
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
};

CountdownWebCrawlerService.convertBoolValToObjectProperty = function (val) {
  if (val) {
    return val ? true : undefined;
  }

  return undefined;
};

CountdownWebCrawlerService.convertStringValToObjectProperty = function (val) {
  if (val) {
    return val.length > 0 ? val : undefined;
  }

  return undefined;
};

CountdownWebCrawlerService.getBarcodeFromImageUrl = function (imageUrl) {
  var str = imageUrl.substr(imageUrl.indexOf('big/') + 4);
  var barcode = str.substr(0, str.indexOf('.jpg'));

  return barcode;
};

exports.default = CountdownWebCrawlerService;