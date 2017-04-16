import Crawler from 'crawler';
import {
  List,
  Map,
} from 'immutable';
import Common from 'smart-grocery-parse-server-common';

class CountdownWebCrawlerService {
  static getProductDetails(config, $) {
    let products = List();

    $('#product-list')
      .filter(function filterProductListCallback() { // eslint-disable-line array-callback-return
        const data = $(this);

        data.find('.product-stamp .details-container')
          .each(function onNewProductExtracted() {
            const product = $(this);
            const imageUrl = config.baseImageUrl + product.find('.product-stamp-thumbnail img')
              .attr('src');
            const barcode = CountdownWebCrawlerService.getBarcodeFromImageUrl(imageUrl);
            const description = product.find('.description')
              .text();

            products = products.push(Map({
              description,
              barcode,
              imageUrl,
            }));
          });
      });

    return products;
  }

  static getBarcodeFromImageUrl(imageUrl) {
    const str = imageUrl.substr(imageUrl.indexOf('big/') + 4);
    const barcode = str.substr(0, str.indexOf('.jpg'));

    return barcode;
  }

  constructor({
    config,
    logVerboseFunc,
    logInfoFunc,
    logErrorFunc,
  }) {
    this.config = config;
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;

    this.crawl = this.crawl.bind(this);
    this.getProductCategoriesPagingInfo = this.getProductCategoriesPagingInfo.bind(this);
    this.crawlProductsAndSaveDetails = this.crawlProductsAndSaveDetails.bind(this);
    this.logVerbose = this.logVerbose.bind(this);
    this.logInfo = this.logInfo.bind(this);
    this.logError = this.logError.bind(this);
  }

  crawl() {
    return new Promise((resolve, reject) => {
      let promises = [Common.CrawlService.createNewCrawlSession('Countdown', new Date())];

      if (!this.config) {
        promises = [...promises, Common.CrawlService.getStoreCrawlerConfig('Countdown')];
      }

      let sessionId;
      let config = this.config;

      return Promise.all(promises)
        .then((results) => {
          sessionId = results[0];

          if (!config) {
            config = results[1];
          }

          this.logInfo(config, () => 'Start fetching product categories paging info...');

          return this.getProductCategoriesPagingInfo(config);
        })
        .then((productsCategoriesPagingInfo) => {
          this.logInfo(config, () => 'Finished fetching product categories paging info.');
          this.logVerbose(config, () => `Fetched product categories paging info: ${productsCategoriesPagingInfo}`);

          this.logInfo(config, () => 'Start crawling products and save the details...');

          return this.crawlProductsAndSaveDetails(sessionId, config,
            productsCategoriesPagingInfo);
        })
        .then(() => {
          this.logInfo(config, () => 'Crawling product successfully completed. Updating crawl session info...');

          Common.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success',
          })
            .then(() => {
              this.logInfo(config, () => 'Updating crawl session info successfully completed.');

              resolve();
            })
            .catch((error) => {
              this.logError(config, () => `Updating crawl session info ended in error. Error: ${error}`);

              reject(error);
            });
        })
        .catch((error) => {
          this.logInfo(config, () => 'Crawling product ended in error. Updating crawl session info...');
          Common.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success',
            error,
          })
            .then(() => {
              this.logInfo(config, () => 'Updating crawl session info successfully completed.');

              reject(error);
            })
            .catch((err) => {
              this.logError(config, () => `Updating crawl session info ended in error. Error: ${err}`);

              reject(`${error} - ${err}`);
            });
        });
    });
  }

  getProductCategoriesPagingInfo(config) {
    return new Promise((resolve, reject) => {
      let productsCategoriesPagingInfo = List();

      const crawler = new Crawler({
        rateLimit: config.rateLimit,
        maxConnections: config.maxConnections,
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive page information for Url: ${res.request.uri.href} - Error: ${error}`);

            return;
          }

          const totalPageNumber = parseInt(res.$('.paging-container .paging .page-number')
            .last()
            .text(), 10);

          productsCategoriesPagingInfo = productsCategoriesPagingInfo.push(
            Map({
              productCategory: res.request.uri.href.replace(config.baseUrl, ''),
              totalPageNumber: totalPageNumber || 1,
            }));

          done();
        },
      });

      crawler.on('drain', () => resolve(productsCategoriesPagingInfo));

      config.productCategories.forEach(productCategory => crawler.queue(config.baseUrl + productCategory));
    });
  }

  crawlProductsAndSaveDetails(sessionId, config, productsCategoriesPagingInfo) {
    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.rateLimit,
        maxConnections: config.maxConnections,
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive products for Url: ${res.request.uri.href} - Error: ${error}`);

            return;
          }

          const productCategoryAndPage = res.request.uri.href.replace(config.baseUrl, '');
          const productCategory = productCategoryAndPage.substring(0, productCategoryAndPage.indexOf('?'));
          const products = CountdownWebCrawlerService.getProductDetails(config, res.$)
            .toJS();

          this.logVerbose(config, () =>
            `Received products for: ${JSON.stringify(res)} - ${productCategory} - ${JSON.stringify(products)}`);
          Common.CountdownCrawlService.addResultSet(sessionId, {
            productCategory,
            products,
          })
            .then(() => {
              this.logInfo(config, () => `Successfully added products for: ${productCategory}.`);

              done();
            })
            .catch((err) => {
              this.logError(config, () => `Failed to save products for: ${productCategory}. Error: ${error}`);

              done();
              reject(`Failed to receive products for Url: ${res.request.uri.href} - Error: ${err}`);
            });
        },
      });

      crawler.on('drain', () => {
        resolve();
      });

      productsCategoriesPagingInfo.forEach(productCategoryInfo => [...Array(productCategoryInfo.get('totalPageNumber'))
        .keys(),
      ].forEach(pageNumber => crawler.queue(`${config.baseUrl + productCategoryInfo.get('productCategory')}?page=${pageNumber + 1}`)));
    });
  }

  logVerbose(config, messageFunc) {
    if (this.logVerboseFunc && config.logLevel >= 3 && messageFunc) {
      this.logVerboseFunc(messageFunc());
    }
  }

  logInfo(config, messageFunc) {
    if (this.logInfoFunc && config.logLevel >= 2 && messageFunc) {
      this.logInfoFunc(messageFunc());
    }
  }

  logError(config, messageFunc) {
    if (this.logErrorFunc && config.logLevel >= 1 && messageFunc) {
      this.logErrorFunc(messageFunc());
    }
  }
}

export default CountdownWebCrawlerService;
