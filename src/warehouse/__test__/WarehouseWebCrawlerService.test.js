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
  test('should crawl all product categories', async () => {
    await new WarehouseWebCrawlerService({
      logVerboseFunc: message => console.log(message),
      logInfoFunc: message => console.log(message),
      logErrorFunc: message => console.log(message),
    }).crawlProductCategories(createConfig());
  });
});

describe('syncProductCategoriesToStoreTags', () => {
  test('should sync tags to store tag table', async () => {
    await new WarehouseWebCrawlerService({
      logVerboseFunc: message => console.log(message),
      logInfoFunc: message => console.log(message),
      logErrorFunc: message => console.log(message),
    }).syncProductCategoriesToStoreTags(createConfig());
  });
});

describe('crawlProducts', () => {
  test('should crawl all products', async () => {
    await new WarehouseWebCrawlerService({
      logVerboseFunc: message => console.log(message),
      logInfoFunc: message => console.log(message),
      logErrorFunc: message => console.log(message),
    }).crawlProducts(createConfig());
  });
});
