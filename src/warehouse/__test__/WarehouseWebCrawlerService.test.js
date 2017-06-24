// @flow

import Immutable from 'immutable';
import '../../../bootstrap';
import WarehouseWebCrawlerService from '../WarehouseWebCrawlerService';

describe('crawlProductCategories', () => {
  test('should crawl all product categories', async () => {
    const config = Immutable.fromJS({
      baseUrl: 'http://www.thewarehouse.co.nz/',
      rateLimit: 2000,
      maxConnections: 1,
    });

    await new WarehouseWebCrawlerService({}).crawlProductCategories(config);
  });
});
