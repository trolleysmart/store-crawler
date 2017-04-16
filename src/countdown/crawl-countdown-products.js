import CountdownWebCrawlerService from './countdown-web-crawler-service';

Parse.Cloud.job('Crawl Countdown Products', (request, status) => { // eslint-disable-line no-undef
  const log = request.log;

  status.message('The job has started.');

  const service = new CountdownWebCrawlerService({
    logVerbose: message => log.info(message),
    logInfo: message => log.info(message),
    logError: message => log.error(message),
  });

  service.crawl()
    .then(() => {
      log.info('Job completed successfully.');
      status.success('Job completed successfully.');
    })
    .catch((error) => {
      log.error(error);
      status.error('Job completed in error.');
    });
});
