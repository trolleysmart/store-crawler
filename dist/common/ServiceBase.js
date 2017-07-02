'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _smartGroceryParseServerCommon = require('smart-grocery-parse-server-common');

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

var ServiceBase = function ServiceBase(_ref) {
  var _this = this;

  var logVerboseFunc = _ref.logVerboseFunc,
    logInfoFunc = _ref.logInfoFunc,
    logErrorFunc = _ref.logErrorFunc;

  _classCallCheck(this, ServiceBase);

  this.splitIntoChunks = function(list, chunkSize) {
    return (0, _immutable.Range)(0, list.count(), chunkSize).map(function(chunkStart) {
      return list.slice(chunkStart, chunkStart + chunkSize);
    });
  };

  this.getJobConfig = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee() {
      var config, jobConfig;
      return regeneratorRuntime.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                _context.next = 2;
                return _microBusinessParseServerCommon.ParseWrapperService.getConfig();

              case 2:
                config = _context.sent;
                jobConfig = config.get('Job');

                if (!jobConfig) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt('return', _immutable2.default.fromJS(jobConfig));

              case 6:
                throw new _microBusinessParseServerCommon.Exception('No config found called Job.');

              case 7:
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

  this.getStoreCrawlerConfig = (function() {
    var _ref3 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2(storeName) {
        var configs;
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  _context2.next = 2;
                  return _smartGroceryParseServerCommon.StoreCrawlerConfigurationService.search(
                    (0, _immutable.Map)({
                      conditions: (0, _immutable.Map)({
                        key: storeName,
                      }),
                      topMost: true,
                    }),
                  );

                case 2:
                  configs = _context2.sent;
                  return _context2.abrupt('return', configs.first());

                case 4:
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

    return function(_x) {
      return _ref3.apply(this, arguments);
    };
  })();

  this.createNewCrawlSessionAndGetStoreCrawlerConfig = (function() {
    var _ref4 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee3(sessionKey, config, storeName) {
        var sessionInfo, sessionId, finalConfig;
        return regeneratorRuntime.wrap(
          function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  sessionInfo = (0, _immutable.Map)({
                    sessionKey: sessionKey,
                    startDateTime: new Date(),
                  });
                  _context3.next = 3;
                  return _smartGroceryParseServerCommon.CrawlSessionService.create(sessionInfo);

                case 3:
                  sessionId = _context3.sent;
                  _context3.t0 = config;

                  if (_context3.t0) {
                    _context3.next = 9;
                    break;
                  }

                  _context3.next = 8;
                  return _this.getStoreCrawlerConfig(storeName);

                case 8:
                  _context3.t0 = _context3.sent.get('config');

                case 9:
                  finalConfig = _context3.t0;

                  if (finalConfig) {
                    _context3.next = 12;
                    break;
                  }

                  throw new _microBusinessParseServerCommon.Exception('Failed to retrieve configuration for ' + storeName + ' store crawler.');

                case 12:
                  _this.logInfo(finalConfig, function() {
                    return 'Created session and retrieved config. Session Id: ' + sessionId;
                  });
                  _this.logVerbose(finalConfig, function() {
                    return 'Config: ' + JSON.stringify(finalConfig);
                  });

                  return _context3.abrupt(
                    'return',
                    (0, _immutable.Map)({
                      sessionInfo: sessionInfo.set('id', sessionId),
                      config: finalConfig,
                    }),
                  );

                case 15:
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

    return function(_x2, _x3, _x4) {
      return _ref4.apply(this, arguments);
    };
  })();

  this.getStore = (function() {
    var _ref5 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee4(name) {
        var criteria, results;
        return regeneratorRuntime.wrap(
          function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                  criteria = (0, _immutable.Map)({
                    conditions: (0, _immutable.Map)({
                      name: name,
                    }),
                  });
                  _context4.next = 3;
                  return _smartGroceryParseServerCommon.StoreService.search(criteria);

                case 3:
                  results = _context4.sent;

                  if (!results.isEmpty()) {
                    _context4.next = 12;
                    break;
                  }

                  _context4.t0 = _smartGroceryParseServerCommon.StoreService;
                  _context4.next = 8;
                  return _smartGroceryParseServerCommon.StoreService.create((0, _immutable.Map)({ name: name }));

                case 8:
                  _context4.t1 = _context4.sent;
                  return _context4.abrupt('return', _context4.t0.read.call(_context4.t0, _context4.t1));

                case 12:
                  if (!(results.count() === 1)) {
                    _context4.next = 14;
                    break;
                  }

                  return _context4.abrupt('return', results.first());

                case 14:
                  throw new _microBusinessParseServerCommon.Exception('Multiple store found called ' + name + '.');

                case 15:
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

    return function(_x5) {
      return _ref5.apply(this, arguments);
    };
  })();

  this.getMostRecentCrawlSessionInfo = (function() {
    var _ref6 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee5(sessionKey) {
        var crawlSessionInfos;
        return regeneratorRuntime.wrap(
          function _callee5$(_context5) {
            while (1) {
              switch ((_context5.prev = _context5.next)) {
                case 0:
                  _context5.next = 2;
                  return _smartGroceryParseServerCommon.CrawlSessionService.search(
                    (0, _immutable.Map)({
                      conditions: (0, _immutable.Map)({
                        sessionKey: sessionKey,
                      }),
                      topMost: true,
                    }),
                  );

                case 2:
                  crawlSessionInfos = _context5.sent;
                  return _context5.abrupt('return', crawlSessionInfos.first());

                case 4:
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

    return function(_x6) {
      return _ref6.apply(this, arguments);
    };
  })();

  this.getMostRecentCrawlResults = (function() {
    var _ref7 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee6(sessionKey, mapFunc) {
        var crawlSessionInfo, crawlSessionId, results, result;
        return regeneratorRuntime.wrap(
          function _callee6$(_context6) {
            while (1) {
              switch ((_context6.prev = _context6.next)) {
                case 0:
                  _context6.next = 2;
                  return _this.getMostRecentCrawlSessionInfo(sessionKey);

                case 2:
                  crawlSessionInfo = _context6.sent;
                  crawlSessionId = crawlSessionInfo.get('id');
                  results = (0, _immutable.List)();
                  result = _smartGroceryParseServerCommon.CrawlResultService.searchAll(
                    (0, _immutable.Map)({
                      conditions: (0, _immutable.Map)({
                        crawlSessionId: crawlSessionId,
                      }),
                    }),
                  );
                  _context6.prev = 6;

                  result.event.subscribe(function(info) {
                    return (results = results.push(mapFunc ? mapFunc(info) : info));
                  });

                  _context6.next = 10;
                  return result.promise;

                case 10:
                  _context6.prev = 10;

                  result.event.unsubscribeAll();
                  return _context6.finish(10);

                case 13:
                  return _context6.abrupt('return', results);

                case 14:
                case 'end':
                  return _context6.stop();
              }
            }
          },
          _callee6,
          _this,
          [[6, , 10, 13]],
        );
      }),
    );

    return function(_x7, _x8) {
      return _ref7.apply(this, arguments);
    };
  })();

  this.getExistingStoreTags = (function() {
    var _ref8 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee7(storeId) {
        var result, storeTags;
        return regeneratorRuntime.wrap(
          function _callee7$(_context7) {
            while (1) {
              switch ((_context7.prev = _context7.next)) {
                case 0:
                  result = _smartGroceryParseServerCommon.StoreTagService.searchAll(
                    (0, _immutable.Map)({ conditions: (0, _immutable.Map)({ storeId: storeId }) }),
                  );
                  _context7.prev = 1;
                  storeTags = (0, _immutable.List)();

                  result.event.subscribe(function(info) {
                    return (storeTags = storeTags.push(info));
                  });

                  _context7.next = 6;
                  return result.promise;

                case 6:
                  return _context7.abrupt('return', storeTags);

                case 7:
                  _context7.prev = 7;

                  result.event.unsubscribeAll();
                  return _context7.finish(7);

                case 10:
                case 'end':
                  return _context7.stop();
              }
            }
          },
          _callee7,
          _this,
          [[1, , 7, 10]],
        );
      }),
    );

    return function(_x9) {
      return _ref8.apply(this, arguments);
    };
  })();

  this.createOrUpdateStoreMasterProduct = (function() {
    var _ref9 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee8(productCategory, productInfo, storeId) {
        var storeMasterProducts, storeMasterProduct, updatedStoreMasterProduct;
        return regeneratorRuntime.wrap(
          function _callee8$(_context8) {
            while (1) {
              switch ((_context8.prev = _context8.next)) {
                case 0:
                  _context8.next = 2;
                  return _smartGroceryParseServerCommon.StoreMasterProductService.search(
                    (0, _immutable.Map)({
                      conditions: (0, _immutable.Map)({
                        productPageUrl: productInfo.get('productPageUrl'),
                        storeId: storeId,
                      }),
                    }),
                  );

                case 2:
                  storeMasterProducts = _context8.sent;

                  if (!storeMasterProducts.isEmpty()) {
                    _context8.next = 8;
                    break;
                  }

                  _context8.next = 6;
                  return _smartGroceryParseServerCommon.StoreMasterProductService.create(
                    (0, _immutable.Map)({
                      description: productInfo.get('description'),
                      productPageUrl: productInfo.get('productPageUrl'),
                      storeId: storeId,
                    }),
                  );

                case 6:
                  _context8.next = 16;
                  break;

                case 8:
                  if (!(storeMasterProducts.count() > 1)) {
                    _context8.next = 12;
                    break;
                  }

                  throw new _microBusinessParseServerCommon.Exception(
                    'Multiple store master product found for ' +
                      productInfo.get('description') +
                      ' and store Id: ' +
                      storeId +
                      ' and productPageUrl:' +
                      productInfo.get('productPageUrl'),
                  );

                case 12:
                  storeMasterProduct = storeMasterProducts.first();
                  updatedStoreMasterProduct = storeMasterProduct.set('productPageUrl', productInfo.get('productPageUrl'));
                  _context8.next = 16;
                  return _smartGroceryParseServerCommon.StoreMasterProductService.update(updatedStoreMasterProduct);

                case 16:
                case 'end':
                  return _context8.stop();
              }
            }
          },
          _callee8,
          _this,
        );
      }),
    );

    return function(_x10, _x11, _x12) {
      return _ref9.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelOneProductCategory = (function() {
    var _ref10 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee9(productCategory, storeTags, storeId) {
        var foundStoreTag;
        return regeneratorRuntime.wrap(
          function _callee9$(_context9) {
            while (1) {
              switch ((_context9.prev = _context9.next)) {
                case 0:
                  foundStoreTag = storeTags.find(function(storeTag) {
                    return storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0;
                  });

                  if (!foundStoreTag) {
                    _context9.next = 6;
                    break;
                  }

                  _context9.next = 4;
                  return _smartGroceryParseServerCommon.StoreTagService.update(
                    foundStoreTag.set('description', productCategory.get('description')).set('weight', productCategory.get('weigth')),
                  );

                case 4:
                  _context9.next = 8;
                  break;

                case 6:
                  _context9.next = 8;
                  return _smartGroceryParseServerCommon.StoreTagService.create(
                    (0, _immutable.Map)({
                      key: productCategory.get('categoryKey'),
                      description: productCategory.get('description'),
                      weight: 1,
                      storeId: storeId,
                    }),
                  );

                case 8:
                case 'end':
                  return _context9.stop();
              }
            }
          },
          _callee9,
          _this,
        );
      }),
    );

    return function(_x13, _x14, _x15) {
      return _ref10.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelTwoProductCategory = (function() {
    var _ref11 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee10(productCategory, storeTags, storeId) {
        var foundStoreTag, parentStoreTagIds;
        return regeneratorRuntime.wrap(
          function _callee10$(_context10) {
            while (1) {
              switch ((_context10.prev = _context10.next)) {
                case 0:
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
                    _context10.next = 7;
                    break;
                  }

                  _context10.next = 5;
                  return _smartGroceryParseServerCommon.StoreTagService.update(
                    foundStoreTag
                      .set('description', productCategory.first().get('description'))
                      .set('weight', productCategory.first().get('weigth'))
                      .set('storeTagIds', parentStoreTagIds),
                  );

                case 5:
                  _context10.next = 9;
                  break;

                case 7:
                  _context10.next = 9;
                  return _smartGroceryParseServerCommon.StoreTagService.create(
                    (0, _immutable.Map)({
                      key: productCategory.first().get('categoryKey'),
                      description: productCategory.first().get('description'),
                      weight: 2,
                      storeId: storeId,
                      storeTagIds: parentStoreTagIds,
                    }),
                  );

                case 9:
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

    return function(_x16, _x17, _x18) {
      return _ref11.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelThreeProductCategory = (function() {
    var _ref12 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee11(productCategory, storeTags, storeId) {
        var foundStoreTag, parentStoreTagIds;
        return regeneratorRuntime.wrap(
          function _callee11$(_context11) {
            while (1) {
              switch ((_context11.prev = _context11.next)) {
                case 0:
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
                    _context11.next = 7;
                    break;
                  }

                  _context11.next = 5;
                  return _smartGroceryParseServerCommon.StoreTagService.update(
                    foundStoreTag
                      .set('description', productCategory.first().get('description'))
                      .set('weight', productCategory.first().get('weigth'))
                      .set('storeTagIds', parentStoreTagIds),
                  );

                case 5:
                  _context11.next = 9;
                  break;

                case 7:
                  _context11.next = 9;
                  return _smartGroceryParseServerCommon.StoreTagService.create(
                    (0, _immutable.Map)({
                      key: productCategory.first().get('categoryKey'),
                      description: productCategory.first().get('description'),
                      weight: 3,
                      storeId: storeId,
                      storeTagIds: parentStoreTagIds,
                    }),
                  );

                case 9:
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

    return function(_x19, _x20, _x21) {
      return _ref12.apply(this, arguments);
    };
  })();

  this.getProducts = (function() {
    var _ref13 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee12(config, storeId, withoutMasterProductLinkSet) {
        var criteria, products, result;
        return regeneratorRuntime.wrap(
          function _callee12$(_context12) {
            while (1) {
              switch ((_context12.prev = _context12.next)) {
                case 0:
                  criteria = (0, _immutable.Map)({
                    conditions: (0, _immutable.Map)({
                      storeId: storeId,
                      without_masterProduct: withoutMasterProductLinkSet,
                    }),
                  });
                  products = (0, _immutable.List)();
                  result = _smartGroceryParseServerCommon.StoreMasterProductService.searchAll(criteria);
                  _context12.prev = 3;

                  result.event.subscribe(function(info) {
                    return (products = products.push(info));
                  });

                  _context12.next = 7;
                  return result.promise;

                case 7:
                  _context12.prev = 7;

                  result.event.unsubscribeAll();
                  return _context12.finish(7);

                case 10:
                  return _context12.abrupt('return', products);

                case 11:
                case 'end':
                  return _context12.stop();
              }
            }
          },
          _callee12,
          _this,
          [[3, , 7, 10]],
        );
      }),
    );

    return function(_x22, _x23, _x24) {
      return _ref13.apply(this, arguments);
    };
  })();

  this.removeDollarSignFromPrice = function(priceWithDollarSign) {
    return parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());
  };

  this.logVerbose = function(config, messageFunc) {
    if (_this.logVerboseFunc && config && config.get('logLevel') && config.get('logLevel') >= 3 && messageFunc) {
      _this.logVerboseFunc(messageFunc());
    }
  };

  this.logInfo = function(config, messageFunc) {
    if (_this.logInfoFunc && config && config.get('logLevel') && config.get('logLevel') >= 2 && messageFunc) {
      _this.logInfoFunc(messageFunc());
    }
  };

  this.logError = function(config, messageFunc) {
    if (_this.logErrorFunc && config && config.get('logLevel') && config.get('logLevel') >= 1 && messageFunc) {
      _this.logErrorFunc(messageFunc());
    }
  };

  this.logVerboseFunc = logVerboseFunc;
  this.logInfoFunc = logInfoFunc;
  this.logErrorFunc = logErrorFunc;
};

exports.default = ServiceBase;
