'use strict';

var _immutable = require('immutable');

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var MicroBusinessParseServerCommon = require('micro-business-parse-server-common');
var TrolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

var keyValues = (0, _immutable.Map)({ countdown: (0, _immutable.Map)({ val1: (0, _v2.default)(), val2: (0, _v2.default)() }) });
var sessionInfo = (0, _immutable.Map)({ val1: (0, _v2.default)(), val2: (0, _v2.default)() });

beforeEach(function () {
  MicroBusinessParseServerCommon.setupParseWrapperServiceGetConfig(keyValues);
  TrolleySmartParseServerCommon.setupCrawlSessionService(sessionInfo);
});

describe('getConfig', function () {
  it('should return the config matches the key', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            expect(new _.ServiceBase('countdown').getConfig()).resolves.toEqual(keyValues.get('countdown'));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  it('should throw exception if provided key does not exist', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            expect(new _.ServiceBase('unknow').getConfig()).rejects.toBeDefined();

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));
});

describe('createNewCrawlSession', function () {
  it('should return the config matches the key', _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            expect(new _.ServiceBase('countdown').createNewCrawlSession('sessionKey')).resolves.toEqual(sessionInfo);

          case 1:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));
});