// @flow

import uuid from 'uuid/v4';

const trolleySmartParseServerCommon = jest.genMockFromModule('trolley-smart-parse-server-common');
let sessionInfo;

class CrawlSessionService {
  create = async () => uuid();
  read = async () => sessionInfo;
}

const setupCrawlSessionService = (arg) => {
  sessionInfo = arg;
};

trolleySmartParseServerCommon.setupCrawlSessionService = setupCrawlSessionService;
trolleySmartParseServerCommon.CrawlSessionService = CrawlSessionService;

module.exports = trolleySmartParseServerCommon;
