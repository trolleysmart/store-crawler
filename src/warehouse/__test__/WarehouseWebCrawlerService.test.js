// @flow

import Immutable from 'immutable';
import '../../../bootstrap';
import WarehouseWebCrawlerService from '../WarehouseWebCrawlerService';

const createConfig = () =>
  Immutable.fromJS({
    baseUrl: 'http://www.thewarehouse.co.nz/',
    rateLimit: 1,
    maxConnections: 1,
    logLevel: 2,
    categoryKeysToExclude: ['specials', 'electronicsgaming-apple'],
  });

describe('crawlProductCategories', () => {
  test('should crawl product categories and save to database', async () => {
    await new WarehouseWebCrawlerService({
      logVerboseFunc: message => console.log(message),
      logInfoFunc: message => console.log(message),
      logErrorFunc: message => console.log(message),
    }).crawlProductCategories(createConfig());
  });
});

describe('syncProductCategoriesToStoreTags', () => {
  test('should sync product categories that have already been crawled into store tags', async () => {
    await new WarehouseWebCrawlerService({
      logVerboseFunc: message => console.log(message),
      logInfoFunc: message => console.log(message),
      logErrorFunc: message => console.log(message),
    }).syncProductCategoriesToStoreTags(createConfig());
  });
});

describe('crawlProducts', () => {
  test('should crawl products and save to database', async () => {
    await new WarehouseWebCrawlerService({
      logVerboseFunc: message => console.log(message),
      logInfoFunc: message => console.log(message),
      logErrorFunc: message => console.log(message),
    }).crawlProducts(createConfig());
  });
});

describe('crawlProductsDetails', () => {
  test('should crawl store master products details', async () => {
    await new WarehouseWebCrawlerService({
      logVerboseFunc: message => console.log(message),
      logInfoFunc: message => console.log(message),
      logErrorFunc: message => console.log(message),
    }).crawlProductsDetails(createConfig());
  });
});
