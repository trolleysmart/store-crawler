// @flow

import Config from './Config';
import ParseWrapperServiceMockTrackerk from './ParseWrapperServiceMockTracker';

const microBusinessParseServerCommon = jest.genMockFromModule('@microbusiness/parse-server-common');
let parseWrapperServiceMockTracker;
let finalKeyValues;

class ParseWrapperService {
  static getConfig = async () => {
    if (parseWrapperServiceMockTracker) {
      parseWrapperServiceMockTracker.getConfig();
    }

    return new Config(finalKeyValues);
  };
}

const resetAllMockTrackers = () => {
  parseWrapperServiceMockTracker = new ParseWrapperServiceMockTrackerk();
};

const getAllMockTrackers = () => ({ parseWrapperServiceMockTracker });

const setupParseWrapperServiceGetConfig = ({ keyValues } = {}) => {
  finalKeyValues = keyValues;
};

microBusinessParseServerCommon.resetAllMockTrackers = resetAllMockTrackers;
microBusinessParseServerCommon.getAllMockTrackers = getAllMockTrackers;

microBusinessParseServerCommon.ParseWrapperService = ParseWrapperService;
microBusinessParseServerCommon.setupParseWrapperServiceGetConfig = setupParseWrapperServiceGetConfig;

module.exports = microBusinessParseServerCommon;
