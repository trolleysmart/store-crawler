'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.setupStoreCrawlerServiceBase = exports.getAllMockTrackers = exports.resetAllMockTrackers = undefined;

var _StoreCrawlerServiceBaseFuncsCallTrack = require('./StoreCrawlerServiceBaseFuncsCallTrack');

var _StoreCrawlerServiceBaseFuncsCallTrack2 = _interopRequireDefault(_StoreCrawlerServiceBaseFuncsCallTrack);

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

var storeCrawlerServiceBaseFuncsCallTrack = void 0;
var finalConfig = void 0;
var finalSessionInfo = void 0;

var resetAllMockTrackers = (exports.resetAllMockTrackers = function resetAllMockTrackers() {
  storeCrawlerServiceBaseFuncsCallTrack = new _StoreCrawlerServiceBaseFuncsCallTrack2.default();
});

var getAllMockTrackers = (exports.getAllMockTrackers = function getAllMockTrackers() {
  return { storeCrawlerServiceBaseFuncsCallTrack: storeCrawlerServiceBaseFuncsCallTrack };
});

var setupStoreCrawlerServiceBase = (exports.setupStoreCrawlerServiceBase = function setupStoreCrawlerServiceBase() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    config = _ref.config,
    sessionInfo = _ref.sessionInfo;

  finalConfig = config;
  finalSessionInfo = sessionInfo;
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
                if (storeCrawlerServiceBaseFuncsCallTrack) {
                  storeCrawlerServiceBaseFuncsCallTrack.getConfig();
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

  this.createNewCrawlSession = (function() {
    var _ref3 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2(sessionKey) {
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  if (storeCrawlerServiceBaseFuncsCallTrack) {
                    storeCrawlerServiceBaseFuncsCallTrack.createNewCrawlSession(sessionKey);
                  }

                  return _context2.abrupt('return', finalSessionInfo);

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

  this.updateExistingCrawlSession = (function() {
    var _ref4 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee3(sessionInfo) {
        return regeneratorRuntime.wrap(
          function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  if (storeCrawlerServiceBaseFuncsCallTrack) {
                    storeCrawlerServiceBaseFuncsCallTrack.updateExistingCrawlSession(sessionInfo);
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

    return function(_x3) {
      return _ref4.apply(this, arguments);
    };
  })();

  this.createNewCrawlResult = (function() {
    var _ref5 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee4(crawlSessionId, resultSet) {
        return regeneratorRuntime.wrap(
          function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                  if (storeCrawlerServiceBaseFuncsCallTrack) {
                    storeCrawlerServiceBaseFuncsCallTrack.createNewCrawlResult(crawlSessionId, resultSet);
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

    return function(_x4, _x5) {
      return _ref5.apply(this, arguments);
    };
  })();

  this.logVerbose = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee5() {
      return regeneratorRuntime.wrap(
        function _callee5$(_context5) {
          while (1) {
            switch ((_context5.prev = _context5.next)) {
              case 0:
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
  this.logInfo = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee6() {
      return regeneratorRuntime.wrap(
        function _callee6$(_context6) {
          while (1) {
            switch ((_context6.prev = _context6.next)) {
              case 0:
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
  this.logError = _asyncToGenerator(
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
};

StoreCrawlerServiceBase.safeGetUri = function(res) {
  return res;
};

exports.default = StoreCrawlerServiceBase;
