'use strict';

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var microBusinessParseServerCommon = jest.genMockFromModule('micro-business-parse-server-common');
var keyValues = void 0;

var ParseWrapperService = function ParseWrapperService() {
  _classCallCheck(this, ParseWrapperService);
};

ParseWrapperService.getConfig = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt('return', new _Config2.default(keyValues));

        case 1:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
}));


var setupParseWrapperServiceGetConfig = function setupParseWrapperServiceGetConfig(arg) {
  keyValues = arg;
};

microBusinessParseServerCommon.setupParseWrapperServiceGetConfig = setupParseWrapperServiceGetConfig;
microBusinessParseServerCommon.ParseWrapperService = ParseWrapperService;

module.exports = microBusinessParseServerCommon;