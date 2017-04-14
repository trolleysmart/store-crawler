import CountdownWebCrawlerService from './countdown-web-crawler-service';

function logInfo(message) {
  console.log(message);
}

function logError(message) {
  console.log(message);
}

describe('crawlProductCategoriesPagingInfo', () => {
  test('should capture all product categories', () => {
    const config = {
      "baseUrl": "https://shop.countdown.co.nz/Shop/Browse/",
      rateLimit: 2000,
      maxConnections: 1,
      productCategories: ['bakery'],
    };
    const service = new CountdownWebCrawlerService(logError, logInfo);

    return service.crawlProductCategoriesPagingInfo(config)
      .then(result => {
        expect(result.get('config'))
          .toBeDefined();

        const productsCategoriesPagingInfo = result.get('productsCategoriesPagingInfo');
        expect(productsCategoriesPagingInfo)
          .toBeDefined();

        const bakeryPagingInfo = result.get('productsCategoriesPagingInfo')
          .find(_ => _.get('productCategory')
            .localeCompare('bakery') === 0);
        expect(bakeryPagingInfo)
          .toBeDefined();
        expect(bakeryPagingInfo.get('totalPageNumber'))
          .toBeDefined();
      });
  });
});
