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

var WarehouseWebCrawlerService = function (_ServiceBase) {
  _inherits(WarehouseWebCrawlerService, _ServiceBase);

  function WarehouseWebCrawlerService() {
    var _ref,
        _this2 = this;

    var _temp, _this, _ret;

    _classCallCheck(this, WarehouseWebCrawlerService);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = WarehouseWebCrawlerService.__proto__ || Object.getPrototypeOf(WarehouseWebCrawlerService)).call.apply(_ref, [this].concat(args))), _this), _this.crawlProductCategories = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(config) {
        var result, sessionInfo, sessionId, finalConfig, updatedSessionInfo, errorMessage, _updatedSessionInfo;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.createNewCrawlSessionAndGetStoreCrawlerConfig('Warehouse Product Categories', config, 'Warehouse');

              case 2:
                result = _context.sent;
                sessionInfo = result.get('sessionInfo');
                sessionId = sessionInfo.get('id');
                finalConfig = result.get('config');
                _context.prev = 6;
                _context.next = 9;
                return _this.crawlAllProductCategories(sessionId, finalConfig);

              case 9:
                updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'success'
                  })
                }));
                _context.next = 12;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

              case 12:
                _context.next = 21;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context['catch'](6);
                errorMessage = _context.t0 instanceof _microBusinessParseServerCommon.Exception ? _context.t0.getErrorMessage() : _context.t0;
                _updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'failed',
                    error: errorMessage
                  })
                }));
                _context.next = 20;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo);

              case 20:
                throw _context.t0;

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2, [[6, 14]]);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }(), _this.crawlAllProductCategories = function (sessionId, config) {
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

            var productCategories = _this.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);

            var crawlResult = (0, _immutable.Map)({
              crawlSessionId: sessionId,
              resultSet: (0, _immutable.Map)({
                productCategories: productCategories
              })
            });

            _smartGroceryParseServerCommon.CrawlResultService.create(crawlResult).then(function () {
              _this.logInfo(config, function () {
                return 'Successfully added products for: ' + productCategories + '.';
              });

              done();
            }).catch(function (err) {
              _this.logError(config, function () {
                return 'Failed to save products for: ' + productCategories + '. Error: ' + JSON.stringify(err);
              });

              done();
              reject('Failed to save products for: ' + productCategories + '. Error: ' + JSON.stringify(err));
            });

            done();
          }
        });

        crawler.on('drain', function () {
          return resolve();
        });

        crawler.queue(config.get('baseUrl'));
      });
    }, _this.crawlLevelOneProductCategoriesAndSubProductCategories = function (config, $) {
      var self = _this;
      var productCategories = (0, _immutable.Set)();

      $('.menu-container .level-1 .menu-category').filter(function filterMenuItems() {
        $(this).children().each(function onEachMenuItem() {
          var menuItem = $(this);
          var categoryKey = menuItem.attr('class');

          if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
            return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
          })) {
            return;
          }

          productCategories = productCategories.add((0, _immutable.Map)({
            categoryKey: categoryKey,
            url: menuItem.find('.level-1').attr('href'),
            description: menuItem.find('.level-1').text().trim(),
            weight: 1,
            subCategories: self.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem)
          }));
        });
      });

      return productCategories;
    }, _this.crawlLevelTwoProductCategoriesAndSubProductCategories = function (config, $, parentNode) {
      var self = _this;
      var productCategories = (0, _immutable.Set)();

      parentNode.find('.menu-navigation .menu-container-level-2 .inner').filter(function filterMenuItems() {
        $(this).find('.category-column').each(function onEachColumn() {
          $(this).children().each(function onEachMenuItem() {
            var menuItem = $(this).find('.category-level-2');
            var categoryKey = menuItem.attr('data-gtm-cgid');

            if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
              return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
            })) {
              return;
            }

            productCategories = productCategories.add((0, _immutable.Map)({
              categoryKey: categoryKey,
              url: menuItem.attr('href'),
              description: menuItem.text().trim(),
              weight: 2,
              subCategories: self.crawlLevelThreeProductCategoriesAndSubProductCategories(config, $, $(this))
            }));
          });
        });
      });

      return productCategories;
    }, _this.crawlLevelThreeProductCategoriesAndSubProductCategories = function (config, $, parentNode) {
      var productCategories = (0, _immutable.Set)();

      parentNode.find('.menu-container-level-3').filter(function filterMenuItems() {
        $(this).children().each(function onEachMenuItem() {
          var menuItem = $(this).find('.category-level-3');
          var categoryKey = menuItem.attr('data-gtm-cgid');

          if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
            return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
          })) {
            return;
          }

          productCategories = productCategories.add((0, _immutable.Map)({
            categoryKey: categoryKey,
            url: menuItem.attr('href'),
            description: menuItem.text().trim(),
            weight: 3
          }));
        });
      });

      return productCategories;
    }, _this.syncProductCategoriesToStoreTags = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
      var store, storeId, productCategories, storeTags, splittedLevelOneProductCategories, storeTagsWithUpdatedLevelOneProductCategories, levelTwoProductCategories, levelTwoProductCategoriesGroupedByCategoryKey, splittedLevelTwoProductCategories, storeTagsWithUpdatedLevelTwoProductCategories, levelThreeProductCategories, levelThreeProductCategoriesGroupedByCategoryKey, splittedLevelThreeProductCategories;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.getStore('Warehouse');

            case 2:
              store = _context2.sent;
              storeId = store.get('id');
              _context2.t0 = _immutable2.default;
              _context2.next = 7;
              return _this.getMostRecentCrawlResults('Warehouse Product Categories', function (info) {
                return info.getIn(['resultSet', 'productCategories']);
              });

            case 7:
              _context2.t1 = _context2.sent.first();
              productCategories = _context2.t0.fromJS.call(_context2.t0, _context2.t1);
              _context2.next = 11;
              return _this.getExistingStoreTags(storeId);

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
              return _this.getExistingStoreTags(storeId);

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
              return _this.getExistingStoreTags(storeId);

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
    })), _this.createOrUpdateLevelOneProductCategory = function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(productCategory, storeTags, storeId) {
        var foundStoreTag;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                foundStoreTag = storeTags.find(function (storeTag) {
                  return storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0;
                });

                if (!foundStoreTag) {
                  _context3.next = 6;
                  break;
                }

                _context3.next = 4;
                return _smartGroceryParseServerCommon.StoreTagService.update(foundStoreTag.set('description', productCategory.get('description')).set('weight', productCategory.get('weigth')));

              case 4:
                _context3.next = 8;
                break;

              case 6:
                _context3.next = 8;
                return _smartGroceryParseServerCommon.StoreTagService.create((0, _immutable.Map)({ key: productCategory.get('categoryKey'), description: productCategory.get('description'), weight: 1, storeId: storeId }));

              case 8:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function (_x2, _x3, _x4) {
        return _ref4.apply(this, arguments);
      };
    }(), _this.createOrUpdateLevelTwoProductCategory = function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(productCategory, storeTags, storeId) {
        var foundStoreTag, parentStoreTagIds;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                foundStoreTag = storeTags.find(function (storeTag) {
                  return storeTag.get('key').localeCompare(productCategory.first().get('categoryKey')) === 0;
                });
                parentStoreTagIds = productCategory.map(function (_) {
                  return _.get('parent');
                }).map(function (parent) {
                  return storeTags.find(function (storeTag) {
                    return storeTag.get('key').localeCompare(parent) === 0;
                  });
                }).map(function (_) {
                  return _.get('id');
                });

                if (!foundStoreTag) {
                  _context4.next = 7;
                  break;
                }

                _context4.next = 5;
                return _smartGroceryParseServerCommon.StoreTagService.update(foundStoreTag.set('description', productCategory.first().get('description')).set('weight', productCategory.first().get('weigth')).set('storeTagIds', parentStoreTagIds));

              case 5:
                _context4.next = 9;
                break;

              case 7:
                _context4.next = 9;
                return _smartGroceryParseServerCommon.StoreTagService.create((0, _immutable.Map)({
                  key: productCategory.first().get('categoryKey'),
                  description: productCategory.first().get('description'),
                  weight: 2,
                  storeId: storeId,
                  storeTagIds: parentStoreTagIds
                }));

              case 9:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2);
      }));

      return function (_x5, _x6, _x7) {
        return _ref5.apply(this, arguments);
      };
    }(), _this.createOrUpdateLevelThreeProductCategory = function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(productCategory, storeTags, storeId) {
        var foundStoreTag, parentStoreTagIds;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                foundStoreTag = storeTags.find(function (storeTag) {
                  return storeTag.get('key').localeCompare(productCategory.first().get('categoryKey')) === 0;
                });
                parentStoreTagIds = productCategory.map(function (_) {
                  return _.get('parent');
                }).map(function (parent) {
                  return storeTags.find(function (storeTag) {
                    return storeTag.get('key').localeCompare(parent) === 0;
                  });
                }).map(function (_) {
                  return _.get('id');
                });

                if (!foundStoreTag) {
                  _context5.next = 7;
                  break;
                }

                _context5.next = 5;
                return _smartGroceryParseServerCommon.StoreTagService.update(foundStoreTag.set('description', productCategory.first().get('description')).set('weight', productCategory.first().get('weigth')).set('storeTagIds', parentStoreTagIds));

              case 5:
                _context5.next = 9;
                break;

              case 7:
                _context5.next = 9;
                return _smartGroceryParseServerCommon.StoreTagService.create((0, _immutable.Map)({
                  key: productCategory.first().get('categoryKey'),
                  description: productCategory.first().get('description'),
                  weight: 3,
                  storeId: storeId,
                  storeTagIds: parentStoreTagIds
                }));

              case 9:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this2);
      }));

      return function (_x8, _x9, _x10) {
        return _ref6.apply(this, arguments);
      };
    }(), _this.crawlProducts = function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(config) {
        var result, sessionInfo, sessionId, finalConfig, store, storeId, storeTags, productCategories, productCategoriesLevelOne, productCategoriesLevelTwo, productCategoriesLevelThree, productCategoriesToCrawl, productCategoriesToCrawlWithTotalItemsInfo, updatedSessionInfo, errorMessage, _updatedSessionInfo2;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return _this.createNewCrawlSessionAndGetStoreCrawlerConfig('Warehouse Product', config, 'Warehouse');

              case 2:
                result = _context6.sent;
                sessionInfo = result.get('sessionInfo');
                sessionId = sessionInfo.get('id');
                finalConfig = result.get('config');
                _context6.prev = 6;
                _context6.next = 9;
                return _this.getStore('Warehouse');

              case 9:
                store = _context6.sent;
                storeId = store.get('id');
                _context6.next = 13;
                return _this.getExistingStoreTags(storeId);

              case 13:
                storeTags = _context6.sent;
                _context6.t0 = _immutable2.default;
                _context6.next = 17;
                return _this.getMostRecentCrawlResults('Warehouse Product Categories', function (info) {
                  return info.getIn(['resultSet', 'productCategories']);
                });

              case 17:
                _context6.t1 = _context6.sent.first();
                productCategories = _context6.t0.fromJS.call(_context6.t0, _context6.t1);
                productCategoriesLevelOne = productCategories.filter(function (_) {
                  return _.get('subCategories').isEmpty();
                });
                productCategoriesLevelTwo = productCategories.filterNot(function (_) {
                  return _.get('subCategories').isEmpty();
                }).flatMap(function (_) {
                  return _.get('subCategories');
                }).filter(function (_) {
                  return _.get('subCategories').isEmpty();
                });
                productCategoriesLevelThree = productCategories.filterNot(function (_) {
                  return _.get('subCategories').isEmpty();
                }).flatMap(function (_) {
                  return _.get('subCategories');
                }).filterNot(function (_) {
                  return _.get('subCategories').isEmpty();
                }).flatMap(function (_) {
                  return _.get('subCategories');
                });
                productCategoriesToCrawl = productCategoriesLevelOne.concat(productCategoriesLevelTwo).concat(productCategoriesLevelThree);
                _context6.next = 25;
                return _this.crawlProductCategoriesTotalItemsInfo(sessionId, finalConfig, productCategoriesToCrawl);

              case 25:
                productCategoriesToCrawlWithTotalItemsInfo = _context6.sent;
                _context6.next = 28;
                return _this.crawlProductsForEachProductCategories(sessionId, finalConfig, productCategoriesToCrawlWithTotalItemsInfo, storeId, storeTags);

              case 28:
                updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'success'
                  })
                }));
                _context6.next = 31;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

              case 31:
                _context6.next = 40;
                break;

              case 33:
                _context6.prev = 33;
                _context6.t2 = _context6['catch'](6);
                errorMessage = _context6.t2 instanceof _microBusinessParseServerCommon.Exception ? _context6.t2.getErrorMessage() : _context6.t2;
                _updatedSessionInfo2 = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'failed',
                    error: errorMessage
                  })
                }));
                _context6.next = 39;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo2);

              case 39:
                throw _context6.t2;

              case 40:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, _this2, [[6, 33]]);
      }));

      return function (_x11) {
        return _ref7.apply(this, arguments);
      };
    }(), _this.crawlProductCategoriesTotalItemsInfo = function (sessionId, config, productCategories) {
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
              done();
              reject('Failed to find product category page info for Url: ' + res.request.uri.href);

              return;
            }

            productCategoriesToCrawlWithTotalItemsInfo = productCategoriesToCrawlWithTotalItemsInfo.push(productCategory.set('totalItems', _this.crawlTotalItemsInfofo(config, res.$)));
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
    }, _this.crawlTotalItemsInfofo = function (config, $) {
      var total = 0;

      $('.tab-content #results-products .pagination').filter(function filterPagination() {
        $(this).children().find('.results-hits').filter(function filterResultHit() {
          var info = $(this).text().trim();
          var line2 = info.split('\r\n')[1].trim();
          var spaceIdx = line2.indexOf(' ');

          total = parseInt(line2.substring(0, spaceIdx).replace(',', '').trim(), 10);
        });
      });

      return total;
    }, _this.crawlProductsForEachProductCategories = function (sessionId, config, productCategories, storeId, storeTags) {
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
          return (0, _immutable.Range)(0, productCategory.get('totalItems'), 24).forEach(function (offset) {
            return crawler.queue(productCategory.get('url') + '?sz=24&start=' + offset);
          });
        });
      });
    }, _this.crawlProductInfo = function (config, $) {
      var products = (0, _immutable.List)();
      $('.tab-content .search-result-content .search-result-items').children().filter(function filterSearchResultItems() {
        var description = $(this).find('.product-info-wrapper .name-link').attr('title');
        var productPageUrl = $(this).find('.product-info-wrapper .name-link').attr('href');
        var imageUrl = $(this).find('.product-image .thumb-link').children().first().attr('src');

        products = products.push((0, _immutable.Map)({ description: description, productPageUrl: productPageUrl, imageUrl: imageUrl }));
      });

      return products;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  return WarehouseWebCrawlerService;
}(_common.ServiceBase);

exports.default = WarehouseWebCrawlerService;