'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

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

var CountdownWebCrawlerService = (function(_StoreCrawlerServiceB) {
  _inherits(CountdownWebCrawlerService, _StoreCrawlerServiceB);

  function CountdownWebCrawlerService(context) {
    var _this2 = this;

    _classCallCheck(this, CountdownWebCrawlerService);

    var _this = _possibleConstructorReturn(
      this,
      (CountdownWebCrawlerService.__proto__ || Object.getPrototypeOf(CountdownWebCrawlerService)).call(this, 'countdown', context),
    );

    _this.crawlAllProductCategories = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(
          function _callee$(_context) {
            while (1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                  _context.t0 = _this;
                  _context.t1 = _this;
                  _context.next = 4;
                  return _this.crawlLevelOneProductCategories();

                case 4:
                  _context.t2 = _context.sent;
                  _context.next = 7;
                  return _context.t1.crawlLevelTwoProductCategories.call(_context.t1, _context.t2);

                case 7:
                  _context.t3 = _context.sent;
                  return _context.abrupt('return', _context.t0.crawlLevelThreeProductCategories.call(_context.t0, _context.t3));

                case 9:
                case 'end':
                  return _context.stop();
              }
            }
          },
          _callee,
          _this2,
        );
      }),
    );
    _this.crawlLevelOneProductCategories = _asyncToGenerator(
      regeneratorRuntime.mark(function _callee2() {
        var config, productCategories;
        return regeneratorRuntime.wrap(
          function _callee2$(_context2) {
            while (1) {
              switch ((_context2.prev = _context2.next)) {
                case 0:
                  _context2.next = 2;
                  return _this.getConfig();

                case 2:
                  config = _context2.sent;
                  productCategories = (0, _immutable.List)();
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

                          var $ = res.$;

                          $('#BrowseSlideBox .row-fluid')
                            .children()
                            .filter(function filterCategoriesColumns() {
                              $(this)
                                .find('.toolbar-slidebox-item')
                                .each(function filterProductCategory() {
                                  var menuItem = $(this).find('.toolbar-slidebox-link');
                                  var url = menuItem.attr('href');
                                  var categoryKey = url.substring(
                                    url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length,
                                  );

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

                                  productCategories = productCategories.push(
                                    (0, _immutable.Map)({
                                      categoryKey: categoryKey,
                                      name: menuItem.text().trim(),
                                      url: '' + config.get('baseUrl') + url,
                                      level: 1,
                                      subCategories: (0, _immutable.List)(),
                                    }),
                                  );

                                  return 0;
                                });

                              return 0;
                            });

                          done();
                        },
                      });

                      crawler.on('drain', function() {
                        return resolve(productCategories);
                      });
                      crawler.queue(config.get('baseUrl'));
                    }),
                  );

                case 5:
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

    _this.crawlLevelTwoProductCategories = (function() {
      var _ref3 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee3(productCategories) {
          var config, updatedProductCategories;
          return regeneratorRuntime.wrap(
            function _callee3$(_context3) {
              while (1) {
                switch ((_context3.prev = _context3.next)) {
                  case 0:
                    _context3.next = 2;
                    return _this.getConfig();

                  case 2:
                    config = _context3.sent;
                    updatedProductCategories = productCategories;
                    return _context3.abrupt(
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

                            var levelOneProductCategoryIdx = productCategories.findIndex(function(_) {
                              return _.get('url').localeCompare(_2.StoreCrawlerServiceBase.safeGetUri(res)) === 0;
                            });

                            if (levelOneProductCategoryIdx === -1) {
                              // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
                              _this.logError(function() {
                                return (
                                  'Failed to match retrieved URL ' +
                                  _2.StoreCrawlerServiceBase.safeGetUri(res) +
                                  ' against provided level one category.'
                                );
                              });

                              return;
                            }

                            var levelOneProductCategory = productCategories.get(levelOneProductCategoryIdx);
                            var $ = res.$;
                            var levelTwoProductCategories = (0, _immutable.List)();

                            $('#left-navigation #navigation-panel .single-level-navigation .navigation-toggle-children .clearfix')
                              .children()
                              .filter(function filterLeftNavigationPanel() {
                                $(this).each(function filterProductCategory() {
                                  var menuItem = $(this).find('.din');
                                  var url = menuItem.attr('href');
                                  var categoryKey = url.substring(
                                    url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length,
                                  );

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

                                  levelTwoProductCategories = levelTwoProductCategories.push(
                                    (0, _immutable.Map)({
                                      categoryKey: categoryKey,
                                      name: menuItem.text().trim(),
                                      url: '' + config.get('baseUrl') + url,
                                      level: 2,
                                    }),
                                  );

                                  return 0;
                                });

                                return 0;
                              });

                            updatedProductCategories = updatedProductCategories.set(
                              levelOneProductCategoryIdx,
                              levelOneProductCategory.set('subCategories', levelTwoProductCategories),
                            );

                            done();
                          },
                        });

                        crawler.on('drain', function() {
                          return resolve(updatedProductCategories);
                        });
                        productCategories.forEach(function(productCategory) {
                          return crawler.queue(productCategory.get('url'));
                        });
                      }),
                    );

                  case 5:
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

      return function(_x) {
        return _ref3.apply(this, arguments);
      };
    })();

    _this.crawlLevelThreeProductCategories = (function() {
      var _ref4 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee4(productCategories) {
          var config, updatedProductCategories;
          return regeneratorRuntime.wrap(
            function _callee4$(_context4) {
              while (1) {
                switch ((_context4.prev = _context4.next)) {
                  case 0:
                    _context4.next = 2;
                    return _this.getConfig();

                  case 2:
                    config = _context4.sent;
                    updatedProductCategories = productCategories;
                    return _context4.abrupt(
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

                            var levelOneProductCategoryIdx = updatedProductCategories.findIndex(function(_) {
                              return _2.StoreCrawlerServiceBase.safeGetUri(res).indexOf(_.get('url')) !== -1;
                            });

                            if (levelOneProductCategoryIdx === -1) {
                              // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
                              _this.logError(function() {
                                return (
                                  'Failed to match retrieved URL ' +
                                  _2.StoreCrawlerServiceBase.safeGetUri(res) +
                                  ' against provided level one category.'
                                );
                              });

                              return;
                            }

                            var levelOneProductCategory = updatedProductCategories.get(levelOneProductCategoryIdx);
                            var levelOneProductSubCategoriesCategory = levelOneProductCategory.get('subCategories');
                            var levelTwoProductCategoryIdx = levelOneProductSubCategoriesCategory.findIndex(function(_) {
                              return _.get('url').localeCompare(_2.StoreCrawlerServiceBase.safeGetUri(res)) === 0;
                            });

                            if (levelTwoProductCategoryIdx === -1) {
                              // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
                              _this.logError(function() {
                                return (
                                  'Failed to match retrieved URL ' +
                                  _2.StoreCrawlerServiceBase.safeGetUri(res) +
                                  ' against provided level two category.'
                                );
                              });

                              return;
                            }

                            var levelTwoProductCategory = levelOneProductSubCategoriesCategory.get(levelTwoProductCategoryIdx);
                            var $ = res.$;
                            var levelThreeProductCategories = (0, _immutable.List)();

                            $('#left-navigation #navigation-panel .single-level-navigation .navigation-toggle-children .clearfix')
                              .children()
                              .filter(function filterLeftNavigationPanel() {
                                $(this).each(function filterProductCategory() {
                                  var menuItem = $(this).find('.din');
                                  var url = menuItem.attr('href');
                                  var categoryKey = url.substring(
                                    url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length,
                                  );

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

                                  levelThreeProductCategories = levelThreeProductCategories.push(
                                    (0, _immutable.Map)({
                                      categoryKey: categoryKey,
                                      name: menuItem.text().trim(),
                                      url: '' + config.get('baseUrl') + url,
                                      level: 3,
                                    }),
                                  );

                                  return 0;
                                });

                                return 0;
                              });

                            updatedProductCategories = updatedProductCategories.set(
                              levelOneProductCategoryIdx,
                              levelOneProductCategory.update('subCategories', function(subcategories) {
                                return subcategories.set(
                                  levelTwoProductCategoryIdx,
                                  levelTwoProductCategory.set('subCategories', levelThreeProductCategories),
                                );
                              }),
                            );

                            done();
                          },
                        });

                        crawler.on('drain', function() {
                          return resolve(updatedProductCategories);
                        });
                        productCategories
                          .flatMap(function(productCategory) {
                            return productCategory.get('subCategories');
                          })
                          .forEach(function(productCategory) {
                            return crawler.queue(productCategory.get('url'));
                          });
                      }),
                    );

                  case 5:
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

      return function(_x2) {
        return _ref4.apply(this, arguments);
      };
    })();

    _this.crawlStoreTagsTotalItemsInfo = (function() {
      var _ref5 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee5(storeTags) {
          var config, storeTagsWithTotalItemsInfo;
          return regeneratorRuntime.wrap(
            function _callee5$(_context5) {
              while (1) {
                switch ((_context5.prev = _context5.next)) {
                  case 0:
                    _context5.next = 2;
                    return _this.getConfig();

                  case 2:
                    config = _context5.sent;
                    storeTagsWithTotalItemsInfo = (0, _immutable.List)();
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

                            var productCategory = storeTags.find(function(_) {
                              return _.get('url').localeCompare(_2.StoreCrawlerServiceBase.safeGetUri(res)) === 0;
                            });

                            if (!productCategory) {
                              // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
                              done();

                              return;
                            }

                            storeTagsWithTotalItemsInfo = storeTagsWithTotalItemsInfo.push(
                              productCategory.set('totalItems', _this.crawlTotalItemsInfo(res.$)),
                            );
                            done();
                          },
                        });

                        crawler.on('drain', function() {
                          return resolve(storeTagsWithTotalItemsInfo);
                        });
                        storeTags.forEach(function(productCategory) {
                          return crawler.queue(productCategory.get('url'));
                        });
                      }),
                    );

                  case 5:
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

      return function(_x3) {
        return _ref5.apply(this, arguments);
      };
    })();

    _this.crawlTotalItemsInfo = function($) {
      var total = 0;

      $('#middle-panel .side-gutter #content-panel .paging-container .paging-description').filter(function filterPagingDescription() {
        var info = $(this)
          .text()
          .trim();
        var spaceIdx = info.indexOf(' ');

        total = parseInt(
          info
            .substring(0, spaceIdx)
            .replace(',', '')
            .trim(),
          10,
        );

        return 0;
      });

      return total;
    };

    _this.crawlProductsForEachStoreTag = (function() {
      var _ref6 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee6(storeTags) {
          var config;
          return regeneratorRuntime.wrap(
            function _callee6$(_context6) {
              while (1) {
                switch ((_context6.prev = _context6.next)) {
                  case 0:
                    _context6.next = 2;
                    return _this.getConfig();

                  case 2:
                    config = _context6.sent;
                    return _context6.abrupt(
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

                            var urlOffset = _2.StoreCrawlerServiceBase.safeGetUri(res).indexOf('?');
                            var baseUrl = _2.StoreCrawlerServiceBase.safeGetUri(res).substring(0, urlOffset);
                            var productCategory = storeTags.find(function(_) {
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
                                  return _this.createOrUpdateStoreProduct(productCategory, productInfo);
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
                        storeTags.forEach(function(productCategory) {
                          return (0, _immutable.Range)(0, Math.ceil(productCategory.get('totalItems') / 24)).forEach(function(offset) {
                            return crawler.queue(productCategory.get('url') + '?page=' + (offset + 1));
                          });
                        });
                      }),
                    );

                  case 4:
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

      return function(_x4) {
        return _ref6.apply(this, arguments);
      };
    })();

    _this.crawlProductInfo = function(config, $) {
      var products = (0, _immutable.List)();
      $('#middle-panel .side-gutter #content-panel #product-list')
        .children()
        .filter(function filterProductList() {
          $(this)
            .find('.product-stamp .details-container')
            .each(function filterProductDetails() {
              var productPageUrl =
                config.get('baseUrl') +
                $(this)
                  .find('._jumpTop')
                  .attr('href');

              products = products.push((0, _immutable.Map)({ productPageUrl: productPageUrl }));

              return 0;
            });
          return 0;
        });

      return products;
    };

    _this.crawlProductsDetails = (function() {
      var _ref7 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee7(config, sessionToken) {
          var finalConfig, store, storeId, storeTags, products, splittedProducts;
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
                    return _this.getConfig('Countdown');

                  case 4:
                    _context7.t0 = _context7.sent;

                  case 5:
                    finalConfig = _context7.t0;
                    _context7.next = 8;
                    return _this.getStore('Countdown', sessionToken);

                  case 8:
                    store = _context7.sent;
                    storeId = store.get('id');
                    _context7.next = 12;
                    return _this.getStoreTags(storeId, false, sessionToken);

                  case 12:
                    storeTags = _context7.sent;
                    _context7.next = 15;
                    return _this.getAllStoreMasterProducts(storeId, sessionToken);

                  case 15:
                    products = _context7.sent;
                    splittedProducts = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(products, 20);
                    _context7.next = 19;
                    return _bluebird2.default.each(splittedProducts.toArray(), function(productChunk) {
                      return Promise.all(
                        productChunk.map(function(product) {
                          return _this.crawlProductDetails(finalConfig, product, storeTags, false, store.get('name'), sessionToken);
                        }),
                      );
                    });

                  case 19:
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

      return function(_x5, _x6) {
        return _ref7.apply(this, arguments);
      };
    })();

    _this.crawlProductsPriceDetails = (function() {
      var _ref8 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee8(config, sessionToken) {
          var finalConfig, store, storeId, storeTags, lastCrawlDateTime, products, splittedProducts;
          return regeneratorRuntime.wrap(
            function _callee8$(_context8) {
              while (1) {
                switch ((_context8.prev = _context8.next)) {
                  case 0:
                    _context8.t0 = config;

                    if (_context8.t0) {
                      _context8.next = 5;
                      break;
                    }

                    _context8.next = 4;
                    return _this.getConfig('Countdown');

                  case 4:
                    _context8.t0 = _context8.sent;

                  case 5:
                    finalConfig = _context8.t0;
                    _context8.next = 8;
                    return _this.getStore('Countdown', sessionToken);

                  case 8:
                    store = _context8.sent;
                    storeId = store.get('id');
                    _context8.next = 12;
                    return _this.getStoreTags(storeId, false, sessionToken);

                  case 12:
                    storeTags = _context8.sent;
                    lastCrawlDateTime = new Date();

                    lastCrawlDateTime.setDate(new Date().getDate() - 1);

                    _context8.next = 17;
                    return _this.getStoreMasterProductsWithMasterProduct(storeId, lastCrawlDateTime, sessionToken);

                  case 17:
                    products = _context8.sent;
                    splittedProducts = _microBusinessCommonJavascript.ImmutableEx.splitIntoChunks(products, 20);
                    _context8.next = 21;
                    return _bluebird2.default.each(splittedProducts.toArray(), function(productChunk) {
                      return Promise.all(
                        productChunk.map(function(product) {
                          return _this.crawlProductDetails(finalConfig, product, storeTags, true, store.get('name'), sessionToken);
                        }),
                      );
                    });

                  case 21:
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

      return function(_x7, _x8) {
        return _ref8.apply(this, arguments);
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
            var tagUrls = (0, _immutable.Set)();

            $('#breadcrumb-panel .breadcrumbs')
              .children()
              .filter(function filterProductTags() {
                var tagUrl = $(this).attr('href');

                if (tagUrl) {
                  tagUrls = tagUrls.add(config.get('baseUrl') + tagUrl);
                }

                return 0;
              });

            productInfo = productInfo.merge({ tagUrls: tagUrls });

            $('#content-container #content-panel #product-details').filter(function filterProductDetails() {
              var productTagWrapperContainer = $(this).find('.product-tag-wrapper');
              var productTagDesktop = productTagWrapperContainer.find('.main-product .product-tag-desktop');

              productTagDesktop.children().each(function filterBadges() {
                var badgeSrc = $(this).attr('src');

                if (badgeSrc) {
                  productInfo = productInfo.merge(self.translateBadge(badgeSrc));
                } else {
                  var badgeUrl = $(this)
                    .find('a img')
                    .attr('src');

                  if (badgeUrl) {
                    productInfo = productInfo.merge(self.translateBadge(badgeUrl));
                  } else {
                    var multiBuyLinkContainer = $(this).find('.multi-buy-link');

                    if (multiBuyLinkContainer) {
                      var awardQuantityFullText = multiBuyLinkContainer
                        .find('.multi-buy-award-quantity')
                        .text()
                        .trim();
                      var awardQuantity = parseFloat(awardQuantityFullText.substring(0, awardQuantityFullText.indexOf(' ')));
                      var awardValue = parseFloat(
                        multiBuyLinkContainer
                          .find('.multi-buy-award-value')
                          .text()
                          .trim(),
                      );

                      productInfo = productInfo.merge({
                        multiBuyInfo: (0, _immutable.Map)({
                          awardQuantity: awardQuantity,
                          awardValue: awardValue,
                        }),
                      });
                    }
                  }
                }

                return 0;
              });

              var imageUrl =
                config.get('baseUrl') + productTagWrapperContainer.find('.big-image-container .product-image .product-image').attr('src');
              var barcode = self.getBarcodeFromImageUrl(imageUrl);
              var productDetailsBasicInfo = $(this).find('#product-details-info-content .prod-details-basic-info');
              var titleContainer = productDetailsBasicInfo.find('.product-title h1');
              var title = titleContainer.text().trim();
              var size = titleContainer
                .find('span')
                .text()
                .trim();
              var sizeOffset = title.indexOf(size);
              var name = sizeOffset === -1 || size.length === 0 ? title : title.substring(0, sizeOffset).trim();
              var description = productDetailsBasicInfo
                .find('.product-info-panel .product-description p')
                .text()
                .trim();

              productInfo = productInfo.merge({
                name: name,
                description: description,
                barcode: barcode,
                imageUrl: imageUrl,
                size: size,
              });

              productDetailsBasicInfo.find('.cost-container .price-container').filter(function filterPriceDetails() {
                var priceContent = $(this).find('.product-price');
                var currentPrice = self.getCurrentPrice(priceContent);
                var wasPrice = self.getWasPrice(priceContent);
                var unitPrice = self.getUnitPrice($(this));

                productInfo = productInfo.merge({
                  currentPrice: currentPrice,
                  wasPrice: wasPrice || undefined,
                  unitPrice: unitPrice,
                });

                return 0;
              });

              productDetailsBasicInfo.find('.cost-container .club-price-container').filter(function filterClubPriceDetails() {
                var clubPriceContent = $(this).find('.drop-down-club-price-wrapper');
                var currentPrice = self.getClubPrice(clubPriceContent);
                var nonClubPriceContent = $(this)
                  .find('.grid-non-club-price')
                  .text()
                  .trim();
                var wasPrice = self.removeDollarSignFromPrice(nonClubPriceContent.substring(nonClubPriceContent.indexOf('$')));
                var unitPrice = self.getUnitPrice($(this));

                productInfo = productInfo.merge({
                  currentPrice: currentPrice,
                  wasPrice: wasPrice || undefined,
                  unitPrice: unitPrice,
                });

                return 0;
              });

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

    _this.getCurrentPrice = function(productPriceContent) {
      var currentPriceContent = productPriceContent
        .find('.price')
        .text()
        .trim();
      var currentPriceTails = productPriceContent
        .find('.price .visible-phone')
        .text()
        .trim();
      var currentPriceContentIncludingDollarSign = currentPriceContent.substring(0, currentPriceContent.indexOf(currentPriceTails));

      return _2.StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceContentIncludingDollarSign);
    };

    _this.getWasPrice = function(productPriceContent) {
      var wasPriceContent = productPriceContent
        .find('.was-price')
        .text()
        .trim();

      return parseFloat(wasPriceContent.substring(wasPriceContent.indexOf('$') + 1));
    };

    _this.getUnitPrice = function(priceContainer) {
      var unitPriceContent = priceContainer
        .find('.cup-price')
        .text()
        .trim();
      var price = _2.StoreCrawlerServiceBase.removeDollarSignFromPrice(unitPriceContent.substring(0, unitPriceContent.indexOf('/')));
      var size = unitPriceContent.substring(unitPriceContent.indexOf('/') + 1);

      if (!price && !size) {
        return undefined;
      }

      return (0, _immutable.Map)({
        price: price || undefined,
        size: size || undefined,
      });
    };

    _this.translateBadge = function(url) {
      var lowerCaseUrl = url.toLowerCase();
      if (lowerCaseUrl.indexOf('badge-special') !== -1) {
        return (0, _immutable.Map)({ special: true });
      }

      if (lowerCaseUrl.indexOf('badge-pricelockdown') !== -1) {
        return (0, _immutable.Map)({ priceLockDown: true });
      }

      if (lowerCaseUrl.indexOf('view-nutrition-info') !== -1) {
        return (0, _immutable.Map)({ viewNutritionInfo: true });
      }

      if (lowerCaseUrl.indexOf('badge-gluten-free') !== -1) {
        return (0, _immutable.Map)({ glutenFree: true });
      }

      if (lowerCaseUrl.indexOf('badge-onecard') !== -1) {
        return (0, _immutable.Map)({ onecard: true });
      }

      if (lowerCaseUrl.indexOf('low_price') !== -1) {
        return (0, _immutable.Map)({ lowPriceEveryday: true });
      }

      if (lowerCaseUrl.indexOf('badge-new') !== -1) {
        return (0, _immutable.Map)({ new: true });
      }

      var multiBuyIconUrl = lowerCaseUrl.match(/\dfor\d/);

      if (multiBuyIconUrl) {
        var multiBuyFullText = lowerCaseUrl
          .substring(lowerCaseUrl.lastIndexOf('/') + 1)
          .trim()
          .match(/\d+/g);
        var awardQuantity = parseInt(multiBuyFullText[0], 10);
        var awardValue = parseFloat(multiBuyFullText[1]);

        if (awardValue >= 100) {
          awardValue /= 100;
        }

        return (0, _immutable.Map)({
          multiBuyInfo: (0, _immutable.Map)({
            awardQuantity: awardQuantity,
            awardValue: awardValue,
          }),
        });
      }

      return (0, _immutable.Map)();
    };

    _this.getClubPrice = function(productPriceContent) {
      var currentPriceContent = productPriceContent.text().trim();
      var currentPriceTails = productPriceContent
        .find('.visible-phone')
        .text()
        .trim();
      var currentPriceContentIncludingDollarSign = currentPriceContent.substring(0, currentPriceContent.indexOf(currentPriceTails));

      return _2.StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceContentIncludingDollarSign);
    };

    _this.getBarcodeFromImageUrl = function(imageUrl) {
      var largeIndex = imageUrl.indexOf('large/');

      if (largeIndex !== -1) {
        var _str = imageUrl.substr(largeIndex + 6);

        return _str.substr(0, _str.indexOf('.jpg'));
      }

      var bigIndex = imageUrl.indexOf('big/');

      if (bigIndex !== -1) {
        var _str2 = imageUrl.substr(bigIndex + 4);

        return _str2.substr(0, _str2.indexOf('.jpg'));
      }

      var zoomIndex = imageUrl.indexOf('zoom/');
      var str = imageUrl.substr(zoomIndex + 5);

      return str.substr(0, str.indexOf('.jpg'));
    };

    _this.updateProductDetails = (function() {
      var _ref9 = _asyncToGenerator(
        regeneratorRuntime.mark(function _callee9(product, storeTags, originalProductInfo, updatePriceDetails, storeName, sessionToken) {
          var masterProductId,
            storeId,
            productInfo,
            priceDetails,
            priceToDisplay,
            currentPrice,
            wasPrice,
            multiBuyInfo,
            unitPrice,
            saving,
            savingPercentage,
            temp,
            masterProductPrice;
          return regeneratorRuntime.wrap(
            function _callee9$(_context9) {
              while (1) {
                switch ((_context9.prev = _context9.next)) {
                  case 0:
                    masterProductId = product.get('masterProductId');
                    storeId = product.get('storeId');
                    productInfo = originalProductInfo;

                    if (!updatePriceDetails) {
                      _context9.next = 18;
                      break;
                    }

                    priceDetails = void 0;
                    priceToDisplay = void 0;

                    if (productInfo.has('onecard') && productInfo.get('onecard')) {
                      priceDetails = (0, _immutable.Map)({
                        specialType: 'onecard',
                      });

                      priceToDisplay = productInfo.get('currentPrice');
                    } else if (productInfo.has('multiBuyInfo') && productInfo.get('multiBuyInfo')) {
                      priceDetails = (0, _immutable.Map)({
                        specialType: 'multiBuy',
                      });

                      priceToDisplay = productInfo.getIn(['multiBuyInfo', 'awardValue']) / productInfo.getIn(['multiBuyInfo', 'awardQuantity']);
                      productInfo = productInfo.set('wasPrice', productInfo.get('currentPrice')).set('currentPrice', priceToDisplay);
                    } else if (productInfo.has('wasPrice') && productInfo.get('wasPrice')) {
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
                    multiBuyInfo = productInfo.get('multiBuyInfo');
                    unitPrice = productInfo.get('unitPrice');
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
                      .merge(multiBuyInfo ? (0, _immutable.Map)({ multiBuyInfo: multiBuyInfo }) : (0, _immutable.Map)())
                      .merge(unitPrice ? (0, _immutable.Map)({ unitPrice: unitPrice }) : (0, _immutable.Map)())
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
                    });
                    _context9.next = 18;
                    return _this.createOrUpdateMasterProductPrice(masterProductId, storeId, masterProductPrice, priceDetails, sessionToken);

                  case 18:
                    _context9.next = 20;
                    return _trolleySmartParseServerCommon.StoreMasterProductService.update(
                      product.merge({
                        name: productInfo.get('name'),
                        description: productInfo.get('description'),
                        barcode: productInfo.get('barcode'),
                        imageUrl: productInfo.get('imageUrl'),
                        size: productInfo.get('size'),
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

                  case 20:
                  case 'end':
                    return _context9.stop();
                }
              }
            },
            _callee9,
            _this2,
          );
        }),
      );

      return function(_x9, _x10, _x11, _x12, _x13, _x14) {
        return _ref9.apply(this, arguments);
      };
    })();

    return _this;
  }

  return CountdownWebCrawlerService;
})(_2.StoreCrawlerServiceBase);

CountdownWebCrawlerService.urlPrefix = '/Shop/Browse/';
exports.default = CountdownWebCrawlerService;
