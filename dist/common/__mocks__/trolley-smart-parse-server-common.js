'use strict';

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
var sessionInfo = void 0;

var CrawlSessionService = function CrawlSessionService() {
  var _this = this;

  _classCallCheck(this, CrawlSessionService);

  this.create = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', (0, _v2.default)());

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  }));
  this.read = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt('return', sessionInfo);

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, _this);
  }));
};

var setupCrawlSessionService = function setupCrawlSessionService(arg) {
  sessionInfo = arg;
};

trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;
trolleySmartParseServerCommon.CrawlSessionService = CrawlSessionService;

module.exports = trolleySmartParseServerCommon;