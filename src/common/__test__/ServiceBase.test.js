// @flow

import { List, Map } from 'immutable';
import uuid from 'uuid/v4';
import { ServiceBase } from '../';

const MicroBusinessParseServerCommon = require('micro-business-parse-server-common');
const TrolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

const keyValues = Map({ countdown: Map({ val1: uuid(), val2: uuid() }) });
const sessionInfo = Map({ val1: uuid(), val2: uuid() });
const storeInfos = List.of(Map({ val1: uuid(), val2: uuid() }), Map({ val1: uuid(), val2: uuid() }));
const serviceBase = new ServiceBase('countdown');

beforeEach(() => {
  MicroBusinessParseServerCommon.setupParseWrapperServiceGetConfig(keyValues);
  TrolleySmartParseServerCommon.setupCrawlSessionService(sessionInfo);
});

describe('getConfig', () => {
  it('should return the config matches the key', async () => {
    expect(serviceBase.getConfig()).resolves.toEqual(keyValues.get('countdown'));
  });

  it('should throw exception if provided key does not exist', async () => {
    expect(new ServiceBase('unknow').getConfig()).rejects.toBeDefined();
  });
});

describe('createNewCrawlSession', () => {
  it('should create new crawl session and return the session info', async () => {
    expect(serviceBase.createNewCrawlSession('sessionKey')).resolves.toEqual(sessionInfo);
  });
});

describe('getStore', () => {
  it('should create new store if provided store deos not exist', async () => {
    TrolleySmartParseServerCommon.setupStoreService(storeInfos.first(), List());
    expect(serviceBase.getStore()).resolves.toEqual(storeInfos.first());
  });

  it('should return the store info if provided store exist', async () => {
    TrolleySmartParseServerCommon.setupStoreService(null, storeInfos.take(1));
    expect(serviceBase.getStore()).resolves.toEqual(storeInfos.first());
  });

  it('should throw exception if multiple store found with the provided store name', async () => {
    TrolleySmartParseServerCommon.setupStoreService(null, storeInfos);
    expect(serviceBase.getStore()).rejects.toBeDefined();
  });
});
