// @flow

import Config from './Config';

const microBusinessParseServerCommon = jest.genMockFromModule('micro-business-parse-server-common');
let finalKeyValues;

class ParseWrapperService {
  static getConfig = async () => new Config(finalKeyValues);
}

const setupParseWrapperServiceGetConfig = ({ keyValues } = {}) => {
  finalKeyValues = keyValues;
};

microBusinessParseServerCommon.setupParseWrapperServiceGetConfig = setupParseWrapperServiceGetConfig;
microBusinessParseServerCommon.ParseWrapperService = ParseWrapperService;

module.exports = microBusinessParseServerCommon;
