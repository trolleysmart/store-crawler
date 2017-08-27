// @flow

import { Map } from 'immutable';
import uuid from 'uuid/v4';
import { ServiceBase } from '../';

const MicroBusinessParseServerCommon = require('micro-business-parse-server-common');

describe('getConfig', () => {
  const keyValues = Map({ countdown: Map({ val1: uuid(), val2: uuid() }) });

  beforeEach(() => {
    MicroBusinessParseServerCommon.setupParseWrapperServiceGetConfig(keyValues);
  });

  it('should return the config matches the key', async () => {
    expect(new ServiceBase('countdown').getConfig()).resolves.toEqual(keyValues.get('countdown'));
  });

  it('should throw exception if provided key does not exist', async () => {
    expect(new ServiceBase('unknow').getConfig()).rejects.toBeDefined();
  });
});
