'use strict';

var _crawler = require('crawler');

var _crawler2 = _interopRequireDefault(_crawler);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _MasterProductList = require('../parse-server/schema/MasterProductList');

var _MasterProductList2 = _interopRequireDefault(_MasterProductList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var defaultUrl = 'https://shop.countdown.co.nz/Shop/Browse/';

function getCategoryPageSize($) {
  var r = $('.paging-container .paging .page-number').last();

  return parseInt(r.text(), 10);
}

function crawlProductCategoryPagingInfomation(log, productCategories) {
  log.info('Crawling pages for category: ' + productCategory);

  return productCategories.map(function (productCategory) {
    return new Promise(function (resolve, reject) {
      var crawler = new _crawler2.default({
        maxConnections: 10,
        callback: function callback(error, res, done) {
          log.info('Response while crawling category: ' + productCategory + ' - ' + res);

          if (error) {
            done();
            reject(error);

            return;
          }

          var pageSize = getCategoryPageSize(res.$);

          done();
          resolve({
            productCategory: productCategory,
            pageSize: pageSize
          });
        }
      });

      crawler.queue(defaultUrl + productCategory);
    });
  });
}

function getBarcodeFromImagePath(imgPath) {
  var str = imgPath.substr(imgPath.indexOf('big/') + 4);
  var barcode = str.substr(0, str.indexOf('.jpg'));

  return barcode;
}

function extractProducts(log, $) {
  // $ is Cheerio by default
  var products = [];
  $('#product-list').filter(function () {
    var data = $(this);

    data.find('.product-stamp .details-container').each(function (i, elem) {
      var product = $(this);
      var productImagePath = 'https://shop.countdown.co.nz' + product.find('.product-stamp-thumbnail img').attr('src');
      var productBarcode = getBarcodeFromImagePath(productImagePath);
      var productDescription = product.find('.description').text();
      products.push({
        productDescription: productDescription,
        productBarcode: productBarcode,
        productImagePath: productImagePath
      });
    });
  });

  return products;
}

function getProducts(log, productCategory, pageSize) {
  log.info('Going to fetch product for category:' + productCategory + ' contains ' + pageSize + ' pages.');

  var pageNumbers = [].concat(_toConsumableArray(Array(pageSize).keys()));

  return pageNumbers.map(function (pageNumber) {
    return new Promise(function (resolve, reject) {
      var c = new _crawler2.default({
        maxConnections: 10,
        // This will be called for each crawled page
        callback: function callback(error, res, done) {
          log.info('Response while crawling product for category: ' + productCategory + ' - page number: ' + pageNumber + ' - ' + res);

          if (error) {
            done();
            reject(error);
            return;
          }

          var products = extractProducts(log, res.$);

          done();
          resolve({
            productCategory: productCategory,
            products: products
          });
        }
      });

      var productPageUrl = defaultUrl + productCategory + '?page=' + (pageNumber + 1);
      c.queue(productPageUrl);
    });
  });
}

Parse.Cloud.job('Countdown-Sync-Master-Product-List', function (request, status) {
  var log = request.log;

  status.message('The job has started.');

  var productCategories = ['bakery', 'easter', 'baby-care', 'baking-cooking'];
  var productCategoriesPromises = crawlProductCategoryPagingInfomation(log, productCategories);

  Promise.all(productCategoriesPromises).then(function (results) {
    var allProductPromises = _immutable2.default.fromJS(results).map(function (result) {
      return getProducts(log, result.get('productCategory'), result.get('pageSize'));
    }).flatMap(function (_) {
      return _;
    });

    Promise.all(allProductPromises).then(function (allProductInfo) {
      var groupedByProductCategory = _immutable2.default.fromJS(allProductInfo).groupBy(function (_) {
        return _.get('productCategory');
      });

      Promise.all(groupedByProductCategory.keySeq().map(function (productCategory) {
        return groupedByProductCategory.get(productCategory).map(function (_) {
          return _.get('products');
        }).flatMap(function (_) {
          return _;
        }).map(function (product) {
          return {
            productCategory: productCategory,
            product: product.toJS()
          };
        });
      }).flatMap(function (_) {
        return _;
      }).map(function (_) {
        return _MasterProductList2.default.spawn(_.product.productDescription, _.product.productBarcode, _.product.productImagePath, _.productCategory).save();
      }).toJS()).then(function (results) {
        return status.success('The job has finished successfully.');
      }).catch(function (error) {
        log.error(error);
        status.error('Job completed in error.');
      });
    }).catch(function (error) {
      log.error(error);
      status.error('Job completed in error.');
    });
  }).catch(function (error) {
    log.error(error);
    status.error('Job completed in error.');
  });
});