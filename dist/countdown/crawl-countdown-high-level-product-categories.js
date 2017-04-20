'use strict';

var _countdownWebCrawlerService = require('./countdown-web-crawler-service');

var jobName = 'Crawl Countdown High Level Product Categories';

Parse.Cloud.job(jobName, function (request, status) {
  // eslint-disable-line no-undef
  var log = request.log;

  log.info('The job ' + jobName + ' has started.');
  status.message('The job has started.');

  var service = new _countdownWebCrawlerService.CountdownWebCrawlerService({
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

  service.crawlHighLevelProductCategories().then(function () {
    log.info('The job ' + jobName + ' completed successfully.');
    status.success('Job completed successfully.');
  }).catch(function (error) {
    log.error('The job ' + jobName + ' ended in error. Error: ' + error);
    status.error('Job completed in error.');
  });
});