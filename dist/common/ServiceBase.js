'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _microBusinessCommonJavascript = require('micro-business-common-javascript');

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _trolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceBase = function ServiceBase(storeKey) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      sessionToken = _ref.sessionToken,
      logVerboseFunc = _ref.logVerboseFunc,
      logInfoFunc = _ref.logInfoFunc,
      logErrorFunc = _ref.logErrorFunc;

  _classCallCheck(this, ServiceBase);

  _initialiseProps.call(this);

  this.storeKey = storeKey;
  this.sessionToken = sessionToken;
  this.logVerboseFunc = logVerboseFunc;
  this.logInfoFunc = logInfoFunc;
  this.logErrorFunc = logErrorFunc;
  this.config = null;
  this.store = null;
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

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

  this.createNewCrawlSession = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(sessionKey) {
      var config, crawlSessionService, sessionId;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.getConfig();

            case 2:
              config = _context2.sent;
              crawlSessionService = new _trolleySmartParseServerCommon.CrawlSessionService();
              _context2.next = 6;
              return crawlSessionService.create((0, _immutable.Map)({ sessionKey: sessionKey, startDateTime: new Date() }), null, _this.sessionToken);

            case 6:
              sessionId = _context2.sent;


              _this.logInfo(config, function () {
                return 'Created session. Session Id: ' + sessionId;
              });

              return _context2.abrupt('return', crawlSessionService.read(sessionId, null, _this.sessionToken));

            case 9:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.getStore = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var criteria, storeService, results;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!_this.store) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt('return', _this.store);

          case 2:
            criteria = (0, _immutable.Map)({
              conditions: (0, _immutable.Map)({
                key: _this.storeKey
              })
            });
            storeService = new _trolleySmartParseServerCommon.StoreService();
            _context3.next = 6;
            return storeService.search(criteria, _this.sessionToken);

          case 6:
            results = _context3.sent;

            if (!(results.count() > 1)) {
              _context3.next = 9;
              break;
            }

            throw new _microBusinessCommonJavascript.Exception('Multiple store found with store key: ' + _this.storeKey + '.');

          case 9:
            if (!results.isEmpty()) {
              _context3.next = 20;
              break;
            }

            _context3.t1 = storeService;
            _context3.next = 13;
            return storeService.create((0, _immutable.Map)({ key: _this.storeKey }, null, _this.sessionToken), null, _this.sessionToken);

          case 13:
            _context3.t2 = _context3.sent;
            _context3.t3 = _this.sessionToken;
            _context3.next = 17;
            return _context3.t1.read.call(_context3.t1, _context3.t2, null, _context3.t3);

          case 17:
            _context3.t0 = _context3.sent;
            _context3.next = 21;
            break;

          case 20:
            _context3.t0 = results.first();

          case 21:
            _this.store = _context3.t0;
            return _context3.abrupt('return', _this.store);

          case 23:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, _this);
  }));
  this.getStoreId = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _this.getStore();

          case 2:
            return _context4.abrupt('return', _context4.sent.get('id'));

          case 3:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, _this);
  }));

  this.getMostRecentCrawlSessionInfo = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(sessionKey) {
      var crawlSessionInfos;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return new _trolleySmartParseServerCommon.CrawlSessionService().search((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  sessionKey: sessionKey
                }),
                topMost: true
              }), _this.sessionToken);

            case 2:
              crawlSessionInfos = _context5.sent;

              if (!crawlSessionInfos.isEmpty()) {
                _context5.next = 7;
                break;
              }

              throw new _microBusinessCommonJavascript.Exception('No crawl session found with session key: ' + sessionKey + '.');

            case 7:
              if (!(crawlSessionInfos.count() > 1)) {
                _context5.next = 9;
                break;
              }

              throw new _microBusinessCommonJavascript.Exception('Multiple crawl session found with session key: ' + sessionKey + '.');

            case 9:
              return _context5.abrupt('return', crawlSessionInfos.first());

            case 10:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this);
    }));

    return function (_x3) {
      return _ref6.apply(this, arguments);
    };
  }();

  this.getMostRecentCrawlResults = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(sessionKey, mapFunc) {
      var crawlSessionInfo, crawlSessionId, results, result;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _this.getMostRecentCrawlSessionInfo(sessionKey, _this.sessionToken);

            case 2:
              crawlSessionInfo = _context6.sent;
              crawlSessionId = crawlSessionInfo.get('id');
              results = (0, _immutable.List)();
              result = new _trolleySmartParseServerCommon.CrawlResultService().searchAll((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  crawlSessionId: crawlSessionId
                })
              }), _this.sessionToken);
              _context6.prev = 6;

              result.event.subscribe(function (info) {
                results = results.push(mapFunc ? mapFunc(info) : info);
              });

              _context6.next = 10;
              return result.promise;

            case 10:
              return _context6.abrupt('return', results);

            case 11:
              _context6.prev = 11;

              result.event.unsubscribeAll();
              return _context6.finish(11);

            case 14:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this, [[6,, 11, 14]]);
    }));

    return function (_x4, _x5) {
      return _ref7.apply(this, arguments);
    };
  }();

  this.getStoreTags = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(includeTag) {
      var storeId, result, storeTags;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context7.sent;
              result = new _trolleySmartParseServerCommon.StoreTagService().searchAll((0, _immutable.Map)({ includeTag: includeTag, conditions: (0, _immutable.Map)({ storeId: storeId }) }), _this.sessionToken);
              _context7.prev = 4;
              storeTags = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                storeTags = storeTags.push(info);
              });

              _context7.next = 9;
              return result.promise;

            case 9:
              return _context7.abrupt('return', storeTags);

            case 10:
              _context7.prev = 10;

              result.event.unsubscribeAll();
              return _context7.finish(10);

            case 13:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this, [[4,, 10, 13]]);
    }));

    return function (_x6) {
      return _ref8.apply(this, arguments);
    };
  }();

  this.createOrUpdateStoreProduct = function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(productCategory, productInfo) {
      var storeId, storeProductService, storeProducts, storeProduct, updatedStoreProduct;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context8.sent;
              storeProductService = new _trolleySmartParseServerCommon.StoreProductService();
              _context8.next = 6;
              return storeProductService.search((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  productPageUrl: productInfo.get('productPageUrl'),
                  storeId: storeId
                })
              }), _this.sessionToken);

            case 6:
              storeProducts = _context8.sent;

              if (!storeProducts.isEmpty()) {
                _context8.next = 12;
                break;
              }

              _context8.next = 10;
              return _trolleySmartParseServerCommon.StoreProductService.create((0, _immutable.Map)({
                productPageUrl: productInfo.get('productPageUrl'),
                lastCrawlDateTime: new Date(1970, 1, 1),
                storeId: storeId
              }), null, _this.sessionToken);

            case 10:
              _context8.next = 20;
              break;

            case 12:
              if (!(storeProducts.count() > 1)) {
                _context8.next = 16;
                break;
              }

              throw new _microBusinessCommonJavascript.Exception('Multiple store product found for store Id: ' + storeId + ' and productPageUrl: ' + productInfo.get('productPageUrl'));

            case 16:
              storeProduct = storeProducts.first();
              updatedStoreProduct = storeProduct.set('productPageUrl', productInfo.get('productPageUrl'));
              _context8.next = 20;
              return storeProductService.update(updatedStoreProduct, _this.sessionToken);

            case 20:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this);
    }));

    return function (_x7, _x8) {
      return _ref9.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelOneProductCategory = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(productCategory, storeTags) {
      var storeId, foundStoreTag, storeTagService;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _this.getStoreId();

            case 2:
              storeId = _context9.sent;
              foundStoreTag = storeTags.find(function (storeTag) {
                return storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0;
              });
              storeTagService = (0, _trolleySmartParseServerCommon.StoreTagService)();

              if (!foundStoreTag) {
                _context9.next = 10;
                break;
              }

              _context9.next = 8;
              return storeTagService.update(foundStoreTag.merge((0, _immutable.Map)({
                name: productCategory.get('name'),
                level: productCategory.get('level'),
                url: productCategory.get('url')
              })), _this.sessionToken);

            case 8:
              _context9.next = 12;
              break;

            case 10:
              _context9.next = 12;
              return storeTagService.create((0, _immutable.Map)({
                key: productCategory.get('categoryKey'),
                storeId: storeId,
                name: productCategory.get('name'),
                level: 1,
                url: productCategory.get('url')
              }), null, _this.sessionToken);

            case 12:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this);
    }));

    return function (_x9, _x10) {
      return _ref10.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelTwoProductCategory = function () {
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
                weight: 2,
                url: productCategory.first().get('url')
              }), null, sessionToken);

            case 9:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this);
    }));

    return function (_x11, _x12, _x13, _x14) {
      return _ref11.apply(this, arguments);
    };
  }();

  this.createOrUpdateLevelThreeProductCategory = function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(productCategory, storeTags, storeId, sessionToken) {
      var foundStoreTag, parentStoreTagIds;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
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
                _context11.next = 7;
                break;
              }

              _context11.next = 5;
              return _trolleySmartParseServerCommon.StoreTagService.update(foundStoreTag.merge((0, _immutable.Map)({
                storeTagIds: parentStoreTagIds,
                name: productCategory.first().get('name'),
                weight: productCategory.first().get('weigth'),
                url: productCategory.first().get('url')
              })), sessionToken);

            case 5:
              _context11.next = 9;
              break;

            case 7:
              _context11.next = 9;
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
              return _context11.stop();
          }
        }
      }, _callee11, _this);
    }));

    return function (_x15, _x16, _x17, _x18) {
      return _ref12.apply(this, arguments);
    };
  }();

  this.getAllStoreProducts = function () {
    var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(storeId, sessionToken) {
      var criteria, result, products;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              criteria = (0, _immutable.Map)({
                includeProduct: true,
                conditions: (0, _immutable.Map)({
                  storeId: storeId
                })
              });
              result = _trolleySmartParseServerCommon.StoreProductService.searchAll(criteria, sessionToken);
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

    return function (_x19, _x20) {
      return _ref13.apply(this, arguments);
    };
  }();

  this.getAllStoreProductsWithoutProduct = function () {
    var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(storeId, sessionToken) {
      var criteria, result, products;
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              criteria = (0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  storeId: storeId,
                  without_product: true
                })
              });
              result = _trolleySmartParseServerCommon.StoreProductService.searchAll(criteria, sessionToken);
              _context13.prev = 2;
              products = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                products = products.push(info);
              });

              _context13.next = 7;
              return result.promise;

            case 7:
              return _context13.abrupt('return', products);

            case 8:
              _context13.prev = 8;

              result.event.unsubscribeAll();
              return _context13.finish(8);

            case 11:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this, [[2,, 8, 11]]);
    }));

    return function (_x21, _x22) {
      return _ref14.apply(this, arguments);
    };
  }();

  this.getStoreProductsWithProductCriteria = function (storeId, lastCrawlDateTime) {
    return (0, _immutable.Map)({
      includeProduct: true,
      conditions: (0, _immutable.Map)({
        storeId: storeId,
        with_product: true,
        lessThanOrEqualTo_lastCrawlDateTime: lastCrawlDateTime
      })
    });
  };

  this.getStoreProductsWithProduct = function () {
    var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(storeId, lastCrawlDateTime, sessionToken) {
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              return _context14.abrupt('return', _trolleySmartParseServerCommon.StoreProductService.search(_this.getStoreProductsWithProductCriteria(storeId, lastCrawlDateTime).set('limit', 1000), sessionToken));

            case 1:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, _this);
    }));

    return function (_x23, _x24, _x25) {
      return _ref15.apply(this, arguments);
    };
  }();

  this.getAllStoreProductsWithProduct = function () {
    var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(storeId, lastCrawlDateTime, sessionToken) {
      var result, products;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              result = _trolleySmartParseServerCommon.StoreProductService.searchAll(_this.getStoreProductsWithProductCriteria(storeId, lastCrawlDateTime), sessionToken);
              _context15.prev = 1;
              products = (0, _immutable.List)();


              result.event.subscribe(function (info) {
                products = products.push(info);
              });

              _context15.next = 6;
              return result.promise;

            case 6:
              return _context15.abrupt('return', products);

            case 7:
              _context15.prev = 7;

              result.event.unsubscribeAll();
              return _context15.finish(7);

            case 10:
            case 'end':
              return _context15.stop();
          }
        }
      }, _callee15, _this, [[1,, 7, 10]]);
    }));

    return function (_x26, _x27, _x28) {
      return _ref16.apply(this, arguments);
    };
  }();

  this.removeDollarSignFromPrice = function (priceWithDollarSign) {
    return parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());
  };

  this.getActiveProductPrices = function () {
    var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(productId, storeId, sessionToken) {
      var criteria;
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              criteria = (0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  productId: productId,
                  storeId: storeId,
                  status: 'A'
                })
              });
              return _context16.abrupt('return', _trolleySmartParseServerCommon.ProductPriceService.search(criteria, sessionToken));

            case 2:
            case 'end':
              return _context16.stop();
          }
        }
      }, _callee16, _this);
    }));

    return function (_x29, _x30, _x31) {
      return _ref17.apply(this, arguments);
    };
  }();

  this.createOrUpdateProductPrice = function () {
    var _ref18 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(productId, storeId, productPrice, priceDetails, sessionToken) {
      var productPrices, notMatchedProductPrices, matchedProductPrices;
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return _this.getActiveProductPrices(productId, storeId, sessionToken);

            case 2:
              productPrices = _context17.sent;

              if (!(!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice'))) {
                _context17.next = 8;
                break;
              }

              if (productPrices.isEmpty()) {
                _context17.next = 7;
                break;
              }

              _context17.next = 7;
              return Promise.all(productPrices.map(function (_) {
                return _trolleySmartParseServerCommon.ProductPriceService.update(_.set('status', 'I'), sessionToken);
              }).toArray());

            case 7:
              return _context17.abrupt('return');

            case 8:
              if (!productPrices.isEmpty()) {
                _context17.next = 13;
                break;
              }

              _context17.next = 11;
              return _trolleySmartParseServerCommon.ProductPriceService.create(productPrice.set('firstCrawledDate', new Date()), null, sessionToken);

            case 11:
              _context17.next = 26;
              break;

            case 13:
              notMatchedProductPrices = productPrices.filterNot(function (_) {
                return _.get('priceDetails').equals(priceDetails);
              });

              if (notMatchedProductPrices.isEmpty()) {
                _context17.next = 17;
                break;
              }

              _context17.next = 17;
              return Promise.all(notMatchedProductPrices.map(function (_) {
                return _trolleySmartParseServerCommon.ProductPriceService.update(_.set('status', 'I'), sessionToken);
              }).toArray());

            case 17:
              matchedProductPrices = productPrices.filter(function (_) {
                return _.get('priceDetails').equals(priceDetails);
              });

              if (!(matchedProductPrices.count() > 1)) {
                _context17.next = 23;
                break;
              }

              _context17.next = 21;
              return Promise.all(matchedProductPrices.skip(1).map(function (_) {
                return _trolleySmartParseServerCommon.ProductPriceService.update(_.set('status', 'I'), sessionToken);
              }).toArray());

            case 21:
              _context17.next = 26;
              break;

            case 23:
              if (!(matchedProductPrices.count() === 0)) {
                _context17.next = 26;
                break;
              }

              _context17.next = 26;
              return _trolleySmartParseServerCommon.ProductPriceService.create(productPrice.set('firstCrawledDate', new Date()), null, sessionToken);

            case 26:
            case 'end':
              return _context17.stop();
          }
        }
      }, _callee17, _this);
    }));

    return function (_x32, _x33, _x34, _x35, _x36) {
      return _ref18.apply(this, arguments);
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
};

exports.default = ServiceBase;