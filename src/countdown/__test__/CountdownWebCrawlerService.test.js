// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { CountdownWebCrawlerService } from '../';

const StoreCrawlerServiceBase = require('../../common/StoreCrawlerServiceBase');

const createCountdownWebCrawlerService = () => new CountdownWebCrawlerService('countdown');

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
    sessionInfo: Map({ id: uuid() }),
  });
});

describe('crawlAndSyncProductCategoriesToStoreTags', () => {
  it('should call getStoreTags three times for all three level product categories', async () => {});

  it('should call createOrUpdateLevelOneProductCategory', async () => {});

  it('should call createOrUpdateLevelTwoProductCategory', async () => {});

  it('should call createOrUpdateLevelThreeProductCategory', async () => {});
});
