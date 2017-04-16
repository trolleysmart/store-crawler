'use strict';

var _countdownWebCrawlerService = require('./countdown-web-crawler-service');

var _countdownWebCrawlerService2 = _interopRequireDefault(_countdownWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Parse.Cloud.job('Crawl Countdown Products', function (request, status) {
  // eslint-disable-line no-undef
  var log = request.log;

  log.info('The job has started.');
  status.message('The job has started.');

  var service = new _countdownWebCrawlerService2.default({
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

  service.crawl().then(function () {
    log.info('Job completed successfully.');
    status.success('Job completed successfully.');
  }).catch(function (error) {
    log.error(error);
    status.error('Job completed in error.');
  });
});