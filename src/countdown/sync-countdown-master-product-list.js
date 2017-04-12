import Crawler from 'crawler';
import Immutable, {
  List,
  Map,
} from 'immutable';
import StoreCrawlerConfiguration from '../parse-server/schema/store-crawler-configuration';
import CountdownMasterProductList from '../parse-server/schema/countdown-master-product-list';

function getCountdownConfiguration() {
  return new Promise((resolve, reject) => {
    const query = new Parse.Query(StoreCrawlerConfiguration);

    query.equalTo('name', 'Countdown');

    return query.find()
      .then((result) => {
        if (result.length === 1) {
          resolve(new StoreCrawlerConfiguration(result[0])
            .getConfigParameters());
        }

        reject('Failed to retrieve store crawler configuration for Countdown.');
      })
      .catch(error => reject(error));
  });
}

function getBarcodeFromImagePath(imgPath) {
  const str = imgPath.substr(imgPath.indexOf('big/') + 4);
  const barcode = str.substr(0, str.indexOf('.jpg'));

  return barcode;
}

function extractProducts(configParameters, $) {
  let products = List();

  $('#product-list')
    .filter(function filterProductListCallback() { // eslint-disable-line array-callback-return
      const data = $(this);

      data.find('.product-stamp .details-container')
        .each(function onNewProductExtracted() {
          const product = $(this);
          const imageUrl = configParameters.baseImageUrl + product.find('.product-stamp-thumbnail img')
            .attr('src');
          const barcode = getBarcodeFromImagePath(imageUrl);
          const description = product.find('.description')
            .text();

          products = products.push(Map({
            description,
            barcode,
            imageUrl,
          }));
        });
    });

  return products;
}

function getProductCategoriesInfo(configParameters, logInfo, logError) {
  return new Promise((resolve, reject) => {
    let productsCategoriesInfo = List();
    const crawler = new Crawler({
      rateLimit: 2000,
      maxConnections: 1,
      callback: (error, res, done) => {
        logInfo(`Received page information response for Url: ${res.request.uri.href}`);

        if (error) {
          logError(`Failed to receive page information for Url: ${res.request.uri.href} - Error: ${error}`);
          done();
          reject(error);

          return;
        }

        const totalPageNumber = parseInt(res.$('.paging-container .paging .page-number')
          .last()
          .text(), 10);

        if (!totalPageNumber) {
          logError(`Failed to receive page information for Url: ${res.request.uri.href}`);
          done();
          reject(error);

          return;
        }

        productsCategoriesInfo = productsCategoriesInfo.push(
          Map({
            productCategory: res.request.uri.href.replace(configParameters.baseUrl, ''),
            totalPageNumber,
          }));

        done();
      },
    });

    crawler.on('drain', () => {
      logInfo('Finished fetching pages inforamtion.');
      resolve(Map({
        configParameters,
        productsCategoriesInfo,
      }));
    });

    configParameters.productCategories.forEach(productCategory => crawler.queue(configParameters.baseUrl + productCategory));
  });
}

function getProducts(configParameters, productsCategoriesInfo, logInfo, logError) {
  return new Promise((resolve, reject) => {
    let products = List();
    const crawler = new Crawler({
      rateLimit: 2000,
      maxConnections: 1,
      callback: (error, res, done) => {
        logInfo(`Received products for Url: ${res.request.uri.href}`);

        if (error) {
          logError(`Failed to receive products for Url: ${res.request.uri.href} - Error: ${error}`);
          done();
          reject(error);

          return;
        }

        products = products.concat(extractProducts(configParameters, res.$));

        done();
      },
    });

    crawler.on('drain', () => {
      logInfo('Finished fetching products.');
      resolve(products);
    });

    productsCategoriesInfo.forEach(productCategoryInfo => [...Array(productCategoryInfo.get('totalPageNumber'))
      .keys(),
    ].forEach(pageNumber => crawler.queue(`${configParameters.baseUrl + productCategoryInfo.get('productCategory')}?page=${pageNumber + 1}`)));
  });
}

function getExistingMatchingProduct(products) {
  return new Promise((resolve, reject) => {
    Promise.all(products.map((product) => {
      const query = new Parse.Query(CountdownMasterProductList);

      query.equalTo('description', product.get('description'));

      return query.find();
    })
        .toArray())
      .then((results) => {
        resolve(Map({
          products,
          existingProducts: Immutable.fromJS(results)
            .flatMap(_ => _)
            .map(_ => new CountdownMasterProductList(_)),
        }));
      })
      .catch(error => reject(error));
  });
}

function saveProducts(products) {
  return new Promise((resolve, reject) => {
    Promise.all(
        products.map(product =>
          CountdownMasterProductList.spawn(
            product.get('description'),
            product.get('barcode'),
            product.get('imageUrl'))
          .save())
        .toArray())
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

Parse.Cloud.job('Sync-Countdown-Master-Product-List', (request, status) => {
  const log = request.log;

  status.message('The job has started.');

  getCountdownConfiguration()
    .then(configParameters =>
      getProductCategoriesInfo(
        configParameters,
        message => log.info(message),
        message => log.error(message)))
    .then(result =>
      getProducts(
        result.get('configParameters'),
        result.get('productsCategoriesInfo'),
        message => log.info(message),
        message => log.error(message)))
    .then((products) => {
      const uniqueProducts = products.filterNot(_ => _.get('description')
          .trim()
          .length === 0)
        .groupBy(_ => _.get('description'))
        .map(_ => _.first());

      return getExistingMatchingProduct(uniqueProducts);
    })
    .then((result) => {
      const products = result.get('products');
      const existingProducts = result.get('existingProducts');
      const productsToAdd = products.filterNot(product =>
        existingProducts
        .find(existingProduct => product
          .get('description')
          .localeCompare(existingProduct.getDescription()) === 0));

      return saveProducts(productsToAdd);
    })
    .then(() => {
      log.info('Job completed successfully.');
      status.error('Job completed successfully.');
    })
    .catch((error) => {
      log.error(error);
      status.error('Job completed in error.');
    });
});
