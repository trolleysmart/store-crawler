// @flow

import Config from './Config';

const microBusinessParseServerCommon = jest.genMockFromModule('micro-business-parse-server-common');
let keyValues;

class ParseWrapperService {
  static getConfig = async () => new Config(keyValues);
}

const setupParseWrapperServiceGetConfig = (arg) => {
  keyValues = arg;
};

microBusinessParseServerCommon.setupParseWrapperServiceGetConfig = setupParseWrapperServiceGetConfig;
microBusinessParseServerCommon.ParseWrapperService = ParseWrapperService;

module.exports = microBusinessParseServerCommon;
