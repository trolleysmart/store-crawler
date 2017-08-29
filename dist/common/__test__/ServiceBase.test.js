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

var MicroBusinessParseServerCommon = require('micro-business-parse-server-common');
var TrolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

var createNewServiceBase = function createNewServiceBase() {
  return new _.ServiceBase('countdown');
};
var keyValues = (0, _immutable.Map)({ countdown: (0, _immutable.Map)({ val1: (0, _v2.default)(), val2: (0, _v2.default)() }) });
var crawlSessionInfos = _immutable.List.of(
  (0, _immutable.Map)({ id: (0, _v2.default)(), val: (0, _v2.default)() }),
  (0, _immutable.Map)({ id: (0, _v2.default)(), val: (0, _v2.default)() }),
);
var storeInfos = _immutable.List.of(
  (0, _immutable.Map)({ id: (0, _v2.default)(), val: (0, _v2.default)() }),
  (0, _immutable.Map)({ id: (0, _v2.default)(), val: (0, _v2.default)() }),
);

beforeEach(function() {
  MicroBusinessParseServerCommon.resetAllMockTracks();
  TrolleySmartParseServerCommon.resetAllMockTracks();
  MicroBusinessParseServerCommon.setupParseWrapperServiceGetConfig({ keyValues: keyValues });
});

describe('getConfig', function() {
  it(
    'should return the config matches the key',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(
          function _callee$(_context) {
            while (1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                  expect(createNewServiceBase().getConfig()).resolves.toEqual(keyValues.get('countdown'));

                case 1:
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
    'should throw exception if provided key does not exist',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  expect(new _.ServiceBase('unknow').getConfig()).rejects.toBeDefined();

                case 1:
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
});

describe('createNewCrawlSession', function() {
  beforeEach(function() {
    TrolleySmartParseServerCommon.setupCrawlSessionService({ crawlSessionInfo: crawlSessionInfos.first() });
  });

  it(
    'should create new crawl session and return the session info',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(
          function _callee3$(_context3) {
            while (1) {
              switch ((_context3.prev = _context3.next)) {
                case 0:
                  expect(createNewServiceBase().createNewCrawlSession('sessionKey')).resolves.toEqual(crawlSessionInfos.first());

                case 1:
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

describe('getStore', function() {
  it(
    'should create new store if provided store deos not exist',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(
          function _callee4$(_context4) {
            while (1) {
              switch ((_context4.prev = _context4.next)) {
                case 0:
                  TrolleySmartParseServerCommon.setupStoreService({ storeInfo: storeInfos.first(), storeInfos: (0, _immutable.List)() });
                  expect(createNewServiceBase().getStore()).resolves.toEqual(storeInfos.first());

                case 2:
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

  it(
    'should return the store info if provided store exist',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(
          function _callee5$(_context5) {
            while (1) {
              switch ((_context5.prev = _context5.next)) {
                case 0:
                  TrolleySmartParseServerCommon.setupStoreService({ storeInfos: storeInfos.take(1) });
                  expect(createNewServiceBase().getStore()).resolves.toEqual(storeInfos.first());

                case 2:
                case 'end':
                  return _context5.stop();
              }
            }
          },
          _callee5,
          undefined,
        );
      }),
    ),
  );

  it(
    'should throw exception if multiple store found with the provided store name',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(
          function _callee6$(_context6) {
            while (1) {
              switch ((_context6.prev = _context6.next)) {
                case 0:
                  TrolleySmartParseServerCommon.setupStoreService({ storeInfos: storeInfos });
                  expect(createNewServiceBase().getStore()).rejects.toBeDefined();

                case 2:
                case 'end':
                  return _context6.stop();
              }
            }
          },
          _callee6,
          undefined,
        );
      }),
    ),
  );
});

describe('getMostRecentCrawlSessionInfo', function() {
  it(
    'should return the top most crawl session info',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee7() {
        return regeneratorRuntime.wrap(
          function _callee7$(_context7) {
            while (1) {
              switch ((_context7.prev = _context7.next)) {
                case 0:
                  TrolleySmartParseServerCommon.setupCrawlSessionService({ crawlSessionInfos: crawlSessionInfos.take(1) });
                  expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).resolves.toEqual(crawlSessionInfos.first());

                case 2:
                case 'end':
                  return _context7.stop();
              }
            }
          },
          _callee7,
          undefined,
        );
      }),
    ),
  );

  it(
    'should throw exception if multiple crawl session info returned',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee8() {
        return regeneratorRuntime.wrap(
          function _callee8$(_context8) {
            while (1) {
              switch ((_context8.prev = _context8.next)) {
                case 0:
                  TrolleySmartParseServerCommon.setupCrawlSessionService({ crawlSessionInfos: crawlSessionInfos });
                  expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).rejects.toBeDefined();

                case 2:
                case 'end':
                  return _context8.stop();
              }
            }
          },
          _callee8,
          undefined,
        );
      }),
    ),
  );

  it(
    'should throw exception if no crawl session found',
    _asyncToGenerator(
      regeneratorRuntime.mark(function _callee9() {
        return regeneratorRuntime.wrap(
          function _callee9$(_context9) {
            while (1) {
              switch ((_context9.prev = _context9.next)) {
                case 0:
                  TrolleySmartParseServerCommon.setupCrawlSessionService({ crawlSessionInfos: (0, _immutable.List)() });
                  expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).rejects.toBeDefined();

                case 2:
                case 'end':
                  return _context9.stop();
              }
            }
          },
          _callee9,
          undefined,
        );
      }),
    ),
  );
});
