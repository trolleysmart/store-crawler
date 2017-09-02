'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _microBusinessCommonJavascript = require('micro-business-common-javascript');

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _trolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value);
            },
            function(err) {
              step('throw', err);
            },
          );
        }
      }
      return step('next');
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var StoreCrawlerServiceBase = function StoreCrawlerServiceBase(storeKey) {
  var _this = this;

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    sessionToken = _ref.sessionToken,
    logVerboseFunc = _ref.logVerboseFunc,
    logInfoFunc = _ref.logInfoFunc,
    logErrorFunc = _ref.logErrorFunc;

  _classCallCheck(this, StoreCrawlerServiceBase);

  this.getConfig = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee() {
      var configs, config;
      return regeneratorRuntime.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
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
        },
        _callee,
        _this,
      );
    }),
  );

  this.createNewCrawlSession = (function() {
    var _ref3 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2(sessionKey) {
        var crawlSessionService, sessionId;
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  crawlSessionService = new _trolleySmartParseServerCommon.CrawlSessionService();
                  _context2.next = 3;
                  return crawlSessionService.create(
                    (0, _immutable.Map)({ sessionKey: sessionKey, startDateTime: new Date() }),
                    null,
                    _this.sessionToken,
                  );

                case 3:
                  sessionId = _context2.sent;
                  return _context2.abrupt('return', crawlSessionService.read(sessionId, null, _this.sessionToken));

                case 5:
                case 'end':
                  return _context2.stop();
              }
            }
          },
          _callee2,
          _this,
        );
      }),
    );

    return function(_x2) {
      return _ref3.apply(this, arguments);
    };
  })();

  this.updateExistingCrawlSession = (function() {
    var _ref4 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee3(sessionInfo) {
        return regeneratorRuntime.wrap(
          function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  _context3.next = 2;
                  return new _trolleySmartParseServerCommon.CrawlSessionService().update(sessionInfo, _this.sessionToken);

                case 2:
                case 'end':
                  return _context3.stop();
              }
            }
          },
          _callee3,
          _this,
        );
      }),
    );

    return function(_x3) {
      return _ref4.apply(this, arguments);
    };
  })();

  this.createNewCrawlResult = (function() {
    var _ref5 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee4(crawlSessionId, resultSet) {
        var crawlResult;
        return regeneratorRuntime.wrap(
          function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                  crawlResult = (0, _immutable.Map)({
                    crawlSessionId: crawlSessionId,
                    resultSet: resultSet,
                  });
                  _context4.next = 3;
                  return new _trolleySmartParseServerCommon.CrawlResultService().create(crawlResult, null, _this.sessionToken);

                case 3:
                case 'end':
                  return _context4.stop();
              }
            }
          },
          _callee4,
          _this,
        );
      }),
    );

    return function(_x4, _x5) {
      return _ref5.apply(this, arguments);
    };
  })();

  this.getStore = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee5() {
      var criteria, storeService, stores;
      return regeneratorRuntime.wrap(
        function _callee5$(_context5) {
          while (1) {
            switch ((_context5.prev = _context5.next)) {
              case 0:
                if (!_this.store) {
                  _context5.next = 2;
                  break;
                }

                return _context5.abrupt('return', _this.store);

              case 2:
                criteria = (0, _immutable.Map)({
                  conditions: (0, _immutable.Map)({
                    key: _this.storeKey,
                  }),
                });
                storeService = new _trolleySmartParseServerCommon.StoreService();
                _context5.next = 6;
                return storeService.search(criteria, _this.sessionToken);

              case 6:
                stores = _context5.sent;

                if (!(stores.count() > 1)) {
                  _context5.next = 9;
                  break;
                }

                throw new _microBusinessCommonJavascript.Exception('Multiple store found with store key: ' + _this.storeKey + '.');

              case 9:
                if (!stores.isEmpty()) {
                  _context5.next = 20;
                  break;
                }

                _context5.t1 = storeService;
                _context5.next = 13;
                return storeService.create((0, _immutable.Map)({ key: _this.storeKey }, null, _this.sessionToken), null, _this.sessionToken);

              case 13:
                _context5.t2 = _context5.sent;
                _context5.t3 = _this.sessionToken;
                _context5.next = 17;
                return _context5.t1.read.call(_context5.t1, _context5.t2, null, _context5.t3);

              case 17:
                _context5.t0 = _context5.sent;
                _context5.next = 21;
                break;

              case 20:
                _context5.t0 = stores.first();

              case 21:
                _this.store = _context5.t0;
                return _context5.abrupt('return', _this.store);

              case 23:
              case 'end':
                return _context5.stop();
            }
          }
        },
        _callee5,
        _this,
      );
    }),
  );
  this.getStoreId = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee6() {
      return regeneratorRuntime.wrap(
        function _callee6$(_context6) {
          while (1) {
            switch ((_context6.prev = _context6.next)) {
              case 0:
                _context6.next = 2;
                return _this.getStore();

              case 2:
                return _context6.abrupt('return', _context6.sent.get('id'));

              case 3:
              case 'end':
                return _context6.stop();
            }
          }
        },
        _callee6,
        _this,
      );
    }),
  );

  this.getMostRecentCrawlSessionInfo = (function() {
    var _ref8 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee7(sessionKey) {
        var crawlSessionInfos;
        return regeneratorRuntime.wrap(
          function _callee7$(_context7) {
            while (1) {
              switch ((_context7.prev = _context7.next)) {
                case 0:
                  _context7.next = 2;
                  return new _trolleySmartParseServerCommon.CrawlSessionService().search(
                    (0, _immutable.Map)({
                      conditions: (0, _immutable.Map)({
                        sessionKey: sessionKey,
                      }),
                      topMost: true,
                    }),
                    _this.sessionToken,
                  );

                case 2:
                  crawlSessionInfos = _context7.sent;

                  if (!crawlSessionInfos.isEmpty()) {
                    _context7.next = 7;
                    break;
                  }

                  throw new _microBusinessCommonJavascript.Exception('No crawl session found with session key: ' + sessionKey + '.');

                case 7:
                  if (!(crawlSessionInfos.count() > 1)) {
                    _context7.next = 9;
                    break;
                  }

                  throw new _microBusinessCommonJavascript.Exception('Multiple crawl session found with session key: ' + sessionKey + '.');

                case 9:
                  return _context7.abrupt('return', crawlSessionInfos.first());

                case 10:
                case 'end':
                  return _context7.stop();
              }
            }
          },
          _callee7,
          _this,
        );
      }),
    );

    return function(_x6) {
      return _ref8.apply(this, arguments);
    };
  })();

  this.getMostRecentCrawlResults = (function() {
    var _ref9 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee8(sessionKey, mapFunc) {
        var crawlSessionInfo, crawlSessionId, crawlResults, result;
        return regeneratorRuntime.wrap(
          function _callee8$(_context8) {
            while (1) {
              switch ((_context8.prev = _context8.next)) {
                case 0:
                  _context8.next = 2;
                  return _this.getMostRecentCrawlSessionInfo(sessionKey, _this.sessionToken);

                case 2:
                  crawlSessionInfo = _context8.sent;
                  crawlSessionId = crawlSessionInfo.get('id');
                  crawlResults = (0, _immutable.List)();
                  result = new _trolleySmartParseServerCommon.CrawlResultService().searchAll(
                    (0, _immutable.Map)({
                      conditions: (0, _immutable.Map)({
                        crawlSessionId: crawlSessionId,
                      }),
                    }),
                    _this.sessionToken,
                  );
                  _context8.prev = 6;

                  result.event.subscribe(function(info) {
                    crawlResults = crawlResults.push(mapFunc ? mapFunc(info) : info);
                  });

                  _context8.next = 10;
                  return result.promise;

                case 10:
                  return _context8.abrupt('return', crawlResults);

                case 11:
                  _context8.prev = 11;

                  result.event.unsubscribeAll();
                  return _context8.finish(11);

                case 14:
                case 'end':
                  return _context8.stop();
              }
            }
          },
          _callee8,
          _this,
          [[6, , 11, 14]],
        );
      }),
    );

    return function(_x7, _x8) {
      return _ref9.apply(this, arguments);
    };
  })();

  this.getStoreTags = (function() {
    var _ref10 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee9(includeTag) {
        var storeId, result, storeTags;
        return regeneratorRuntime.wrap(
          function _callee9$(_context9) {
            while (1) {
              switch ((_context9.prev = _context9.next)) {
                case 0:
                  _context9.next = 2;
                  return _this.getStoreId();

                case 2:
                  storeId = _context9.sent;
                  result = new _trolleySmartParseServerCommon.StoreTagService().searchAll(
                    (0, _immutable.Map)({ includeTag: includeTag, conditions: (0, _immutable.Map)({ storeId: storeId }) }),
                    _this.sessionToken,
                  );
                  _context9.prev = 4;
                  storeTags = (0, _immutable.List)();

                  result.event.subscribe(function(info) {
                    storeTags = storeTags.push(info);
                  });

                  _context9.next = 9;
                  return result.promise;

                case 9:
                  return _context9.abrupt('return', storeTags);

                case 10:
                  _context9.prev = 10;

                  result.event.unsubscribeAll();
                  return _context9.finish(10);

                case 13:
                case 'end':
                  return _context9.stop();
              }
            }
          },
          _callee9,
          _this,
          [[4, , 10, 13]],
        );
      }),
    );

    return function(_x9) {
      return _ref10.apply(this, arguments);
    };
  })();

  this.createOrUpdateStoreProduct = (function() {
    var _ref11 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee10(productCategory, productInfo) {
        var storeId, storeProductService, storeProducts;
        return regeneratorRuntime.wrap(
          function _callee10$(_context10) {
            while (1) {
              switch ((_context10.prev = _context10.next)) {
                case 0:
                  _context10.next = 2;
                  return _this.getStoreId();

                case 2:
                  storeId = _context10.sent;
                  storeProductService = new _trolleySmartParseServerCommon.StoreProductService();
                  _context10.next = 6;
                  return storeProductService.search(
                    (0, _immutable.Map)({
                      conditions: (0, _immutable.Map)({
                        productPageUrl: productInfo.get('productPageUrl'),
                        storeId: storeId,
                      }),
                    }),
                    _this.sessionToken,
                  );

                case 6:
                  storeProducts = _context10.sent;

                  if (!storeProducts.isEmpty()) {
                    _context10.next = 12;
                    break;
                  }

                  _context10.next = 10;
                  return _trolleySmartParseServerCommon.StoreProductService.create(
                    productInfo.megre(
                      (0, _immutable.Map)({
                        lastCrawlDateTime: (0, _moment2.default)('01/01/1971', 'DD/MM/YYYY').toDate(),
                        storeId: storeId,
                      }),
                    ),
                    null,
                    _this.sessionToken,
                  );

                case 10:
                  _context10.next = 18;
                  break;

                case 12:
                  if (!(storeProducts.count() > 1)) {
                    _context10.next = 16;
                    break;
                  }

                  throw new _microBusinessCommonJavascript.Exception(
                    'Multiple store product found for store Id: ' + storeId + ' and productPageUrl: ' + productInfo.get('productPageUrl'),
                  );

                case 16:
                  _context10.next = 18;
                  return storeProductService.update(storeProducts.first().merge(productInfo), _this.sessionToken);

                case 18:
                case 'end':
                  return _context10.stop();
              }
            }
          },
          _callee10,
          _this,
        );
      }),
    );

    return function(_x10, _x11) {
      return _ref11.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelOneProductCategory = (function() {
    var _ref12 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee11(productCategory, storeTags) {
        var storeId, storeTagService, foundStoreTag;
        return regeneratorRuntime.wrap(
          function _callee11$(_context11) {
            while (1) {
              switch ((_context11.prev = _context11.next)) {
                case 0:
                  _context11.next = 2;
                  return _this.getStoreId();

                case 2:
                  storeId = _context11.sent;
                  storeTagService = new _trolleySmartParseServerCommon.StoreTagService();
                  foundStoreTag = storeTags.find(function(storeTag) {
                    return storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0;
                  });

                  if (!foundStoreTag) {
                    _context11.next = 10;
                    break;
                  }

                  _context11.next = 8;
                  return storeTagService.update(
                    foundStoreTag.merge(
                      (0, _immutable.Map)({
                        name: productCategory.get('name'),
                        level: productCategory.get('level'),
                        url: productCategory.get('url'),
                      }),
                    ),
                    _this.sessionToken,
                  );

                case 8:
                  _context11.next = 12;
                  break;

                case 10:
                  _context11.next = 12;
                  return storeTagService.create(
                    (0, _immutable.Map)({
                      key: productCategory.get('categoryKey'),
                      storeId: storeId,
                      name: productCategory.get('name'),
                      level: 1,
                      url: productCategory.get('url'),
                    }),
                    null,
                    _this.sessionToken,
                  );

                case 12:
                case 'end':
                  return _context11.stop();
              }
            }
          },
          _callee11,
          _this,
        );
      }),
    );

    return function(_x12, _x13) {
      return _ref12.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelTwoProductCategory = (function() {
    var _ref13 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee12(productCategory, storeTags) {
        var storeId, storeTagService, foundStoreTag, parentStoreTagIds;
        return regeneratorRuntime.wrap(
          function _callee12$(_context12) {
            while (1) {
              switch ((_context12.prev = _context12.next)) {
                case 0:
                  _context12.next = 2;
                  return _this.getStoreId();

                case 2:
                  storeId = _context12.sent;
                  storeTagService = new _trolleySmartParseServerCommon.StoreTagService();
                  foundStoreTag = storeTags.find(function(storeTag) {
                    return storeTag.get('key').localeCompare(productCategory.first().get('categoryKey')) === 0;
                  });
                  parentStoreTagIds = productCategory
                    .map(function(_) {
                      return _.get('parent');
                    })
                    .map(function(parent) {
                      return storeTags.find(function(storeTag) {
                        return storeTag.get('key').localeCompare(parent) === 0;
                      });
                    })
                    .map(function(_) {
                      return _.get('id');
                    });

                  if (!foundStoreTag) {
                    _context12.next = 11;
                    break;
                  }

                  _context12.next = 9;
                  return storeTagService.update(
                    foundStoreTag.merge(
                      (0, _immutable.Map)({
                        storeTagIds: parentStoreTagIds,
                        name: productCategory.first().get('name'),
                        level: productCategory.first().get('level'),
                        url: productCategory.first().get('url'),
                      }),
                    ),
                    _this.sessionToken,
                  );

                case 9:
                  _context12.next = 13;
                  break;

                case 11:
                  _context12.next = 13;
                  return storeTagService.create(
                    (0, _immutable.Map)({
                      key: productCategory.first().get('categoryKey'),
                      storeId: storeId,
                      storeTagIds: parentStoreTagIds,
                      name: productCategory.first().get('name'),
                      level: 2,
                      url: productCategory.first().get('url'),
                    }),
                    null,
                    _this.sessionToken,
                  );

                case 13:
                case 'end':
                  return _context12.stop();
              }
            }
          },
          _callee12,
          _this,
        );
      }),
    );

    return function(_x14, _x15) {
      return _ref13.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelThreeProductCategory = (function() {
    var _ref14 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee13(productCategory, storeTags) {
        var storeId, storeTagService, foundStoreTag, parentStoreTagIds;
        return regeneratorRuntime.wrap(
          function _callee13$(_context13) {
            while (1) {
              switch ((_context13.prev = _context13.next)) {
                case 0:
                  _context13.next = 2;
                  return _this.getStoreId();

                case 2:
                  storeId = _context13.sent;
                  storeTagService = new _trolleySmartParseServerCommon.StoreTagService();
                  foundStoreTag = storeTags.find(function(storeTag) {
                    return storeTag.get('key').localeCompare(productCategory.first().get('categoryKey')) === 0;
                  });
                  parentStoreTagIds = productCategory
                    .map(function(_) {
                      return _.get('parent');
                    })
                    .map(function(parent) {
                      return storeTags.find(function(storeTag) {
                        return storeTag.get('key').localeCompare(parent) === 0;
                      });
                    })
                    .map(function(_) {
                      return _.get('id');
                    });

                  if (!foundStoreTag) {
                    _context13.next = 11;
                    break;
                  }

                  _context13.next = 9;
                  return storeTagService.update(
                    foundStoreTag.merge(
                      (0, _immutable.Map)({
                        storeTagIds: parentStoreTagIds,
                        name: productCategory.first().get('name'),
                        level: productCategory.first().get('level'),
                        url: productCategory.first().get('url'),
                      }),
                    ),
                    _this.sessionToken,
                  );

                case 9:
                  _context13.next = 13;
                  break;

                case 11:
                  _context13.next = 13;
                  return storeTagService.create(
                    (0, _immutable.Map)({
                      key: productCategory.first().get('categoryKey'),
                      storeId: storeId,
                      storeTagIds: parentStoreTagIds,
                      name: productCategory.first().get('name'),
                      level: 3,
                      url: productCategory.first().get('url'),
                    }),
                    null,
                    _this.sessionToken,
                  );

                case 13:
                case 'end':
                  return _context13.stop();
              }
            }
          },
          _callee13,
          _this,
        );
      }),
    );

    return function(_x16, _x17) {
      return _ref14.apply(this, arguments);
    };
  })();

  this.getStoreProductsCriteria = (function() {
    var _ref15 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee14() {
        var _ref16 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          lastCrawlDateTime = _ref16.lastCrawlDateTime;

        return regeneratorRuntime.wrap(
          function _callee14$(_context14) {
            while (1) {
              switch ((_context14.prev = _context14.next)) {
                case 0:
                  _context14.t0 = _immutable.Map;
                  _context14.t1 = _immutable.Map;
                  _context14.next = 4;
                  return _this.getStoreId();

                case 4:
                  _context14.t2 = _context14.sent;
                  _context14.t3 = lastCrawlDateTime || undefined;
                  _context14.t4 = {
                    storeId: _context14.t2,
                    lessThanOrEqualTo_lastCrawlDateTime: _context14.t3,
                  };
                  _context14.t5 = (0, _context14.t1)(_context14.t4);
                  _context14.t6 = {
                    conditions: _context14.t5,
                  };
                  return _context14.abrupt('return', (0, _context14.t0)(_context14.t6));

                case 10:
                case 'end':
                  return _context14.stop();
              }
            }
          },
          _callee14,
          _this,
        );
      }),
    );

    return function() {
      return _ref15.apply(this, arguments);
    };
  })();

  this.getAllStoreProducts = (function() {
    var _ref17 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee15() {
        var _ref18 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          lastCrawlDateTime = _ref18.lastCrawlDateTime;

        var result, storeProducts;
        return regeneratorRuntime.wrap(
          function _callee15$(_context15) {
            while (1) {
              switch ((_context15.prev = _context15.next)) {
                case 0:
                  _context15.t0 = new _trolleySmartParseServerCommon.StoreProductService();
                  _context15.next = 3;
                  return _this.getStoreProductsCriteria({ lastCrawlDateTime: lastCrawlDateTime });

                case 3:
                  _context15.t1 = _context15.sent;
                  _context15.t2 = _this.sessionToken;
                  result = _context15.t0.searchAll.call(_context15.t0, _context15.t1, _context15.t2);
                  _context15.prev = 6;
                  storeProducts = (0, _immutable.List)();

                  result.event.subscribe(function(info) {
                    storeProducts = storeProducts.push(info);
                  });

                  _context15.next = 11;
                  return result.promise;

                case 11:
                  return _context15.abrupt('return', storeProducts);

                case 12:
                  _context15.prev = 12;

                  result.event.unsubscribeAll();
                  return _context15.finish(12);

                case 15:
                case 'end':
                  return _context15.stop();
              }
            }
          },
          _callee15,
          _this,
          [[6, , 12, 15]],
        );
      }),
    );

    return function() {
      return _ref17.apply(this, arguments);
    };
  })();

  this.getStoreProducts = (function() {
    var _ref19 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee16() {
        var _ref20 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          lastCrawlDateTime = _ref20.lastCrawlDateTime;

        return regeneratorRuntime.wrap(
          function _callee16$(_context16) {
            while (1) {
              switch ((_context16.prev = _context16.next)) {
                case 0:
                  _context16.t0 = new _trolleySmartParseServerCommon.StoreProductService();
                  _context16.next = 3;
                  return _this.getStoreProductsCriteria({ lastCrawlDateTime: lastCrawlDateTime }).set('limit', 1000);

                case 3:
                  _context16.t1 = _context16.sent;
                  _context16.t2 = _this.sessionToken;
                  return _context16.abrupt('return', _context16.t0.search.call(_context16.t0, _context16.t1, _context16.t2));

                case 6:
                case 'end':
                  return _context16.stop();
              }
            }
          },
          _callee16,
          _this,
        );
      }),
    );

    return function() {
      return _ref19.apply(this, arguments);
    };
  })();

  this.getActiveProductPrices = (function() {
    var _ref21 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee17(storeProductId) {
        var storeId, criteria;
        return regeneratorRuntime.wrap(
          function _callee17$(_context17) {
            while (1) {
              switch ((_context17.prev = _context17.next)) {
                case 0:
                  _context17.next = 2;
                  return _this.getStoreId();

                case 2:
                  storeId = _context17.sent;
                  criteria = (0, _immutable.Map)({
                    conditions: (0, _immutable.Map)({
                      storeProductId: storeProductId,
                      storeId: storeId,
                      status: 'A',
                    }),
                  });
                  return _context17.abrupt('return', new _trolleySmartParseServerCommon.ProductPriceService().search(criteria, _this.sessionToken));

                case 5:
                case 'end':
                  return _context17.stop();
              }
            }
          },
          _callee17,
          _this,
        );
      }),
    );

    return function(_x21) {
      return _ref21.apply(this, arguments);
    };
  })();

  this.createOrUpdateProductPrice = (function() {
    var _ref22 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee18(storeProductId, productPrice, priceDetails) {
        var productPrices, productPriceService, notMatchedProductPrices, matchedProductPrices;
        return regeneratorRuntime.wrap(
          function _callee18$(_context18) {
            while (1) {
              switch ((_context18.prev = _context18.next)) {
                case 0:
                  _context18.next = 2;
                  return _this.getActiveProductPrices(storeProductId);

                case 2:
                  productPrices = _context18.sent;
                  productPriceService = new _trolleySmartParseServerCommon.ProductPriceService();

                  if (!(!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice'))) {
                    _context18.next = 9;
                    break;
                  }

                  if (productPrices.isEmpty()) {
                    _context18.next = 8;
                    break;
                  }

                  _context18.next = 8;
                  return Promise.all(
                    productPrices
                      .map(function(_) {
                        return productPriceService.update(_.set('status', 'I'), _this.sessionToken);
                      })
                      .toArray(),
                  );

                case 8:
                  return _context18.abrupt('return');

                case 9:
                  if (!productPrices.isEmpty()) {
                    _context18.next = 14;
                    break;
                  }

                  _context18.next = 12;
                  return productPriceService.create(productPrice, null, _this.sessionToken);

                case 12:
                  _context18.next = 27;
                  break;

                case 14:
                  notMatchedProductPrices = productPrices.filterNot(function(_) {
                    return _.get('priceDetails').equals(priceDetails);
                  });

                  if (notMatchedProductPrices.isEmpty()) {
                    _context18.next = 18;
                    break;
                  }

                  _context18.next = 18;
                  return Promise.all(
                    notMatchedProductPrices
                      .map(function(_) {
                        return productPriceService.update(_.set('status', 'I'), _this.sessionToken);
                      })
                      .toArray(),
                  );

                case 18:
                  matchedProductPrices = productPrices.filter(function(_) {
                    return _.get('priceDetails').equals(priceDetails);
                  });

                  if (!(matchedProductPrices.count() > 1)) {
                    _context18.next = 24;
                    break;
                  }

                  _context18.next = 22;
                  return Promise.all(
                    matchedProductPrices
                      .skip(1)
                      .map(function(_) {
                        return productPriceService.update(_.set('status', 'I'), _this.sessionToken);
                      })
                      .toArray(),
                  );

                case 22:
                  _context18.next = 27;
                  break;

                case 24:
                  if (!(matchedProductPrices.count() === 0)) {
                    _context18.next = 27;
                    break;
                  }

                  _context18.next = 27;
                  return productPriceService.create(productPrice, null, _this.sessionToken);

                case 27:
                case 'end':
                  return _context18.stop();
              }
            }
          },
          _callee18,
          _this,
        );
      }),
    );

    return function(_x22, _x23, _x24) {
      return _ref22.apply(this, arguments);
    };
  })();

  this.logVerbose = (function() {
    var _ref23 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee19(messageFunc) {
        var config;
        return regeneratorRuntime.wrap(
          function _callee19$(_context19) {
            while (1) {
              switch ((_context19.prev = _context19.next)) {
                case 0:
                  _context19.next = 2;
                  return _this.getConfig();

                case 2:
                  config = _context19.sent;

                  if (_this.logVerboseFunc && config.get('logLevel') && config.get('logLevel') >= 3 && messageFunc) {
                    _this.logVerboseFunc(messageFunc());
                  }

                case 4:
                case 'end':
                  return _context19.stop();
              }
            }
          },
          _callee19,
          _this,
        );
      }),
    );

    return function(_x25) {
      return _ref23.apply(this, arguments);
    };
  })();

  this.logInfo = (function() {
    var _ref24 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee20(messageFunc) {
        var config;
        return regeneratorRuntime.wrap(
          function _callee20$(_context20) {
            while (1) {
              switch ((_context20.prev = _context20.next)) {
                case 0:
                  _context20.next = 2;
                  return _this.getConfig();

                case 2:
                  config = _context20.sent;

                  if (_this.logInfoFunc && config.get('logLevel') && config.get('logLevel') >= 2 && messageFunc) {
                    _this.logInfoFunc(messageFunc());
                  }

                case 4:
                case 'end':
                  return _context20.stop();
              }
            }
          },
          _callee20,
          _this,
        );
      }),
    );

    return function(_x26) {
      return _ref24.apply(this, arguments);
    };
  })();

  this.logError = (function() {
    var _ref25 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee21(messageFunc) {
        var config;
        return regeneratorRuntime.wrap(
          function _callee21$(_context21) {
            while (1) {
              switch ((_context21.prev = _context21.next)) {
                case 0:
                  _context21.next = 2;
                  return _this.getConfig();

                case 2:
                  config = _context21.sent;

                  if (_this.logErrorFunc && config.get('logLevel') && config.get('logLevel') >= 1 && messageFunc) {
                    _this.logErrorFunc(messageFunc());
                  }

                case 4:
                case 'end':
                  return _context21.stop();
              }
            }
          },
          _callee21,
          _this,
        );
      }),
    );

    return function(_x27) {
      return _ref25.apply(this, arguments);
    };
  })();

  this.storeKey = storeKey;
  this.sessionToken = sessionToken;
  this.logVerboseFunc = logVerboseFunc;
  this.logInfoFunc = logInfoFunc;
  this.logErrorFunc = logErrorFunc;
  this.config = null;
  this.store = null;
};

StoreCrawlerServiceBase.removeDollarSignFromPrice = function(priceWithDollarSign) {
  return parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());
};

StoreCrawlerServiceBase.safeGetUri = function(res) {
  return res && res.request && res.request.uri ? res.request.uri.href : '';
};

exports.default = StoreCrawlerServiceBase;
