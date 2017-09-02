// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { StoreCrawlerServiceBase } from '../';

const MicroBusinessParseServerCommon = require('micro-business-parse-server-common');
const TrolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

const createNewStoreCrawlerServiceBase = () => new StoreCrawlerServiceBase('countdown');
const keyValues = Map({ countdown: Map({ val1: uuid(), val2: uuid() }) });
const storeInfos = List.of(Map({ id: uuid(), val: uuid() }), Map({ id: uuid(), val: uuid() }));

beforeEach(() => {
  MicroBusinessParseServerCommon.resetAllMockTrackers();
  TrolleySmartParseServerCommon.resetAllMockTrackers();
  MicroBusinessParseServerCommon.setupParseWrapperServiceGetConfig({ keyValues });
});

describe('getConfig', () => {
  it('should return the config matches the key', async () => {
    expect(createNewStoreCrawlerServiceBase().getConfig()).resolves.toEqual(keyValues.get('countdown'));
    expect(MicroBusinessParseServerCommon.getAllMockTrackers().parseWrapperServiceMockTracker.getConfig.mock.calls.length).toBe(1);
  });

  it('should throw exception if provided key does not exist', async () => {
    expect(new StoreCrawlerServiceBase('unknow').getConfig()).rejects.toBeDefined();
    expect(MicroBusinessParseServerCommon.getAllMockTrackers().parseWrapperServiceMockTracker.getConfig.mock.calls.length).toBe(1);
  });
});

describe('getStore', () => {
  it('should create new store if provided store deos not exist', async () => {
    TrolleySmartParseServerCommon.setupStoreService({ storeInfo: storeInfos.first(), storeInfos: List() });
    expect(createNewStoreCrawlerServiceBase().getStore()).resolves.toEqual(storeInfos.first());
  });

  it('should return the store info if provided store exist', async () => {
    TrolleySmartParseServerCommon.setupStoreService({ storeInfos: storeInfos.take(1) });
    expect(createNewStoreCrawlerServiceBase().getStore()).resolves.toEqual(storeInfos.first());
  });

  it('should throw exception if multiple store found with the provided store name', async () => {
    TrolleySmartParseServerCommon.setupStoreService({ storeInfos });
    expect(createNewStoreCrawlerServiceBase().getStore()).rejects.toBeDefined();
  });
});
