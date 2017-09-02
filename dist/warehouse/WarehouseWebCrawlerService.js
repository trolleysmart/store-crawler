'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _microBusinessCommonJavascript = require('micro-business-common-javascript');

var _trolleySmartParseServerCommon = require('trolley-smart-parse-server-common');

var _2 = require('../');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value);
            },
            function(err) {
              step('throw', err);
            },
          );
        }
      }
      return step('next');
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, enumerable: false, writable: true, configurable: true },
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : (subClass.__proto__ = superClass);
}

var WarehouseWebCrawlerService = (function(_StoreCrawlerServiceB) {
  _inherits(WarehouseWebCrawlerService, _StoreCrawlerServiceB);

  function WarehouseWebCrawlerService(context) {
    var _this2 = this;

    _classCallCheck(this, WarehouseWebCrawlerService);

    var _this = _possibleConstructorReturn(
      this,
      (WarehouseWebCrawlerService.__proto__ || Object.getPrototypeOf(WarehouseWebCrawlerService)).call(this, 'warehouse', context),
    );

    _this.crawlProductCategories = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee() {
        var sessionInfo, errorMessage;
        return regeneratorRuntime.wrap(
          function _callee$(_context) {
            while (1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                  _context.next = 2;
                  return _this.createNewCrawlSession('Warehouse Product Categories');

                case 2:
                  sessionInfo = _context.sent;
                  _context.prev = 3;
                  _context.next = 6;
                  return _this.crawlAllProductCategories(sessionInfo.get('id'));

                case 6:
                  _context.next = 8;
                  return _this.updateExistingCrawlSession(
                    sessionInfo.merge(
                      (0, _immutable.Map)({
                        endDateTime: new Date(),
                        additionalInfo: (0, _immutable.Map)({
                          status: 'success',
                        }),
                      }),
                    ),
                  );

                case 8:
                  _context.next = 16;
                  break;

                case 10:
                  _context.prev = 10;
                  _context.t0 = _context['catch'](3);
                  errorMessage = _context.t0 instanceof _microBusinessCommonJavascript.Exception ? _context.t0.getErrorMessage() : _context.t0;
                  _context.next = 15;
                  return _this.updateExistingCrawlSession(
                    sessionInfo.merge(
                      (0, _immutable.Map)({
                        endDateTime: new Date(),
                        additionalInfo: (0, _immutable.Map)({
                          status: 'failed',
                          error: errorMessage,
                        }),
                      }),
                    ),
                  );

                case 15:
                  throw _context.t0;

                case 16:
                case 'end':
                  return _context.stop();
              }
            }
          },
          _callee,
          _this2,
          [[3, 10]],
        );
      }),
    );

    _this.crawlAllProductCategories = (function() {
      var _ref2 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee2(crawlSessionId) {
          var config;
          return regeneratorRuntime.wrap(
            function _callee2$(_context2) {
              while (1) {
                switch ((_context2.prev = _context2.next)) {
                  case 0:
                    _context2.next = 2;
                    return _this.getConfig();

                  case 2:
                    config = _context2.sent;
                    return _context2.abrupt(
                      'return',
                      new Promise(function(resolve, reject) {
                        var crawler = new _crawler2.default({
                          rateLimit: config.get('rateLimit'),
                          maxConnections: config.get('maxConnections'),
                          callback: function callback(error, res, done) {
                            _this.logInfo(function() {
                              return 'Received response for: ' + _2.StoreCrawlerServiceBase.safeGetUri(res);
                            });
                            _this.logVerbose(function() {
                              return 'Received response for: ' + JSON.stringify(res);
                            });

                            if (error) {
                              done();
                              reject(
                                'Failed to receive product categories for Url: ' +
                                  _2.StoreCrawlerServiceBase.safeGetUri(res) +
                                  ' - Error: ' +
                                  JSON.stringify(error),
                              );

                              return;
                            }

                            var productCategories = _this.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);

                            _this
                              .createNewCrawlResult(
                                crawlSessionId,
                                (0, _immutable.Map)({
                                  productCategories: productCategories,
                                }),
                              )
                              .then(function() {
                                _this.logInfo(function() {
                                  return 'Successfully added products for: ' + productCategories + '.';
                                });

                                done();
                              })
                              .catch(function(err) {
                                _this.logError(function() {
                                  return 'Failed to save products for: ' + productCategories + '. Error: ' + JSON.stringify(err);
                                });

                                done();
                                reject('Failed to save products for: ' + productCategories + '. Error: ' + JSON.stringify(err));
                              });
                          },
                        });

                        crawler.on('drain', function() {
                          return resolve();
                        });
                        crawler.queue(config.get('baseUrl'));
                      }),
                    );

                  case 4:
                  case 'end':
                    return _context2.stop();
                }
              }
            },
            _callee2,
            _this2,
          );
        }),
      );

      return function(_x) {
        return _ref2.apply(this, arguments);
      };
    })();

    _this.crawlLevelOneProductCategoriesAndSubProductCategories = function(config, $) {
      var self = _this;
      var productCategories = (0, _immutable.Set)();

      $('.menu-container .level-1 .menu-category').filter(function filterMenuItems() {
        $(this)
          .children()
          .each(function onEachMenuItem() {
            var menuItem = $(this);
            var categoryKey = menuItem.attr('class');

            if (
              config.get('categoryKeysToExclude') &&
              config.get('categoryKeysToExclude').find(function(_) {
                return (
                  _.toLowerCase()
                    .trim()
                    .localeCompare(categoryKey.toLowerCase().trim()) === 0
                );
              })
            ) {
              return 0;
            }

            productCategories = productCategories.add(
              (0, _immutable.Map)({
                categoryKey: categoryKey,
                url: menuItem.find('.level-1').attr('href'),
                name: menuItem
                  .find('.level-1')
                  .text()
                  .trim(),
                level: 1,
                subCategories: self.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem, categoryKey),
              }),
            );

            return 0;
          });

        return 0;
      });

      return productCategories;
    };

    _this.crawlLevelTwoProductCategoriesAndSubProductCategories = function(config, $, parentNode, parentCategoryKey) {
      var self = _this;
      var productCategories = (0, _immutable.Set)();

      parentNode.find('.menu-navigation .menu-container-level-2 .inner').filter(function filterMenuItems() {
        $(this)
          .find('.category-column')
          .each(function onEachColumn() {
            $(this)
              .children()
              .each(function onEachMenuItem() {
                var menuItem = $(this).find('.category-level-2');
                var categoryKey = parentCategoryKey + '/' + menuItem.attr('data-gtm-cgid');

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(function(_) {
                    return (
                      _.toLowerCase()
                        .trim()
                        .localeCompare(categoryKey.toLowerCase().trim()) === 0
                    );
                  })
                ) {
                  return 0;
                }

                productCategories = productCategories.add(
                  (0, _immutable.Map)({
                    categoryKey: categoryKey,
                    url: menuItem.attr('href'),
                    name: menuItem.text().trim(),
                    level: 2,
                    subCategories: self.crawlLevelThreeProductCategoriesAndSubProductCategories(config, $, $(this), categoryKey),
                  }),
                );

                return 0;
              });

            return 0;
          });

        return 0;
      });

      return productCategories;
    };

    _this.crawlLevelThreeProductCategoriesAndSubProductCategories = function(config, $, parentNode, parentCategoryKey) {
      var productCategories = (0, _immutable.Set)();

      parentNode.find('.menu-container-level-3').filter(function filterMenuItems() {
        $(this)
          .children()
          .each(function onEachMenuItem() {
            var menuItem = $(this).find('.category-level-3');
            var categoryKey = parentCategoryKey + '/' + menuItem.attr('data-gtm-cgid');

            if (
              config.get('categoryKeysToExclude') &&
              config.get('categoryKeysToExclude').find(function(_) {
                return (
                  _.toLowerCase()
                    .trim()
                    .localeCompare(categoryKey.toLowerCase().trim()) === 0
                );
              })
            ) {
              return 0;
            }

            productCategories = productCategories.add(
              (0, _immutable.Map)({
                categoryKey: categoryKey,
                url: menuItem.attr('href'),
                name: menuItem.text().trim(),
                level: 3,
              }),
            );

            return 0;
          });

        return 0;
      });

      return productCategories;
    };

    _this.syncProductCategoriesToStoreTags = (function() {
      var _ref3 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee3(sessionToken) {
          var store,
            storeId,
            productCategories,
            storeTags,
            splittedLevelOneProductCategories,
            storeTagsWithUpdatedLevelOneProductCategories,
            levelTwoProductCategories,
            levelTwoProductCategoriesGroupedByCategoryKey,
            splittedLevelTwoProductCategories,
            storeTagsWithUpdatedLevelTwoProductCategories,
            levelThreeProductCategories,
            levelThreeProductCategoriesGroupedByCategoryKey,
            splittedLevelThreeProductCategories;
          return regeneratorRuntime.wrap(
            function _callee3$(_context3) {
              while (1) {
                switch ((_context3.prev = _context3.next)) {
                  case 0:
                    _context3.next = 2;
                    return _this.getStore('Warehouse', sessionToken);

                  case 2:
                    store = _context3.sent;
                    storeId = store.get('id');
                    _context3.t0 = _immutable2.default;
                    _context3.next = 7;
                    return _this.getMostRecentCrawlResults(
                      'Warehouse Product Categories',
                      function(info) {
                        return info.getIn(['resultSet', 'productCategories']);
                      },
                      sessionToken,
                    );

                  case 7:
                    _context3.t1 = _context3.sent.first();
                    productCategories = _context3.t0.fromJS.call(_context3.t0, _context3.t1);
                    _context3.next = 11;
                    return _this.getStoreTags(storeId, false, sessionToken);

                  case 11:
                    storeTags = _context3.sent;
                    splittedLevelOneProductCategories = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(productCategories, 100);
                    _context3.next = 15;
                    return _bluebird2.default.each(splittedLevelOneProductCategories.toArray(), function(productCategoryChunks) {
                      return Promise.all(
                        productCategoryChunks.map(function(productCategory) {
                          return _this.createOrUpdateLevelOneProductCategory(productCategory, storeTags, storeId, sessionToken);
                        }),
                      );
                    });

                  case 15:
                    _context3.next = 17;
                    return _this.getStoreTags(storeId, false, sessionToken);

                  case 17:
                    storeTagsWithUpdatedLevelOneProductCategories = _context3.sent;
                    levelTwoProductCategories = productCategories
                      .map(function(productCategory) {
                        return productCategory.update('subCategories', function(subCategories) {
                          return subCategories.map(function(subCategory) {
                            return subCategory.set('parent', productCategory.get('categoryKey'));
                          });
                        });
                      })
                      .flatMap(function(productCategory) {
                        return productCategory.get('subCategories');
                      });
                    levelTwoProductCategoriesGroupedByCategoryKey = levelTwoProductCategories.groupBy(function(productCategory) {
                      return productCategory.get('categoryKey');
                    });
                    splittedLevelTwoProductCategories = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(
                      levelTwoProductCategoriesGroupedByCategoryKey.valueSeq(),
                      100,
                    );
                    _context3.next = 23;
                    return _bluebird2.default.each(splittedLevelTwoProductCategories.toArray(), function(productCategoryChunks) {
                      return Promise.all(
                        productCategoryChunks.map(function(productCategory) {
                          return _this.createOrUpdateLevelTwoProductCategory(
                            productCategory,
                            storeTagsWithUpdatedLevelOneProductCategories,
                            storeId,
                            sessionToken,
                          );
                        }),
                      );
                    });

                  case 23:
                    _context3.next = 25;
                    return _this.getStoreTags(storeId, false, sessionToken);

                  case 25:
                    storeTagsWithUpdatedLevelTwoProductCategories = _context3.sent;
                    levelThreeProductCategories = productCategories
                      .flatMap(function(productCategory) {
                        return productCategory.get('subCategories');
                      })
                      .map(function(productCategory) {
                        return productCategory.update('subCategories', function(subCategories) {
                          return subCategories.map(function(subCategory) {
                            return subCategory.set('parent', productCategory.get('categoryKey'));
                          });
                        });
                      })
                      .flatMap(function(productCategory) {
                        return productCategory.get('subCategories');
                      });
                    levelThreeProductCategoriesGroupedByCategoryKey = levelThreeProductCategories.groupBy(function(productCategory) {
                      return productCategory.get('categoryKey');
                    });
                    splittedLevelThreeProductCategories = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(
                      levelThreeProductCategoriesGroupedByCategoryKey.valueSeq(),
                      100,
                    );
                    _context3.next = 31;
                    return _bluebird2.default.each(splittedLevelThreeProductCategories.toArray(), function(productCategoryChunks) {
                      return Promise.all(
                        productCategoryChunks.map(function(productCategory) {
                          return _this.createOrUpdateLevelThreeProductCategory(
                            productCategory,
                            storeTagsWithUpdatedLevelTwoProductCategories,
                            storeId,
                            sessionToken,
                          );
                        }),
                      );
                    });

                  case 31:
                  case 'end':
                    return _context3.stop();
                }
              }
            },
            _callee3,
            _this2,
          );
        }),
      );

      return function(_x2) {
        return _ref3.apply(this, arguments);
      };
    })();

    _this.crawlProducts = (function() {
      var _ref4 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee4(config, sessionToken) {
          var finalConfig,
            store,
            storeId,
            productCategories,
            productCategoriesLevelOne,
            productCategoriesLevelTwo,
            productCategoriesLevelThree,
            productCategoriesToCrawl,
            productCategoriesToCrawlWithTotalItemsInfo;
          return regeneratorRuntime.wrap(
            function _callee4$(_context4) {
              while (1) {
                switch ((_context4.prev = _context4.next)) {
                  case 0:
                    _context4.t0 = config;

                    if (_context4.t0) {
                      _context4.next = 5;
                      break;
                    }

                    _context4.next = 4;
                    return _this.getConfig('Warehouse');

                  case 4:
                    _context4.t0 = _context4.sent;

                  case 5:
                    finalConfig = _context4.t0;
                    _context4.next = 8;
                    return _this.getStore('Warehouse', sessionToken);

                  case 8:
                    store = _context4.sent;
                    storeId = store.get('id');
                    _context4.t1 = _immutable2.default;
                    _context4.next = 13;
                    return _this.getMostRecentCrawlResults(
                      'Warehouse Product Categories',
                      function(info) {
                        return info.getIn(['resultSet', 'productCategories']);
                      },
                      sessionToken,
                    );

                  case 13:
                    _context4.t2 = _context4.sent.first();
                    productCategories = _context4.t1.fromJS.call(_context4.t1, _context4.t2);
                    productCategoriesLevelOne = productCategories.filter(function(_) {
                      return _.get('subCategories').isEmpty();
                    });
                    productCategoriesLevelTwo = productCategories
                      .filterNot(function(_) {
                        return _.get('subCategories').isEmpty();
                      })
                      .flatMap(function(_) {
                        return _.get('subCategories');
                      })
                      .filter(function(_) {
                        return _.get('subCategories').isEmpty();
                      });
                    productCategoriesLevelThree = productCategories
                      .filterNot(function(_) {
                        return _.get('subCategories').isEmpty();
                      })
                      .flatMap(function(_) {
                        return _.get('subCategories');
                      })
                      .filterNot(function(_) {
                        return _.get('subCategories').isEmpty();
                      })
                      .flatMap(function(_) {
                        return _.get('subCategories');
                      });
                    productCategoriesToCrawl = productCategoriesLevelOne.concat(productCategoriesLevelTwo).concat(productCategoriesLevelThree);
                    _context4.next = 21;
                    return _this.crawlProductCategoriesTotalItemsInfo(finalConfig, productCategoriesToCrawl);

                  case 21:
                    productCategoriesToCrawlWithTotalItemsInfo = _context4.sent;
                    _context4.next = 24;
                    return _this.crawlProductsForEachProductCategories(
                      finalConfig,
                      productCategoriesToCrawlWithTotalItemsInfo,
                      storeId,
                      sessionToken,
                    );

                  case 24:
                  case 'end':
                    return _context4.stop();
                }
              }
            },
            _callee4,
            _this2,
          );
        }),
      );

      return function(_x3, _x4) {
        return _ref4.apply(this, arguments);
      };
    })();

    _this.crawlProductCategoriesTotalItemsInfo = (function() {
      var _ref5 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee5(config, productCategories) {
          var productCategoriesToCrawlWithTotalItemsInfo;
          return regeneratorRuntime.wrap(
            function _callee5$(_context5) {
              while (1) {
                switch ((_context5.prev = _context5.next)) {
                  case 0:
                    productCategoriesToCrawlWithTotalItemsInfo = (0, _immutable.List)();
                    return _context5.abrupt(
                      'return',
                      new Promise(function(resolve, reject) {
                        var crawler = new _crawler2.default({
                          rateLimit: config.get('rateLimit'),
                          maxConnections: config.get('maxConnections'),
                          callback: function callback(error, res, done) {
                            _this.logInfo(function() {
                              return 'Received response for: ' + _2.StoreCrawlerServiceBase.safeGetUri(res);
                            });
                            _this.logVerbose(function() {
                              return 'Received response for: ' + JSON.stringify(res);
                            });

                            if (error) {
                              done();
                              reject(
                                'Failed to receive product category page info for Url: ' +
                                  _2.StoreCrawlerServiceBase.safeGetUri(res) +
                                  ' - Error: ' +
                                  JSON.stringify(error),
                              );

                              return;
                            }

                            var productCategory = productCategories.find(function(_) {
                              return _.get('url').localeCompare(_2.StoreCrawlerServiceBase.safeGetUri(res)) === 0;
                            });

                            if (!productCategory) {
                              // Ignoring the returned URL as looks like Warehouse forward the URL to other different categories
                              done();

                              return;
                            }

                            productCategoriesToCrawlWithTotalItemsInfo = productCategoriesToCrawlWithTotalItemsInfo.push(
                              productCategory.set('totalItems', _this.crawlTotalItemsInfo(config, res.$)),
                            );

                            done();
                          },
                        });

                        crawler.on('drain', function() {
                          return resolve(productCategoriesToCrawlWithTotalItemsInfo);
                        });
                        productCategories.forEach(function(productCategory) {
                          return crawler.queue(productCategory.get('url'));
                        });
                      }),
                    );

                  case 2:
                  case 'end':
                    return _context5.stop();
                }
              }
            },
            _callee5,
            _this2,
          );
        }),
      );

      return function(_x5, _x6) {
        return _ref5.apply(this, arguments);
      };
    })();

    _this.crawlTotalItemsInfo = function(config, $) {
      var total = 0;

      $('.tab-content #results-products .pagination').filter(function filterPagination() {
        $(this)
          .children()
          .find('.results-hits')
          .filter(function filterResultHit() {
            var info = $(this)
              .text()
              .trim();
            var line2 = info.split('\r\n')[1].trim();
            var spaceIdx = line2.indexOf(' ');

            total = parseInt(
              line2
                .substring(0, spaceIdx)
                .replace(',', '')
                .trim(),
              10,
            );

            return 0;
          });

        return 0;
      });

      return total;
    };

    _this.crawlProductsForEachProductCategories = function(config, productCategories, storeId, sessionToken) {
      return new Promise(function(resolve, reject) {
        var crawler = new _crawler2.default({
          rateLimit: config.get('rateLimit'),
          maxConnections: config.get('maxConnections'),
          callback: function callback(error, res, done) {
            _this.logInfo(function() {
              return 'Received response for: ' + _2.StoreCrawlerServiceBase.safeGetUri(res);
            });
            _this.logVerbose(function() {
              return 'Received response for: ' + JSON.stringify(res);
            });

            if (error) {
              done();
              reject(
                'Failed to receive product category page info for Url: ' +
                  _2.StoreCrawlerServiceBase.safeGetUri(res) +
                  ' - Error: ' +
                  JSON.stringify(error),
              );

              return;
            }

            var urlOffset = _2.StoreCrawlerServiceBase.safeGetUri(res).indexOf('?');
            var baseUrl = _2.StoreCrawlerServiceBase.safeGetUri(res).substring(0, urlOffset);
            var productCategory = productCategories.find(function(_) {
              return _.get('url').localeCompare(baseUrl) === 0;
            });

            if (!productCategory) {
              done();
              reject('Failed to find product category page info for Url: ' + baseUrl);

              return;
            }

            var productInfos = _this.crawlProductInfo(config, res.$);

            Promise.all(
              productInfos
                .filter(function(productInfo) {
                  return productInfo.get('productPageUrl');
                })
                .map(function(productInfo) {
                  return _this.createOrUpdateStoreMasterProduct(productCategory, productInfo, storeId, sessionToken);
                }),
            )
              .then(function() {
                return done();
              })
              .catch(function(storeProductUpdateError) {
                done();
                reject(storeProductUpdateError);
              });
          },
        });

        crawler.on('drain', function() {
          return resolve();
        });
        productCategories.forEach(function(productCategory) {
          return (0, _immutable.Range)(0, productCategory.get('totalItems'), 24).forEach(function(offset) {
            return crawler.queue(productCategory.get('url') + '?sz=24&start=' + offset);
          });
        });
      });
    };

    _this.crawlProductInfo = function(config, $) {
      var products = (0, _immutable.List)();
      $('.tab-content .search-result-content .search-result-items')
        .children()
        .filter(function filterSearchResultItems() {
          var productPageUrl = $(this)
            .find('.product-info-wrapper .name-link')
            .attr('href');

          products = products.push((0, _immutable.Map)({ productPageUrl: productPageUrl }));

          return 0;
        });

      return products;
    };

    _this.crawlProductsDetails = (function() {
      var _ref6 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee6(config, sessionToken) {
          var finalConfig, store, storeId, storeTags, products, splittedProducts;
          return regeneratorRuntime.wrap(
            function _callee6$(_context6) {
              while (1) {
                switch ((_context6.prev = _context6.next)) {
                  case 0:
                    _context6.t0 = config;

                    if (_context6.t0) {
                      _context6.next = 5;
                      break;
                    }

                    _context6.next = 4;
                    return _this.getConfig('Warehouse');

                  case 4:
                    _context6.t0 = _context6.sent;

                  case 5:
                    finalConfig = _context6.t0;
                    _context6.next = 8;
                    return _this.getStore('Warehouse', sessionToken);

                  case 8:
                    store = _context6.sent;
                    storeId = store.get('id');
                    _context6.next = 12;
                    return _this.getStoreTags(storeId, false, sessionToken);

                  case 12:
                    storeTags = _context6.sent;
                    _context6.next = 15;
                    return _this.getAllStoreMasterProducts(storeId, sessionToken);

                  case 15:
                    products = _context6.sent;
                    splittedProducts = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(products, 20);
                    _context6.next = 19;
                    return _bluebird2.default.each(splittedProducts.toArray(), function(productChunk) {
                      return Promise.all(
                        productChunk.map(function(product) {
                          return _this.crawlProductDetails(finalConfig, product, storeTags, false, store.get('name'), sessionToken);
                        }),
                      );
                    });

                  case 19:
                  case 'end':
                    return _context6.stop();
                }
              }
            },
            _callee6,
            _this2,
          );
        }),
      );

      return function(_x7, _x8) {
        return _ref6.apply(this, arguments);
      };
    })();

    _this.crawlProductsPriceDetails = (function() {
      var _ref7 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee7(config, sessionToken) {
          var finalConfig, store, storeId, storeTags, lastCrawlDateTime, products, splittedProducts;
          return regeneratorRuntime.wrap(
            function _callee7$(_context7) {
              while (1) {
                switch ((_context7.prev = _context7.next)) {
                  case 0:
                    _context7.t0 = config;

                    if (_context7.t0) {
                      _context7.next = 5;
                      break;
                    }

                    _context7.next = 4;
                    return _this.getConfig('Warehouse');

                  case 4:
                    _context7.t0 = _context7.sent;

                  case 5:
                    finalConfig = _context7.t0;
                    _context7.next = 8;
                    return _this.getStore('Warehouse', sessionToken);

                  case 8:
                    store = _context7.sent;
                    storeId = store.get('id');
                    _context7.next = 12;
                    return _this.getStoreTags(storeId, false, sessionToken);

                  case 12:
                    storeTags = _context7.sent;
                    lastCrawlDateTime = new Date();

                    lastCrawlDateTime.setDate(new Date().getDate() - 1);

                    _context7.next = 17;
                    return _this.getStoreMasterProductsWithMasterProduct(storeId, lastCrawlDateTime, sessionToken);

                  case 17:
                    products = _context7.sent;
                    splittedProducts = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(products, 20);
                    _context7.next = 21;
                    return _bluebird2.default.each(splittedProducts.toArray(), function(productChunk) {
                      return Promise.all(
                        productChunk.map(function(product) {
                          return _this.crawlProductDetails(finalConfig, product, storeTags, true, store.get('name'), sessionToken);
                        }),
                      );
                    });

                  case 21:
                  case 'end':
                    return _context7.stop();
                }
              }
            },
            _callee7,
            _this2,
          );
        }),
      );

      return function(_x9, _x10) {
        return _ref7.apply(this, arguments);
      };
    })();

    _this.crawlProductDetails = function(config, product, storeTags, updatePriceDetails, storeName, sessionToken) {
      return new Promise(function(resolve, reject) {
        var productInfo = (0, _immutable.Map)();
        var crawler = new _crawler2.default({
          rateLimit: config.get('rateLimit'),
          maxConnections: config.get('maxConnections'),
          callback: function callback(error, res, done) {
            _this.logInfo(function() {
              return 'Received response for: ' + _2.StoreCrawlerServiceBase.safeGetUri(res);
            });
            _this.logVerbose(function() {
              return 'Received response for: ' + JSON.stringify(res);
            });

            if (error) {
              done();
              reject(
                'Failed to receive product categories for Url: ' + _2.StoreCrawlerServiceBase.safeGetUri(res) + ' - Error: ' + JSON.stringify(error),
              );

              return;
            }

            var $ = res.$;
            var self = _this;
            var tagUrls = (0, _immutable.List)();

            $('.breadcrumb')
              .children()
              .filter(function filterTags() {
                var tag = $(this)
                  .find('a')
                  .attr('href');

                tagUrls = tagUrls.push(tag);

                return 0;
              });

            tagUrls = tagUrls.skip(1).pop();

            productInfo = productInfo.merge({ tagUrls: tagUrls });

            $('#pdpMain').filter(function filterMainContainer() {
              var mainContainer = $(this);

              mainContainer.find('.row-product-details').filter(function filterDetails() {
                $(this)
                  .find('.product-image-container .product-primary-image .product-image .primary-image')
                  .filter(function filterImage() {
                    productInfo = productInfo.merge({
                      imageUrl: $(this).attr('src'),
                    });

                    return 0;
                  });

                $(this)
                  .find('.product-detail')
                  .filter(function filterDetail() {
                    var name = $(this)
                      .find('.product-name')
                      .text()
                      .trim();
                    var descriptionContainer = $(this).find('.product-description');
                    var description = descriptionContainer
                      .find('.description-text')
                      .text()
                      .trim()
                      .split('\r\n')[0];
                    var barcode = descriptionContainer
                      .find('.product-number .product-id')
                      .text()
                      .trim()
                      .split('\r\n')[0];
                    var priceContainer = $(this).find('#product-content .upper-product-price .product-price');

                    productInfo = productInfo.merge(self.crawlStandardPrice($, priceContainer));
                    productInfo = productInfo.merge(self.crawlSalePrice($, priceContainer));
                    productInfo = productInfo.merge(self.crawlSavingPrice($, priceContainer, productInfo));
                    productInfo = productInfo.merge(self.crawlOfferEndDate($, priceContainer));

                    productInfo = productInfo.merge({
                      name: name,
                      description: description,
                      barcode: barcode,
                    });

                    return 0;
                  });

                return 0;
              });

              productInfo = productInfo.merge(self.crawlBenefitAndFeatures($, mainContainer));

              return 0;
            });

            _this
              .updateProductDetails(product, storeTags, productInfo, updatePriceDetails, storeName, sessionToken)
              .then(function() {
                return done();
              })
              .catch(function(internalError) {
                done();
                reject(internalError);
              });
          },
        });

        crawler.on('drain', function() {
          return resolve();
        });
        crawler.queue(product.get('productPageUrl'));
      });
    };

    _this.crawlStandardPrice = function($, priceContainer) {
      var self = _this;
      var result = (0, _immutable.Map)();

      priceContainer.find('.standardprice .pv-price').filter(function filterstandardPrice() {
        var currentPriceWithDollarSign = $(this)
          .text()
          .trim();
        var currentPrice = self.removeDollarSignFromPrice(currentPriceWithDollarSign);

        result = (0, _immutable.Map)({ currentPrice: currentPrice });

        return 0;
      });

      return result;
    };

    _this.crawlSalePrice = function($, priceContainer) {
      var self = _this;
      var result = (0, _immutable.Map)();

      priceContainer.find('.price-sales .pv-price').filter(function filterStandardPrice() {
        var currentPriceWithDollarSign = $(this)
          .text()
          .trim();
        var currentPrice = self.removeDollarSignFromPrice(currentPriceWithDollarSign);

        result = (0, _immutable.Map)({ currentPrice: currentPrice });

        return 0;
      });

      return result;
    };

    _this.crawlSavingPrice = function($, priceContainer, productInfo) {
      var self = _this;
      var result = (0, _immutable.Map)();

      priceContainer.find('.promotion .save-amount').filter(function filterSalePrice() {
        var savingText = $(this)
          .text()
          .trim();
        var savingWithDollarSign = savingText.substring(savingText.indexOf('$'));
        var saving = self.removeDollarSignFromPrice(savingWithDollarSign);

        result = (0, _immutable.Map)({
          saving: saving,
          wasPrice: saving ? Math.round((productInfo.get('currentPrice') + saving) * 100) / 100 : undefined,
        });

        return 0;
      });

      return result;
    };

    _this.crawlOfferEndDate = function($, priceContainer) {
      var result = (0, _immutable.Map)();

      priceContainer.find('.offers-end').filter(function filterOfferEndDate() {
        var offerEndDateText = $(this)
          .text()
          .trim();
        var offerEndDate = offerEndDateText.substring(offerEndDateText.lastIndexOf(' ')).trim();

        result = (0, _immutable.Map)({ offerEndDate: (0, _moment2.default)(offerEndDate, 'DD/MM/YYYY').toDate() });

        return 0;
      });

      return result;
    };

    _this.crawlBenefitAndFeatures = function($, mainContainer) {
      var benefitsAndFeatures = (0, _immutable.List)();

      mainContainer
        .find('.row .product-features-print .product-features .featuresbenefits-text ul')
        .children()
        .filter(function filterFeatureBenefit() {
          benefitsAndFeatures = benefitsAndFeatures.push(
            $(this)
              .text()
              .trim(),
          );

          return 0;
        });

      return (0, _immutable.Map)({ benefitsAndFeatures: benefitsAndFeatures });
    };

    _this.updateProductDetails = (function() {
      var _ref8 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee8(product, storeTags, productInfo, updatePriceDetails, storeName, sessionToken) {
          var masterProductId,
            storeId,
            priceDetails,
            priceToDisplay,
            currentPrice,
            wasPrice,
            offerEndDate,
            saving,
            savingPercentage,
            temp,
            masterProductPrice;
          return regeneratorRuntime.wrap(
            function _callee8$(_context8) {
              while (1) {
                switch ((_context8.prev = _context8.next)) {
                  case 0:
                    masterProductId = product.get('masterProductId');
                    storeId = product.get('storeId');

                    if (!updatePriceDetails) {
                      _context8.next = 16;
                      break;
                    }

                    priceDetails = void 0;
                    priceToDisplay = void 0;

                    if (
                      (productInfo.has('wasPrice') && productInfo.get('wasPrice')) ||
                      (productInfo.has('offerEndDate') && productInfo.get('offerEndDate'))
                    ) {
                      priceDetails = (0, _immutable.Map)({
                        specialType: 'special',
                      });

                      priceToDisplay = productInfo.get('currentPrice');
                    } else {
                      priceDetails = (0, _immutable.Map)({
                        specialType: 'none',
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

                    priceDetails = priceDetails
                      .merge(currentPrice ? (0, _immutable.Map)({ currentPrice: currentPrice }) : (0, _immutable.Map)())
                      .merge(wasPrice ? (0, _immutable.Map)({ wasPrice: wasPrice }) : (0, _immutable.Map)())
                      .merge(offerEndDate ? (0, _immutable.Map)({ offerEndDate: offerEndDate }) : (0, _immutable.Map)())
                      .merge((0, _immutable.Map)({ saving: saving, savingPercentage: savingPercentage }));

                    masterProductPrice = (0, _immutable.Map)({
                      masterProductId: masterProductId,
                      storeId: storeId,
                      name: product.getIn(['masterProduct', 'name']),
                      description: product.getIn(['masterProduct', 'description']),
                      storeName: storeName,
                      status: 'A',
                      priceDetails: priceDetails,
                      priceToDisplay: priceToDisplay,
                      saving: saving,
                      savingPercentage: savingPercentage,
                      tagIds: product.getIn(['masterProduct', 'tagIds']),
                    }).merge(offerEndDate ? (0, _immutable.Map)({ offerEndDate: offerEndDate }) : (0, _immutable.Map)());
                    _context8.next = 16;
                    return _this.createOrUpdateMasterProductPrice(masterProductId, storeId, masterProductPrice, priceDetails, sessionToken);

                  case 16:
                    _trolleySmartParseServerCommon.StoreMasterProductService.update(
                      product.merge({
                        name: productInfo.get('name'),
                        description: productInfo.get('name'),
                        barcode: productInfo.get('barcode'),
                        imageUrl: productInfo.get('imageUrl'),
                        lastCrawlDateTime: updatePriceDetails ? new Date() : productInfo.get('lastCrawlDateTime'),
                        storeTagIds: storeTags
                          .filter(function(storeTag) {
                            return productInfo.get('tagUrls').find(function(tagUrl) {
                              return tagUrl.localeCompare(storeTag.get('url')) === 0;
                            });
                          })
                          .map(function(storeTag) {
                            return storeTag.get('id');
                          }),
                      }),
                      sessionToken,
                    );

                  case 17:
                  case 'end':
                    return _context8.stop();
                }
              }
            },
            _callee8,
            _this2,
          );
        }),
      );

      return function(_x11, _x12, _x13, _x14, _x15, _x16) {
        return _ref8.apply(this, arguments);
      };
    })();

    return _this;
  }

  return WarehouseWebCrawlerService;
})(_2.StoreCrawlerServiceBase);

exports.default = WarehouseWebCrawlerService;
