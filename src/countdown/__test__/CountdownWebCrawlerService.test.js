// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { CountdownWebCrawlerService } from '../';

const StoreCrawlerServiceBase = require('../../common/StoreCrawlerServiceBase');

const createCountdownWebCrawlerService = () => new CountdownWebCrawlerService('countdown');

const storeTags = List.of(Map({ id: uuid(), url: 'https://shop.countdown.co.nz/Shop/Browse/baby-care/baby-formula' }));

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
    storeTags,
  });
});

describe('crawlProducts', () => {
  it('should crawl products for the provided store tags', async () => {});
});
