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

            _this.logVerbose(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });

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

            _this.logVerbose(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });

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

            _this.logVerbose(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });

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
    }, _this.crawlProducts = function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(config) {
        var finalConfig, store, storeId, storeTags, productCategories, productCategoriesToCrawl, productCategoriesToCrawlWithTotalItemsInfo;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = config;

                if (_context2.t0) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 4;
                return _this.getStoreCrawlerConfig('Countdown');

              case 4:
                _context2.t0 = _context2.sent.get('config');

              case 5:
                finalConfig = _context2.t0;
                _context2.next = 8;
                return _this.getStore('Countdown');

              case 8:
                store = _context2.sent;
                storeId = store.get('id');
                _context2.next = 12;
                return _this.getExistingStoreTags(storeId);

              case 12:
                storeTags = _context2.sent;
                _context2.t1 = _immutable2.default;
                _context2.next = 16;
                return _this.getMostRecentCrawlResults('Countdown Product Categories', function (info) {
                  return info.getIn(['resultSet', 'productCategories']);
                });

              case 16:
                _context2.t2 = _context2.sent.first();
                productCategories = _context2.t1.fromJS.call(_context2.t1, _context2.t2);
                productCategoriesToCrawl = productCategories.flatMap(function (_) {
                  return _.get('subCategories');
                }).flatMap(function (_) {
                  return _.get('subCategories');
                });
                _context2.next = 21;
                return _this.crawlProductCategoriesTotalItemsInfo(finalConfig, productCategoriesToCrawl);

              case 21:
                productCategoriesToCrawlWithTotalItemsInfo = _context2.sent;
                _context2.next = 24;
                return _this.crawlProductsForEachProductCategories(finalConfig, productCategoriesToCrawlWithTotalItemsInfo, storeId, storeTags);

              case 24:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }));

      return function (_x2) {
        return _ref3.apply(this, arguments);
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

            _this.logVerbose(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });

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
    }, _this.crawlProductsForEachProductCategories = function (config, productCategories, storeId, storeTags) {
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

            _this.logVerbose(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });

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

            Promise.all(productInfos.map(function (productInfo) {
              return _this.createOrUpdateStoreMasterProduct(productCategory, productInfo, storeId, storeTags);
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
          var description = $(this).find('.description').text().trim();
          var imageUrl = $(this).get('baseImageUrl') + $(this).find('.product-stamp-thumbnail img').attr('src');
          var productPageUrl = config.get('baseUrl') + $(this).find('.grid-stamp-pull-top h3 a').attr('href');

          products = products.push((0, _immutable.Map)({ description: description, productPageUrl: productPageUrl, imageUrl: imageUrl }));

          return 0;
        });
        return 0;
      });

      return products;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  return CountdownWebCrawlerService;
}(_common.ServiceBase);

exports.default = CountdownWebCrawlerService;