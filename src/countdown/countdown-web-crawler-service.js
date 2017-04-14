import Crawler from 'crawler';
import {
  List,
  Map,
} from 'immutable';

class CountdownWebCrawlerService {
  constrcutor(logError, logInfo) {
    this.logError = logError;
    this.logInfo = logInfo;

    this.logErrorMessage = this.logErrorMessage.bind(this);
    this.logInfoMessage = this.logInfoMessage.bind(this);
    this.crawlProductCategoriesPagingInfo = this.crawlProductCategoriesPagingInfo.bind(this);
  }

  logErrorMessage(message) {
    if (this.logError) {
      this.logError(message);
    }
  }

  logInfoMessage(message) {
    if (this.logInfo) {
      this.logInfo(message);
    }
  }

  crawlProductCategoriesPagingInfo(config) {
    return new Promise((resolve, reject) => {
      let productsCategoriesPagingInfo = List();

      const crawler = new Crawler({
        rateLimit: config.rateLimit,
        maxConnections: config.maxConnections,
        callback: (error, res, done) => {
          this.logInfoMessage(`Received page information response for Url: ${res.request.uri.href}`);

          if (error) {
            this.logErrorMessage(`Failed to receive page information for Url: ${res.request.uri.href} - Error: ${error}`);
            done();
            reject(error);

            return;
          }

          const totalPageNumber = parseInt(res.$('.paging-container .paging .page-number')
            .last()
            .text(), 10);

          if (!totalPageNumber) {
            this.logErrorMessage(`Failed to receive page information for Url: ${res.request.uri.href}`);
            done();
            reject(error);

            return;
          }

          productsCategoriesPagingInfo = productsCategoriesPagingInfo.push(
            Map({
              productCategory: res.request.uri.href.replace(config.baseUrl, ''),
              totalPageNumber,
            }));

          done();
        },
      });

      crawler.on('drain', () => {
        this.logInfoMessage('Finished fetching pages inforamtion.');
        resolve(Map({
          config,
          productsCategoriesPagingInfo,
        }));
      });

      config.productCategories.forEach(productCategory => crawler.queue(config.baseUrl + productCategory));
    });
  }
}

export default CountdownWebCrawlerService;
