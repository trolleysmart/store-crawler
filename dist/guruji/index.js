'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _common = require('../common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Guruji = function (_StoreCrawlerServiceB) {
  _inherits(Guruji, _StoreCrawlerServiceB);

  function Guruji(context) {
    var _this2 = this;

    _classCallCheck(this, Guruji);

    var _this = _possibleConstructorReturn(this, (Guruji.__proto__ || Object.getPrototypeOf(Guruji)).call(this, 'guruji', context));

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
                      return 'Received response for: ' + _common.StoreCrawlerServiceBase.safeGetUri(res);
                    });
                    _this.logVerbose(function () {
                      return 'Received response for: ' + JSON.stringify(res);
                    });

                    if (error) {
                      done();
                      _this.logError(function () {
                        return 'Failed to receive product categories for Url: ' + _common.StoreCrawlerServiceBase.safeGetUri(res) + ' - Error: ' + JSON.stringify(error);
                      });

                      return;
                    }

                    productCategories = _this.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);
                    done();
                  }
                });

                crawler.on('drain', function () {
                  return resolve(productCategories);
                });
                crawler.queue(config.get('baseUrl'));
              }));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this2);
    }));

    _this.crawlLevelOneProductCategoriesAndSubProductCategories = function (config, $) {
      var categories = (0, _immutable.List)();

      $('.container .navbar-collapse .navbar-nav .dropdown .dropdown-submenu a').filter(function onEachCategory() {
        var url = $(this).attr('href');
        var name = $(this).text();
        var keys = _immutable2.default.fromJS(url.substring(url.indexOf(config.get('baseUrl')) + config.get('baseUrl').length).split('/')).skip(3).filter(function (_) {
          return _;
        });

        categories = categories.push((0, _immutable.Map)({
          url: url,
          categoryKey: keys.reduce(function (acc, key) {
            return acc + '/' + key;
          }),
          name: name,
          level: keys.count()
        }));
        return 0;
      });

      if (config.get('categoryKeysToExclude')) {
        categories = categories.filterNot(function (category) {
          return config.get('categoryKeysToExclude').find(function (_) {
            return _.toLowerCase().trim().localeCompare(category.get('categoryKey').toLowerCase().trim()) === 0;
          });
        });
      }

      var levelTwoCategories = categories.filter(function (_) {
        return _.get('level') === 2;
      }).map(function (category) {
        return category.set('subCategories', categories.filter(function (_) {
          return _.get('level') === category.get('level') + 1 && _.get('categoryKey').indexOf(category.get('categoryKey')) === 0;
        }));
      });

      return categories.filter(function (_) {
        return _.get('level') === 1;
      }).map(function (category) {
        return category.set('subCategories', levelTwoCategories.filter(function (_) {
          return _.get('level') === category.get('level') + 1 && _.get('categoryKey').indexOf(category.get('categoryKey')) === 0;
        }));
      });
    };

    _this.crawlStoreTagsTotalItemsInfo = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(storeTags) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', storeTags);

              case 1:
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

    _this.crawlProductsForEachStoreTag = function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(storeTags) {
        var config;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _this.getConfig();

              case 2:
                config = _context3.sent;
                return _context3.abrupt('return', new Promise(function (resolve) {
                  var crawler = new _crawler2.default({
                    rateLimit: config.get('rateLimit'),
                    maxConnections: config.get('maxConnections'),
                    callback: function callback(error, res, done) {
                      _this.logInfo(function () {
                        return 'Received response for: ' + _common.StoreCrawlerServiceBase.safeGetUri(res);
                      });
                      _this.logVerbose(function () {
                        return 'Received response for: ' + JSON.stringify(res);
                      });

                      if (error) {
                        done();
                        _this.logError(function () {
                          return 'Failed to receive product category page info for Url: ' + _common.StoreCrawlerServiceBase.safeGetUri(res) + ' - Error: ' + JSON.stringify(error);
                        });

                        return;
                      }

                      var urlOffset = _common.StoreCrawlerServiceBase.safeGetUri(res).indexOf('?');
                      var baseUrl = _common.StoreCrawlerServiceBase.safeGetUri(res).substring(0, urlOffset);
                      var productCategory = storeTags.find(function (_) {
                        return _.get('url').localeCompare(baseUrl) === 0;
                      });

                      if (!productCategory) {
                        done();
                        _this.logError(function () {
                          return 'Failed to find product category page info for Url: ' + baseUrl;
                        });
                      }

                      var productInfos = _this.crawlProductInfo(config, res.$);

                      Promise.all(productInfos.filter(function (productInfo) {
                        return productInfo.get('productPageUrl');
                      }).map(function (productInfo) {
                        return _this.createOrUpdateStoreProduct(productInfo, true);
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
                  storeTags.forEach(function (storeTag) {
                    return crawler.queue(storeTag.get('url') + '?shop_page=view-all');
                  });
                }));

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    }();

    _this.crawlProductInfo = function (config, $) {
      var products = (0, _immutable.Set)();

      $('.products').children().filter(function filterSearchResultItems() {
        var productPageUrl = $(this).find('.product .text a').attr('href');

        products = products.add((0, _immutable.Map)({ productPageUrl: config.get('baseUrl') + productPageUrl }));

        return 0;
      });

      return products;
    };

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
                        return 'Received response for: ' + _common.StoreCrawlerServiceBase.safeGetUri(res);
                      });
                      _this.logVerbose(function () {
                        return 'Received response for: ' + JSON.stringify(res);
                      });

                      if (error) {
                        done();
                        _this.logError(function () {
                          return 'Failed to receive product categories for Url: ' + _common.StoreCrawlerServiceBase.safeGetUri(res) + ' - Error: ' + JSON.stringify(error);
                        });

                        return;
                      }

                      var $ = res.$;

                      var tagUrls = (0, _immutable.List)();
                      var stopFindingTags = false;

                      $('.sidebar-menu .panel-body .category-menu').children(function filterTags() {
                        if (stopFindingTags) {
                          return 0;
                        }

                        var tagUrl = $(this).find('a').attr('href');

                        if (!tagUrl) {
                          stopFindingTags = true;

                          return 0;
                        }

                        tagUrls = tagUrls.push(config.get('baseUrl') + tagUrl);
                        return 0;
                      });

                      productInfo = productInfo.merge({ tagUrls: tagUrls });

                      $('.container .product-name h2').filter(function filterProductName() {
                        productInfo = productInfo.set('name', $(this).text().trim());

                        return 0;
                      });

                      $('.container .product-slider img').filter(function filterProductName() {
                        productInfo = productInfo.set('imageUrl', config.get('baseUrl') + $(this).attr('src'));

                        return 0;
                      });

                      var differentProductsFound = (0, _immutable.List)();

                      $('.container').each(function filterContainer() {
                        var linePrefixToFind = "var variants = $.parseJSON('";
                        var content = $(this).text();
                        var linePrefixToFindIdx = content.indexOf(linePrefixToFind);
                        var endOfLinePrefixToFindIdx = content.indexOf("');", linePrefixToFindIdx);

                        if (linePrefixToFindIdx >= 0 && endOfLinePrefixToFindIdx >= 0) {
                          var products = _immutable2.default.fromJS(JSON.parse(content.substring(linePrefixToFindIdx + linePrefixToFind.length, endOfLinePrefixToFindIdx))).remove('child');

                          differentProductsFound = products.valueSeq().map(function (_) {
                            var price = parseFloat(_.get('product_attributes_price'));
                            var discountedPrice = parseFloat(_.get('product_attributes_disc_price'));

                            return (0, _immutable.Map)({
                              size: _.get('product_attributes_value'),
                              currentPrice: discountedPrice === 0.0 ? price : discountedPrice,
                              wasPrice: discountedPrice === 0.0 ? undefined : price
                            });
                          });
                        }

                        return 0;
                      });

                      // TODO: 20171129 - Morteza: Only now reading the first product. In future, need to create extra product for each listed item
                      _this.updateProductDetails(product, storeTags, differentProductsFound.map(function (_) {
                        return productInfo.merge(_);
                      }).first()).then(function () {
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

      return function (_x3, _x4) {
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
                return _context5.abrupt('return', Promise.all([_this.createOrUpdateProductPrice(storeProductId, productPrice, true), _this.updateExistingStoreProduct(product.merge({
                  name: productInfo.get('name'),
                  imageUrl: productInfo.get('imageUrl'),
                  lastCrawlDateTime: new Date(),
                  storeTagIds: storeTags.filter(function (storeTag) {
                    return productInfo.get('tagUrls').find(function (tagUrl) {
                      return tagUrl.localeCompare(storeTag.get('url')) === 0;
                    });
                  }).map(function (storeTag) {
                    return storeTag.get('id');
                  }).toSet().toList()
                }), true)]));

              case 15:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this2);
      }));

      return function (_x5, _x6, _x7) {
        return _ref5.apply(this, arguments);
      };
    }();

    return _this;
  }

  return Guruji;
}(_common.StoreCrawlerServiceBase);

exports.default = Guruji;