'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _smartGroceryParseServerCommon = require('smart-grocery-parse-server-common');

var _common = require('../common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CountdownWebCrawlerService = function (_ServiceBase) {
  _inherits(CountdownWebCrawlerService, _ServiceBase);

  function CountdownWebCrawlerService() {
    var _ref,
        _this2 = this;

    var _temp, _this, _ret;

    _classCallCheck(this, CountdownWebCrawlerService);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CountdownWebCrawlerService.__proto__ || Object.getPrototypeOf(CountdownWebCrawlerService)).call.apply(_ref, [this].concat(args))), _this), _this.crawlProductCategories = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(config) {
        var result, sessionInfo, sessionId, finalConfig, productCategories, crawlResult, updatedSessionInfo, errorMessage, _updatedSessionInfo;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.createNewCrawlSessionAndGetStoreCrawlerConfig('Countdown Product Categories', config, 'Countdown');

              case 2:
                result = _context.sent;
                sessionInfo = result.get('sessionInfo');
                sessionId = sessionInfo.get('id');
                finalConfig = result.get('config');
                _context.prev = 6;
                _context.next = 9;
                return _this.crawlLevelOneProductCategories(finalConfig);

              case 9:
                productCategories = _context.sent;
                _context.next = 12;
                return _this.crawlLevelTwoProductCategories(finalConfig, productCategories);

              case 12:
                productCategories = _context.sent;
                _context.next = 15;
                return _this.crawlLevelThreeProductCategories(finalConfig, productCategories);

              case 15:
                productCategories = _context.sent;
                crawlResult = (0, _immutable.Map)({
                  crawlSessionId: sessionId,
                  resultSet: (0, _immutable.Map)({
                    productCategories: productCategories.toJS()
                  })
                });
                _context.next = 19;
                return _smartGroceryParseServerCommon.CrawlResultService.create(crawlResult);

              case 19:
                updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'success'
                  })
                }));
                _context.next = 22;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

              case 22:
                _context.next = 31;
                break;

              case 24:
                _context.prev = 24;
                _context.t0 = _context['catch'](6);
                errorMessage = _context.t0 instanceof _microBusinessParseServerCommon.Exception ? _context.t0.getErrorMessage() : _context.t0;
                _updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'failed',
                    error: errorMessage
                  })
                }));
                _context.next = 30;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo);

              case 30:
                throw _context.t0;

              case 31:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2, [[6, 24]]);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }(), _this.crawlLevelOneProductCategories = function (config) {
      var productCategories = (0, _immutable.List)();

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
              reject('Failed to receive product categories for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var $ = res.$;

            $('#BrowseSlideBox .row-fluid').children().filter(function filterCategoriesColumns() {
              $(this).find('.toolbar-slidebox-item').each(function filterProductCategory() {
                var menuItem = $(this).find('.toolbar-slidebox-link');
                var url = menuItem.attr('href');
                var categoryKey = url.substring(url.lastIndexOf('/') + 1, url.length);

                if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
                  return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
                })) {
                  return 0;
                }

                productCategories = productCategories.push((0, _immutable.Map)({
                  categoryKey: categoryKey,
                  description: menuItem.text().trim(),
                  url: '' + config.get('baseUrl') + url,
                  weight: 1
                }));

                return 0;
              });

              return 0;
            });

            done();
          }
        });

        crawler.on('drain', function () {
          return resolve(productCategories);
        });
        crawler.queue(config.get('baseUrl'));
      });
    }, _this.crawlLevelTwoProductCategories = function (config, productCategories) {
      var updatedProductCategories = productCategories;

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
              reject('Failed to receive product categories for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var levelOneProductCategoryIdx = productCategories.findIndex(function (_) {
              return _.get('url').localeCompare(res.request.uri.href) === 0;
            });

            if (levelOneProductCategoryIdx === -1) {
              // Ignoring the returned URL as looks like Warehouse forward the URL to other different categories
              _this.logError(config, function () {
                return 'Failed to match retrieved URL ' + res.request.uri.href + ' against provided level one category.';
              });

              return;
            }

            var levelOneProductCategory = productCategories.get(levelOneProductCategoryIdx);
            var $ = res.$;
            var levelTwoProductCategories = (0, _immutable.List)();

            $('#left-navigation #navigation-panel .single-level-navigation .navigation-toggle-children .clearfix').children().filter(function filterLeftNavigationPanel() {
              $(this).each(function filterProductCategory() {
                var menuItem = $(this).find('.din');
                var url = menuItem.attr('href');
                var categoryKey = url.substring(url.lastIndexOf('/') + 1, url.length);

                if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
                  return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
                })) {
                  return 0;
                }

                levelTwoProductCategories = levelTwoProductCategories.push((0, _immutable.Map)({ categoryKey: categoryKey, description: menuItem.text().trim(), url: '' + config.get('baseUrl') + url, weight: 2 }));

                return 0;
              });

              return 0;
            });

            updatedProductCategories = updatedProductCategories.set(levelOneProductCategoryIdx, levelOneProductCategory.set('subCategories', levelTwoProductCategories));

            done();
          }
        });

        crawler.on('drain', function () {
          return resolve(updatedProductCategories);
        });
        productCategories.forEach(function (productCategory) {
          return crawler.queue(productCategory.get('url'));
        });
      });
    }, _this.crawlLevelThreeProductCategories = function (config, productCategories) {
      var updatedProductCategories = productCategories;

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
              reject('Failed to receive product categories for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var levelOneProductCategoryIdx = updatedProductCategories.findIndex(function (_) {
              return res.request.uri.href.indexOf(_.get('url')) !== -1;
            });

            if (levelOneProductCategoryIdx === -1) {
              // Ignoring the returned URL as looks like Warehouse forward the URL to other different categories
              _this.logError(config, function () {
                return 'Failed to match retrieved URL ' + res.request.uri.href + ' against provided level one category.';
              });

              return;
            }

            var levelOneProductCategory = updatedProductCategories.get(levelOneProductCategoryIdx);
            var levelOneProductSubCategoriesCategory = levelOneProductCategory.get('subCategories');
            var levelTwoProductCategoryIdx = levelOneProductSubCategoriesCategory.findIndex(function (_) {
              return _.get('url').localeCompare(res.request.uri.href) === 0;
            });

            if (levelTwoProductCategoryIdx === -1) {
              // Ignoring the returned URL as looks like Warehouse forward the URL to other different categories
              _this.logError(config, function () {
                return 'Failed to match retrieved URL ' + res.request.uri.href + ' against provided level two category.';
              });

              return;
            }

            var levelTwoProductCategory = levelOneProductSubCategoriesCategory.get(levelTwoProductCategoryIdx);
            var $ = res.$;
            var levelThreeProductCategories = (0, _immutable.List)();

            $('#left-navigation #navigation-panel .single-level-navigation .navigation-toggle-children .clearfix').children().filter(function filterLeftNavigationPanel() {
              $(this).each(function filterProductCategory() {
                var menuItem = $(this).find('.din');
                var url = menuItem.attr('href');
                var categoryKey = url.substring(url.lastIndexOf('/') + 1, url.length);

                if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
                  return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
                })) {
                  return 0;
                }

                levelThreeProductCategories = levelThreeProductCategories.push((0, _immutable.Map)({ categoryKey: categoryKey, description: menuItem.text().trim(), url: '' + config.get('baseUrl') + url, weight: 3 }));

                return 0;
              });

              return 0;
            });

            updatedProductCategories = updatedProductCategories.set(levelOneProductCategoryIdx, levelOneProductCategory.update('subCategories', function (subcategories) {
              return subcategories.set(levelTwoProductCategoryIdx, levelTwoProductCategory.set('subCategories', levelThreeProductCategories));
            }));

            done();
          }
        });

        crawler.on('drain', function () {
          return resolve(updatedProductCategories);
        });
        productCategories.flatMap(function (productCategory) {
          return productCategory.get('subCategories');
        }).forEach(function (productCategory) {
          return crawler.queue(productCategory.get('url'));
        });
      });
    }, _this.crawlLevelOneProductCategoriesAndSubProductCategories = function (config, $) {
      var highLevelProductCategories = (0, _immutable.List)();

      $('#BrowseSlideBox').filter(function filterHighLevelProductCategoriesCallback() {
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
    }, _this.getProductDetails = function (config, $) {
      var self = _this;
      var products = (0, _immutable.List)();

      $('#product-list').filter(function filterProductListCallback() {
        // eslint-disable-line array-callback-return
        // eslint-disable-line array-callback-return
        var data = $(this);

        data.find('.product-stamp .details-container').each(function onNewProductExtracted() {
          var product = $(this);
          var imageUrl = config.get('baseImageUrl') + product.find('.product-stamp-thumbnail img').attr('src');
          var barcode = self.getBarcodeFromImageUrl(imageUrl);
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
            description: self.convertStringValToObjectProperty(description),
            barcode: self.convertStringValToObjectProperty(barcode),
            imageUrl: self.convertStringValToObjectProperty(imageUrl),
            special: self.convertBoolValToObjectProperty(special),
            lowPriceEveryDay: self.convertBoolValToObjectProperty(lowPriceEveryDay),
            lockdownPrice: self.convertBoolValToObjectProperty(lockdownPrice),
            glutenFree: self.convertBoolValToObjectProperty(glutenFree),
            newItem: self.convertBoolValToObjectProperty(newItem),
            onecard: self.convertBoolValToObjectProperty(onecard),
            viewNutritionInfo: self.convertBoolValToObjectProperty(viewNutritionInfo),
            fairTradePromotion: self.convertBoolValToObjectProperty(fairTradePromotion),
            specialMultiBuyText: self.convertStringValToObjectProperty(specialMultiBuyText),
            multiBuyText: self.convertStringValToObjectProperty(multiBuyText),
            price: self.convertStringValToObjectProperty(price),
            wasPrice: self.convertStringValToObjectProperty(wasPrice),
            clubPrice: self.convertStringValToObjectProperty(clubPrice),
            nonClubPrice: self.convertStringValToObjectProperty(nonClubPrice)
          }));
        });
      });

      return products;
    }, _this.convertBoolValToObjectProperty = function (val) {
      if (val) {
        return val ? true : undefined;
      }

      return undefined;
    }, _this.convertStringValToObjectProperty = function (val) {
      if (val) {
        return val.length > 0 ? val : undefined;
      }

      return undefined;
    }, _this.getBarcodeFromImageUrl = function (imageUrl) {
      var str = imageUrl.substr(imageUrl.indexOf('big/') + 4);
      var barcode = str.substr(0, str.indexOf('.jpg'));

      return barcode;
    }, _this.crawlHighLevelProductCategories = function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(config) {
        var result, sessionInfo, finalConfig, updatedSessionInfo, errorMessage, _updatedSessionInfo2;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _this.createNewCrawlSessionAndGetStoreCrawlerConfig('Countdown High Level Product Categories', config, 'Countdown');

              case 2:
                result = _context2.sent;
                sessionInfo = result.get('sessionInfo');
                finalConfig = result.get('config');
                _context2.prev = 5;

                _this.logInfo(finalConfig, function () {
                  return 'Start fetching product categories paging info...';
                });

                _context2.next = 9;
                return _this.crawlHighLevelProductCategoriesAndSaveDetails(sessionInfo.get('id'), finalConfig);

              case 9:

                _this.logInfo(finalConfig, function () {
                  return 'Crawling high level product categories successfully completed.';
                });

                updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'success'
                  })
                }));
                _context2.next = 13;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

              case 13:
                _context2.next = 22;
                break;

              case 15:
                _context2.prev = 15;
                _context2.t0 = _context2['catch'](5);
                errorMessage = _context2.t0 instanceof _microBusinessParseServerCommon.Exception ? _context2.t0.getErrorMessage() : _context2.t0;
                _updatedSessionInfo2 = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'failed',
                    error: errorMessage
                  })
                }));
                _context2.next = 21;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo2);

              case 21:
                throw _context2.t0;

              case 22:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2, [[5, 15]]);
      }));

      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    }(), _this.crawlProducts = function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(config) {
        var result, sessionInfo, finalConfig, productsCategoriesPagingInfo, updatedSessionInfo, errorMessage, _updatedSessionInfo3;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _this.createNewCrawlSessionAndGetStoreCrawlerConfig('Countdown Products', config, 'Countdown');

              case 2:
                result = _context3.sent;
                sessionInfo = result.get('sessionInfo');
                finalConfig = result.get('config');
                _context3.prev = 5;

                _this.logInfo(finalConfig, function () {
                  return 'Start fetching product categories paging info...';
                });

                _context3.next = 9;
                return _this.getProductCategoriesPagingInfo(finalConfig);

              case 9:
                productsCategoriesPagingInfo = _context3.sent;

                _this.logInfo(finalConfig, function () {
                  return 'Finished fetching product categories paging info.';
                });
                _this.logVerbose(finalConfig, function () {
                  return 'Fetched product categories paging info: ' + productsCategoriesPagingInfo;
                });

                _this.logInfo(finalConfig, function () {
                  return 'Start crawling products and save the details...';
                });

                _context3.next = 15;
                return _this.crawlProductsAndSaveDetails(sessionInfo.get('id'), finalConfig, productsCategoriesPagingInfo);

              case 15:

                _this.logInfo(finalConfig, function () {
                  return 'Crawling product successfully completed.';
                });

                updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'success'
                  })
                }));
                _context3.next = 19;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

              case 19:
                _context3.next = 28;
                break;

              case 21:
                _context3.prev = 21;
                _context3.t0 = _context3['catch'](5);
                errorMessage = _context3.t0 instanceof _microBusinessParseServerCommon.Exception ? _context3.t0.getErrorMessage() : _context3.t0;
                _updatedSessionInfo3 = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'failed',
                    error: errorMessage
                  })
                }));
                _context3.next = 27;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo3);

              case 27:
                throw _context3.t0;

              case 28:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2, [[5, 21]]);
      }));

      return function (_x3) {
        return _ref4.apply(this, arguments);
      };
    }(), _this.getProductCategoriesPagingInfo = function (config) {
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
    }, _this.crawlHighLevelProductCategoriesAndSaveDetails = function (sessionId, config) {
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

            var highLevelProductCategories = _this.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);

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
    }, _this.crawlProductsAndSaveDetails = function (sessionId, config, productsCategoriesPagingInfo) {
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
            var products = _this.getProductDetails(config, res.$);

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
    }, _this.syncProductCategoriesToStoreTags = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
      var store, storeId, productCategories, storeTags, splittedLevelOneProductCategories, storeTagsWithUpdatedLevelOneProductCategories, levelTwoProductCategories, levelTwoProductCategoriesGroupedByCategoryKey, splittedLevelTwoProductCategories, storeTagsWithUpdatedLevelTwoProductCategories, levelThreeProductCategories, levelThreeProductCategoriesGroupedByCategoryKey, splittedLevelThreeProductCategories;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this.getStore('Countdown');

            case 2:
              store = _context4.sent;
              storeId = store.get('id');
              _context4.t0 = _immutable2.default;
              _context4.next = 7;
              return _this.getMostRecentCrawlResults('Countdown Product Categories', function (info) {
                return info.getIn(['resultSet', 'productCategories']);
              });

            case 7:
              _context4.t1 = _context4.sent.first();
              productCategories = _context4.t0.fromJS.call(_context4.t0, _context4.t1);
              _context4.next = 11;
              return _this.getExistingStoreTags(storeId);

            case 11:
              storeTags = _context4.sent;
              splittedLevelOneProductCategories = _this.splitIntoChunks(productCategories, 100);
              _context4.next = 15;
              return _bluebird2.default.each(splittedLevelOneProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelOneProductCategory(productCategory, storeTags, storeId);
                }));
              });

            case 15:
              _context4.next = 17;
              return _this.getExistingStoreTags(storeId);

            case 17:
              storeTagsWithUpdatedLevelOneProductCategories = _context4.sent;
              levelTwoProductCategories = productCategories.map(function (productCategory) {
                return productCategory.update('subCategories', function (subCategories) {
                  return subCategories.map(function (subCategory) {
                    return subCategory.set('parent', productCategory.get('categoryKey'));
                  });
                });
              }).flatMap(function (productCategory) {
                return productCategory.get('subCategories');
              });
              levelTwoProductCategoriesGroupedByCategoryKey = levelTwoProductCategories.groupBy(function (productCategory) {
                return productCategory.get('categoryKey');
              });
              splittedLevelTwoProductCategories = _this.splitIntoChunks(levelTwoProductCategoriesGroupedByCategoryKey.valueSeq(), 100);
              _context4.next = 23;
              return _bluebird2.default.each(splittedLevelTwoProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelTwoProductCategory(productCategory, storeTagsWithUpdatedLevelOneProductCategories, storeId);
                }));
              });

            case 23:
              _context4.next = 25;
              return _this.getExistingStoreTags(storeId);

            case 25:
              storeTagsWithUpdatedLevelTwoProductCategories = _context4.sent;
              levelThreeProductCategories = productCategories.flatMap(function (productCategory) {
                return productCategory.get('subCategories');
              }).map(function (productCategory) {
                return productCategory.update('subCategories', function (subCategories) {
                  return subCategories.map(function (subCategory) {
                    return subCategory.set('parent', productCategory.get('categoryKey'));
                  });
                });
              }).flatMap(function (productCategory) {
                return productCategory.get('subCategories');
              });
              levelThreeProductCategoriesGroupedByCategoryKey = levelThreeProductCategories.groupBy(function (productCategory) {
                return productCategory.get('categoryKey');
              });
              splittedLevelThreeProductCategories = _this.splitIntoChunks(levelThreeProductCategoriesGroupedByCategoryKey.valueSeq(), 100);
              _context4.next = 31;
              return _bluebird2.default.each(splittedLevelThreeProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelThreeProductCategory(productCategory, storeTagsWithUpdatedLevelTwoProductCategories, storeId);
                }));
              });

            case 31:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this2);
    })), _temp), _possibleConstructorReturn(_this, _ret);
  }

  // ///////////////////////////////////////////////////////////////


  return CountdownWebCrawlerService;
}(_common.ServiceBase);

exports.default = CountdownWebCrawlerService;