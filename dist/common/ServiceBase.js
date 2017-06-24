'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _smartGroceryParseServerCommon = require('smart-grocery-parse-server-common');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceBase = function ServiceBase(_ref) {
  var _this = this;

  var logVerboseFunc = _ref.logVerboseFunc,
      logInfoFunc = _ref.logInfoFunc,
      logErrorFunc = _ref.logErrorFunc;

  _classCallCheck(this, ServiceBase);

  this.getStoreCrawlerConfig = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(storeName) {
      var configs;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _smartGroceryParseServerCommon.StoreCrawlerConfigurationService.search((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  key: storeName
                }),
                topMost: true
              }));

            case 2:
              configs = _context.sent;
              return _context.abrupt('return', configs.first());

            case 4:
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

  this.createNewCrawlSessionAndGetStoreCrawlerConfig = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(sessionKey, config, storeName) {
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
              return _smartGroceryParseServerCommon.CrawlSessionService.create(sessionInfo);

            case 3:
              sessionId = _context2.sent;
              _context2.t0 = config;

              if (_context2.t0) {
                _context2.next = 9;
                break;
              }

              _context2.next = 8;
              return _this.getStoreCrawlerConfig(storeName);

            case 8:
              _context2.t0 = _context2.sent.get('config');

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

    return function (_x2, _x3, _x4) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.getStore = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(name) {
      var criteria, results;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              criteria = (0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  name: name
                })
              });
              _context3.next = 3;
              return _smartGroceryParseServerCommon.StoreService.search(criteria);

            case 3:
              results = _context3.sent;

              if (!results.isEmpty()) {
                _context3.next = 12;
                break;
              }

              _context3.t0 = _smartGroceryParseServerCommon.StoreService;
              _context3.next = 8;
              return _smartGroceryParseServerCommon.StoreService.create((0, _immutable.Map)({ name: name }));

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
              throw new _microBusinessParseServerCommon.Exception('Multiple store found called ' + name + '.');

            case 15:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x5) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.getMostRecentCrawlSessionInfo = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(sessionKey) {
      var crawlSessionInfos;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _smartGroceryParseServerCommon.CrawlSessionService.search((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  sessionKey: sessionKey
                }),
                topMost: true
              }));

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

    return function (_x6) {
      return _ref5.apply(this, arguments);
    };
  }();

  this.getMostRecentCrawlResults = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(sessionKey, mapFunc) {
      var crawlSessionInfo, crawlSessionId, results, result;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this.getMostRecentCrawlSessionInfo(sessionKey);

            case 2:
              crawlSessionInfo = _context5.sent;
              crawlSessionId = crawlSessionInfo.get('id');
              results = (0, _immutable.List)();
              result = _smartGroceryParseServerCommon.CrawlResultService.searchAll((0, _immutable.Map)({
                conditions: (0, _immutable.Map)({
                  crawlSessionId: crawlSessionId
                })
              }));
              _context5.prev = 6;

              result.event.subscribe(function (info) {
                return results = results.push(mapFunc ? mapFunc(info) : info);
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

    return function (_x7, _x8) {
      return _ref6.apply(this, arguments);
    };
  }();

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