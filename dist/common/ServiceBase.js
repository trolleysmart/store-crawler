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

  this.createNewSessionAndGetConfig = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(sessionKey, config, storeName) {
      var sessionInfo, promises, finalConfig, results, sessionId;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              sessionInfo = (0, _immutable.Map)({
                sessionKey: sessionKey,
                startDateTime: new Date()
              });
              promises = _immutable.List.of(_smartGroceryParseServerCommon.CrawlSessionService.create(sessionInfo));


              if (!config) {
                promises = promises.push(_smartGroceryParseServerCommon.StoreCrawlerConfigurationService.search((0, _immutable.Map)({
                  conditions: (0, _immutable.Map)({
                    key: storeName
                  }),
                  topMost: true
                })));
              }

              finalConfig = config;
              _context.next = 6;
              return Promise.all(promises.toArray());

            case 6:
              results = _context.sent;
              sessionId = results[0];


              if (!finalConfig) {
                finalConfig = results[1].first().get('config');
              }

              if (finalConfig) {
                _context.next = 11;
                break;
              }

              throw new _microBusinessParseServerCommon.Exception('Failed to retrieve configuration for ' + storeName + ' store crawler.');

            case 11:

              _this.logInfo(finalConfig, function () {
                return 'Created session and retrieved config. Session Id: ' + sessionId;
              });
              _this.logVerbose(finalConfig, function () {
                return 'Config: ' + JSON.stringify(finalConfig);
              });

              return _context.abrupt('return', (0, _immutable.Map)({
                sessionInfo: sessionInfo.set('id', sessionId),
                config: finalConfig
              }));

            case 14:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x, _x2, _x3) {
      return _ref2.apply(this, arguments);
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