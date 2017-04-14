'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CountdownWebCrawlerService = function () {
  function CountdownWebCrawlerService() {
    _classCallCheck(this, CountdownWebCrawlerService);
  }

  _createClass(CountdownWebCrawlerService, [{
    key: 'constrcutor',
    value: function constrcutor(logError, logInfo) {
      this.logError = logError;
      this.logInfo = logInfo;

      this.logErrorMessage = this.logErrorMessage.bind(this);
      this.logInfoMessage = this.logInfoMessage.bind(this);
      this.crawlProductCategoriesPagingInfo = this.crawlProductCategoriesPagingInfo.bind(this);
    }
  }, {
    key: 'logErrorMessage',
    value: function logErrorMessage(message) {
      if (this.logError) {
        this.logError(message);
      }
    }
  }, {
    key: 'logInfoMessage',
    value: function logInfoMessage(message) {
      if (this.logInfo) {
        this.logInfo(message);
      }
    }
  }, {
    key: 'crawlProductCategoriesPagingInfo',
    value: function crawlProductCategoriesPagingInfo(config) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var productsCategoriesPagingInfo = (0, _immutable.List)();

        var crawler = new _crawler2.default({
          rateLimit: config.rateLimit,
          maxConnections: config.maxConnections,
          callback: function callback(error, res, done) {
            _this.logInfoMessage('Received page information response for Url: ' + res.request.uri.href);

            if (error) {
              _this.logErrorMessage('Failed to receive page information for Url: ' + res.request.uri.href + ' - Error: ' + error);
              done();
              reject(error);

              return;
            }

            var totalPageNumber = parseInt(res.$('.paging-container .paging .page-number').last().text(), 10);

            if (!totalPageNumber) {
              _this.logErrorMessage('Failed to receive page information for Url: ' + res.request.uri.href);
              done();
              reject(error);

              return;
            }

            productsCategoriesPagingInfo = productsCategoriesPagingInfo.push((0, _immutable.Map)({
              productCategory: res.request.uri.href.replace(config.baseUrl, ''),
              totalPageNumber: totalPageNumber
            }));

            done();
          }
        });

        crawler.on('drain', function () {
          _this.logInfoMessage('Finished fetching pages inforamtion.');
          resolve((0, _immutable.Map)({
            config: config,
            productsCategoriesPagingInfo: productsCategoriesPagingInfo
          }));
        });

        config.productCategories.forEach(function (productCategory) {
          return crawler.queue(config.baseUrl + productCategory);
        });
      });
    }
  }]);

  return CountdownWebCrawlerService;
}();

exports.default = CountdownWebCrawlerService;