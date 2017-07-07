'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

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

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = WarehouseWebCrawlerService.__proto__ || Object.getPrototypeOf(WarehouseWebCrawlerService)).call.apply(_ref, [this].concat(args))), _this), _this.crawlProductCategories = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(config) {
        var result, sessionInfo, sessionId, finalConfig, updatedSessionInfo, errorMessage, _updatedSessionInfo;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.createNewCrawlSessionAndGetConfig('Warehouse Product Categories', config, 'Warehouse');

              case 2:
                result = _context.sent;
                sessionInfo = result.get('sessionInfo');
                sessionId = sessionInfo.get('id');
                finalConfig = result.get('config');
                _context.prev = 6;
                _context.next = 9;
                return _this.crawlAllProductCategories(sessionId, finalConfig);

              case 9:
                updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'success'
                  })
                }));
                _context.next = 12;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(updatedSessionInfo);

              case 12:
                _context.next = 21;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context['catch'](6);
                errorMessage = _context.t0 instanceof _microBusinessParseServerCommon.Exception ? _context.t0.getErrorMessage() : _context.t0;
                _updatedSessionInfo = sessionInfo.merge((0, _immutable.Map)({
                  endDateTime: new Date(),
                  additionalInfo: (0, _immutable.Map)({
                    status: 'failed',
                    error: errorMessage
                  })
                }));
                _context.next = 20;
                return _smartGroceryParseServerCommon.CrawlSessionService.update(_updatedSessionInfo);

              case 20:
                throw _context.t0;

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2, [[6, 14]]);
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
              reject('Failed to receive product categories for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

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
          }
        });

        crawler.on('drain', function () {
          return resolve();
        });
        crawler.queue(config.get('baseUrl'));
      });
    }, _this.crawlLevelOneProductCategoriesAndSubProductCategories = function (config, $) {
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
            weight: 1,
            subCategories: self.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem, categoryKey)
          }));

          return 0;
        });

        return 0;
      });

      return productCategories;
    }, _this.crawlLevelTwoProductCategoriesAndSubProductCategories = function (config, $, parentNode, parentCategoryKey) {
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
              weight: 2,
              subCategories: self.crawlLevelThreeProductCategoriesAndSubProductCategories(config, $, $(this), categoryKey)
            }));

            return 0;
          });

          return 0;
        });

        return 0;
      });

      return productCategories;
    }, _this.crawlLevelThreeProductCategoriesAndSubProductCategories = function (config, $, parentNode, parentCategoryKey) {
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
            weight: 3
          }));

          return 0;
        });

        return 0;
      });

      return productCategories;
    }, _this.syncProductCategoriesToStoreTags = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
      var store, storeId, productCategories, storeTags, splittedLevelOneProductCategories, storeTagsWithUpdatedLevelOneProductCategories, levelTwoProductCategories, levelTwoProductCategoriesGroupedByCategoryKey, splittedLevelTwoProductCategories, storeTagsWithUpdatedLevelTwoProductCategories, levelThreeProductCategories, levelThreeProductCategoriesGroupedByCategoryKey, splittedLevelThreeProductCategories;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.getStore('Warehouse');

            case 2:
              store = _context2.sent;
              storeId = store.get('id');
              _context2.t0 = _immutable2.default;
              _context2.next = 7;
              return _this.getMostRecentCrawlResults('Warehouse Product Categories', function (info) {
                return info.getIn(['resultSet', 'productCategories']);
              });

            case 7:
              _context2.t1 = _context2.sent.first();
              productCategories = _context2.t0.fromJS.call(_context2.t0, _context2.t1);
              _context2.next = 11;
              return _this.getStoreTags(storeId);

            case 11:
              storeTags = _context2.sent;
              splittedLevelOneProductCategories = _this.splitIntoChunks(productCategories, 100);
              _context2.next = 15;
              return _bluebird2.default.each(splittedLevelOneProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelOneProductCategory(productCategory, storeTags, storeId);
                }));
              });

            case 15:
              _context2.next = 17;
              return _this.getStoreTags(storeId);

            case 17:
              storeTagsWithUpdatedLevelOneProductCategories = _context2.sent;
              levelTwoProductCategories = productCategories.map(function (productCategory) {
                return productCategory.update('subCategories', function (subCategories) {
                  return subCategories.map(function (subCategory) {
                    return subCategory.set('parent', productCategory.get('categoryKey'));
                  });
                });
              }).flatMap(function (productCategory) {
                return productCategory.get('subCategories');
              });
              levelTwoProductCategoriesGroupedByCategoryKey = levelTwoProductCategories.groupBy(function (productCategory) {
                return productCategory.get('categoryKey');
              });
              splittedLevelTwoProductCategories = _this.splitIntoChunks(levelTwoProductCategoriesGroupedByCategoryKey.valueSeq(), 100);
              _context2.next = 23;
              return _bluebird2.default.each(splittedLevelTwoProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelTwoProductCategory(productCategory, storeTagsWithUpdatedLevelOneProductCategories, storeId);
                }));
              });

            case 23:
              _context2.next = 25;
              return _this.getStoreTags(storeId);

            case 25:
              storeTagsWithUpdatedLevelTwoProductCategories = _context2.sent;
              levelThreeProductCategories = productCategories.flatMap(function (productCategory) {
                return productCategory.get('subCategories');
              }).map(function (productCategory) {
                return productCategory.update('subCategories', function (subCategories) {
                  return subCategories.map(function (subCategory) {
                    return subCategory.set('parent', productCategory.get('categoryKey'));
                  });
                });
              }).flatMap(function (productCategory) {
                return productCategory.get('subCategories');
              });
              levelThreeProductCategoriesGroupedByCategoryKey = levelThreeProductCategories.groupBy(function (productCategory) {
                return productCategory.get('categoryKey');
              });
              splittedLevelThreeProductCategories = _this.splitIntoChunks(levelThreeProductCategoriesGroupedByCategoryKey.valueSeq(), 100);
              _context2.next = 31;
              return _bluebird2.default.each(splittedLevelThreeProductCategories.toArray(), function (productCategoryChunks) {
                return Promise.all(productCategoryChunks.map(function (productCategory) {
                  return _this.createOrUpdateLevelThreeProductCategory(productCategory, storeTagsWithUpdatedLevelTwoProductCategories, storeId);
                }));
              });

            case 31:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2);
    })), _this.crawlProducts = function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(config) {
        var finalConfig, store, storeId, productCategories, productCategoriesLevelOne, productCategoriesLevelTwo, productCategoriesLevelThree, productCategoriesToCrawl, productCategoriesToCrawlWithTotalItemsInfo;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.t0 = config;

                if (_context3.t0) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 4;
                return _this.getConfig('Warehouse');

              case 4:
                _context3.t0 = _context3.sent;

              case 5:
                finalConfig = _context3.t0;
                _context3.next = 8;
                return _this.getStore('Warehouse');

              case 8:
                store = _context3.sent;
                storeId = store.get('id');
                _context3.t1 = _immutable2.default;
                _context3.next = 13;
                return _this.getMostRecentCrawlResults('Warehouse Product Categories', function (info) {
                  return info.getIn(['resultSet', 'productCategories']);
                });

              case 13:
                _context3.t2 = _context3.sent.first();
                productCategories = _context3.t1.fromJS.call(_context3.t1, _context3.t2);
                productCategoriesLevelOne = productCategories.filter(function (_) {
                  return _.get('subCategories').isEmpty();
                });
                productCategoriesLevelTwo = productCategories.filterNot(function (_) {
                  return _.get('subCategories').isEmpty();
                }).flatMap(function (_) {
                  return _.get('subCategories');
                }).filter(function (_) {
                  return _.get('subCategories').isEmpty();
                });
                productCategoriesLevelThree = productCategories.filterNot(function (_) {
                  return _.get('subCategories').isEmpty();
                }).flatMap(function (_) {
                  return _.get('subCategories');
                }).filterNot(function (_) {
                  return _.get('subCategories').isEmpty();
                }).flatMap(function (_) {
                  return _.get('subCategories');
                });
                productCategoriesToCrawl = productCategoriesLevelOne.concat(productCategoriesLevelTwo).concat(productCategoriesLevelThree);
                _context3.next = 21;
                return _this.crawlProductCategoriesTotalItemsInfo(finalConfig, productCategoriesToCrawl);

              case 21:
                productCategoriesToCrawlWithTotalItemsInfo = _context3.sent;
                _context3.next = 24;
                return _this.crawlProductsForEachProductCategories(finalConfig, productCategoriesToCrawlWithTotalItemsInfo, storeId);

              case 24:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function (_x2) {
        return _ref4.apply(this, arguments);
      };
    }(), _this.crawlProductCategoriesTotalItemsInfo = function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(config, productCategories) {
        var productCategoriesToCrawlWithTotalItemsInfo;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                productCategoriesToCrawlWithTotalItemsInfo = (0, _immutable.List)();
                return _context4.abrupt('return', new Promise(function (resolve, reject) {
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
                        reject('Failed to receive product category page info for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

                        return;
                      }

                      var productCategory = productCategories.find(function (_) {
                        return _.get('url').localeCompare(res.request.uri.href) === 0;
                      });

                      if (!productCategory) {
                        // Ignoring the returned URL as looks like Warehouse forward the URL to other different categories
                        done();

                        return;
                      }

                      productCategoriesToCrawlWithTotalItemsInfo = productCategoriesToCrawlWithTotalItemsInfo.push(productCategory.set('totalItems', _this.crawlTotalItemsInfo(config, res.$)));
                      done();
                    }
                  });

                  crawler.on('drain', function () {
                    return resolve(productCategoriesToCrawlWithTotalItemsInfo);
                  });
                  productCategories.forEach(function (productCategory) {
                    return crawler.queue(productCategory.get('url'));
                  });
                }));

              case 2:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2);
      }));

      return function (_x3, _x4) {
        return _ref5.apply(this, arguments);
      };
    }(), _this.crawlTotalItemsInfo = function (config, $) {
      var total = 0;

      $('.tab-content #results-products .pagination').filter(function filterPagination() {
        $(this).children().find('.results-hits').filter(function filterResultHit() {
          var info = $(this).text().trim();
          var line2 = info.split('\r\n')[1].trim();
          var spaceIdx = line2.indexOf(' ');

          total = parseInt(line2.substring(0, spaceIdx).replace(',', '').trim(), 10);

          return 0;
        });

        return 0;
      });

      return total;
    }, _this.crawlProductsForEachProductCategories = function (config, productCategories, storeId) {
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
              reject('Failed to receive product category page info for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var urlOffset = res.request.uri.href.indexOf('?');
            var baseUrl = res.request.uri.href.substring(0, urlOffset);
            var productCategory = productCategories.find(function (_) {
              return _.get('url').localeCompare(baseUrl) === 0;
            });

            if (!productCategory) {
              done();
              reject('Failed to find product category page info for Url: ' + baseUrl);

              return;
            }

            var productInfos = _this.crawlProductInfo(config, res.$);

            Promise.all(productInfos.map(function (productInfo) {
              return _this.createOrUpdateStoreMasterProduct(productCategory, productInfo, storeId);
            })).then(function () {
              return done();
            }).catch(function (storeProductUpdateError) {
              done();
              reject(storeProductUpdateError);
            });
          }
        });

        crawler.on('drain', function () {
          return resolve();
        });
        productCategories.forEach(function (productCategory) {
          return (0, _immutable.Range)(0, productCategory.get('totalItems'), 24).forEach(function (offset) {
            return crawler.queue(productCategory.get('url') + '?sz=24&start=' + offset);
          });
        });
      });
    }, _this.crawlProductInfo = function (config, $) {
      var products = (0, _immutable.List)();
      $('.tab-content .search-result-content .search-result-items').children().filter(function filterSearchResultItems() {
        var productPageUrl = $(this).find('.product-info-wrapper .name-link').attr('href');

        products = products.push((0, _immutable.Map)({ productPageUrl: productPageUrl }));

        return 0;
      });

      return products;
    }, _this.crawlProductsDetails = function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(config) {
        var finalConfig, store, storeId, lastCrawlDateTime, products;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.t0 = config;

                if (_context5.t0) {
                  _context5.next = 5;
                  break;
                }

                _context5.next = 4;
                return _this.getConfig('Countdown');

              case 4:
                _context5.t0 = _context5.sent;

              case 5:
                finalConfig = _context5.t0;
                _context5.next = 8;
                return _this.getStore('Warehouse');

              case 8:
                store = _context5.sent;
                storeId = store.get('id');
                lastCrawlDateTime = new Date();


                lastCrawlDateTime.setDate(new Date().getDate() - 1);

                _context5.next = 14;
                return _this.getStoreProducts(finalConfig, storeId, false, lastCrawlDateTime);

              case 14:
                products = _context5.sent;
                _context5.next = 17;
                return _bluebird2.default.each(products.toArray(), function (product) {
                  return _this.crawlProductDetails(finalConfig, product);
                });

              case 17:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this2);
      }));

      return function (_x5) {
        return _ref6.apply(this, arguments);
      };
    }(), _this.crawlProductDetails = function (config, product) {
      return new Promise(function (resolve, reject) {
        var productInfo = (0, _immutable.Map)();
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
              reject('Failed to receive product categories for Url: ' + res.request.uri.href + ' - Error: ' + JSON.stringify(error));

              return;
            }

            var $ = res.$;
            var self = _this;
            var tags = (0, _immutable.List)();

            $('.breadcrumb').children().filter(function filterTags() {
              var tag = $(this).find('a').attr('href');

              tags = tags.push(tag);

              return 0;
            });

            tags = tags.skip(1).pop();

            productInfo = productInfo.merge({ tags: tags });

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
                  var description = descriptionContainer.find('.description-text').text().trim().split('\r\n')[0];
                  var barcode = descriptionContainer.find('.product-number .product-id').text().trim().split('\r\n')[0];
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

            _smartGroceryParseServerCommon.StoreMasterProductService.update(product.merge({
              name: productInfo.get('name'),
              description: productInfo.get('name'),
              barcode: productInfo.get('barcode'),
              imageUrl: productInfo.get('imageUrl')
            })).then(function () {
              return done();
            }).catch(function (internalError) {
              done();
              reject(internalError);
            });
          }
        });

        crawler.on('drain', function () {
          return resolve();
        });
        crawler.queue(product.get('productPageUrl'));
      });
    }, _this.crawlStandardPrice = function ($, priceContainer) {
      var self = _this;
      var result = (0, _immutable.Map)();

      priceContainer.find('.standardprice .pv-price').filter(function filterstandardPrice() {
        var currentPriceWithDollarSign = $(this).text().trim();
        var currentPrice = self.removeDollarSignFromPrice(currentPriceWithDollarSign);

        result = (0, _immutable.Map)({ currentPrice: currentPrice });

        return 0;
      });

      return result;
    }, _this.crawlSalePrice = function ($, priceContainer) {
      var self = _this;
      var result = (0, _immutable.Map)();

      priceContainer.find('.price-sales .pv-price').filter(function filterStandardPrice() {
        var currentPriceWithDollarSign = $(this).text().trim();
        var currentPrice = self.removeDollarSignFromPrice(currentPriceWithDollarSign);

        result = (0, _immutable.Map)({ currentPrice: currentPrice });

        return 0;
      });

      return result;
    }, _this.crawlSavingPrice = function ($, priceContainer, productInfo) {
      var self = _this;
      var result = (0, _immutable.Map)();

      priceContainer.find('.promotion .save-amount').filter(function filterSalePrice() {
        var savingText = $(this).text().trim();
        var savingWithDollarSign = savingText.substring(savingText.indexOf('$'));
        var saving = self.removeDollarSignFromPrice(savingWithDollarSign);

        result = (0, _immutable.Map)({
          saving: saving,
          wasPrice: Math.round((productInfo.get('currentPrice') + saving) * 100) / 100
        });

        return 0;
      });

      return result;
    }, _this.crawlOfferEndDate = function ($, priceContainer) {
      var result = (0, _immutable.Map)();

      priceContainer.find('.offers-end').filter(function filterOfferEndDate() {
        var offerEndDateText = $(this).text().trim();
        var offerEndDate = offerEndDateText.substring(offerEndDateText.lastIndexOf(' ')).trim();

        result = (0, _immutable.Map)({ offerEndDate: new Date(offerEndDate) });

        return 0;
      });

      return result;
    }, _this.crawlBenefitAndFeatures = function ($, mainContainer) {
      var benefitsAndFeatures = (0, _immutable.List)();

      mainContainer.find('.row .product-features-print .product-features .featuresbenefits-text ul').children().filter(function filterFeatureBenefit() {
        benefitsAndFeatures = benefitsAndFeatures.push($(this).text().trim());

        return 0;
      });

      return (0, _immutable.Map)({ benefitsAndFeatures: benefitsAndFeatures });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  return WarehouseWebCrawlerService;
}(_common.ServiceBase);

exports.default = WarehouseWebCrawlerService;