'use strict';

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _WarehouseWebCrawlerService = require('./WarehouseWebCrawlerService');

var _WarehouseWebCrawlerService2 = _interopRequireDefault(_WarehouseWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var jobName = 'Crawl Warehouse Products';

Parse.Cloud.job(jobName, function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(request, status) {
    var log, service, errorMessage;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // eslint-disable-line no-undef
            log = request.log;


            log.info('The job ' + jobName + ' has started.');
            status.message('The job ' + jobName + ' has started.');

            service = new _WarehouseWebCrawlerService2.default({
              logVerboseFunc: function logVerboseFunc(message) {
                return log.info(message);
              },
              logInfoFunc: function logInfoFunc(message) {
                return log.info(message);
              },
              logErrorFunc: function logErrorFunc(message) {
                return log.error(message);
              }
            });
            _context.prev = 4;
            _context.next = 7;
            return service.crawlProducts();

          case 7:

            log.info('The job ' + jobName + ' completed successfully.');
            status.success('The job ' + jobName + ' completed successfully.');
            _context.next = 16;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](4);
            errorMessage = _context.t0 instanceof _microBusinessParseServerCommon.Exception ? _context.t0.getErrorMessage() : _context.t0;


            log.error('The job ' + jobName + ' ended in error. Error: ' + errorMessage);
            status.error('The job ' + jobName + ' ended in error. Error: ' + errorMessage);

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[4, 11]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());