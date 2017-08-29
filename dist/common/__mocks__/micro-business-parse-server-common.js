'use strict';

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

var _ParseWrapperServiceFuncCallTrack = require('./ParseWrapperServiceFuncCallTrack');

var _ParseWrapperServiceFuncCallTrack2 = _interopRequireDefault(_ParseWrapperServiceFuncCallTrack);

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

var microBusinessParseServerCommon = jest.genMockFromModule('micro-business-parse-server-common');
var parseWrapperServiceFuncCallTrack = void 0;
var finalKeyValues = void 0;

var ParseWrapperService = function ParseWrapperService() {
  _classCallCheck(this, ParseWrapperService);
};

ParseWrapperService.getConfig = _asyncToGenerator(
  regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(
      function _callee$(_context) {
        while (1) {
          switch ((_context.prev = _context.next)) {
            case 0:
              parseWrapperServiceFuncCallTrack.getConfig();

              return _context.abrupt('return', new _Config2.default(finalKeyValues));

            case 2:
            case 'end':
              return _context.stop();
          }
        }
      },
      _callee,
      undefined,
    );
  }),
);

var resetAllMockTracks = function resetAllMockTracks() {
  parseWrapperServiceFuncCallTrack = new _ParseWrapperServiceFuncCallTrack2.default();
};

var setupParseWrapperServiceGetConfig = function setupParseWrapperServiceGetConfig() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    keyValues = _ref.keyValues;

  finalKeyValues = keyValues;
};

microBusinessParseServerCommon.resetAllMockTracks = resetAllMockTracks;

microBusinessParseServerCommon.ParseWrapperService = ParseWrapperService;
microBusinessParseServerCommon.parseWrapperServiceFuncCallTrack = parseWrapperServiceFuncCallTrack;
microBusinessParseServerCommon.setupParseWrapperServiceGetConfig = setupParseWrapperServiceGetConfig;

module.exports = microBusinessParseServerCommon;
