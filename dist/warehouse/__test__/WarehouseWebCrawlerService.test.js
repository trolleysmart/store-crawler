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

var createWarehouseWebCrawlerService = function createWarehouseWebCrawlerService() {
  return new _.WarehouseWebCrawlerService('countdown');
};

jest.mock('../../common/StoreCrawlerServiceBase');

var sessionInfo = (0, _immutable.Map)({ id: (0, _v2.default)() });

beforeEach(function() {
  StoreCrawlerServiceBase.resetAllMockTrackers();
  StoreCrawlerServiceBase.setupStoreCrawlerServiceBase({
    config: (0, _immutable.Map)({
      baseUrl: 'http://www.thewarehouse.co.nz/',
      rateLimit: 1,
      maxConnections: 1,
      logLevel: 2,
      categoryKeysToExclude: _immutable.List.of('specials', 'electronicsgaming-apple', 'gifting-giftcards-faqs'),
    }),
    sessionInfo: sessionInfo,
  });
});

describe('crawlProductCategories', function() {
  it(
    'should call createNewCrawlSession',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee() {
        var calls;
        return regeneratorRuntime.wrap(
          function _callee$(_context) {
            while (1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                  _context.next = 2;
                  return createWarehouseWebCrawlerService().crawlProductCategories();

                case 2:
                  calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseMockTracker.createNewCrawlSession.mock.calls;

                  expect(calls.length).toBe(1);
                  expect(calls[0][0]).toBe('Warehouse Product Categories');

                case 5:
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
    'should create crawl result',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2() {
        var calls;
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  _context2.next = 2;
                  return createWarehouseWebCrawlerService().crawlProductCategories();

                case 2:
                  calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseMockTracker.createNewCrawlResult.mock.calls;

                  expect(calls.length).toBe(1);
                  expect(calls[0][0]).toBeTruthy();
                  expect(calls[0][1]).toBeTruthy();

                case 6:
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
    'should update crawl session',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee3() {
        var calls;
        return regeneratorRuntime.wrap(
          function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  _context3.next = 2;
                  return createWarehouseWebCrawlerService().crawlProductCategories();

                case 2:
                  calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseMockTracker.updateExistingCrawlSession.mock.calls;

                  expect(calls.length).toBe(1);
                  expect(calls[0][0].get('id')).toBe(sessionInfo.get('id'));
                  expect(calls[0][0].has('endDateTime')).toBeTruthy();
                  expect(calls[0][0].getIn(['additionalInfo', 'status'])).toBe('success');

                case 7:
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
});
