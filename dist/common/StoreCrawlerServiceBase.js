'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _microBusinessCommonJavascript = require('micro-business-common-javascript');

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _trolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StoreCrawlerServiceBase = function StoreCrawlerServiceBase(storeKey) {
  var _this = this;

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      sessionToken = _ref.sessionToken,
      logVerboseFunc = _ref.logVerboseFunc,
      logInfoFunc = _ref.logInfoFunc,
      logErrorFunc = _ref.logErrorFunc;

  _classCallCheck(this, StoreCrawlerServiceBase);

  this.getConfig = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var configs, config;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_this.config) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', _this.config);

          case 2:
            _context.next = 4;
            return _microBusinessParseServerCommon.ParseWrapperService.getConfig();

          case 4:
            configs = _context.sent;
            config = configs.get(_this.storeKey);

            if (!config) {
              _context.next = 9;
              break;
            }

            _this.config = _immutable2.default.fromJS(config);

            return _context.abrupt('return', _this.config);

          case 9:
            throw new _microBusinessCommonJavascript.Exception('Failed to retrieve configuration for ' + _this.storeKey + ' store crawler.');

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  }));
  this.getStore = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var criteria, storeService, stores;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!_this.store) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return', _this.store);

          case 2:
            criteria = (0, _immutable.Map)({
              conditions: (0, _immutable.Map)({
                key: _this.storeKey
              })
            });
            storeService = new _trolleySmartParseServerCommon.StoreService();
            _context2.next = 6;
            return storeService.search(criteria, _this.sessionToken);

          case 6:
            stores = _context2.sent;

            if (!(stores.count() > 1)) {
              _context2.next = 9;
              break;
            }

            throw new _microBusinessCommonJavascript.Exception('Multiple store found with store key: ' + _this.storeKey + '.');

          case 9:
            if (!stores.isEmpty()) {
              _context2.next = 20;
              break;
            }

            _context2.t1 = storeService;
            _context2.next = 13;
            return storeService.create((0, _immutable.Map)({ key: _this.storeKey }, null, _this.sessionToken), null, _this.sessionToken);

          case 13:
            _context2.t2 = _context2.sent;
            _context2.t3 = _this.sessionToken;
            _context2.next = 17;
            return _context2.t1.read.call(_context2.t1, _context2.t2, null, _context2.t3);

          case 17:
            _context2.t0 = _context2.sent;
            _context2.next = 21;
            break;

          case 20:
            _context2.t0 = stores.first();

          case 21:
            _this.store = _context2.t0;
            return _context2.abrupt('return', _this.store);

          case 23:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, _this);
  }));
  this.getStoreId = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _this.getStore();

          case 2:
            return _context3.abrupt('return', _context3.sent.get('id'));

          case 3:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, _this);
  }));

  this.getStoreTags = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(includeTag) {
      var storeId, result, storeTags;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context4.sent;
              result = new _trolleySmartParseServerCommon.StoreTagService().searchAll((0, _immutable.Map)({ includeTag: includeTag, conditions: (0, _immutable.Map)({ storeId: storeId }) }), _this.sessionToken);
              _context4.prev = 4;
              storeTags = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                storeTags = storeTags.push(info);
              });

              _context4.next = 9;
              return result.promise;

            case 9:
              return _context4.abrupt('return', storeTags);

            case 10:
              _context4.prev = 10;

              result.event.unsubscribeAll();
              return _context4.finish(10);

            case 13:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this, [[4,, 10, 13]]);
    }));

    return function (_x2) {
      return _ref5.apply(this, arguments);
    };
  }();

  this.createOrUpdateStoreProduct = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(productCategory, productInfo) {
      var storeId, storeProductService, storeProducts;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context5.sent;
              storeProductService = new _trolleySmartParseServerCommon.StoreProductService();
              _context5.next = 6;
              return storeProductService.search((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  productPageUrl: productInfo.get('productPageUrl'),
                  storeId: storeId
                })
              }), _this.sessionToken);

            case 6:
              storeProducts = _context5.sent;

              if (!storeProducts.isEmpty()) {
                _context5.next = 12;
                break;
              }

              _context5.next = 10;
              return _trolleySmartParseServerCommon.StoreProductService.create(productInfo.megre((0, _immutable.Map)({
                lastCrawlDateTime: (0, _moment2.default)('01/01/1971', 'DD/MM/YYYY').toDate(),
                storeId: storeId
              })), null, _this.sessionToken);

            case 10:
              _context5.next = 18;
              break;

            case 12:
              if (!(storeProducts.count() > 1)) {
                _context5.next = 16;
                break;
              }

              throw new _microBusinessCommonJavascript.Exception('Multiple store product found for store Id: ' + storeId + ' and productPageUrl: ' + productInfo.get('productPageUrl'));

            case 16:
              _context5.next = 18;
              return storeProductService.update(storeProducts.first().merge(productInfo), _this.sessionToken);

            case 18:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this);
    }));

    return function (_x3, _x4) {
      return _ref6.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelOneProductCategory = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(productCategory, storeTags) {
      var storeId, storeTagService, foundStoreTag;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context6.sent;
              storeTagService = new _trolleySmartParseServerCommon.StoreTagService();
              foundStoreTag = storeTags.find(function (storeTag) {
                return storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0;
              });

              if (!foundStoreTag) {
                _context6.next = 10;
                break;
              }

              _context6.next = 8;
              return storeTagService.update(foundStoreTag.merge((0, _immutable.Map)({
                name: productCategory.get('name'),
                level: productCategory.get('level'),
                url: productCategory.get('url')
              })), _this.sessionToken);

            case 8:
              _context6.next = 12;
              break;

            case 10:
              _context6.next = 12;
              return storeTagService.create((0, _immutable.Map)({
                key: productCategory.get('categoryKey'),
                storeId: storeId,
                name: productCategory.get('name'),
                level: 1,
                url: productCategory.get('url')
              }), null, _this.sessionToken);

            case 12:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this);
    }));

    return function (_x5, _x6) {
      return _ref7.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelTwoProductCategory = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(productCategory, storeTags) {
      var storeId, storeTagService, foundStoreTag, parentStoreTagIds;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context7.sent;
              storeTagService = new _trolleySmartParseServerCommon.StoreTagService();
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
                _context7.next = 11;
                break;
              }

              _context7.next = 9;
              return storeTagService.update(foundStoreTag.merge((0, _immutable.Map)({
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                level: productCategory.first().get('level'),
                url: productCategory.first().get('url')
              })), _this.sessionToken);

            case 9:
              _context7.next = 13;
              break;

            case 11:
              _context7.next = 13;
              return storeTagService.create((0, _immutable.Map)({
                key: productCategory.first().get('categoryKey'),
                storeId: storeId,
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                level: 2,
                url: productCategory.first().get('url')
              }), null, _this.sessionToken);

            case 13:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this);
    }));

    return function (_x7, _x8) {
      return _ref8.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelThreeProductCategory = function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(productCategory, storeTags) {
      var storeId, storeTagService, foundStoreTag, parentStoreTagIds;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context8.sent;
              storeTagService = new _trolleySmartParseServerCommon.StoreTagService();
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
                _context8.next = 11;
                break;
              }

              _context8.next = 9;
              return storeTagService.update(foundStoreTag.merge((0, _immutable.Map)({
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                level: productCategory.first().get('level'),
                url: productCategory.first().get('url')
              })), _this.sessionToken);

            case 9:
              _context8.next = 13;
              break;

            case 11:
              _context8.next = 13;
              return storeTagService.create((0, _immutable.Map)({
                key: productCategory.first().get('categoryKey'),
                storeId: storeId,
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                level: 3,
                url: productCategory.first().get('url')
              }), null, _this.sessionToken);

            case 13:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this);
    }));

    return function (_x9, _x10) {
      return _ref9.apply(this, arguments);
    };
  }();

  this.getStoreProductsCriteria = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
      var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          lastCrawlDateTime = _ref11.lastCrawlDateTime;

      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.t0 = _immutable.Map;
              _context9.t1 = _immutable.Map;
              _context9.next = 4;
              return _this.getStoreId();

            case 4:
              _context9.t2 = _context9.sent;
              _context9.t3 = lastCrawlDateTime || undefined;
              _context9.t4 = {
                storeId: _context9.t2,
                lessThanOrEqualTo_lastCrawlDateTime: _context9.t3
              };
              _context9.t5 = (0, _context9.t1)(_context9.t4);
              _context9.t6 = {
                conditions: _context9.t5
              };
              return _context9.abrupt('return', (0, _context9.t0)(_context9.t6));

            case 10:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this);
    }));

    return function () {
      return _ref10.apply(this, arguments);
    };
  }();

  this.getAllStoreProducts = function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
      var _ref13 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          lastCrawlDateTime = _ref13.lastCrawlDateTime;

      var result, storeProducts;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.t0 = new _trolleySmartParseServerCommon.StoreProductService();
              _context10.next = 3;
              return _this.getStoreProductsCriteria({ lastCrawlDateTime: lastCrawlDateTime });

            case 3:
              _context10.t1 = _context10.sent;
              _context10.t2 = _this.sessionToken;
              result = _context10.t0.searchAll.call(_context10.t0, _context10.t1, _context10.t2);
              _context10.prev = 6;
              storeProducts = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                storeProducts = storeProducts.push(info);
              });

              _context10.next = 11;
              return result.promise;

            case 11:
              return _context10.abrupt('return', storeProducts);

            case 12:
              _context10.prev = 12;

              result.event.unsubscribeAll();
              return _context10.finish(12);

            case 15:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this, [[6,, 12, 15]]);
    }));

    return function () {
      return _ref12.apply(this, arguments);
    };
  }();

  this.getStoreProducts = function () {
    var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
      var _ref15 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          lastCrawlDateTime = _ref15.lastCrawlDateTime;

      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.t0 = new _trolleySmartParseServerCommon.StoreProductService();
              _context11.next = 3;
              return _this.getStoreProductsCriteria({ lastCrawlDateTime: lastCrawlDateTime }).set('limit', 1000);

            case 3:
              _context11.t1 = _context11.sent;
              _context11.t2 = _this.sessionToken;
              return _context11.abrupt('return', _context11.t0.search.call(_context11.t0, _context11.t1, _context11.t2));

            case 6:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this);
    }));

    return function () {
      return _ref14.apply(this, arguments);
    };
  }();

  this.getActiveProductPrices = function () {
    var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(storeProductId) {
      var storeId, criteria;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context12.sent;
              criteria = (0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  storeProductId: storeProductId,
                  storeId: storeId,
                  status: 'A'
                })
              });
              return _context12.abrupt('return', new _trolleySmartParseServerCommon.ProductPriceService().search(criteria, _this.sessionToken));

            case 5:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this);
    }));

    return function (_x14) {
      return _ref16.apply(this, arguments);
    };
  }();

  this.updateExistingStoreProduct = function () {
    var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(storeProduct) {
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return new _trolleySmartParseServerCommon.StoreProductService().update(storeProduct, _this.sessionToken);

            case 2:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this);
    }));

    return function (_x15) {
      return _ref17.apply(this, arguments);
    };
  }();

  this.createOrUpdateProductPrice = function () {
    var _ref18 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(storeProductId, productPrice, priceDetails) {
      var productPrices, productPriceService, notMatchedProductPrices, matchedProductPrices;
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return _this.getActiveProductPrices(storeProductId);

            case 2:
              productPrices = _context14.sent;
              productPriceService = new _trolleySmartParseServerCommon.ProductPriceService();

              if (!(!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice'))) {
                _context14.next = 9;
                break;
              }

              if (productPrices.isEmpty()) {
                _context14.next = 8;
                break;
              }

              _context14.next = 8;
              return Promise.all(productPrices.map(function (_) {
                return productPriceService.update(_.set('status', 'I'), _this.sessionToken);
              }).toArray());

            case 8:
              return _context14.abrupt('return');

            case 9:
              if (!productPrices.isEmpty()) {
                _context14.next = 14;
                break;
              }

              _context14.next = 12;
              return productPriceService.create(productPrice, null, _this.sessionToken);

            case 12:
              _context14.next = 27;
              break;

            case 14:
              notMatchedProductPrices = productPrices.filterNot(function (_) {
                return _.get('priceDetails').equals(priceDetails);
              });

              if (notMatchedProductPrices.isEmpty()) {
                _context14.next = 18;
                break;
              }

              _context14.next = 18;
              return Promise.all(notMatchedProductPrices.map(function (_) {
                return productPriceService.update(_.set('status', 'I'), _this.sessionToken);
              }).toArray());

            case 18:
              matchedProductPrices = productPrices.filter(function (_) {
                return _.get('priceDetails').equals(priceDetails);
              });

              if (!(matchedProductPrices.count() > 1)) {
                _context14.next = 24;
                break;
              }

              _context14.next = 22;
              return Promise.all(matchedProductPrices.skip(1).map(function (_) {
                return productPriceService.update(_.set('status', 'I'), _this.sessionToken);
              }).toArray());

            case 22:
              _context14.next = 27;
              break;

            case 24:
              if (!(matchedProductPrices.count() === 0)) {
                _context14.next = 27;
                break;
              }

              _context14.next = 27;
              return productPriceService.create(productPrice, null, _this.sessionToken);

            case 27:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, _this);
    }));

    return function (_x16, _x17, _x18) {
      return _ref18.apply(this, arguments);
    };
  }();

  this.crawlAndSyncProductCategoriesToStoreTags = _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
    var productCategories, storeTags, splittedLevelOneProductCategories, storeTagsWithUpdatedLevelOneProductCategories, levelTwoProductCategories, levelTwoProductCategoriesGroupedByCategoryKey, splittedLevelTwoProductCategories, storeTagsWithUpdatedLevelTwoProductCategories, levelThreeProductCategories, levelThreeProductCategoriesGroupedByCategoryKey, splittedLevelThreeProductCategories;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.next = 2;
            return _this.crawlAllProductCategories();

          case 2:
            productCategories = _context15.sent;
            _context15.next = 5;
            return _this.getStoreTags(false);

          case 5:
            storeTags = _context15.sent;
            splittedLevelOneProductCategories = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(productCategories, 100);
            _context15.next = 9;
            return _bluebird2.default.each(splittedLevelOneProductCategories.toArray(), function (productCategoryChunks) {
              return Promise.all(productCategoryChunks.map(function (productCategory) {
                return _this.createOrUpdateLevelOneProductCategory(productCategory, storeTags);
              }));
            });

          case 9:
            _context15.next = 11;
            return _this.getStoreTags(false);

          case 11:
            storeTagsWithUpdatedLevelOneProductCategories = _context15.sent;
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
            splittedLevelTwoProductCategories = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(levelTwoProductCategoriesGroupedByCategoryKey.valueSeq(), 100);
            _context15.next = 17;
            return _bluebird2.default.each(splittedLevelTwoProductCategories.toArray(), function (productCategoryChunks) {
              return Promise.all(productCategoryChunks.map(function (productCategory) {
                return _this.createOrUpdateLevelTwoProductCategory(productCategory, storeTagsWithUpdatedLevelOneProductCategories);
              }));
            });

          case 17:
            _context15.next = 19;
            return _this.getStoreTags(false);

          case 19:
            storeTagsWithUpdatedLevelTwoProductCategories = _context15.sent;
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
            splittedLevelThreeProductCategories = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(levelThreeProductCategoriesGroupedByCategoryKey.valueSeq(), 100);
            _context15.next = 25;
            return _bluebird2.default.each(splittedLevelThreeProductCategories.toArray(), function (productCategoryChunks) {
              return Promise.all(productCategoryChunks.map(function (productCategory) {
                return _this.createOrUpdateLevelThreeProductCategory(productCategory, storeTagsWithUpdatedLevelTwoProductCategories);
              }));
            });

          case 25:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, _this);
  }));
  this.crawlProducts = _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
    return regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.t0 = _this;
            _context16.t1 = _this;
            _context16.next = 4;
            return _this.getStoreTags();

          case 4:
            _context16.t2 = _context16.sent;
            _context16.next = 7;
            return _context16.t1.crawlStoreTagsTotalItemsInfo.call(_context16.t1, _context16.t2);

          case 7:
            _context16.t3 = _context16.sent;
            _context16.next = 10;
            return _context16.t0.crawlProductsForEachStoreTag.call(_context16.t0, _context16.t3);

          case 10:
          case 'end':
            return _context16.stop();
        }
      }
    }, _callee16, _this);
  }));

  this.logVerbose = function () {
    var _ref21 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(messageFunc) {
      var config;
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return _this.getConfig();

            case 2:
              config = _context17.sent;


              if (_this.logVerboseFunc && config.get('logLevel') && config.get('logLevel') >= 3 && messageFunc) {
                _this.logVerboseFunc(messageFunc());
              }

            case 4:
            case 'end':
              return _context17.stop();
          }
        }
      }, _callee17, _this);
    }));

    return function (_x19) {
      return _ref21.apply(this, arguments);
    };
  }();

  this.logInfo = function () {
    var _ref22 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18(messageFunc) {
      var config;
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.next = 2;
              return _this.getConfig();

            case 2:
              config = _context18.sent;


              if (_this.logInfoFunc && config.get('logLevel') && config.get('logLevel') >= 2 && messageFunc) {
                _this.logInfoFunc(messageFunc());
              }

            case 4:
            case 'end':
              return _context18.stop();
          }
        }
      }, _callee18, _this);
    }));

    return function (_x20) {
      return _ref22.apply(this, arguments);
    };
  }();

  this.logError = function () {
    var _ref23 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(messageFunc) {
      var config;
      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.next = 2;
              return _this.getConfig();

            case 2:
              config = _context19.sent;


              if (_this.logErrorFunc && config.get('logLevel') && config.get('logLevel') >= 1 && messageFunc) {
                _this.logErrorFunc(messageFunc());
              }

            case 4:
            case 'end':
              return _context19.stop();
          }
        }
      }, _callee19, _this);
    }));

    return function (_x21) {
      return _ref23.apply(this, arguments);
    };
  }();

  this.crawlAllProductCategories = _asyncToGenerator(regeneratorRuntime.mark(function _callee20() {
    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            return _context20.abrupt('return', (0, _immutable.List)());

          case 1:
          case 'end':
            return _context20.stop();
        }
      }
    }, _callee20, _this);
  }));
  this.crawlStoreTagsTotalItemsInfo = _asyncToGenerator(regeneratorRuntime.mark(function _callee21() {
    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            return _context21.abrupt('return', (0, _immutable.List)());

          case 1:
          case 'end':
            return _context21.stop();
        }
      }
    }, _callee21, _this);
  }));
  this.crawlProductsForEachStoreTag = _asyncToGenerator(regeneratorRuntime.mark(function _callee22() {
    return regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
          case 'end':
            return _context22.stop();
        }
      }
    }, _callee22, _this);
  }));

  this.storeKey = storeKey;
  this.sessionToken = sessionToken;
  this.logVerboseFunc = logVerboseFunc;
  this.logInfoFunc = logInfoFunc;
  this.logErrorFunc = logErrorFunc;
  this.config = null;
  this.store = null;
}

// These function must be overriden by the child classes
;

StoreCrawlerServiceBase.removeDollarSignFromPrice = function (priceWithDollarSign) {
  return parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());
};

StoreCrawlerServiceBase.safeGetUri = function (res) {
  return res && res.request && res.request.uri ? res.request.uri.href : '';
};

exports.default = StoreCrawlerServiceBase;