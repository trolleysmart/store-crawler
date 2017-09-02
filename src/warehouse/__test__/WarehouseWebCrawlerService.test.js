// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { WarehouseWebCrawlerService } from '../';

const StoreCrawlerServiceBase = require('../../common/StoreCrawlerServiceBase');

const createWarehouseWebCrawlerService = () => new WarehouseWebCrawlerService('countdown');

jest.mock('../../common/StoreCrawlerServiceBase');

const sessionInfo = Map({ id: uuid() });

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
    sessionInfo,
  });
});

describe('crawlProductCategories', () => {
  it('should call createNewCrawlSession', async () => {
    await createWarehouseWebCrawlerService().crawlProductCategories();

    const calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseFuncsCallTrack.createNewCrawlSession.mock.calls;

    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe('Warehouse Product Categories');
  });

  it('should create crawl result', async () => {
    await createWarehouseWebCrawlerService().crawlProductCategories();

    const calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseFuncsCallTrack.createNewCrawlResult.mock.calls;

    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBeTruthy();
    expect(calls[0][1]).toBeTruthy();
  });

  it('should update crawl session', async () => {
    await createWarehouseWebCrawlerService().crawlProductCategories();

    const calls = StoreCrawlerServiceBase.getAllMockTrackers().storeCrawlerServiceBaseFuncsCallTrack.updateExistingCrawlSession.mock.calls;

    expect(calls.length).toBe(1);
    expect(calls[0][0].get('id')).toBe(sessionInfo.get('id'));
    expect(calls[0][0].has('endDateTime')).toBeTruthy();
    expect(calls[0][0].getIn(['additionalInfo', 'status'])).toBe('success');
  });
});
