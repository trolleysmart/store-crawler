'use strict';

var _countdownWebCrawlerService = require('./countdown-web-crawler-service');

var _countdownWebCrawlerService2 = _interopRequireDefault(_countdownWebCrawlerService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jobName = 'Crawl Countdown Products';

Parse.Cloud.job(jobName, function (request, status) {
  // eslint-disable-line no-undef
  var log = request.log;

  log.info('The job ' + jobName + ' has started.');
  status.message('The job ' + jobName + ' has started.');

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

  service.crawlProducts().then(function () {
    log.info('The job ' + jobName + ' completed successfully.');
    status.success('The job ' + jobName + ' completed successfully.');
  }).catch(function (error) {
    log.error('The job ' + jobName + ' ended in error. Error: ' + JSON.stringify(error));
    status.error('The job ' + jobName + ' ended in error. Error: ' + JSON.stringify(error));
  });
});