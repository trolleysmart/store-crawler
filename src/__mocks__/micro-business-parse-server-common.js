// @flow

import Config from './Config';
import ParseWrapperServiceFuncCallTrack from './ParseWrapperServiceFuncCallTrack';

const microBusinessParseServerCommon = jest.genMockFromModule('micro-business-parse-server-common');
let parseWrapperServiceFuncCallTrack;
let finalKeyValues;

class ParseWrapperService {
  static getConfig = async () => {
    if (parseWrapperServiceFuncCallTrack) {
      parseWrapperServiceFuncCallTrack.getConfig();
    }

    return new Config(finalKeyValues);
  };
}

const resetAllMockTrackers = () => {
  parseWrapperServiceFuncCallTrack = new ParseWrapperServiceFuncCallTrack();
};

const getAllMockTrackers = () => ({ parseWrapperServiceFuncCallTrack });

const setupParseWrapperServiceGetConfig = ({ keyValues } = {}) => {
  finalKeyValues = keyValues;
};

microBusinessParseServerCommon.resetAllMockTrackers = resetAllMockTrackers;
microBusinessParseServerCommon.getAllMockTrackers = getAllMockTrackers;

microBusinessParseServerCommon.ParseWrapperService = ParseWrapperService;
microBusinessParseServerCommon.setupParseWrapperServiceGetConfig = setupParseWrapperServiceGetConfig;

module.exports = microBusinessParseServerCommon;
