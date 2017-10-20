'use strict';

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _StoreServiceMockTracker = require('./StoreServiceMockTracker');

var _StoreServiceMockTracker2 = _interopRequireDefault(_StoreServiceMockTracker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
var storeServiceMockTracker = void 0;
var finalStoreInfo = void 0;
var finalStoreInfos = void 0;

var StoreService = function StoreService() {
  var _this = this;

  _classCallCheck(this, StoreService);

  this.create = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(info, acl, sessionToken) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (storeServiceMockTracker) {
                storeServiceMockTracker.create(info, acl, sessionToken);
              }

              return _context.abrupt('return', (0, _v2.default)());

            case 2:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();

  this.read = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(id, criteria, sessionToken) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (storeServiceMockTracker) {
                storeServiceMockTracker.read(id, criteria, sessionToken);
              }

              return _context2.abrupt('return', finalStoreInfo);

            case 2:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x4, _x5, _x6) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.search = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(criteria, sessionToken) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (storeServiceMockTracker) {
                storeServiceMockTracker.search(criteria, sessionToken);
              }

              return _context3.abrupt('return', finalStoreInfos);

            case 2:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x7, _x8) {
      return _ref3.apply(this, arguments);
    };
  }();
};

var resetAllMockTrackers = function resetAllMockTrackers() {
  storeServiceMockTracker = new _StoreServiceMockTracker2.default();
};

var getAllMockTrackers = function getAllMockTrackers() {
  return { storeServiceMockTracker: storeServiceMockTracker };
};

var setupStoreService = function setupStoreService() {
  var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      storeInfo = _ref4.storeInfo,
      storeInfos = _ref4.storeInfos;

  finalStoreInfo = storeInfo;
  finalStoreInfos = storeInfos;
};

trolleySmartParseServerCommon.resetAllMockTrackers = resetAllMockTrackers;
trolleySmartParseServerCommon.getAllMockTrackers = getAllMockTrackers;

trolleySmartParseServerCommon.StoreService = StoreService;
trolleySmartParseServerCommon.setupStoreService = setupStoreService;

module.exports = trolleySmartParseServerCommon;