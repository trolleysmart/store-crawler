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
                return _this.createNewCrawlSessionAndGetConfig('Countdown Product Categories', config, 'Countdown');

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
                    productCategories: productCategories
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
                var categoryKey = url.substring(url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length);

                if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
                  return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
                })) {
                  return 0;
                }

                productCategories = productCategories.push((0, _immutable.Map)({
                  categoryKey: categoryKey,
                  name: menuItem.text().trim(),
                  url: '' + config.get('baseUrl') + url,
                  weight: 1,
                  subCategories: (0, _immutable.List)()
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
              // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
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
                var categoryKey = url.substring(url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length);

                if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
                  return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
                })) {
                  return 0;
                }

                levelTwoProductCategories = levelTwoProductCategories.push((0, _immutable.Map)({ categoryKey: categoryKey, name: menuItem.text().trim(), url: '' + config.get('baseUrl') + url, weight: 2 }));

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
              // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
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
              // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
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
                var categoryKey = url.substring(url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length);

                if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
                  return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
                })) {
                  return 0;
                }

                levelThreeProductCategories = levelThreeProductCategories.push((0, _immutable.Map)({ categoryKey: categoryKey, name: menuItem.text().trim(), url: '' + config.get('baseUrl') + url, weight: 3 }));

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
    }, _this.syncProductCategoriesToStoreTags = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
      var store, storeId, productCategories, storeTags, splittedLevelOneProductCategories, storeTagsWithUpdatedLevelOneProductCategories, levelTwoProductCategories, levelTwoProductCategoriesGroupedByCategoryKey, splittedLevelTwoProductCategories, storeTagsWithUpdatedLevelTwoProductCategories, levelThreeProductCategories, levelThreeProductCategoriesGroupedByCategoryKey, splittedLevelThreeProductCategories;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.getStore('Countdown');

            case 2:
              store = _context2.sent;
              storeId = store.get('id');
              _context2.t0 = _immutable2.default;
              _context2.next = 7;
              return _this.getMostRecentCrawlResults('Countdown Product Categories', function (info) {
                return info.getIn(['resultSet', 'productCategories']);
              });

            case 7:
              _context2.t1 = _context2.sent.first();
              productCategories = _context2.t0.fromJS.call(_context2.t0, _context2.t1);
              _context2.next = 11;
              return _this.getStoreTags(storeId);

            case 11:
              storeTags = _context2.sent;
              splittedLevelOneProductCategories = _this.splitIntoChunks(productCategories, 100);
              _context2.next = 15;
              return _bluebird2.default.each(splittedLevelOneProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelOneProductCategory(productCategory, storeTags, storeId);
                }));
              });

            case 15:
              _context2.next = 17;
              return _this.getStoreTags(storeId);

            case 17:
              storeTagsWithUpdatedLevelOneProductCategories = _context2.sent;
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
              _context2.next = 23;
              return _bluebird2.default.each(splittedLevelTwoProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelTwoProductCategory(productCategory, storeTagsWithUpdatedLevelOneProductCategories, storeId);
                }));
              });

            case 23:
              _context2.next = 25;
              return _this.getStoreTags(storeId);

            case 25:
              storeTagsWithUpdatedLevelTwoProductCategories = _context2.sent;
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
              _context2.next = 31;
              return _bluebird2.default.each(splittedLevelThreeProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelThreeProductCategory(productCategory, storeTagsWithUpdatedLevelTwoProductCategories, storeId);
                }));
              });

            case 31:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2);
    })), _this.crawlProducts = function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(config) {
        var finalConfig, store, storeId, productCategoriesToCrawl, productCategoriesToCrawlWithTotalItemsInfo;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.t0 = config;

                if (_context3.t0) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 4;
                return _this.getConfig('Countdown');

              case 4:
                _context3.t0 = _context3.sent;

              case 5:
                finalConfig = _context3.t0;
                _context3.next = 8;
                return _this.getStore('Countdown');

              case 8:
                store = _context3.sent;
                storeId = store.get('id');
                _context3.t1 = _immutable2.default;
                _context3.next = 13;
                return _this.getMostRecentCrawlResults('Countdown Product Categories', function (info) {
                  return info.getIn(['resultSet', 'productCategories']);
                });

              case 13:
                _context3.t2 = _context3.sent.first();
                productCategoriesToCrawl = _context3.t1.fromJS.call(_context3.t1, _context3.t2);
                _context3.next = 17;
                return _this.crawlProductCategoriesTotalItemsInfo(finalConfig, productCategoriesToCrawl);

              case 17:
                productCategoriesToCrawlWithTotalItemsInfo = _context3.sent;
                _context3.next = 20;
                return _this.crawlProductsForEachProductCategories(finalConfig, productCategoriesToCrawlWithTotalItemsInfo, storeId);

              case 20:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function (_x2) {
        return _ref4.apply(this, arguments);
      };
    }(), _this.crawlProductCategoriesTotalItemsInfo = function (config, productCategories) {
      var productCategoriesToCrawlWithTotalItemsInfo = (0, _immutable.List)();

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
              reject('Failed to receive product category page info for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var productCategory = productCategories.find(function (_) {
              return _.get('url').localeCompare(res.request.uri.href) === 0;
            });

            if (!productCategory) {
              // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
              done();

              return;
            }

            productCategoriesToCrawlWithTotalItemsInfo = productCategoriesToCrawlWithTotalItemsInfo.push(productCategory.set('totalItems', _this.crawlTotalItemsInfo(config, res.$)));
            done();
          }
        });

        crawler.on('drain', function () {
          return resolve(productCategoriesToCrawlWithTotalItemsInfo);
        });
        productCategories.forEach(function (productCategory) {
          return crawler.queue(productCategory.get('url'));
        });
      });
    }, _this.crawlTotalItemsInfo = function (config, $) {
      var total = 0;

      $('#middle-panel .side-gutter #content-panel .paging-container .paging-description').filter(function filterPagingDescription() {
        var info = $(this).text().trim();
        var spaceIdx = info.indexOf(' ');

        total = parseInt(info.substring(0, spaceIdx).replace(',', '').trim(), 10);

        return 0;
      });

      return total;
    }, _this.crawlProductsForEachProductCategories = function (config, productCategories, storeId) {
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
              reject('Failed to receive product category page info for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var urlOffset = res.request.uri.href.indexOf('?');
            var baseUrl = res.request.uri.href.substring(0, urlOffset);
            var productCategory = productCategories.find(function (_) {
              return _.get('url').localeCompare(baseUrl) === 0;
            });

            if (!productCategory) {
              done();
              reject('Failed to find product category page info for Url: ' + baseUrl);

              return;
            }

            var productInfos = _this.crawlProductInfo(config, res.$);

            Promise.all(productInfos.filter(function (productInfo) {
              return productInfo.get('productPageUrl');
            }).map(function (productInfo) {
              return _this.createOrUpdateStoreMasterProduct(productCategory, productInfo, storeId);
            })).then(function () {
              return done();
            }).catch(function (storeProductUpdateError) {
              done();
              reject(storeProductUpdateError);
            });
          }
        });

        crawler.on('drain', function () {
          return resolve();
        });
        productCategories.forEach(function (productCategory) {
          return (0, _immutable.Range)(0, Math.ceil(productCategory.get('totalItems') / 24)).forEach(function (offset) {
            return crawler.queue(productCategory.get('url') + '?page=' + (offset + 1));
          });
        });
      });
    }, _this.crawlProductInfo = function (config, $) {
      var products = (0, _immutable.List)();
      $('#middle-panel .side-gutter #content-panel #product-list').children().filter(function filterProductList() {
        $(this).find('.product-stamp .details-container').each(function filterProductDetails() {
          var productPageUrl = config.get('baseUrl') + $(this).find('._jumpTop').attr('href');

          products = products.push((0, _immutable.Map)({ productPageUrl: productPageUrl }));

          return 0;
        });
        return 0;
      });

      return products;
    }, _this.crawlProductsDetails = function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(config) {
        var finalConfig, store, storeId, storeTags, products;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.t0 = config;

                if (_context4.t0) {
                  _context4.next = 5;
                  break;
                }

                _context4.next = 4;
                return _this.getConfig('Countdown');

              case 4:
                _context4.t0 = _context4.sent;

              case 5:
                finalConfig = _context4.t0;
                _context4.next = 8;
                return _this.getStore('Countdown');

              case 8:
                store = _context4.sent;
                storeId = store.get('id');
                _context4.next = 12;
                return _this.getStoreTags(storeId);

              case 12:
                storeTags = _context4.sent;
                _context4.next = 15;
                return _this.getAllStoreMasterProductsWithoutMasterProduct(storeId);

              case 15:
                products = _context4.sent;
                _context4.next = 18;
                return _bluebird2.default.each(products.toArray(), function (product) {
                  return _this.crawlProductDetails(finalConfig, product, storeTags, false);
                });

              case 18:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2);
      }));

      return function (_x3) {
        return _ref5.apply(this, arguments);
      };
    }(), _this.crawlProductsPriceDetails = function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(config) {
        var finalConfig, store, storeId, storeTags, lastCrawlDateTime, products;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.t0 = config;

                if (_context5.t0) {
                  _context5.next = 5;
                  break;
                }

                _context5.next = 4;
                return _this.getConfig('Countdown');

              case 4:
                _context5.t0 = _context5.sent;

              case 5:
                finalConfig = _context5.t0;
                _context5.next = 8;
                return _this.getStore('Countdown');

              case 8:
                store = _context5.sent;
                storeId = store.get('id');
                _context5.next = 12;
                return _this.getStoreTags(storeId);

              case 12:
                storeTags = _context5.sent;
                lastCrawlDateTime = new Date();


                lastCrawlDateTime.setDate(new Date().getDate() - 1);

                _context5.next = 17;
                return _this.getStoreMasterProductsWithMasterProduct(storeId, lastCrawlDateTime);

              case 17:
                products = _context5.sent;
                _context5.next = 20;
                return _bluebird2.default.each(products.toArray(), function (product) {
                  return _this.crawlProductDetails(finalConfig, product, storeTags, true);
                });

              case 20:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this2);
      }));

      return function (_x4) {
        return _ref6.apply(this, arguments);
      };
    }(), _this.crawlProductDetails = function (config, product, storeTags, updatePriceDetails) {
      return new Promise(function (resolve, reject) {
        var productInfo = (0, _immutable.Map)();

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
            var self = _this;
            var tagUrls = (0, _immutable.Set)();

            $('#breadcrumb-panel .breadcrumbs').children().filter(function filterProductTags() {
              var tagUrl = $(this).attr('href');

              if (tagUrl) {
                tagUrls = tagUrls.add(config.get('baseUrl') + tagUrl);
              }

              return 0;
            });

            productInfo = productInfo.merge({ tagUrls: tagUrls });

            $('#content-container #content-panel #product-details').filter(function filterProductDetails() {
              var productTagWrapperContainer = $(this).find('.product-tag-wrapper');
              var productTagDesktop = productTagWrapperContainer.find('.main-product .product-tag-desktop');

              productTagDesktop.children().each(function filterBadges() {
                var badgeSrc = $(this).attr('src');

                if (badgeSrc) {
                  productInfo = productInfo.merge(self.translateBadge(badgeSrc));
                } else {
                  var badgeUrl = $(this).find('a img').attr('src');

                  if (badgeUrl) {
                    productInfo = productInfo.merge(self.translateBadge(badgeUrl));
                  } else {
                    var multiBuyLinkContainer = $(this).find('.multi-buy-link');

                    if (multiBuyLinkContainer) {
                      var awardQuantityFullText = multiBuyLinkContainer.find('.multi-buy-award-quantity').text().trim();
                      var awardQuantity = parseFloat(awardQuantityFullText.substring(0, awardQuantityFullText.indexOf(' ')));
                      var awardValue = parseFloat(multiBuyLinkContainer.find('.multi-buy-award-value').text().trim());

                      productInfo = productInfo.merge({
                        multiBuyInfo: (0, _immutable.Map)({
                          awardQuantity: awardQuantity,
                          awardValue: awardValue
                        })
                      });
                    }
                  }
                }

                return 0;
              });

              var imageUrl = config.get('baseUrl') + productTagWrapperContainer.find('.big-image-container .product-image .product-image').attr('src');
              var barcode = self.getBarcodeFromImageUrl(imageUrl);
              var productDetailsBasicInfo = $(this).find('#product-details-info-content .prod-details-basic-info');
              var titleContainer = productDetailsBasicInfo.find('.product-title h1');
              var title = titleContainer.text().trim();
              var size = titleContainer.find('span').text().trim();
              var sizeOffset = title.indexOf(size);
              var name = sizeOffset === -1 || size.length === 0 ? title : title.substring(0, sizeOffset).trim();
              var description = productDetailsBasicInfo.find('.product-info-panel .product-description p').text().trim();

              productInfo = productInfo.merge({
                name: name,
                description: description,
                barcode: barcode,
                imageUrl: imageUrl,
                size: size
              });

              productDetailsBasicInfo.find('.cost-container .price-container').filter(function filterPriceDetails() {
                var priceContent = $(this).find('.product-price');
                var currentPrice = self.getCurrentPrice(priceContent);
                var wasPrice = self.getWasPrice(priceContent);
                var unitPrice = self.getUnitPrice($(this));

                productInfo = productInfo.merge({
                  currentPrice: currentPrice,
                  wasPrice: wasPrice || undefined,
                  unitPrice: unitPrice
                });

                return 0;
              });

              productDetailsBasicInfo.find('.cost-container .club-price-container').filter(function filterClubPriceDetails() {
                var clubPriceContent = $(this).find('.drop-down-club-price-wrapper');
                var currentPrice = self.getClubPrice(clubPriceContent);
                var nonClubPriceContent = $(this).find('.grid-non-club-price').text().trim();
                var wasPrice = self.removeDollarSignFromPrice(nonClubPriceContent.substring(nonClubPriceContent.indexOf('$')));
                var unitPrice = self.getUnitPrice($(this));

                productInfo = productInfo.merge({
                  currentPrice: currentPrice,
                  wasPrice: wasPrice || undefined,
                  unitPrice: unitPrice
                });

                return 0;
              });

              self.updateProductDetails(product, storeTags, productInfo, updatePriceDetails).then(function () {
                return done();
              }).catch(function (internalError) {
                done();
                reject(internalError);
              });

              return 0;
            });
          }
        });

        crawler.on('drain', function () {
          return resolve();
        });
        crawler.queue(product.get('productPageUrl'));
      });
    }, _this.getCurrentPrice = function (productPriceContent) {
      var currentPriceContent = productPriceContent.find('.price').text().trim();
      var currentPriceTails = productPriceContent.find('.price .visible-phone').text().trim();
      var currentPriceContentIncludingDollarSign = currentPriceContent.substring(0, currentPriceContent.indexOf(currentPriceTails));

      return _this.removeDollarSignFromPrice(currentPriceContentIncludingDollarSign);
    }, _this.getWasPrice = function (productPriceContent) {
      var wasPriceContent = productPriceContent.find('.was-price').text().trim();

      return parseFloat(wasPriceContent.substring(wasPriceContent.indexOf('$') + 1));
    }, _this.getUnitPrice = function (priceContainer) {
      var unitPriceContent = priceContainer.find('.cup-price').text().trim();
      var price = _this.removeDollarSignFromPrice(unitPriceContent.substring(0, unitPriceContent.indexOf('/')));
      var size = unitPriceContent.substring(unitPriceContent.indexOf('/') + 1);

      if (!price && !size) {
        return undefined;
      }

      return (0, _immutable.Map)({
        price: price || undefined,
        size: size || undefined
      });
    }, _this.translateBadge = function (url) {
      var lowerCaseUrl = url.toLowerCase();
      if (lowerCaseUrl.indexOf('badge-special') !== -1) {
        return (0, _immutable.Map)({ special: true });
      }

      if (lowerCaseUrl.indexOf('badge-pricelockdown') !== -1) {
        return (0, _immutable.Map)({ priceLockDown: true });
      }

      if (lowerCaseUrl.indexOf('view-nutrition-info') !== -1) {
        return (0, _immutable.Map)({ viewNutritionInfo: true });
      }

      if (lowerCaseUrl.indexOf('badge-gluten-free') !== -1) {
        return (0, _immutable.Map)({ glutenFree: true });
      }

      if (lowerCaseUrl.indexOf('badge-onecard') !== -1) {
        return (0, _immutable.Map)({ onecard: true });
      }

      if (lowerCaseUrl.indexOf('low_price') !== -1) {
        return (0, _immutable.Map)({ lowPriceEveryday: true });
      }

      if (lowerCaseUrl.indexOf('badge-new') !== -1) {
        return (0, _immutable.Map)({ new: true });
      }

      var multiBuyIconUrl = lowerCaseUrl.match(/\dfor\d/);

      if (multiBuyIconUrl) {
        var multiBuyFullText = lowerCaseUrl.substring(lowerCaseUrl.lastIndexOf('/') + 1, lowerCaseUrl.indexOf('.')).trim();

        return (0, _immutable.Map)({
          multiBuyInfo: (0, _immutable.Map)({
            awardQuantity: multiBuyFullText.substring(0, multiBuyFullText.indexOf('for')),
            awardValue: multiBuyFullText.substring(multiBuyFullText.indexOf('for') + 'for'.length)
          })
        });
      }

      return (0, _immutable.Map)();
    }, _this.getClubPrice = function (productPriceContent) {
      var currentPriceContent = productPriceContent.text().trim();
      var currentPriceTails = productPriceContent.find('.visible-phone').text().trim();
      var currentPriceContentIncludingDollarSign = currentPriceContent.substring(0, currentPriceContent.indexOf(currentPriceTails));

      return _this.removeDollarSignFromPrice(currentPriceContentIncludingDollarSign);
    }, _this.getBarcodeFromImageUrl = function (imageUrl) {
      var largeIndex = imageUrl.indexOf('large/');

      if (largeIndex !== -1) {
        var _str = imageUrl.substr(largeIndex + 6);

        return _str.substr(0, _str.indexOf('.jpg'));
      }

      var bigIndex = imageUrl.indexOf('big/');

      if (bigIndex !== -1) {
        var _str2 = imageUrl.substr(bigIndex + 4);

        return _str2.substr(0, _str2.indexOf('.jpg'));
      }

      var zoomIndex = imageUrl.indexOf('zoom/');
      var str = imageUrl.substr(zoomIndex + 5);

      return str.substr(0, str.indexOf('.jpg'));
    }, _this.updateProductDetails = function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(product, storeTags, productInfo, updatePriceDetails) {
        var masterProductId, storeId, priceDetails, priceToDisplay, currentPrice, wasPrice, multiBuyInfo, unitPrice, masterProductPrice;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                masterProductId = product.get('masterProductId');
                storeId = product.get('storeId');

                if (!updatePriceDetails) {
                  _context6.next = 14;
                  break;
                }

                priceDetails = void 0;
                priceToDisplay = void 0;


                if (productInfo.has('onecard') && productInfo.get('onecard')) {
                  priceDetails = (0, _immutable.Map)({
                    specialType: 'onecard'
                  });

                  priceToDisplay = productInfo.get('currentPrice');
                } else if (productInfo.has('multiBuyInfo') && productInfo.get('multiBuyInfo')) {
                  priceDetails = (0, _immutable.Map)({
                    specialType: 'multiBuy'
                  });

                  priceToDisplay = productInfo.getIn(['multiBuyInfo', 'awardValue']) / productInfo.getIn(['multiBuyInfo', 'awardQuantity']);
                } else if (productInfo.has('wasPrice') && productInfo.get('wasPrice')) {
                  priceDetails = (0, _immutable.Map)({
                    specialType: 'special'
                  });

                  priceToDisplay = productInfo.get('currentPrice');
                } else {
                  priceDetails = (0, _immutable.Map)({
                    specialType: 'none'
                  });

                  priceToDisplay = productInfo.get('currentPrice');
                }

                currentPrice = productInfo.get('currentPrice');
                wasPrice = productInfo.get('wasPrice');
                multiBuyInfo = productInfo.get('multiBuyInfo');
                unitPrice = productInfo.get('unitPrice');


                priceDetails = priceDetails.merge(currentPrice ? (0, _immutable.Map)({ currentPrice: currentPrice }) : (0, _immutable.Map)()).merge(wasPrice ? (0, _immutable.Map)({ wasPrice: wasPrice }) : (0, _immutable.Map)()).merge(multiBuyInfo ? (0, _immutable.Map)({ multiBuyInfo: multiBuyInfo }) : (0, _immutable.Map)()).merge(unitPrice ? (0, _immutable.Map)({ unitPrice: unitPrice }) : (0, _immutable.Map)());

                masterProductPrice = (0, _immutable.Map)({
                  masterProductId: masterProductId,
                  storeId: storeId,
                  name: product.get('name'),
                  storeName: 'Countdown',
                  status: 'A',
                  priceDetails: priceDetails,
                  priceToDisplay: priceToDisplay
                });
                _context6.next = 14;
                return _this.createOrUpdateMasterProductPrice(masterProductId, storeId, masterProductPrice, priceDetails);

              case 14:
                _context6.next = 16;
                return _smartGroceryParseServerCommon.StoreMasterProductService.update(product.merge({
                  name: productInfo.get('name'),
                  description: productInfo.get('description'),
                  barcode: productInfo.get('barcode'),
                  imageUrl: productInfo.get('imageUrl'),
                  size: productInfo.get('size'),
                  lastCrawlDateTime: updatePriceDetails ? new Date() : productInfo.get('lastCrawlDateTime'),
                  storeTagIds: storeTags.filter(function (storeTag) {
                    return productInfo.get('tagUrls').find(function (tagUrl) {
                      return tagUrl.localeCompare(storeTag.get('url')) === 0;
                    });
                  }).map(function (storeTag) {
                    return storeTag.get('id');
                  })
                }));

              case 16:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, _this2);
      }));

      return function (_x5, _x6, _x7, _x8) {
        return _ref7.apply(this, arguments);
      };
    }(), _temp), _possibleConstructorReturn(_this, _ret);
  }

  return CountdownWebCrawlerService;
}(_common.ServiceBase);

CountdownWebCrawlerService.urlPrefix = '/Shop/Browse/';
exports.default = CountdownWebCrawlerService;