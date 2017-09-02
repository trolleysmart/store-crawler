'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var StoreCrawlerServiceBaseFuncsCallTrack = function StoreCrawlerServiceBaseFuncsCallTrack() {
  _classCallCheck(this, StoreCrawlerServiceBaseFuncsCallTrack);

  this.getConfig = jest.fn();
  this.createNewCrawlSession = jest.fn();
  this.updateExistingCrawlSession = jest.fn();
  this.createNewCrawlResult = jest.fn();
};

exports.default = StoreCrawlerServiceBaseFuncsCallTrack;
