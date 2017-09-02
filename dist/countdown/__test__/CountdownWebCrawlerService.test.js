'use strict';

var _immutable = require('immutable');

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _ = require('../');

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

var StoreCrawlerServiceBase = require('../../common/StoreCrawlerServiceBase');

var createCountdownWebCrawlerService = function createCountdownWebCrawlerService() {
  return new _.CountdownWebCrawlerService('countdown');
};

jest.mock('../../common/StoreCrawlerServiceBase');

beforeEach(function() {
  StoreCrawlerServiceBase.resetAllMockTrackers();
  StoreCrawlerServiceBase.setupStoreCrawlerServiceBase({
    config: (0, _immutable.Map)({
      baseUrl: 'https://shop.countdown.co.nz',
      rateLimit: 1,
      maxConnections: 1,
      logLevel: 2,
      categoryKeysToExclude: _immutable.List.of('restricted-items', 'christmas'),
    }),
    sessionInfo: (0, _immutable.Map)({ id: (0, _v2.default)() }),
  });
});

describe('crawlAndSyncProductCategoriesToStoreTags', function() {
  it(
    'should call getStoreTags three times for all three level product categories',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(
          function _callee$(_context) {
            while (1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                case 'end':
                  return _context.stop();
              }
            }
          },
          _callee,
          undefined,
        );
      }),
    ),
  );

  it(
    'should call createOrUpdateLevelOneProductCategory',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                case 'end':
                  return _context2.stop();
              }
            }
          },
          _callee2,
          undefined,
        );
      }),
    ),
  );

  it(
    'should call createOrUpdateLevelTwoProductCategory',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(
          function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                case 'end':
                  return _context3.stop();
              }
            }
          },
          _callee3,
          undefined,
        );
      }),
    ),
  );

  it(
    'should call createOrUpdateLevelThreeProductCategory',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(
          function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                case 'end':
                  return _context4.stop();
              }
            }
          },
          _callee4,
          undefined,
        );
      }),
    ),
  );
});
