'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _microBusinessParseServerCommon = require('micro-business-parse-server-common');

var _smartGroceryParseServerCommon = require('smart-grocery-parse-server-common');

var _common = require('../common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WarehouseWebCrawlerService = function (_ServiceBase) {
  _inherits(WarehouseWebCrawlerService, _ServiceBase);

  function WarehouseWebCrawlerService() {
    var _ref,
        _this2 = this;

    var _temp, _this, _ret;

    _classCallCheck(this, WarehouseWebCrawlerService);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = WarehouseWebCrawlerService.__proto__ || Object.getPrototypeOf(WarehouseWebCrawlerService)).call.apply(_ref, [this].concat(args))), _this), _this.crawlLevelOneProductCategoriesAndSubProductCategories = function (config, $) {
      var self = _this;
      var productCategories = (0, _immutable.Set)();

      $('.menu-container .level-1 .menu-category').filter(function filterMenuItems() {
        $(this).children().each(function onEachMenuItem() {
          var menuItem = $(this);

          productCategories = productCategories.add((0, _immutable.Map)({
            categoryKey: menuItem.attr('class'),
            url: menuItem.find('.level-1').attr('href'),
            description: menuItem.find('.level-1').text().trim(),
            weight: 1,
            subCategories: self.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem)
          }));
        });
      });

      return productCategories;
    }, _this.crawlLevelTwoProductCategoriesAndSubProductCategories = function (config, $, parentNode) {
      var self = _this;
      var productCategories = (0, _immutable.Set)();

      parentNode.find('.menu-navigation .menu-container-level-2 .inner').filter(function filterMenuItems() {
        $(this).children().each(function onEachMenuItem() {
          var menuItem = $(this).find('.category-column .parent-has-child .category-level-2');

          productCategories = productCategories.add((0, _immutable.Map)({
            categoryKey: menuItem.attr('data-gtm-cgid'),
            url: menuItem.attr('href'),
            description: menuItem.text().trim(),
            weight: 2,
            subCategories: self.crawlLevelThreeProductCategoriesAndSubProductCategories(config, $, $(this).find('.category-column .parent-has-child'))
          }));
        });
      });

      return productCategories;
    }, _this.crawlLevelThreeProductCategoriesAndSubProductCategories = function (config, $, parentNode) {
      var productCategories = (0, _immutable.Set)();

      parentNode.find('.menu-container-level-3').filter(function filterMenuItems() {
        $(this).children().each(function onEachMenuItem() {
          var menuItem = $(this).find('.category-level-3');

          productCategories = productCategories.add((0, _immutable.Map)({
            categoryKey: menuItem.attr('data-gtm-cgid'),
            url: menuItem.attr('href'),
            description: menuItem.text().trim(),
            weight: 3
          }));
        });
      });

      return productCategories;
    }, _this.crawlProductCategories = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(config) {
        var result, sessionInfo, finalConfig, updatedSessionInfo, errorMessage, _updatedSessionInfo;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.createNewCrawlSessionAndGetStoreCrawlerConfig('Warehouse Product Categories', config, 'Warehouse');

              case 2:
                result = _context.sent;
                sessionInfo = result.get('sessionInfo');
                finalConfig = result.get('config');
                _context.prev = 5;

                _this.logInfo(finalConfig, function () {
                  return 'Start fetching product categories...';
                });

                _context.next = 9;
                return _this.crawlAllProductCategories(sessionInfo.get('id'), finalConfig);

              case 9:

                _this.logInfo(finalConfig, function () {
                  return 'Crawling product categories successfully completed.';
                });

                updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'success'
                  })
                }));
                _context.next = 13;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

              case 13:
                _context.next = 22;
                break;

              case 15:
                _context.prev = 15;
                _context.t0 = _context['catch'](5);
                errorMessage = _context.t0 instanceof _microBusinessParseServerCommon.Exception ? _context.t0.getErrorMessage() : _context.t0;
                _updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'failed',
                    error: errorMessage
                  })
                }));
                _context.next = 21;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo);

              case 21:
                throw _context.t0;

              case 22:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2, [[5, 15]]);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }(), _this.crawlAllProductCategories = function (sessionId, config) {
      return new Promise(function (resolve, reject) {
        var crawler = new _crawler2.default({
          rateLimit: config.get('rateLimit'),
          maxConnections: config.get('maxConnections'),
          callback: function callback(error, res, done) {
            _this.logInfo(config, function () {
              return 'Received response for: ' + res.request.uri.href;
            });
            _this.logVerbose(config, function () {
              return 'Received response for: ' + JSON.stringify(res);
            });

            if (error) {
              done();
              reject('Failed to receive high level product categories for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var productCategories = _this.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);

            var crawlResult = (0, _immutable.Map)({
              crawlSessionId: sessionId,
              resultSet: (0, _immutable.Map)({
                productCategories: productCategories
              })
            });

            _smartGroceryParseServerCommon.CrawlResultService.create(crawlResult).then(function () {
              _this.logInfo(config, function () {
                return 'Successfully added products for: ' + productCategories + '.';
              });

              done();
            }).catch(function (err) {
              _this.logError(config, function () {
                return 'Failed to save products for: ' + productCategories + '. Error: ' + JSON.stringify(err);
              });

              done();
              reject('Failed to save products for: ' + productCategories + '. Error: ' + JSON.stringify(err));
            });

            done();
          }
        });

        crawler.on('drain', function () {
          resolve();
        });

        crawler.queue(config.get('baseUrl'));
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  return WarehouseWebCrawlerService;
}(_common.ServiceBase);

exports.default = WarehouseWebCrawlerService;