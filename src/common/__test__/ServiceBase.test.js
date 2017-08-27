// @flow

import { Map } from 'immutable';
import uuid from 'uuid/v4';
import { ServiceBase } from '../';

const MicroBusinessParseServerCommon = require('micro-business-parse-server-common');

describe('getConfig', () => {
  const keyValues = Map({ key: Map({ val1: uuid(), val2: uuid() }) });

  beforeEach(() => {
    MicroBusinessParseServerCommon.setupParseWrapperServiceGetConfig(keyValues);
  });

  it('should return the config matches the key', async () => {
    expect(new ServiceBase().getConfig('key')).resolves.toEqual(keyValues.get('key'));
  });

  it('should throw exception if provided key does not exist', async () => {
    expect(new ServiceBase().getConfig('unknown')).rejects.toBeDefined();
  });
});
