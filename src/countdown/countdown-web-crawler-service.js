import Crawler from 'crawler';
import {
  List,
  Map,
} from 'immutable';
import Common from 'smart-grocery-parse-server-common';

class CountdownWebCrawlerService {
  static getProductCategoriesPagingInfoUsingProvidedConfig(config) {
    return new Promise((resolve, reject) => {
      let productsCategoriesPagingInfo = List();

      const crawler = new Crawler({
        rateLimit: config.rateLimit,
        maxConnections: config.maxConnections,
        callback: (error, res, done) => {
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

  static getBarcodeFromImageUrl(imageUrl) {
    const str = imageUrl.substr(imageUrl.indexOf('big/') + 4);
    const barcode = str.substr(0, str.indexOf('.jpg'));

    return barcode;
  }

  constructor(config) {
    this.config = config;

    this.crawl = this.crawl.bind(this);
    this.getProductCategoriesPagingInfo = this.getProductCategoriesPagingInfo.bind(this);
    this.saveDetails = this.saveDetails.bind(this);
    this.getProductDetails = this.getProductDetails.bind(this);
  }

  crawl() {
    return new Promise((resolve, reject) => {
      let sessionId;
      return Promise.all([Common.CrawlService.createNewCrawlSession('Countdown', new Date()), this.getProductCategoriesPagingInfo()])
        .then((results) => {
          sessionId = results[0];

          return this.saveDetails(sessionId, results[1]);
        })
        .then(() => {
          Common.CrawlService.updateCrawlSessionEndDateTime(sessionId, new Date());
          resolve();
        })
        .catch((error) => {
          Common.CrawlService.updateCrawlSessionEndDateTime(sessionId, new Date());
          reject(error);
        });
    });
  }

  getProductCategoriesPagingInfo() {
    return this.config ?
      CountdownWebCrawlerService.getProductCategoriesPagingInfoUsingProvidedConfig(this.config) :
      Common.CrawlService.getStoreCrawlerConfig('Countdown')
      .then(CountdownWebCrawlerService.getProductCategoriesPagingInfoUsingProvidedConfig);
  }

  saveDetails(sessionId, productsCategoriesPagingInfo) {
    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: this.config.rateLimit,
        maxConnections: this.config.maxConnections,
        callback: (error, res, done) => {
          if (error) {
            done();
            reject(`Failed to receive products for Url: ${res.request.uri.href} - Error: ${error}`);

            return;
          }

          const productCategoryAndPage = res.request.uri.href.replace(this.config.baseUrl, '');
          const productCategory = productCategoryAndPage.substring(0, productCategoryAndPage.indexOf('?'));

          Common.CountdownCrawlService.addResultSet(sessionId, {
            productCategory,
            products: this.getProductDetails(res.$)
                .toJS(),
          })
            .then(() => done())
            .catch((err) => {
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
      ].forEach(pageNumber => crawler.queue(`${this.config.baseUrl + productCategoryInfo.get('productCategory')}?page=${pageNumber + 1}`)));
    });
  }

  getProductDetails($) {
    const self = this;
    let products = List();

    $('#product-list')
      .filter(function filterProductListCallback() { // eslint-disable-line array-callback-return
        const data = $(this);

        data.find('.product-stamp .details-container')
          .each(function onNewProductExtracted() {
            const product = $(this);
            const imageUrl = self.config.baseImageUrl + product.find('.product-stamp-thumbnail img')
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

}

export default CountdownWebCrawlerService;
