// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { WarehouseWebCrawlerService } from '../';

const StoreCrawlerServiceBase = require('../../common/StoreCrawlerServiceBase');

const createWarehouseWebCrawlerService = () => new WarehouseWebCrawlerService('countdown');

jest.mock('../../common/StoreCrawlerServiceBase');

const store = Map({ id: uuid() });
const storeTags = List.of(Map({ id: uuid(), url: 'http://www.thewarehouse.co.nz/c/food-pets-household/food-drink/hot-drinks' }));
const storeProducts = List.of(
  Map({ id: uuid(), productPageUrl: 'http://www.thewarehouse.co.nz/p/coca-cola-can-mixed-tray-355ml-24-pack-new/R2177577.html' }),
  Map({ id: uuid(), productPageUrl: 'http://www.thewarehouse.co.nz/p/pure-nz-spring-water-600ml-24-pack-blue/R2177571.html' }),
);

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
    store,
    storeTags,
    storeProducts,
  });
});

describe('crawlProducts', () => {
  it('should crawl products for the provided store tags', async () => {});
});
