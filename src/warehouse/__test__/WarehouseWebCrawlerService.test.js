// @flow

import Chance from 'chance';
import { List, Map, Range } from 'immutable';
import uuid from 'uuid/v4';
import { WarehouseWebCrawlerService } from '../';

const StoreCrawlerServiceBase = require('../../common/StoreCrawlerServiceBase');

const createWarehouseWebCrawlerService = () => new WarehouseWebCrawlerService('countdown');
const chance = new Chance();

jest.mock('../../common/StoreCrawlerServiceBase');

const storeTags = Range(1, chance.integer({ min: 5, max: 20 }))
  .map(() => Map({ id: uuid() }))
  .toList();

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

describe('crawlAndSyncProductCategoriesToStoreTags', () => {
  it('should call getStoreTags three times for all three level product categories', async () => {
    await createWarehouseWebCrawlerService().crawlAndSyncProductCategoriesToStoreTags();

    const calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseMockTracker.getStoreTags.mock.calls;

    expect(calls.length).toBe(3);
    expect(calls[0][0]).toBe(false);
    expect(calls[1][0]).toBe(false);
    expect(calls[2][0]).toBe(false);
  });

  it('should call createOrUpdateLevelOneProductCategory', async () => {
    await createWarehouseWebCrawlerService().crawlAndSyncProductCategoriesToStoreTags();

    const calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseMockTracker.createOrUpdateLevelOneProductCategory.mock.calls;

    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][1]).toEqual(storeTags);
  });

  it('should call createOrUpdateLevelTwoProductCategory', async () => {
    await createWarehouseWebCrawlerService().crawlAndSyncProductCategoriesToStoreTags();

    const calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseMockTracker.createOrUpdateLevelTwoProductCategory.mock.calls;

    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][1]).toEqual(storeTags);
  });

  it('should call createOrUpdateLevelThreeProductCategory', async () => {
    await createWarehouseWebCrawlerService().crawlAndSyncProductCategoriesToStoreTags();

    const calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseMockTracker.createOrUpdateLevelThreeProductCategory.mock.calls;

    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][1]).toEqual(storeTags);
  });
});
