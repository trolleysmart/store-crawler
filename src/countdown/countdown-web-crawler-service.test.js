import '../../bootstrap';
import CountdownWebCrawlerService from './countdown-web-crawler-service';

describe('getProductCategoriesPagingInfo', () => {
  test('should capture paging info for product categories with multiple page', () => {
    const config = {
      "baseUrl": "https://shop.countdown.co.nz/Shop/Browse/",
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery'],
    };

    return new CountdownWebCrawlerService({})
      .getProductCategoriesPagingInfo(config)
      .then((productsCategoriesPagingInfo) => {
        expect(productsCategoriesPagingInfo)
          .toBeDefined();

        const bakeryPagingInfo = productsCategoriesPagingInfo
          .find(_ => _.get('productCategory')
            .localeCompare(config.productCategories[0]) === 0);
        expect(bakeryPagingInfo)
          .toBeDefined();
        expect(bakeryPagingInfo.get('totalPageNumber'))
          .toBeDefined();
      });
  });

  test('should capture paging info for product categories with single page', () => {
    const config = {
      "baseUrl": "https://shop.countdown.co.nz/Shop/Browse/",
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery/desserts-pies'],
    };
    return new CountdownWebCrawlerService({})
      .getProductCategoriesPagingInfo(config)
      .then((productsCategoriesPagingInfo) => {
        expect(productsCategoriesPagingInfo)
          .toBeDefined();

        const bakeryPagingInfo = productsCategoriesPagingInfo
          .find(_ => _.get('productCategory')
            .localeCompare(config.productCategories[0]) === 0);
        expect(bakeryPagingInfo)
          .toBeDefined();
        expect(bakeryPagingInfo.get('totalPageNumber'))
          .toBeDefined();
      });
  });
});

describe('crawl', () => {
  test('should crawl and save to database', () => {
    const config = {
      "baseUrl": "https://shop.countdown.co.nz/Shop/Browse/",
      rateLimit: 2000,
      maxConnections: 1,
      logLevel: 1,
      productCategories: ['bakery/desserts-pies'],
    };
    return new CountdownWebCrawlerService({
        config,
        logVerboseFunc: message => console.log(message),
        logInfoFunc: message => console.log(message),
        logErrorFunc: message => console.log(message),
      })
      .crawl();
  });
});
