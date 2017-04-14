'use strict';

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _storeCrawlerConfiguration = require('../parse-server/schema/store-crawler-configuration');

var _storeCrawlerConfiguration2 = _interopRequireDefault(_storeCrawlerConfiguration);

var _countdownMasterProductList = require('../parse-server/schema/countdown-master-product-list');

var _countdownMasterProductList2 = _interopRequireDefault(_countdownMasterProductList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getCountdownConfiguration() {
  return new Promise(function (resolve, reject) {
    var query = new Parse.Query(_storeCrawlerConfiguration2.default);

    query.equalTo('name', 'Countdown');

    return query.find().then(function (result) {
      if (result.length === 1) {
        resolve(new _storeCrawlerConfiguration2.default(result[0]).getConfigParameters());
      }

      reject('Failed to retrieve store crawler configuration for Countdown.');
    }).catch(function (error) {
      return reject(error);
    });
  });
}

function getBarcodeFromImagePath(imgPath) {
  var str = imgPath.substr(imgPath.indexOf('big/') + 4);
  var barcode = str.substr(0, str.indexOf('.jpg'));

  return barcode;
}

function extractProducts(configParameters, $) {
  var products = (0, _immutable.List)();

  $('#product-list').filter(function filterProductListCallback() {
    // eslint-disable-line array-callback-return
    var data = $(this);

    data.find('.product-stamp .details-container').each(function onNewProductExtracted() {
      var product = $(this);
      var imageUrl = configParameters.baseImageUrl + product.find('.product-stamp-thumbnail img').attr('src');
      var barcode = getBarcodeFromImagePath(imageUrl);
      var description = product.find('.description').text();

      products = products.push((0, _immutable.Map)({
        description: description,
        barcode: barcode,
        imageUrl: imageUrl
      }));
    });
  });

  return products;
}

function getProductCategoriesInfo(configParameters, logInfo, logError) {
  return new Promise(function (resolve, reject) {
    var productsCategoriesInfo = (0, _immutable.List)();
    var crawler = new _crawler2.default({
      rateLimit: 2000,
      maxConnections: 1,
      callback: function callback(error, res, done) {
        logInfo('Received page information response for Url: ' + res.request.uri.href);

        if (error) {
          logError('Failed to receive page information for Url: ' + res.request.uri.href + ' - Error: ' + error);
          done();
          reject(error);

          return;
        }

        var totalPageNumber = parseInt(res.$('.paging-container .paging .page-number').last().text(), 10);

        if (!totalPageNumber) {
          logError('Failed to receive page information for Url: ' + res.request.uri.href);
          done();
          reject(error);

          return;
        }

        productsCategoriesInfo = productsCategoriesInfo.push((0, _immutable.Map)({
          productCategory: res.request.uri.href.replace(configParameters.baseUrl, ''),
          totalPageNumber: totalPageNumber
        }));

        done();
      }
    });

    crawler.on('drain', function () {
      logInfo('Finished fetching pages inforamtion.');
      resolve((0, _immutable.Map)({
        configParameters: configParameters,
        productsCategoriesInfo: productsCategoriesInfo
      }));
    });

    configParameters.productCategories.forEach(function (productCategory) {
      return crawler.queue(configParameters.baseUrl + productCategory);
    });
  });
}

function getProducts(configParameters, productsCategoriesInfo, logInfo, logError) {
  return new Promise(function (resolve, reject) {
    var products = (0, _immutable.List)();
    var crawler = new _crawler2.default({
      rateLimit: 2000,
      maxConnections: 1,
      callback: function callback(error, res, done) {
        logInfo('Received products for Url: ' + res.request.uri.href);

        if (error) {
          logError('Failed to receive products for Url: ' + res.request.uri.href + ' - Error: ' + error);
          done();
          reject(error);

          return;
        }

        products = products.concat(extractProducts(configParameters, res.$));

        done();
      }
    });

    crawler.on('drain', function () {
      logInfo('Finished fetching products.');
      resolve(products);
    });

    productsCategoriesInfo.forEach(function (productCategoryInfo) {
      return [].concat(_toConsumableArray(Array(productCategoryInfo.get('totalPageNumber')).keys())).forEach(function (pageNumber) {
        return crawler.queue(configParameters.baseUrl + productCategoryInfo.get('productCategory') + '?page=' + (pageNumber + 1));
      });
    });
  });
}

function getExistingMatchingProduct(products) {
  return new Promise(function (resolve, reject) {
    Promise.all(products.map(function (product) {
      var query = new Parse.Query(_countdownMasterProductList2.default);

      query.equalTo('description', product.get('description'));

      return query.find();
    }).toArray()).then(function (results) {
      resolve((0, _immutable.Map)({
        products: products,
        existingProducts: _immutable2.default.fromJS(results).flatMap(function (_) {
          return _;
        }).map(function (_) {
          return new _countdownMasterProductList2.default(_);
        })
      }));
    }).catch(function (error) {
      return reject(error);
    });
  });
}

function saveProducts(products) {
  return new Promise(function (resolve, reject) {
    Promise.all(products.map(function (product) {
      return _countdownMasterProductList2.default.spawn(product.get('description'), product.get('barcode'), product.get('imageUrl')).save();
    }).toArray()).then(function () {
      return resolve();
    }).catch(function (error) {
      return reject(error);
    });
  });
}

Parse.Cloud.job('Crawl Countdown Products', function (request, status) {
  var log = request.log;

  status.message('The job has started.');

  getCountdownConfiguration().then(function (configParameters) {
    return getProductCategoriesInfo(configParameters, function (message) {
      return log.info(message);
    }, function (message) {
      return log.error(message);
    });
  }).then(function (result) {
    return getProducts(result.get('configParameters'), result.get('productsCategoriesInfo'), function (message) {
      return log.info(message);
    }, function (message) {
      return log.error(message);
    });
  }).then(function (products) {
    var uniqueProducts = products.filterNot(function (_) {
      return _.get('description').trim().length === 0;
    }).groupBy(function (_) {
      return _.get('description');
    }).map(function (_) {
      return _.first();
    });

    return getExistingMatchingProduct(uniqueProducts);
  }).then(function (result) {
    var products = result.get('products');
    var existingProducts = result.get('existingProducts');
    var productsToAdd = products.filterNot(function (product) {
      return existingProducts.find(function (existingProduct) {
        return product.get('description').localeCompare(existingProduct.getDescription()) === 0;
      });
    });

    return saveProducts(productsToAdd);
  }).then(function () {
    log.info('Job completed successfully.');
    status.success('Job completed successfully.');
  }).catch(function (error) {
    log.error(error);
    status.error('Job completed in error.');
  });
});