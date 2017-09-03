// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { CountdownWebCrawlerService } from '../';

const StoreCrawlerServiceBase = require('../../common/StoreCrawlerServiceBase');

const createCountdownWebCrawlerService = () => new CountdownWebCrawlerService('countdown');

const store = Map({ id: uuid() });
const storeTags = List.of(Map({ id: uuid(), url: 'https://shop.countdown.co.nz/Shop/Browse/baby-care/baby-formula' }));
const storeProducts = List.of(
  Map({
    id: uuid(),
    productPageUrl: 'https://shop.countdown.co.nz/Shop/ProductDetails?stockcode=473704&name=blackmores-follow-on-from-6-months-formula-stage-2',
  }),
  Map({ id: uuid(), productPageUrl: 'https://shop.countdown.co.nz/Shop/ProductDetails?stockcode=722127&name=abes-bagels-cinnamon-raisin-360g' }),
);

jest.mock('../../common/StoreCrawlerServiceBase');

beforeEach(() => {
  StoreCrawlerServiceBase.resetAllMockTrackers();
  StoreCrawlerServiceBase.setupStoreCrawlerServiceBase({
    config: Map({
      baseUrl: 'https://shop.countdown.co.nz',
      rateLimit: 1,
      maxConnections: 1,
      logLevel: 2,
      categoryKeysToExclude: List.of('restricted-items', 'christmas'),
    }),
    store,
    storeTags,
    storeProducts,
  });
});

describe('crawlProducts', () => {
  it('should crawl products for the provided store tags', async () => {});
});
