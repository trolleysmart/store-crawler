import Crawler from 'crawler';
import {
  List,
  Map,
} from 'immutable';
import Common from 'smart-grocery-parse-server-common';

class CountdownWebCrawlerService {
  static getProductCategoriesPagingInfo(config) {
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

  static crawlProductsAndSaveDetails(sessionId, config, productsCategoriesPagingInfo) {
    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.rateLimit,
        maxConnections: config.maxConnections,
        callback: (error, res, done) => {
          if (error) {
            done();
            reject(`Failed to receive products for Url: ${res.request.uri.href} - Error: ${error}`);

            return;
          }

          const productCategoryAndPage = res.request.uri.href.replace(config.baseUrl, '');
          const productCategory = productCategoryAndPage.substring(0, productCategoryAndPage.indexOf('?'));

          Common.CountdownCrawlService.addResultSet(sessionId, {
            productCategory,
            products: CountdownWebCrawlerService.getProductDetails(config, res.$)
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
      ].forEach(pageNumber => crawler.queue(`${config.baseUrl + productCategoryInfo.get('productCategory')}?page=${pageNumber + 1}`)));
    });
  }

  constructor(config) {
    this.config = config;

    this.crawl = this.crawl.bind(this);
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

          return CountdownWebCrawlerService.getProductCategoriesPagingInfo(config);
        })
        .then(productsCategoriesPagingInfo => CountdownWebCrawlerService.crawlProductsAndSaveDetails(sessionId, config,
          productsCategoriesPagingInfo))
        .then(() => {
          Common.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success',
          });
          resolve();
        })
        .catch((error) => {
          Common.CrawlService.updateCrawlSession(sessionId, new Date(), {
            status: 'success',
            error,
          });
          reject(error);
        });
    });
  }
}

export default CountdownWebCrawlerService;
