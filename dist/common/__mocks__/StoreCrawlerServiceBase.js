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
var finalStoreTags = void 0;

var resetAllMockTrackers = (exports.resetAllMockTrackers = function resetAllMockTrackers() {
  storeCrawlerServiceBaseMockTracker = new _StoreCrawlerServiceBaseMockTracker2.default();
});

var getAllMockTrackers = (exports.getAllMockTrackers = function getAllMockTrackers() {
  return { storeCrawlerServiceBaseMockTracker: storeCrawlerServiceBaseMockTracker };
});

var setupStoreCrawlerServiceBase = (exports.setupStoreCrawlerServiceBase = function setupStoreCrawlerServiceBase() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    config = _ref.config,
    storeTags = _ref.storeTags;

  finalConfig = config;
  finalStoreTags = storeTags;
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

  this.getStoreTags = (function() {
    var _ref3 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2(includeTag) {
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.getStoreTags(includeTag);
                  }

                  return _context2.abrupt('return', finalStoreTags);

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

    return function(_x2) {
      return _ref3.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelOneProductCategory = (function() {
    var _ref4 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee3(productCategory, storeTags) {
        return regeneratorRuntime.wrap(
          function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateLevelOneProductCategory(productCategory, storeTags);
                  }

                case 1:
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

    return function(_x3, _x4) {
      return _ref4.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelTwoProductCategory = (function() {
    var _ref5 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee4(productCategory, storeTags) {
        return regeneratorRuntime.wrap(
          function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateLevelTwoProductCategory(productCategory, storeTags);
                  }

                case 1:
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

    return function(_x5, _x6) {
      return _ref5.apply(this, arguments);
    };
  })();

  this.createOrUpdateLevelThreeProductCategory = (function() {
    var _ref6 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee5(productCategory, storeTags) {
        return regeneratorRuntime.wrap(
          function _callee5$(_context5) {
            while (1) {
              switch ((_context5.prev = _context5.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateLevelThreeProductCategory(productCategory, storeTags);
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

    return function(_x7, _x8) {
      return _ref6.apply(this, arguments);
    };
  })();

  this.createOrUpdateStoreProduct = (function() {
    var _ref7 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee6(productCategory, productInfo) {
        return regeneratorRuntime.wrap(
          function _callee6$(_context6) {
            while (1) {
              switch ((_context6.prev = _context6.next)) {
                case 0:
                  if (storeCrawlerServiceBaseMockTracker) {
                    storeCrawlerServiceBaseMockTracker.createOrUpdateStoreProduct(productCategory, productInfo);
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

    return function(_x9, _x10) {
      return _ref7.apply(this, arguments);
    };
  })();

  this.logVerbose = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee7() {
      return regeneratorRuntime.wrap(
        function _callee7$(_context7) {
          while (1) {
            switch ((_context7.prev = _context7.next)) {
              case 0:
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
  this.logInfo = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee8() {
      return regeneratorRuntime.wrap(
        function _callee8$(_context8) {
          while (1) {
            switch ((_context8.prev = _context8.next)) {
              case 0:
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
  this.logError = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee9() {
      return regeneratorRuntime.wrap(
        function _callee9$(_context9) {
          while (1) {
            switch ((_context9.prev = _context9.next)) {
              case 0:
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
};

StoreCrawlerServiceBase.safeGetUri = function(res) {
  return res && res.request && res.request.uri ? res.request.uri.href : '';
};

exports.default = StoreCrawlerServiceBase;
