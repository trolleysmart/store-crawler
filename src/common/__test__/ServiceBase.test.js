// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { ServiceBase } from '../';

const MicroBusinessParseServerCommon = require('micro-business-parse-server-common');
const TrolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

const createNewServiceBase = () => new ServiceBase('countdown');
const keyValues = Map({ countdown: Map({ val1: uuid(), val2: uuid() }) });
const crawlSessionInfos = List.of(Map({ id: uuid(), val: uuid() }), Map({ id: uuid(), val: uuid() }));
const storeInfos = List.of(Map({ id: uuid(), val: uuid() }), Map({ id: uuid(), val: uuid() }));

beforeEach(() => {
  MicroBusinessParseServerCommon.resetAllMockTracks();
  TrolleySmartParseServerCommon.resetAllMockTracks();
  MicroBusinessParseServerCommon.setupParseWrapperServiceGetConfig({ keyValues });
});

describe('getConfig', () => {
  it('should return the config matches the key', async () => {
    expect(createNewServiceBase().getConfig()).resolves.toEqual(keyValues.get('countdown'));
  });

  it('should throw exception if provided key does not exist', async () => {
    expect(new ServiceBase('unknow').getConfig()).rejects.toBeDefined();
  });
});

describe('createNewCrawlSession', () => {
  beforeEach(() => {
    TrolleySmartParseServerCommon.setupCrawlSessionService({ crawlSessionInfo: crawlSessionInfos.first() });
  });

  it('should create new crawl session and return the session info', async () => {
    expect(createNewServiceBase().createNewCrawlSession('sessionKey')).resolves.toEqual(crawlSessionInfos.first());
  });
});

describe('getStore', () => {
  it('should create new store if provided store deos not exist', async () => {
    TrolleySmartParseServerCommon.setupStoreService({ storeInfo: storeInfos.first(), storeInfos: List() });
    expect(createNewServiceBase().getStore()).resolves.toEqual(storeInfos.first());
  });

  it('should return the store info if provided store exist', async () => {
    TrolleySmartParseServerCommon.setupStoreService({ storeInfos: storeInfos.take(1) });
    expect(createNewServiceBase().getStore()).resolves.toEqual(storeInfos.first());
  });

  it('should throw exception if multiple store found with the provided store name', async () => {
    TrolleySmartParseServerCommon.setupStoreService({ storeInfos });
    expect(createNewServiceBase().getStore()).rejects.toBeDefined();
  });
});

describe('getMostRecentCrawlSessionInfo', () => {
  it('should return the top most crawl session info', async () => {
    TrolleySmartParseServerCommon.setupCrawlSessionService({ crawlSessionInfos: crawlSessionInfos.take(1) });
    expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).resolves.toEqual(crawlSessionInfos.first());
  });

  it('should throw exception if multiple crawl session info returned', async () => {
    TrolleySmartParseServerCommon.setupCrawlSessionService({ crawlSessionInfos });
    expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).rejects.toBeDefined();
  });

  it('should throw exception if no crawl session found', async () => {
    TrolleySmartParseServerCommon.setupCrawlSessionService({ crawlSessionInfos: List() });
    expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).rejects.toBeDefined();
  });
});
