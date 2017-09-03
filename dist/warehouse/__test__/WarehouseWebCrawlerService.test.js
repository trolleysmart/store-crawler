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

var storeTags = _immutable.List.of(
  (0, _immutable.Map)({ id: (0, _v2.default)(), url: 'http://www.thewarehouse.co.nz/c/food-pets-household/food-drink/hot-drinks' }),
);

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
    storeTags: storeTags,
  });
});

describe('crawlProducts', function() {
  it(
    'should crawl products for the provided store tags',
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
});
