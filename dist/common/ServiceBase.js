'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _trolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceBase = function ServiceBase(_ref) {
  var _this = this;

  var logVerboseFunc = _ref.logVerboseFunc,
      logInfoFunc = _ref.logInfoFunc,
      logErrorFunc = _ref.logErrorFunc;

  _classCallCheck(this, ServiceBase);

  this.splitIntoChunks = function (list, chunkSize) {
    return (0, _immutable.Range)(0, list.count(), chunkSize).map(function (chunkStart) {
      return list.slice(chunkStart, chunkStart + chunkSize);
    });
  };

  this.getConfig = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(key) {
      var configs, config;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _microBusinessParseServerCommon.ParseWrapperService.getConfig();

            case 2:
              configs = _context.sent;
              config = configs.get(key);

              if (!config) {
                _context.next = 6;
                break;
              }

              return _context.abrupt('return', _immutable2.default.fromJS(config));

            case 6:
              throw new _microBusinessParseServerCommon.Exception('No config found called ' + key + '.');

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.createNewCrawlSessionAndGetConfig = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(sessionKey, config, storeName, sessionToken) {
      var sessionInfo, sessionId, finalConfig;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              sessionInfo = (0, _immutable.Map)({
                sessionKey: sessionKey,
                startDateTime: new Date()
              });
              _context2.next = 3;
              return _trolleySmartParseServerCommon.CrawlSessionService.create(sessionInfo, null, sessionToken);

            case 3:
              sessionId = _context2.sent;
              _context2.t0 = config;

              if (_context2.t0) {
                _context2.next = 9;
                break;
              }

              _context2.next = 8;
              return _this.getConfig(storeName);

            case 8:
              _context2.t0 = _context2.sent;

            case 9:
              finalConfig = _context2.t0;

              if (finalConfig) {
                _context2.next = 12;
                break;
              }

              throw new _microBusinessParseServerCommon.Exception('Failed to retrieve configuration for ' + storeName + ' store crawler.');

            case 12:

              _this.logInfo(finalConfig, function () {
                return 'Created session and retrieved config. Session Id: ' + sessionId;
              });
              _this.logVerbose(finalConfig, function () {
                return 'Config: ' + JSON.stringify(finalConfig);
              });

              return _context2.abrupt('return', (0, _immutable.Map)({
                sessionInfo: sessionInfo.set('id', sessionId),
                config: finalConfig
              }));

            case 15:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2, _x3, _x4, _x5) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.getStore = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(key, sessionToken) {
      var criteria, results;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              criteria = (0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  key: key
                })
              });
              _context3.next = 3;
              return _trolleySmartParseServerCommon.StoreService.search(criteria, sessionToken);

            case 3:
              results = _context3.sent;

              if (!results.isEmpty()) {
                _context3.next = 12;
                break;
              }

              _context3.t0 = _trolleySmartParseServerCommon.StoreService;
              _context3.next = 8;
              return _trolleySmartParseServerCommon.StoreService.create((0, _immutable.Map)({ key: key }, null, sessionToken), null, sessionToken);

            case 8:
              _context3.t1 = _context3.sent;
              return _context3.abrupt('return', _context3.t0.read.call(_context3.t0, _context3.t1));

            case 12:
              if (!(results.count() === 1)) {
                _context3.next = 14;
                break;
              }

              return _context3.abrupt('return', results.first());

            case 14:
              throw new _microBusinessParseServerCommon.Exception('Multiple store found with provided key: ' + key + '.');

            case 15:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x6, _x7) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.getMostRecentCrawlSessionInfo = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(sessionKey, sessionToken) {
      var crawlSessionInfos;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _trolleySmartParseServerCommon.CrawlSessionService.search((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  sessionKey: sessionKey
                }),
                topMost: true
              }), sessionToken);

            case 2:
              crawlSessionInfos = _context4.sent;
              return _context4.abrupt('return', crawlSessionInfos.first());

            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x8, _x9) {
      return _ref5.apply(this, arguments);
    };
  }();

  this.getMostRecentCrawlResults = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(sessionKey, mapFunc, sessionToken) {
      var crawlSessionInfo, crawlSessionId, results, result;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this.getMostRecentCrawlSessionInfo(sessionKey, sessionToken);

            case 2:
              crawlSessionInfo = _context5.sent;
              crawlSessionId = crawlSessionInfo.get('id');
              results = (0, _immutable.List)();
              result = _trolleySmartParseServerCommon.CrawlResultService.searchAll((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  crawlSessionId: crawlSessionId
                })
              }), sessionToken);
              _context5.prev = 6;

              result.event.subscribe(function (info) {
                results = results.push(mapFunc ? mapFunc(info) : info);
              });

              _context5.next = 10;
              return result.promise;

            case 10:
              _context5.prev = 10;

              result.event.unsubscribeAll();
              return _context5.finish(10);

            case 13:
              return _context5.abrupt('return', results);

            case 14:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this, [[6,, 10, 13]]);
    }));

    return function (_x10, _x11, _x12) {
      return _ref6.apply(this, arguments);
    };
  }();

  this.getStoreTags = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(storeId, includeTag, sessionToken) {
      var result, storeTags;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              result = _trolleySmartParseServerCommon.StoreTagService.searchAll((0, _immutable.Map)({ includeTag: includeTag, conditions: (0, _immutable.Map)({ storeId: storeId }) }), sessionToken);
              _context6.prev = 1;
              storeTags = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                storeTags = storeTags.push(info);
              });

              _context6.next = 6;
              return result.promise;

            case 6:
              return _context6.abrupt('return', storeTags);

            case 7:
              _context6.prev = 7;

              result.event.unsubscribeAll();
              return _context6.finish(7);

            case 10:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this, [[1,, 7, 10]]);
    }));

    return function (_x13, _x14, _x15) {
      return _ref7.apply(this, arguments);
    };
  }();

  this.createOrUpdateStoreMasterProduct = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(productCategory, productInfo, storeId, sessionToken) {
      var storeMasterProducts, storeMasterProduct, updatedStoreMasterProduct;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _trolleySmartParseServerCommon.StoreMasterProductService.search((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  productPageUrl: productInfo.get('productPageUrl'),
                  storeId: storeId
                })
              }), sessionToken);

            case 2:
              storeMasterProducts = _context7.sent;

              if (!storeMasterProducts.isEmpty()) {
                _context7.next = 8;
                break;
              }

              _context7.next = 6;
              return _trolleySmartParseServerCommon.StoreMasterProductService.create((0, _immutable.Map)({
                productPageUrl: productInfo.get('productPageUrl'),
                lastCrawlDateTime: new Date(1970, 1, 1),
                storeId: storeId
              }), null, sessionToken);

            case 6:
              _context7.next = 16;
              break;

            case 8:
              if (!(storeMasterProducts.count() > 1)) {
                _context7.next = 12;
                break;
              }

              throw new _microBusinessParseServerCommon.Exception('Multiple store master product found for store Id: ' + storeId + ' and productPageUrl: ' + productInfo.get('productPageUrl'));

            case 12:
              storeMasterProduct = storeMasterProducts.first();
              updatedStoreMasterProduct = storeMasterProduct.set('productPageUrl', productInfo.get('productPageUrl'));
              _context7.next = 16;
              return _trolleySmartParseServerCommon.StoreMasterProductService.update(updatedStoreMasterProduct, sessionToken);

            case 16:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this);
    }));

    return function (_x16, _x17, _x18, _x19) {
      return _ref8.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelOneProductCategory = function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(productCategory, storeTags, storeId, sessionToken) {
      var foundStoreTag;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              foundStoreTag = storeTags.find(function (storeTag) {
                return storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0;
              });

              if (!foundStoreTag) {
                _context8.next = 6;
                break;
              }

              _context8.next = 4;
              return _trolleySmartParseServerCommon.StoreTagService.update(foundStoreTag.merge((0, _immutable.Map)({
                name: productCategory.get('name'),
                weight: productCategory.get('weigth'),
                url: productCategory.get('url')
              })), sessionToken);

            case 4:
              _context8.next = 8;
              break;

            case 6:
              _context8.next = 8;
              return _trolleySmartParseServerCommon.StoreTagService.create((0, _immutable.Map)({
                key: productCategory.get('categoryKey'),
                storeId: storeId,
                name: productCategory.get('name'),
                weight: 1,
                url: productCategory.get('url')
              }), null, sessionToken);

            case 8:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this);
    }));

    return function (_x20, _x21, _x22, _x23) {
      return _ref9.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelTwoProductCategory = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(productCategory, storeTags, storeId, sessionToken) {
      var foundStoreTag, parentStoreTagIds;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
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
                _context9.next = 7;
                break;
              }

              _context9.next = 5;
              return _trolleySmartParseServerCommon.StoreTagService.update(foundStoreTag.merge((0, _immutable.Map)({
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                weight: productCategory.first().get('weigth'),
                url: productCategory.first().get('url')
              })), sessionToken);

            case 5:
              _context9.next = 9;
              break;

            case 7:
              _context9.next = 9;
              return _trolleySmartParseServerCommon.StoreTagService.create((0, _immutable.Map)({
                key: productCategory.first().get('categoryKey'),
                storeId: storeId,
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                weight: 2,
                url: productCategory.first().get('url')
              }), null, sessionToken);

            case 9:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this);
    }));

    return function (_x24, _x25, _x26, _x27) {
      return _ref10.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelThreeProductCategory = function () {
    var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(productCategory, storeTags, storeId, sessionToken) {
      var foundStoreTag, parentStoreTagIds;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
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
                _context10.next = 7;
                break;
              }

              _context10.next = 5;
              return _trolleySmartParseServerCommon.StoreTagService.update(foundStoreTag.merge((0, _immutable.Map)({
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                weight: productCategory.first().get('weigth'),
                url: productCategory.first().get('url')
              })), sessionToken);

            case 5:
              _context10.next = 9;
              break;

            case 7:
              _context10.next = 9;
              return _trolleySmartParseServerCommon.StoreTagService.create((0, _immutable.Map)({
                key: productCategory.first().get('categoryKey'),
                storeId: storeId,
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                weight: 3,
                url: productCategory.first().get('url')
              }), null, sessionToken);

            case 9:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this);
    }));

    return function (_x28, _x29, _x30, _x31) {
      return _ref11.apply(this, arguments);
    };
  }();

  this.getAllStoreMasterProducts = function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(storeId, sessionToken) {
      var criteria, result, products;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              criteria = (0, _immutable.Map)({
                includeStore: true,
                conditions: (0, _immutable.Map)({
                  storeId: storeId
                })
              });
              result = _trolleySmartParseServerCommon.StoreMasterProductService.searchAll(criteria, sessionToken);
              _context11.prev = 2;
              products = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                products = products.push(info);
              });

              _context11.next = 7;
              return result.promise;

            case 7:
              return _context11.abrupt('return', products);

            case 8:
              _context11.prev = 8;

              result.event.unsubscribeAll();
              return _context11.finish(8);

            case 11:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this, [[2,, 8, 11]]);
    }));

    return function (_x32, _x33) {
      return _ref12.apply(this, arguments);
    };
  }();

  this.getAllStoreMasterProductsWithoutMasterProduct = function () {
    var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(storeId, sessionToken) {
      var criteria, result, products;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              criteria = (0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  storeId: storeId,
                  without_masterProduct: true
                })
              });
              result = _trolleySmartParseServerCommon.StoreMasterProductService.searchAll(criteria, sessionToken);
              _context12.prev = 2;
              products = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                products = products.push(info);
              });

              _context12.next = 7;
              return result.promise;

            case 7:
              return _context12.abrupt('return', products);

            case 8:
              _context12.prev = 8;

              result.event.unsubscribeAll();
              return _context12.finish(8);

            case 11:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this, [[2,, 8, 11]]);
    }));

    return function (_x34, _x35) {
      return _ref13.apply(this, arguments);
    };
  }();

  this.getStoreMasterProductsWithMasterProductCriteria = function (storeId, lastCrawlDateTime) {
    return (0, _immutable.Map)({
      includeStore: true,
      conditions: (0, _immutable.Map)({
        storeId: storeId,
        with_masterProduct: true,
        lessThanOrEqualTo_lastCrawlDateTime: lastCrawlDateTime
      })
    });
  };

  this.getStoreMasterProductsWithMasterProduct = function () {
    var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(storeId, lastCrawlDateTime, sessionToken) {
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              return _context13.abrupt('return', _trolleySmartParseServerCommon.StoreMasterProductService.search(_this.getStoreMasterProductsWithMasterProductCriteria(storeId, lastCrawlDateTime).set('limit', 1000), sessionToken));

            case 1:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this);
    }));

    return function (_x36, _x37, _x38) {
      return _ref14.apply(this, arguments);
    };
  }();

  this.getAllStoreMasterProductsWithMasterProduct = function () {
    var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(storeId, lastCrawlDateTime, sessionToken) {
      var result, products;
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              result = _trolleySmartParseServerCommon.StoreMasterProductService.searchAll(_this.getStoreMasterProductsWithMasterProductCriteria(storeId, lastCrawlDateTime), sessionToken);
              _context14.prev = 1;
              products = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                products = products.push(info);
              });

              _context14.next = 6;
              return result.promise;

            case 6:
              return _context14.abrupt('return', products);

            case 7:
              _context14.prev = 7;

              result.event.unsubscribeAll();
              return _context14.finish(7);

            case 10:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, _this, [[1,, 7, 10]]);
    }));

    return function (_x39, _x40, _x41) {
      return _ref15.apply(this, arguments);
    };
  }();

  this.removeDollarSignFromPrice = function (priceWithDollarSign) {
    return parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());
  };

  this.getActiveMasterProductPrices = function () {
    var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(masterProductId, storeId, sessionToken) {
      var criteria;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              criteria = (0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  masterProductId: masterProductId,
                  storeId: storeId,
                  status: 'A'
                })
              });
              return _context15.abrupt('return', _trolleySmartParseServerCommon.MasterProductPriceService.search(criteria, sessionToken));

            case 2:
            case 'end':
              return _context15.stop();
          }
        }
      }, _callee15, _this);
    }));

    return function (_x42, _x43, _x44) {
      return _ref16.apply(this, arguments);
    };
  }();

  this.createOrUpdateMasterProductPrice = function () {
    var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(masterProductId, storeId, masterProductPrice, priceDetails, sessionToken) {
      var masterProductPrices, notMatchedMasterProductPrices, matchedMasterProductPrices;
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return _this.getActiveMasterProductPrices(masterProductId, storeId, sessionToken);

            case 2:
              masterProductPrices = _context16.sent;

              if (!(!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice'))) {
                _context16.next = 8;
                break;
              }

              if (masterProductPrices.isEmpty()) {
                _context16.next = 7;
                break;
              }

              _context16.next = 7;
              return Promise.all(masterProductPrices.map(function (_) {
                return _trolleySmartParseServerCommon.MasterProductPriceService.update(_.set('status', 'I'), sessionToken);
              }).toArray());

            case 7:
              return _context16.abrupt('return');

            case 8:
              if (!masterProductPrices.isEmpty()) {
                _context16.next = 13;
                break;
              }

              _context16.next = 11;
              return _trolleySmartParseServerCommon.MasterProductPriceService.create(masterProductPrice.set('firstCrawledDate', new Date()), null, sessionToken);

            case 11:
              _context16.next = 26;
              break;

            case 13:
              notMatchedMasterProductPrices = masterProductPrices.filterNot(function (_) {
                return _.get('priceDetails').equals(priceDetails);
              });

              if (notMatchedMasterProductPrices.isEmpty()) {
                _context16.next = 17;
                break;
              }

              _context16.next = 17;
              return Promise.all(notMatchedMasterProductPrices.map(function (_) {
                return _trolleySmartParseServerCommon.MasterProductPriceService.update(_.set('status', 'I'), sessionToken);
              }).toArray());

            case 17:
              matchedMasterProductPrices = masterProductPrices.filter(function (_) {
                return _.get('priceDetails').equals(priceDetails);
              });

              if (!(matchedMasterProductPrices.count() > 1)) {
                _context16.next = 23;
                break;
              }

              _context16.next = 21;
              return Promise.all(matchedMasterProductPrices.skip(1).map(function (_) {
                return _trolleySmartParseServerCommon.MasterProductPriceService.update(_.set('status', 'I'), sessionToken);
              }).toArray());

            case 21:
              _context16.next = 26;
              break;

            case 23:
              if (!(matchedMasterProductPrices.count() === 0)) {
                _context16.next = 26;
                break;
              }

              _context16.next = 26;
              return _trolleySmartParseServerCommon.MasterProductPriceService.create(masterProductPrice.set('firstCrawledDate', new Date()), null, sessionToken);

            case 26:
            case 'end':
              return _context16.stop();
          }
        }
      }, _callee16, _this);
    }));

    return function (_x45, _x46, _x47, _x48, _x49) {
      return _ref17.apply(this, arguments);
    };
  }();

  this.safeGetUri = function (res) {
    return res && res.request && res.request.uri ? res.request.uri.href : '';
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

exports.default = ServiceBase;