'use strict';

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _CrawlSessionServiceFuncCallTrack = require('./CrawlSessionServiceFuncCallTrack');

var _CrawlSessionServiceFuncCallTrack2 = _interopRequireDefault(_CrawlSessionServiceFuncCallTrack);

var _StoreServiceFuncCallTrack = require('./StoreServiceFuncCallTrack');

var _StoreServiceFuncCallTrack2 = _interopRequireDefault(_StoreServiceFuncCallTrack);

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

var trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
var crawlSessionServiceFuncCallTrack = void 0;
var storeServiceFuncCallTrack = void 0;
var finalCrawlSessionInfo = void 0;
var finalCrawlSessionInfos = void 0;
var finalStoreInfo = void 0;
var finalStoreInfos = void 0;

var CrawlSessionService = function CrawlSessionService() {
  var _this = this;

  _classCallCheck(this, CrawlSessionService);

  this.create = (function() {
    var _ref = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee(info, acl, sessionToken) {
        return regeneratorRuntime.wrap(
          function _callee$(_context) {
            while (1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                  if (crawlSessionServiceFuncCallTrack) {
                    crawlSessionServiceFuncCallTrack.create(info, acl, sessionToken);
                  }

                  return _context.abrupt('return', (0, _v2.default)());

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

    return function(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  })();

  this.read = (function() {
    var _ref2 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2(id, criteria, sessionToken) {
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  if (crawlSessionServiceFuncCallTrack) {
                    crawlSessionServiceFuncCallTrack.read(id, criteria, sessionToken);
                  }

                  return _context2.abrupt('return', finalCrawlSessionInfo);

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

    return function(_x4, _x5, _x6) {
      return _ref2.apply(this, arguments);
    };
  })();

  this.search = (function() {
    var _ref3 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee3(criteria, sessionToken) {
        return regeneratorRuntime.wrap(
          function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  if (crawlSessionServiceFuncCallTrack) {
                    crawlSessionServiceFuncCallTrack.search(criteria, sessionToken);
                  }

                  return _context3.abrupt('return', finalCrawlSessionInfos);

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

    return function(_x7, _x8) {
      return _ref3.apply(this, arguments);
    };
  })();
};

var StoreService = function StoreService() {
  var _this2 = this;

  _classCallCheck(this, StoreService);

  this.create = (function() {
    var _ref4 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee4(info, acl, sessionToken) {
        return regeneratorRuntime.wrap(
          function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                  if (storeServiceFuncCallTrack) {
                    storeServiceFuncCallTrack.create(info, acl, sessionToken);
                  }

                  return _context4.abrupt('return', (0, _v2.default)());

                case 2:
                case 'end':
                  return _context4.stop();
              }
            }
          },
          _callee4,
          _this2,
        );
      }),
    );

    return function(_x9, _x10, _x11) {
      return _ref4.apply(this, arguments);
    };
  })();

  this.read = (function() {
    var _ref5 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee5(id, criteria, sessionToken) {
        return regeneratorRuntime.wrap(
          function _callee5$(_context5) {
            while (1) {
              switch ((_context5.prev = _context5.next)) {
                case 0:
                  if (storeServiceFuncCallTrack) {
                    storeServiceFuncCallTrack.read(id, criteria, sessionToken);
                  }

                  return _context5.abrupt('return', finalStoreInfo);

                case 2:
                case 'end':
                  return _context5.stop();
              }
            }
          },
          _callee5,
          _this2,
        );
      }),
    );

    return function(_x12, _x13, _x14) {
      return _ref5.apply(this, arguments);
    };
  })();

  this.search = (function() {
    var _ref6 = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee6(criteria, sessionToken) {
        return regeneratorRuntime.wrap(
          function _callee6$(_context6) {
            while (1) {
              switch ((_context6.prev = _context6.next)) {
                case 0:
                  if (storeServiceFuncCallTrack) {
                    storeServiceFuncCallTrack.search(criteria, sessionToken);
                  }

                  return _context6.abrupt('return', finalStoreInfos);

                case 2:
                case 'end':
                  return _context6.stop();
              }
            }
          },
          _callee6,
          _this2,
        );
      }),
    );

    return function(_x15, _x16) {
      return _ref6.apply(this, arguments);
    };
  })();
};

var resetAllMockTrackers = function resetAllMockTrackers() {
  crawlSessionServiceFuncCallTrack = new _CrawlSessionServiceFuncCallTrack2.default();
  storeServiceFuncCallTrack = new _StoreServiceFuncCallTrack2.default();
};

var getAllMockTrackers = function getAllMockTrackers() {
  return { crawlSessionServiceFuncCallTrack: crawlSessionServiceFuncCallTrack, storeServiceFuncCallTrack: storeServiceFuncCallTrack };
};

var setupCrawlSessionService = function setupCrawlSessionService() {
  var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    crawlSessionInfo = _ref7.crawlSessionInfo,
    crawlSessionInfos = _ref7.crawlSessionInfos;

  finalCrawlSessionInfo = crawlSessionInfo;
  finalCrawlSessionInfos = crawlSessionInfos;
};

var setupStoreService = function setupStoreService() {
  var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    storeInfo = _ref8.storeInfo,
    storeInfos = _ref8.storeInfos;

  finalStoreInfo = storeInfo;
  finalStoreInfos = storeInfos;
};

trolleySmartParseServerCommon.resetAllMockTrackers = resetAllMockTrackers;
trolleySmartParseServerCommon.getAllMockTrackers = getAllMockTrackers;

trolleySmartParseServerCommon.CrawlSessionService = CrawlSessionService;
trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;

trolleySmartParseServerCommon.StoreService = StoreService;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;

module.exports = trolleySmartParseServerCommon;
