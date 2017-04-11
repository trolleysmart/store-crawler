import Crawler from 'crawler';
import Immutable from 'immutable';
import MasterProductList from '../parse-server/schema/MasterProductList';

const defaultUrl = 'https://shop.countdown.co.nz/Shop/Browse/';

const crawlProductCategoryPagingInfomation = (productCategories) => {
  const getCategoryPageSize = ($) => {
    const r = $('.paging-container .paging .page-number')
      .last();

    return parseInt(r.text(), 10);
  };

  return productCategories.map(productCategory =>
    new Promise((resolve, reject) => {
      const crawler = new Crawler({
        maxConnections: 10,
        callback: (error, res, done) => {
          if (error) {
            reject(error);

            return;
          }

          const pageSize = getCategoryPageSize(res.$);
          done();
          resolve({
            productCategory,
            pageSize,
          });
        },
      });

      crawler.queue(defaultUrl + productCategory);
    }));
};

const getBarcodeFromImagePath = (imgPath) => {
  const str = imgPath.substr(imgPath.indexOf('big/') + 4);
  const barcode = str.substr(0, str.indexOf('.jpg'));
  return barcode;
};

const extractProducts = ($) => {
  // $ is Cheerio by default
  const products = [];
  $('#product-list')
    .filter(function () {
      const data = $(this);

      data.find('.product-stamp .details-container')
        .each(function (i, elem) {
          const product = $(this);
          const productImagePath = `https://shop.countdown.co.nz${product.find('.product-stamp-thumbnail img')
            .attr('src')}`;
          const productBarcode = getBarcodeFromImagePath(productImagePath);
          const productDescription = product.find('.description')
            .text();
          products.push({
            productDescription,
            productBarcode,
            productImagePath,
          });
        });
    });

  return products;
};

function getProducts(log, productCategory, pageSize) {
  log.info(`Going to fetch product for category:${productCategory} contains ${pageSize} pages.`);

  const pageNumbers = [...Array(pageSize)
    .keys(),
  ];

  return pageNumbers.map(pageNumber => new Promise((resolve, reject) => {
    const c = new Crawler({
      maxConnections: 10,
      // This will be called for each crawled page
      callback(error, res, done) {
        if (error) {
          done();
          reject(error);
          return;
        }

        const products = extractProducts(res.$);

        done();
        resolve({
          productCategory,
          products,
        });
      },
    });

    const productPageUrl = `${defaultUrl + productCategory}?page=${pageNumber + 1}`;
    c.queue(productPageUrl);
  }));
}

Parse.Cloud.job('Countdown-Sync-Master-Product-List', (request, status) => {
  const log = request.log;

  status.message('The job has started.');

  const productCategories = ['bakery', 'easter', 'baby-care', 'baking-cooking'];
  const productCategoriesPromises = crawlProductCategoryPagingInfomation(productCategories);

  Promise.all(productCategoriesPromises)
    .then((results) => {
      const allProductPromises = Immutable.fromJS(results)
        .map(result => getProducts(log, result.get('productCategory'), result.get('pageSize')))
        .flatMap(_ => _);

      Promise.all(allProductPromises)
        .then((allProductInfo) => {
          const groupedByProductCategory = Immutable
            .fromJS(allProductInfo)
            .groupBy(_ => _.get('productCategory'));

          Promise.all(groupedByProductCategory
              .keySeq()
              .map(productCategory =>
                groupedByProductCategory.get(productCategory)
                .map(_ => _.get('products'))
                .flatMap(_ => _)
                .map(product => ({
                  productCategory,
                  product: product.toJS(),
                })))
              .flatMap(_ => _)
              .map(_ => MasterProductList
                .spawn(_.product.productDescription,
                  _.product.productBarcode,
                  _.product.productImagePath,
                  _.productCategory)
                .save())
              .toJS())
            .then(results => status.success('The job has finished successfully.'))
            .catch((error) => {
              log.error(error);
              status.error('Job completed in error.');
            });
        })
        .catch((error) => {
          log.error(error);
          status.error('Job completed in error.');
        });
    })
    .catch((error) => {
      log.error(error);
      status.error('Job completed in error.');
    });
});
