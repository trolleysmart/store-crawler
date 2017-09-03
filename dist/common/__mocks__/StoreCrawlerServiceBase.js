'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.setupStoreCrawlerServiceBase = exports.getAllMockTrackers = exports.resetAllMockTrackers = undefined;

var _StoreCrawlerServiceBaseMockTracker = require('./StoreCrawlerServiceBaseMockTracker');

var _StoreCrawlerServiceBaseMockTracker2 = _interopRequireDefault(_StoreCrawlerServiceBaseMockTracker);

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

var storeCrawlerServiceBaseMockTracker = void 0;
var finalConfig = void 0;
var finalStore = void 0;
var finalStoreTags = void 0;
var finalStoreProducts = void 0;

var resetAllMockTrackers = (exports.resetAllMockTrackers = function resetAllMockTrackers() {
  storeCrawlerServiceBaseMockTracker = new _StoreCrawlerServiceBaseMockTracker2.default();
});

var getAllMockTrackers = (exports.getAllMockTrackers = function getAllMockTrackers() {
  return { storeCrawlerServiceBaseMockTracker: storeCrawlerServiceBaseMockTracker };
});

var setupStoreCrawlerServiceBase = (exports.setupStoreCrawlerServiceBase = function setupStoreCrawlerServiceBase() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    config = _ref.config,
    store = _ref.store,
    storeTags = _ref.storeTags,
    storeProducts = _ref.storeProducts;

  finalConfig = config;
  finalStore = store;
  finalStoreTags = storeTags;
  finalStoreProducts = storeProducts;
});

var StoreCrawlerServiceBase = function StoreCrawlerServiceBase() {
  var _this = this;

  _classCallCheck(this, StoreCrawlerServiceBase);

  this.getConfig = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                if (storeCrawlerServiceBaseMockTracker) {
                  storeCrawlerServiceBaseMockTracker.getConfig();
                }

                return _context.abrupt('return', finalConfig);

              case 2:
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
  this.getStore = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(
        function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                if (storeCrawlerServiceBaseMockTracker) {
                  storeCrawlerServiceBaseMockTracker.getStore();
                }

                return _context2.abrupt('return', finalStore);

              case 2:
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
  this.getStoreId = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(
        function _callee3$(_context3) {
          while (1) {
            switch ((_context3.prev = _context3.next)) {
              case 0:
                if (storeCrawlerServiceBaseMockTracker) {
                  storeCrawlerServiceBaseMockTracker.getStoreId();
                }

                return _context3.abrupt('return', finalStore.get('id'));

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

  this.getStoreTags = (function() {
    var _ref5 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee4(includeTag) {
        return regeneratorRuntime.wrap(
          function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.getStoreTags(includeTag);
                  }

                  return _context4.abrupt('return', finalStoreTags);

                case 2:
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

    return function(_x2) {
      return _ref5.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelOneProductCategory = (function() {
    var _ref6 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee5(productCategory, storeTags) {
        return regeneratorRuntime.wrap(
          function _callee5$(_context5) {
            while (1) {
              switch ((_context5.prev = _context5.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateLevelOneProductCategory(productCategory, storeTags);
                  }

                case 1:
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

    return function(_x3, _x4) {
      return _ref6.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelTwoProductCategory = (function() {
    var _ref7 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee6(productCategory, storeTags) {
        return regeneratorRuntime.wrap(
          function _callee6$(_context6) {
            while (1) {
              switch ((_context6.prev = _context6.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateLevelTwoProductCategory(productCategory, storeTags);
                  }

                case 1:
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

    return function(_x5, _x6) {
      return _ref7.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelThreeProductCategory = (function() {
    var _ref8 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee7(productCategory, storeTags) {
        return regeneratorRuntime.wrap(
          function _callee7$(_context7) {
            while (1) {
              switch ((_context7.prev = _context7.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateLevelThreeProductCategory(productCategory, storeTags);
                  }

                case 1:
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

    return function(_x7, _x8) {
      return _ref8.apply(this, arguments);
    };
  })();

  this.createOrUpdateStoreProduct = (function() {
    var _ref9 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee8(productCategory, productInfo) {
        return regeneratorRuntime.wrap(
          function _callee8$(_context8) {
            while (1) {
              switch ((_context8.prev = _context8.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateStoreProduct(productCategory, productInfo);
                  }

                case 1:
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

    return function(_x9, _x10) {
      return _ref9.apply(this, arguments);
    };
  })();

  this.getStoreProducts = (function() {
    var _ref10 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee9(inputArgument) {
        return regeneratorRuntime.wrap(
          function _callee9$(_context9) {
            while (1) {
              switch ((_context9.prev = _context9.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.getStoreProducts(inputArgument);
                  }

                  return _context9.abrupt('return', finalStoreProducts);

                case 2:
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

    return function(_x11) {
      return _ref10.apply(this, arguments);
    };
  })();

  this.createOrUpdateProductPrice = (function() {
    var _ref11 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee10(storeProductId, productPrice, priceDetails) {
        return regeneratorRuntime.wrap(
          function _callee10$(_context10) {
            while (1) {
              switch ((_context10.prev = _context10.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateProductPrice(storeProductId, productPrice, priceDetails);
                  }

                case 1:
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

    return function(_x12, _x13, _x14) {
      return _ref11.apply(this, arguments);
    };
  })();

  this.updateExistingStoreProduct = (function() {
    var _ref12 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee11(storeProduct) {
        return regeneratorRuntime.wrap(
          function _callee11$(_context11) {
            while (1) {
              switch ((_context11.prev = _context11.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.updateExistingStoreProduct(storeProduct);
                  }

                case 1:
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

    return function(_x15) {
      return _ref12.apply(this, arguments);
    };
  })();

  this.logVerbose = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee12() {
      return regeneratorRuntime.wrap(
        function _callee12$(_context12) {
          while (1) {
            switch ((_context12.prev = _context12.next)) {
              case 0:
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
  this.logInfo = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee13() {
      return regeneratorRuntime.wrap(
        function _callee13$(_context13) {
          while (1) {
            switch ((_context13.prev = _context13.next)) {
              case 0:
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
  this.logError = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee14() {
      return regeneratorRuntime.wrap(
        function _callee14$(_context14) {
          while (1) {
            switch ((_context14.prev = _context14.next)) {
              case 0:
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
};

StoreCrawlerServiceBase.safeGetUri = function(res) {
  return res && res.request && res.request.uri ? res.request.uri.href : '';
};

StoreCrawlerServiceBase.removeDollarSignFromPrice = function(priceWithDollarSign) {
  return parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());
};

exports.default = StoreCrawlerServiceBase;
