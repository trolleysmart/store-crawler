'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _trolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

var _2 = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Health2000WebCrawlerService = function (_StoreCrawlerServiceB) {
  _inherits(Health2000WebCrawlerService, _StoreCrawlerServiceB);

  function Health2000WebCrawlerService(context) {
    var _this2 = this;

    _classCallCheck(this, Health2000WebCrawlerService);

    var _this = _possibleConstructorReturn(this, (Health2000WebCrawlerService.__proto__ || Object.getPrototypeOf(Health2000WebCrawlerService)).call(this, 'health2000', context));

    _this.crawlAllProductCategories = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      var config, productCategories;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this.getConfig();

            case 2:
              config = _context.sent;
              productCategories = void 0;
              return _context.abrupt('return', new Promise(function (resolve) {
                var crawler = new _crawler2.default({
                  rateLimit: config.get('rateLimit'),
                  maxConnections: config.get('maxConnections'),
                  callback: function callback(error, res, done) {
                    _this.logInfo(function () {
                      return 'Received response for: ' + _2.StoreCrawlerServiceBase.safeGetUri(res);
                    });
                    _this.logVerbose(function () {
                      return 'Received response for: ' + JSON.stringify(res);
                    });

                    if (error) {
                      done();
                      _this.logError(function () {
                        return 'Failed to receive product categories for Url: ' + _2.StoreCrawlerServiceBase.safeGetUri(res) + ' - Error: ' + JSON.stringify(error);
                      });

                      return;
                    }

                    productCategories = _this.crawlLevelOneProductCategories(config, res.$);
                    done();
                  }
                });

                crawler.on('drain', function () {
                  return resolve(productCategories);
                });
                crawler.queue(config.get('baseUrl') + '/maincategory');
              }));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this2);
    }));

    _this.crawlLevelOneProductCategories = function (config, $) {
      var productCategories = (0, _immutable.Set)();

      $('.container .row .categoryNavigation .nav-stacked li a').each(function onEachNavigationLink() {
        var navItem = $(this);
        var name = navItem.text().trim();
        var url = config.get('baseUrl') + navItem.attr('href');
        var categoryKey = url.substring(url.lastIndexOf('/') + 1);

        if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
          return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
        })) {
          return 0;
        }

        productCategories = productCategories.add((0, _immutable.Map)({
          categoryKey: categoryKey,
          url: url,
          name: name,
          level: 1,
          subCategories: (0, _immutable.List)()
        }));

        return 0;
      });

      return productCategories;
    };

    _this.crawlStoreTagsTotalItemsInfo = function (storeTags) {
      return storeTags;
    };

    _this.crawlProductsForEachStoreTag = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(storeTags) {
        var config;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _this.getConfig();

              case 2:
                config = _context2.sent;
                return _context2.abrupt('return', new Promise(function (resolve) {
                  var crawler = new _crawler2.default({
                    rateLimit: config.get('rateLimit'),
                    maxConnections: config.get('maxConnections'),
                    callback: function callback(error, res, done) {
                      _this.logInfo(function () {
                        return 'Received response for: ' + _2.StoreCrawlerServiceBase.safeGetUri(res);
                      });
                      _this.logVerbose(function () {
                        return 'Received response for: ' + JSON.stringify(res);
                      });

                      if (error) {
                        done();
                        _this.logError(function () {
                          return 'Failed to receive product category page info for Url: ' + _2.StoreCrawlerServiceBase.safeGetUri(res) + ' - Error: ' + JSON.stringify(error);
                        });

                        return;
                      }
                      var url = _2.StoreCrawlerServiceBase.safeGetUri(res);
                      var productCategory = storeTags.find(function (_) {
                        return _.get('url').localeCompare(url) === 0;
                      });

                      if (!productCategory) {
                        done();
                        _this.logError(function () {
                          return 'Failed to find product category page info for Url: ' + url;
                        });

                        return;
                      }

                      var $ = res.$;

                      var productInfos = (0, _immutable.List)();

                      $('.js-productContent .row .productTitle a').each(function onEachNavigationLink() {
                        var productTitle = $(this);
                        var productPageUrl = '' + config.get('baseUrl') + productTitle.attr('href');

                        productInfos = productInfos.push((0, _immutable.Map)({ productPageUrl: productPageUrl, productKey: productPageUrl.substring(productPageUrl.lastIndexOf('/') + 1) }));

                        return 0;
                      });

                      Promise.all(productInfos.filter(function (productInfo) {
                        return productInfo.get('productPageUrl');
                      }).groupBy(function (productInfo) {
                        return productInfo.get('productKey');
                      }).map(function (_) {
                        return _.first();
                      }).valueSeq().map(function (productInfo) {
                        return _this.createOrUpdateStoreProductForHealth2000(productInfo, false);
                      })).then(function () {
                        return done();
                      }).catch(function (storeProductUpdateError) {
                        done();
                        _this.logError(function () {
                          return storeProductUpdateError;
                        });
                      });
                    }
                  });

                  crawler.on('drain', function () {
                    return resolve();
                  });
                  storeTags.forEach(function (productCategory) {
                    return crawler.queue(productCategory.get('url'));
                  });
                }));

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }();

    _this.createOrUpdateStoreProductForHealth2000 = function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(productInfo, authorizedToDisplay) {
        var storeId, service, storeProducts;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _this.getStoreId();

              case 2:
                storeId = _context3.sent;
                service = new _trolleySmartParseServerCommon.StoreProductService();
                _context3.next = 6;
                return service.search((0, _immutable.Map)({
                  conditions: (0, _immutable.Map)({
                    endsWith_productPageUrl: productInfo.get('productKey'),
                    storeId: storeId
                  })
                }), _this.sessionToken);

              case 6:
                storeProducts = _context3.sent;

                if (!storeProducts.isEmpty()) {
                  _context3.next = 12;
                  break;
                }

                _context3.next = 10;
                return service.create(productInfo.merge((0, _immutable.Map)({
                  storeId: storeId,
                  createdByCrawler: true,
                  authorizedToDisplay: authorizedToDisplay
                })), null, _this.sessionToken);

              case 10:
                _context3.next = 15;
                break;

              case 12:
                if (!(storeProducts.count() === 1)) {
                  _context3.next = 15;
                  break;
                }

                _context3.next = 15;
                return service.update(storeProducts.first().merge(productInfo).set('createdByCrawler', true).set('authorizedToDisplay', authorizedToDisplay), _this.sessionToken);

              case 15:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function (_x2, _x3) {
        return _ref3.apply(this, arguments);
      };
    }();

    _this.crawlProductDetails = function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(product, storeTags) {
        var config;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _this.getConfig();

              case 2:
                config = _context4.sent;
                return _context4.abrupt('return', new Promise(function (resolve) {
                  var productInfo = (0, _immutable.Map)();

                  var crawler = new _crawler2.default({
                    rateLimit: config.get('rateLimit'),
                    maxConnections: config.get('maxConnections'),
                    callback: function callback(error, res, done) {
                      _this.logInfo(function () {
                        return 'Received response for: ' + _2.StoreCrawlerServiceBase.safeGetUri(res);
                      });
                      _this.logVerbose(function () {
                        return 'Received response for: ' + JSON.stringify(res);
                      });

                      if (error) {
                        done();
                        _this.logError(function () {
                          return 'Failed to receive product categories for Url: ' + _2.StoreCrawlerServiceBase.safeGetUri(res) + ' - Error: ' + JSON.stringify(error);
                        });

                        return;
                      }

                      var $ = res.$;

                      var tagUrls = (0, _immutable.List)();

                      $('.breadcrumb li a').each(function filterTags() {
                        var tag = $(this);

                        tagUrls = tagUrls.push(tag.attr('href'));

                        return 0;
                      });

                      tagUrls = tagUrls.skip(1).take(1).map(function (tagUrl) {
                        return config.get('baseUrl') + tagUrl;
                      });

                      productInfo = productInfo.merge({ tagUrls: tagUrls });

                      $('#ProductDisplay .js-productDetail').filter(function filterProductDetails() {
                        var productDetails = $(this);

                        productDetails.find('.productDetail .productTitle').filter(function filterName() {
                          productInfo = productInfo.merge((0, _immutable.Map)({
                            name: $(this).text().trim()
                          }));

                          return 0;
                        });

                        productDetails.find('.productAccordion .m0-sm').filter(function filterDescription() {
                          productInfo = productInfo.merge((0, _immutable.Map)({
                            description: $(this).text().trim()
                          }));

                          return 0;
                        });

                        productDetails.find('.productImages .mainImage .productMainImage img').filter(function filterMainImage() {
                          productInfo = productInfo.merge((0, _immutable.Map)({ imageUrl: config.get('baseUrl') + $(this).attr('src') }));

                          return 0;
                        });

                        productDetails.find('.productDetail .js-price').filter(function filterPrice() {
                          $(this).find('.was').filter(function filterWasPrice() {
                            var priceStr = $(this).text().trim();

                            productInfo = productInfo.merge((0, _immutable.Map)({ wasPrice: _2.StoreCrawlerServiceBase.removeDollarSignFromPrice(priceStr.substring(priceStr.lastIndexOf(' ') + 1)) }));

                            return 0;
                          });

                          $(this).find('.is').filter(function filterIsPrice() {
                            var priceStr = $(this).text().trim();

                            productInfo = productInfo.merge((0, _immutable.Map)({ currentPrice: _2.StoreCrawlerServiceBase.removeDollarSignFromPrice(priceStr.substring(priceStr.lastIndexOf(' ') + 1)) }));
                            return 0;
                          });

                          return 0;
                        });

                        return 0;
                      });

                      _this.updateProductDetails(product, storeTags, productInfo).then(function () {
                        return done();
                      }).catch(function (internalError) {
                        done();
                        _this.logError(function () {
                          return internalError;
                        });
                      });
                    }
                  });

                  crawler.on('drain', function () {
                    return resolve();
                  });
                  crawler.queue(product.get('productPageUrl'));
                }));

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2);
      }));

      return function (_x4, _x5) {
        return _ref4.apply(this, arguments);
      };
    }();

    _this.updateProductDetails = function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(product, storeTags, productInfo) {
        var storeId, priceDetails, priceToDisplay, currentPrice, wasPrice, saving, savingPercentage, temp, storeProductId, productPrice;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return _this.getStoreId();

              case 2:
                storeId = _context5.sent;
                priceDetails = void 0;
                priceToDisplay = void 0;


                if (productInfo.has('wasPrice') && productInfo.get('wasPrice')) {
                  priceDetails = (0, _immutable.Map)({
                    specialType: 'special'
                  });

                  priceToDisplay = productInfo.get('currentPrice');
                } else {
                  priceDetails = (0, _immutable.Map)({
                    specialType: 'none'
                  });

                  priceToDisplay = productInfo.get('currentPrice');
                }

                currentPrice = productInfo.get('currentPrice');
                wasPrice = productInfo.get('wasPrice');
                saving = 0;
                savingPercentage = 0;


                if (wasPrice && currentPrice) {
                  saving = wasPrice - currentPrice;

                  temp = saving * 100;


                  savingPercentage = temp / wasPrice;
                }

                priceDetails = priceDetails.merge(currentPrice ? (0, _immutable.Map)({ currentPrice: currentPrice }) : (0, _immutable.Map)()).merge(wasPrice ? (0, _immutable.Map)({ wasPrice: wasPrice }) : (0, _immutable.Map)()).merge((0, _immutable.Map)({ saving: saving, savingPercentage: savingPercentage }));

                storeProductId = product.get('id');
                productPrice = (0, _immutable.Map)({
                  name: productInfo.get('name'),
                  description: productInfo.get('description'),
                  barcode: productInfo.get('barcode'),
                  size: productInfo.get('size'),
                  imageUrl: product.get('imageUrl'),
                  productPageUrl: product.get('productPageUrl'),
                  priceDetails: priceDetails,
                  priceToDisplay: priceToDisplay,
                  saving: saving,
                  savingPercentage: savingPercentage,
                  status: 'A',
                  special: priceDetails.get('specialType').localeCompare('none') !== 0,
                  storeId: storeId,
                  storeProductId: storeProductId,
                  tagIds: storeTags.filter(function (storeTag) {
                    return product.get('storeTagIds').find(function (_) {
                      return _.localeCompare(storeTag.get('id')) === 0;
                    });
                  }).map(function (storeTag) {
                    return storeTag.get('tagId');
                  }).filter(function (storeTag) {
                    return storeTag;
                  }).toSet().toList()
                });
                return _context5.abrupt('return', Promise.all([_this.createOrUpdateProductPrice(storeProductId, productPrice, false), _this.updateExistingStoreProduct(product.merge({
                  name: productInfo.get('name'),
                  description: productInfo.get('description'),
                  barcode: productInfo.get('barcode'),
                  imageUrl: productInfo.get('imageUrl'),
                  lastCrawlDateTime: new Date(),
                  storeTagIds: storeTags.filter(function (storeTag) {
                    return productInfo.get('tagUrls').find(function (tagUrl) {
                      return tagUrl.localeCompare(storeTag.get('url')) === 0;
                    });
                  }).map(function (storeTag) {
                    return storeTag.get('id');
                  }).toSet().toList()
                }), false)]));

              case 15:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this2);
      }));

      return function (_x6, _x7, _x8) {
        return _ref5.apply(this, arguments);
      };
    }();

    return _this;
  }

  return Health2000WebCrawlerService;
}(_2.StoreCrawlerServiceBase);

exports.default = Health2000WebCrawlerService;