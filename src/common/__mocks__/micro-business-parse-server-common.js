// @flow

import Config from './Config';
import ParseWrapperServiceFuncCallTrack from './ParseWrapperServiceFuncCallTrack';

const microBusinessParseServerCommon = jest.genMockFromModule('micro-business-parse-server-common');
let parseWrapperServiceFuncCallTrack;
let finalKeyValues;

class ParseWrapperService {
  static getConfig = async () => {
    parseWrapperServiceFuncCallTrack.getConfig();

    return new Config(finalKeyValues);
  };
}

const resetAllMockTracks = () => {
  parseWrapperServiceFuncCallTrack = new ParseWrapperServiceFuncCallTrack();
};

const setupParseWrapperServiceGetConfig = ({ keyValues } = {}) => {
  finalKeyValues = keyValues;
};

microBusinessParseServerCommon.resetAllMockTracks = resetAllMockTracks;

microBusinessParseServerCommon.ParseWrapperService = ParseWrapperService;
microBusinessParseServerCommon.parseWrapperServiceFuncCallTrack = parseWrapperServiceFuncCallTrack;
microBusinessParseServerCommon.setupParseWrapperServiceGetConfig = setupParseWrapperServiceGetConfig;

module.exports = microBusinessParseServerCommon;
