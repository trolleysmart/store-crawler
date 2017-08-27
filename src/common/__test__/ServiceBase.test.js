// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { ServiceBase } from '../';

const MicroBusinessParseServerCommon = require('micro-business-parse-server-common');
const TrolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

const createNewServiceBase = () => new ServiceBase('countdown');
const keyValues = Map({ countdown: Map({ val1: uuid(), val2: uuid() }) });
const sessionInfos = List.of(Map({ val1: uuid(), val2: uuid() }), Map({ val1: uuid(), val2: uuid() }));
const storeInfos = List.of(Map({ val1: uuid(), val2: uuid() }), Map({ val1: uuid(), val2: uuid() }));

beforeEach(() => {
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
    TrolleySmartParseServerCommon.setupCrawlSessionService({ sessionInfo: sessionInfos.first() });
  });

  it('should create new crawl session and return the session info', async () => {
    expect(createNewServiceBase().createNewCrawlSession('sessionKey')).resolves.toEqual(sessionInfos.first());
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
    TrolleySmartParseServerCommon.setupCrawlSessionService({ sessionInfos: sessionInfos.take(1) });
    expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).resolves.toEqual(sessionInfos.first());
  });

  it('should throw exception if multiple crawl session info returned', async () => {
    TrolleySmartParseServerCommon.setupCrawlSessionService({ sessionInfos });
    expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).rejects.toBeDefined();
  });

  it('should throw exception if no crawl session found', async () => {
    TrolleySmartParseServerCommon.setupCrawlSessionService({ sessionInfos: List() });
    expect(createNewServiceBase().getMostRecentCrawlSessionInfo('sessionKey')).rejects.toBeDefined();
  });
});
