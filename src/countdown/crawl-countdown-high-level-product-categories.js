import CountdownWebCrawlerService from './countdown-web-crawler-service';

const jobName = 'Crawl Countdown High Level Product Categories';

Parse.Cloud.job(jobName, (request, status) => { // eslint-disable-line no-undef
  const log = request.log;

  log.info(`The job ${jobName} has started.`);
  status.message(`The job ${jobName} has started.`);

  const service = new CountdownWebCrawlerService({
    logVerboseFunc: message => log.info(message),
    logInfoFunc: message => log.info(message),
    logErrorFunc: message => log.error(message),
  });

  service.crawlHighLevelProductCategories()
    .then(() => {
      log.info(`The job ${jobName} completed successfully.`);
      status.success(`The job ${jobName} completed successfully.`);
    })
    .catch((error) => {
      log.error(`The job ${jobName} ended in error. Error: ${JSON.stringify(error)}`);
      status.error(`The job ${jobName} ended in error. Error: ${JSON.stringify(error)}`);
    });
});
