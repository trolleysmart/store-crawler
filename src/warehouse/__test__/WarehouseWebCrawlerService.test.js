// @flow

import Immutable, { List } from 'immutable';
import '../../../bootstrap';
import WarehouseWebCrawlerService from '../WarehouseWebCrawlerService';

const createConfig = () =>
  Immutable.fromJS({
    baseUrl: 'http://www.thewarehouse.co.nz/',
    rateLimit: 2000,
    maxConnections: 1,
    categoryKeysToExclude: List.of('specials', 'electronicsgaming-apple'),
  });

describe('crawlProductCategories', () => {
  test('should crawl all product categories', async () => {
    await new WarehouseWebCrawlerService({}).crawlProductCategories(createConfig());
  });
});

describe('syncProductCategoriesToStoreTags', () => {
  test('should sync tags to store tag table', async () => {
    await new WarehouseWebCrawlerService({}).syncProductCategoriesToStoreTags(createConfig());
  });
});

describe('crawlProducts', () => {
  test('should crawl all products', async () => {
    await new WarehouseWebCrawlerService({}).crawlProducts(createConfig());
  });
});
