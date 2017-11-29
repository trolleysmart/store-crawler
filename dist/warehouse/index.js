'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _common = require('../common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Warehouse = function (_StoreCrawlerServiceB) {
  _inherits(Warehouse, _StoreCrawlerServiceB);

  function Warehouse(context) {
    var _this2 = this;

    _classCallCheck(this, Warehouse);

    var _this = _possibleConstructorReturn(this, (Warehouse.__proto__ || Object.getPrototypeOf(Warehouse)).call(this, 'warehouse', context));

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
      var self = _this;
      var productCategories = (0, _immutable.Set)();

      $('.menu-container .level-1 .menu-category').filter(function filterMenuItems() {
        $(this).children().each(function onEachMenuItem() {
          var menuItem = $(this);
          var categoryKey = menuItem.attr('class');

          if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
            return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
          })) {
            return 0;
          }

          productCategories = productCategories.add((0, _immutable.Map)({
            categoryKey: categoryKey,
            url: menuItem.find('.level-1').attr('href'),
            name: menuItem.find('.level-1').text().trim(),
            level: 1,
            subCategories: self.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem, categoryKey)
          }));

          return 0;
        });

        return 0;
      });

      return productCategories;
    };

    _this.crawlLevelTwoProductCategoriesAndSubProductCategories = function (config, $, parentNode, parentCategoryKey) {
      var self = _this;
      var productCategories = (0, _immutable.Set)();

      parentNode.find('.menu-navigation .menu-container-level-2 .inner').filter(function filterMenuItems() {
        $(this).find('.category-column').each(function onEachColumn() {
          $(this).children().each(function onEachMenuItem() {
            var menuItem = $(this).find('.category-level-2');
            var categoryKey = parentCategoryKey + '/' + menuItem.attr('data-gtm-cgid');

            if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
              return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
            })) {
              return 0;
            }

            productCategories = productCategories.add((0, _immutable.Map)({
              categoryKey: categoryKey,
              url: menuItem.attr('href'),
              name: menuItem.text().trim(),
              level: 2,
              subCategories: self.crawlLevelThreeProductCategoriesAndSubProductCategories(config, $, $(this), categoryKey)
            }));

            return 0;
          });

          return 0;
        });

        return 0;
      });

      return productCategories;
    };

    _this.crawlLevelThreeProductCategoriesAndSubProductCategories = function (config, $, parentNode, parentCategoryKey) {
      var productCategories = (0, _immutable.Set)();

      parentNode.find('.menu-container-level-3').filter(function filterMenuItems() {
        $(this).children().each(function onEachMenuItem() {
          var menuItem = $(this).find('.category-level-3');
          var categoryKey = parentCategoryKey + '/' + menuItem.attr('data-gtm-cgid');

          if (config.get('categoryKeysToExclude') && config.get('categoryKeysToExclude').find(function (_) {
            return _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0;
          })) {
            return 0;
          }

          productCategories = productCategories.add((0, _immutable.Map)({
            categoryKey: categoryKey,
            url: menuItem.attr('href'),
            name: menuItem.text().trim(),
            level: 3
          }));

          return 0;
        });

        return 0;
      });

      return productCategories;
    };

    _this.crawlStoreTagsTotalItemsInfo = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(storeTags) {
        var config, storeTagsWithTotalItemsInfo;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _this.getConfig();

              case 2:
                config = _context2.sent;
                storeTagsWithTotalItemsInfo = (0, _immutable.List)();
                return _context2.abrupt('return', new Promise(function (resolve) {
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

                      var productCategory = storeTags.find(function (_) {
                        return _.get('url').localeCompare(_common.StoreCrawlerServiceBase.safeGetUri(res)) === 0;
                      });

                      if (!productCategory) {
                        // Ignoring the returned URL as looks like Warehouse forward the URL to other different categories
                        done();

                        return;
                      }

                      storeTagsWithTotalItemsInfo = storeTagsWithTotalItemsInfo.push(productCategory.set('totalItems', _this.crawlTotalItemsInfo(res.$)));

                      done();
                    }
                  });

                  crawler.on('drain', function () {
                    return resolve(storeTagsWithTotalItemsInfo);
                  });
                  storeTags.forEach(function (productCategory) {
                    return crawler.queue(productCategory.get('url'));
                  });
                }));

              case 5:
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

    _this.crawlTotalItemsInfo = function ($) {
      var total = 0;

      $('.tab-content #results-products .pagination').filter(function filterPagination() {
        $(this).children().find('.results-hits').filter(function filterResultHit() {
          var info = $(this).text().trim();
          var line2 = info.split('\n')[1].trim();
          var spaceIdx = line2.indexOf(' ');

          total = parseInt(line2.substring(0, spaceIdx).replace(',', '').trim(), 10);

          return 0;
        });

        return 0;
      });

      return total;
    };

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

                        return;
                      }

                      var productInfos = _this.crawlProductInfo(config, res.$);

                      Promise.all(productInfos.filter(function (productInfo) {
                        return productInfo.get('productPageUrl');
                      }).map(function (productInfo) {
                        return _this.createOrUpdateStoreProduct(productInfo, false);
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
                    return (0, _immutable.Range)(0, storeTag.get('totalItems'), 24).forEach(function (offset) {
                      return crawler.queue(storeTag.get('url') + '?sz=24&start=' + offset);
                    });
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
      var products = (0, _immutable.List)();
      $('.tab-content .search-result-content .search-result-items').children().filter(function filterSearchResultItems() {
        var productPageUrl = $(this).find('.product-info-wrapper .name-link').attr('href');

        products = products.push((0, _immutable.Map)({ productPageUrl: productPageUrl }));

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

                      var self = _this;
                      var tagUrls = (0, _immutable.List)();

                      $('.breadcrumb').children().filter(function filterTags() {
                        var tag = $(this).find('a').attr('href');

                        tagUrls = tagUrls.push(tag);

                        return 0;
                      });

                      tagUrls = tagUrls.skip(1).pop();

                      productInfo = productInfo.merge({ tagUrls: tagUrls });

                      $('#pdpMain').filter(function filterMainContainer() {
                        var mainContainer = $(this);

                        mainContainer.find('.row-product-details').filter(function filterDetails() {
                          $(this).find('.product-image-container .product-primary-image .product-image .primary-image').filter(function filterImage() {
                            productInfo = productInfo.merge({
                              imageUrl: $(this).attr('src')
                            });

                            return 0;
                          });

                          $(this).find('.product-detail').filter(function filterDetail() {
                            var name = $(this).find('.product-name').text().trim();
                            var descriptionContainer = $(this).find('.product-description');
                            var description = descriptionContainer.find('.description-text').text().trim().split('\n')[0];
                            var barcode = descriptionContainer.find('.product-number .product-id').text().trim().split('\n')[0];
                            var priceContainer = $(this).find('#product-content .upper-product-price .product-price');

                            productInfo = productInfo.merge(self.crawlStandardPrice($, priceContainer));
                            productInfo = productInfo.merge(self.crawlSalePrice($, priceContainer));
                            productInfo = productInfo.merge(self.crawlSavingPrice($, priceContainer, productInfo));
                            productInfo = productInfo.merge(self.crawlOfferEndDate($, priceContainer));

                            productInfo = productInfo.merge({
                              name: name,
                              description: description,
                              barcode: barcode
                            });

                            return 0;
                          });

                          return 0;
                        });

                        productInfo = productInfo.merge(self.crawlBenefitAndFeatures($, mainContainer));

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

      return function (_x3, _x4) {
        return _ref4.apply(this, arguments);
      };
    }();

    _this.crawlStandardPrice = function ($, priceContainer) {
      var result = (0, _immutable.Map)();

      priceContainer.find('.standardprice .pv-price').filter(function filterstandardPrice() {
        var currentPriceWithDollarSign = $(this).text().trim();
        var currentPrice = _common.StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceWithDollarSign);

        result = (0, _immutable.Map)({ currentPrice: currentPrice });

        return 0;
      });

      return result;
    };

    _this.crawlSalePrice = function ($, priceContainer) {
      var result = (0, _immutable.Map)();

      priceContainer.find('.price-sales .pv-price').filter(function filterStandardPrice() {
        var currentPriceWithDollarSign = $(this).text().trim();
        var currentPrice = _common.StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceWithDollarSign);

        result = (0, _immutable.Map)({ currentPrice: currentPrice });

        return 0;
      });

      return result;
    };

    _this.crawlSavingPrice = function ($, priceContainer, productInfo) {
      var result = (0, _immutable.Map)();

      priceContainer.find('.promotion .save-amount').filter(function filterSalePrice() {
        var savingText = $(this).text().trim();
        var savingWithDollarSign = savingText.substring(savingText.indexOf('$'));
        var saving = _common.StoreCrawlerServiceBase.removeDollarSignFromPrice(savingWithDollarSign);

        result = (0, _immutable.Map)({
          saving: saving,
          wasPrice: saving ? Math.round((productInfo.get('currentPrice') + saving) * 100) / 100 : undefined
        });

        return 0;
      });

      return result;
    };

    _this.crawlOfferEndDate = function ($, priceContainer) {
      var result = (0, _immutable.Map)();

      priceContainer.find('.offers-end').filter(function filterOfferEndDate() {
        var offerEndDateText = $(this).text().trim();
        var offerEndDate = offerEndDateText.substring(offerEndDateText.lastIndexOf(' ')).trim();

        result = (0, _immutable.Map)({ offerEndDate: (0, _moment2.default)(offerEndDate, 'DD/MM/YYYY').toDate() });

        return 0;
      });

      return result;
    };

    _this.crawlBenefitAndFeatures = function ($, mainContainer) {
      var benefitsAndFeatures = (0, _immutable.List)();

      mainContainer.find('.row .product-features-print .product-features .featuresbenefits-text ul').children().filter(function filterFeatureBenefit() {
        benefitsAndFeatures = benefitsAndFeatures.push($(this).text().trim());

        return 0;
      });

      return (0, _immutable.Map)({ benefitsAndFeatures: benefitsAndFeatures });
    };

    _this.updateProductDetails = function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(product, storeTags, productInfo) {
        var storeId, priceDetails, priceToDisplay, currentPrice, wasPrice, offerEndDate, saving, savingPercentage, temp, storeProductId, productPrice;
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


                if (productInfo.has('wasPrice') && productInfo.get('wasPrice') || productInfo.has('offerEndDate') && productInfo.get('offerEndDate')) {
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
                offerEndDate = productInfo.get('offerEndDate');
                saving = 0;
                savingPercentage = 0;


                if (wasPrice && currentPrice) {
                  saving = wasPrice - currentPrice;

                  temp = saving * 100;


                  savingPercentage = temp / wasPrice;
                }

                priceDetails = priceDetails.merge(currentPrice ? (0, _immutable.Map)({ currentPrice: currentPrice }) : (0, _immutable.Map)()).merge(wasPrice ? (0, _immutable.Map)({ wasPrice: wasPrice }) : (0, _immutable.Map)()).merge(offerEndDate ? (0, _immutable.Map)({ offerEndDate: offerEndDate }) : (0, _immutable.Map)()).merge((0, _immutable.Map)({ saving: saving, savingPercentage: savingPercentage }));

                storeProductId = product.get('id');
                productPrice = (0, _immutable.Map)({
                  name: productInfo.get('name'),
                  description: productInfo.get('description'),
                  barcode: productInfo.get('barcode'),
                  size: productInfo.get('size'),
                  imageUrl: productInfo.get('imageUrl'),
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
                }).merge(offerEndDate ? (0, _immutable.Map)({ offerEndDate: offerEndDate }) : (0, _immutable.Map)());
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

              case 16:
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

  return Warehouse;
}(_common.StoreCrawlerServiceBase);

exports.default = Warehouse;