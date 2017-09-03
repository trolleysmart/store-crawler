// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { WarehouseWebCrawlerService } from '../';

const StoreCrawlerServiceBase = require('../../common/StoreCrawlerServiceBase');

const createWarehouseWebCrawlerService = () => new WarehouseWebCrawlerService('countdown');

jest.mock('../../common/StoreCrawlerServiceBase');

const storeTags = List.of(Map({ id: uuid(), url: 'http://www.thewarehouse.co.nz/c/food-pets-household/food-drink/hot-drinks' }));

beforeEach(() => {
  StoreCrawlerServiceBase.resetAllMockTrackers();
  StoreCrawlerServiceBase.setupStoreCrawlerServiceBase({
    config: Map({
      baseUrl: 'http://www.thewarehouse.co.nz/',
      rateLimit: 1,
      maxConnections: 1,
      logLevel: 2,
      categoryKeysToExclude: List.of('specials', 'electronicsgaming-apple', 'gifting-giftcards-faqs'),
    }),
    storeTags,
  });
});

describe('crawlProducts', () => {
  it('should crawl products for the provided store tags', async () => {});
});
