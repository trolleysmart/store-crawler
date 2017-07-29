// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import Immutable, { List, Map, Range, Set } from 'immutable';
import moment from 'moment';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService, StoreMasterProductService } from 'trolley-smart-parse-server-common';
import { ServiceBase } from '../common';

export default class WarehouseWebCrawlerService extends ServiceBase {
  crawlProductCategories = async (config, sessionToken) => {
    const result = await this.createNewCrawlSessionAndGetConfig('Warehouse Product Categories', config, 'Warehouse', sessionToken);
    const sessionInfo = result.get('sessionInfo');
    const sessionId = sessionInfo.get('id');
    const finalConfig = result.get('config');

    try {
      await this.crawlAllProductCategories(sessionId, finalConfig, sessionToken);

      const updatedSessionInfo = sessionInfo.merge(
        Map({
          endDateTime: new Date(),
          additionalInfo: Map({
            status: 'success',
          }),
        }),
      );

      await CrawlSessionService.update(updatedSessionInfo, sessionToken);
    } catch (ex) {
      const errorMessage = ex instanceof Exception ? ex.getErrorMessage() : ex;
      const updatedSessionInfo = sessionInfo.merge(
        Map({
          endDateTime: new Date(),
          additionalInfo: Map({
            status: 'failed',
            error: errorMessage,
          }),
        }),
      );

      await CrawlSessionService.update(updatedSessionInfo, sessionToken);
      throw ex;
    }
  };

  crawlAllProductCategories = (sessionId, config, sessionToken) =>
    new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${this.safeGetUri(res)}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product categories for Url: ${this.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const productCategories = this.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);
          const crawlResult = Map({
            crawlSessionId: sessionId,
            resultSet: Map({
              productCategories,
            }),
          });

          CrawlResultService.create(crawlResult, null, sessionToken)
            .then(() => {
              this.logInfo(config, () => `Successfully added products for: ${productCategories}.`);

              done();
            })
            .catch((err) => {
              this.logError(config, () => `Failed to save products for: ${productCategories}. Error: ${JSON.stringify(err)}`);

              done();
              reject(`Failed to save products for: ${productCategories}. Error: ${JSON.stringify(err)}`);
            });
        },
      });

      crawler.on('drain', () => resolve());
      crawler.queue(config.get('baseUrl'));
    });

  crawlLevelOneProductCategoriesAndSubProductCategories = (config, $) => {
    const self = this;
    let productCategories = Set();

    $('.menu-container .level-1 .menu-category').filter(function filterMenuItems() {
      $(this).children().each(function onEachMenuItem() {
        const menuItem = $(this);
        const categoryKey = menuItem.attr('class');

        if (
          config.get('categoryKeysToExclude') &&
          config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
        ) {
          return 0;
        }

        productCategories = productCategories.add(
          Map({
            categoryKey,
            url: menuItem.find('.level-1').attr('href'),
            name: menuItem.find('.level-1').text().trim(),
            weight: 1,
            subCategories: self.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem, categoryKey),
          }),
        );

        return 0;
      });

      return 0;
    });

    return productCategories;
  };

  crawlLevelTwoProductCategoriesAndSubProductCategories = (config, $, parentNode, parentCategoryKey) => {
    const self = this;
    let productCategories = Set();

    parentNode.find('.menu-navigation .menu-container-level-2 .inner').filter(function filterMenuItems() {
      $(this).find('.category-column').each(function onEachColumn() {
        $(this).children().each(function onEachMenuItem() {
          const menuItem = $(this).find('.category-level-2');
          const categoryKey = `${parentCategoryKey}/${menuItem.attr('data-gtm-cgid')}`;

          if (
            config.get('categoryKeysToExclude') &&
            config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
          ) {
            return 0;
          }

          productCategories = productCategories.add(
            Map({
              categoryKey,
              url: menuItem.attr('href'),
              name: menuItem.text().trim(),
              weight: 2,
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

  crawlLevelThreeProductCategoriesAndSubProductCategories = (config, $, parentNode, parentCategoryKey) => {
    let productCategories = Set();

    parentNode.find('.menu-container-level-3').filter(function filterMenuItems() {
      $(this).children().each(function onEachMenuItem() {
        const menuItem = $(this).find('.category-level-3');
        const categoryKey = `${parentCategoryKey}/${menuItem.attr('data-gtm-cgid')}`;

        if (
          config.get('categoryKeysToExclude') &&
          config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
        ) {
          return 0;
        }

        productCategories = productCategories.add(
          Map({
            categoryKey,
            url: menuItem.attr('href'),
            name: menuItem.text().trim(),
            weight: 3,
          }),
        );

        return 0;
      });

      return 0;
    });

    return productCategories;
  };

  syncProductCategoriesToStoreTags = async (sessionToken) => {
    const store = await this.getStore('Warehouse', sessionToken);
    const storeId = store.get('id');
    const productCategories = Immutable.fromJS(
      (await this.getMostRecentCrawlResults(
        'Warehouse Product Categories',
        info => info.getIn(['resultSet', 'productCategories']),
        sessionToken,
      )).first(),
    );
    const storeTags = await this.getStoreTags(storeId, false, sessionToken);
    const splittedLevelOneProductCategories = this.splitIntoChunks(productCategories, 100);

    await BluebirdPromise.each(splittedLevelOneProductCategories.toArray(), productCategoryChunks =>
      Promise.all(
        productCategoryChunks.map(productCategory => this.createOrUpdateLevelOneProductCategory(productCategory, storeTags, storeId, sessionToken)),
      ),
    );

    const storeTagsWithUpdatedLevelOneProductCategories = await this.getStoreTags(storeId, false, sessionToken);
    const levelTwoProductCategories = productCategories
      .map(productCategory =>
        productCategory.update('subCategories', subCategories =>
          subCategories.map(subCategory => subCategory.set('parent', productCategory.get('categoryKey'))),
        ),
      )
      .flatMap(productCategory => productCategory.get('subCategories'));
    const levelTwoProductCategoriesGroupedByCategoryKey = levelTwoProductCategories.groupBy(productCategory => productCategory.get('categoryKey'));
    const splittedLevelTwoProductCategories = this.splitIntoChunks(levelTwoProductCategoriesGroupedByCategoryKey.valueSeq(), 100);

    await BluebirdPromise.each(splittedLevelTwoProductCategories.toArray(), productCategoryChunks =>
      Promise.all(
        productCategoryChunks.map(productCategory =>
          this.createOrUpdateLevelTwoProductCategory(productCategory, storeTagsWithUpdatedLevelOneProductCategories, storeId, sessionToken),
        ),
      ),
    );

    const storeTagsWithUpdatedLevelTwoProductCategories = await this.getStoreTags(storeId, false, sessionToken);
    const levelThreeProductCategories = productCategories
      .flatMap(productCategory => productCategory.get('subCategories'))
      .map(productCategory =>
        productCategory.update('subCategories', subCategories =>
          subCategories.map(subCategory => subCategory.set('parent', productCategory.get('categoryKey'))),
        ),
      )
      .flatMap(productCategory => productCategory.get('subCategories'));
    const levelThreeProductCategoriesGroupedByCategoryKey = levelThreeProductCategories.groupBy(productCategory =>
      productCategory.get('categoryKey'),
    );
    const splittedLevelThreeProductCategories = this.splitIntoChunks(levelThreeProductCategoriesGroupedByCategoryKey.valueSeq(), 100);

    await BluebirdPromise.each(splittedLevelThreeProductCategories.toArray(), productCategoryChunks =>
      Promise.all(
        productCategoryChunks.map(productCategory =>
          this.createOrUpdateLevelThreeProductCategory(productCategory, storeTagsWithUpdatedLevelTwoProductCategories, storeId, sessionToken),
        ),
      ),
    );
  };

  crawlProducts = async (config, sessionToken) => {
    const finalConfig = config || (await this.getConfig('Warehouse'));
    const store = await this.getStore('Warehouse', sessionToken);
    const storeId = store.get('id');
    const productCategories = Immutable.fromJS(
      (await this.getMostRecentCrawlResults(
        'Warehouse Product Categories',
        info => info.getIn(['resultSet', 'productCategories']),
        sessionToken,
      )).first(),
    );
    const productCategoriesLevelOne = productCategories.filter(_ => _.get('subCategories').isEmpty());
    const productCategoriesLevelTwo = productCategories
      .filterNot(_ => _.get('subCategories').isEmpty())
      .flatMap(_ => _.get('subCategories'))
      .filter(_ => _.get('subCategories').isEmpty());
    const productCategoriesLevelThree = productCategories
      .filterNot(_ => _.get('subCategories').isEmpty())
      .flatMap(_ => _.get('subCategories'))
      .filterNot(_ => _.get('subCategories').isEmpty())
      .flatMap(_ => _.get('subCategories'));
    const productCategoriesToCrawl = productCategoriesLevelOne.concat(productCategoriesLevelTwo).concat(productCategoriesLevelThree);
    const productCategoriesToCrawlWithTotalItemsInfo = await this.crawlProductCategoriesTotalItemsInfo(finalConfig, productCategoriesToCrawl);

    await this.crawlProductsForEachProductCategories(finalConfig, productCategoriesToCrawlWithTotalItemsInfo, storeId, sessionToken);
  };

  crawlProductCategoriesTotalItemsInfo = async (config, productCategories) => {
    let productCategoriesToCrawlWithTotalItemsInfo = List();

    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${this.safeGetUri(res)}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product category page info for Url: ${this.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const productCategory = productCategories.find(_ => _.get('url').localeCompare(this.safeGetUri(res)) === 0);

          if (!productCategory) {
            // Ignoring the returned URL as looks like Warehouse forward the URL to other different categories
            done();

            return;
          }

          productCategoriesToCrawlWithTotalItemsInfo = productCategoriesToCrawlWithTotalItemsInfo.push(
            productCategory.set('totalItems', this.crawlTotalItemsInfo(config, res.$)),
          );

          done();
        },
      });

      crawler.on('drain', () => resolve(productCategoriesToCrawlWithTotalItemsInfo));
      productCategories.forEach(productCategory => crawler.queue(productCategory.get('url')));
    });
  };

  crawlTotalItemsInfo = (config, $) => {
    let total = 0;

    $('.tab-content #results-products .pagination').filter(function filterPagination() {
      $(this).children().find('.results-hits').filter(function filterResultHit() {
        const info = $(this).text().trim();
        const line2 = info.split('\r\n')[1].trim();
        const spaceIdx = line2.indexOf(' ');

        total = parseInt(line2.substring(0, spaceIdx).replace(',', '').trim(), 10);

        return 0;
      });

      return 0;
    });

    return total;
  };

  crawlProductsForEachProductCategories = (config, productCategories, storeId, sessionToken) =>
    new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${this.safeGetUri(res)}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product category page info for Url: ${this.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const urlOffset = this.safeGetUri(res).indexOf('?');
          const baseUrl = this.safeGetUri(res).substring(0, urlOffset);
          const productCategory = productCategories.find(_ => _.get('url').localeCompare(baseUrl) === 0);

          if (!productCategory) {
            done();
            reject(`Failed to find product category page info for Url: ${baseUrl}`);

            return;
          }

          const productInfos = this.crawlProductInfo(config, res.$);

          Promise.all(
            productInfos
              .filter(productInfo => productInfo.get('productPageUrl'))
              .map(productInfo => this.createOrUpdateStoreMasterProduct(productCategory, productInfo, storeId, sessionToken)),
          )
            .then(() => done())
            .catch((storeProductUpdateError) => {
              done();
              reject(storeProductUpdateError);
            });
        },
      });

      crawler.on('drain', () => resolve());
      productCategories.forEach(productCategory =>
        Range(0, productCategory.get('totalItems'), 24).forEach(offset => crawler.queue(`${productCategory.get('url')}?sz=24&start=${offset}`)),
      );
    });

  crawlProductInfo = (config, $) => {
    let products = List();
    $('.tab-content .search-result-content .search-result-items').children().filter(function filterSearchResultItems() {
      const productPageUrl = $(this).find('.product-info-wrapper .name-link').attr('href');

      products = products.push(Map({ productPageUrl }));

      return 0;
    });

    return products;
  };

  crawlProductsDetails = async (config, sessionToken) => {
    const finalConfig = config || (await this.getConfig('Warehouse'));
    const store = await this.getStore('Warehouse', sessionToken);
    const storeId = store.get('id');
    const storeTags = await this.getStoreTags(storeId, false, sessionToken);
    const products = await this.getAllStoreMasterProducts(storeId, sessionToken);
    const splittedProducts = this.splitIntoChunks(products, 20);

    await BluebirdPromise.each(splittedProducts.toArray(), productChunk =>
      Promise.all(productChunk.map(product => this.crawlProductDetails(finalConfig, product, storeTags, false, sessionToken))),
    );
  };

  crawlProductsPriceDetails = async (config, sessionToken) => {
    const finalConfig = config || (await this.getConfig('Warehouse'));
    const store = await this.getStore('Warehouse', sessionToken);
    const storeId = store.get('id');
    const storeTags = await this.getStoreTags(storeId, false, sessionToken);
    const lastCrawlDateTime = new Date();

    lastCrawlDateTime.setDate(new Date().getDate() - 1);

    const products = await this.getStoreMasterProductsWithMasterProduct(storeId, lastCrawlDateTime, sessionToken);
    const splittedProducts = this.splitIntoChunks(products, 20);

    await BluebirdPromise.each(splittedProducts.toArray(), productChunk =>
      Promise.all(productChunk.map(product => this.crawlProductDetails(finalConfig, product, storeTags, true, sessionToken))),
    );
  };

  crawlProductDetails = (config, product, storeTags, updatePriceDetails, sessionToken) =>
    new Promise((resolve, reject) => {
      let productInfo = Map();
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${this.safeGetUri(res)}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product categories for Url: ${this.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const $ = res.$;
          const self = this;
          let tagUrls = List();

          $('.breadcrumb').children().filter(function filterTags() {
            const tag = $(this).find('a').attr('href');

            tagUrls = tagUrls.push(tag);

            return 0;
          });

          tagUrls = tagUrls.skip(1).pop();

          productInfo = productInfo.merge({ tagUrls });

          $('#pdpMain').filter(function filterMainContainer() {
            const mainContainer = $(this);

            mainContainer.find('.row-product-details').filter(function filterDetails() {
              $(this).find('.product-image-container .product-primary-image .product-image .primary-image').filter(function filterImage() {
                productInfo = productInfo.merge({
                  imageUrl: $(this).attr('src'),
                });

                return 0;
              });

              $(this).find('.product-detail').filter(function filterDetail() {
                const name = $(this).find('.product-name').text().trim();
                const descriptionContainer = $(this).find('.product-description');
                const description = descriptionContainer.find('.description-text').text().trim().split('\r\n')[0];
                const barcode = descriptionContainer.find('.product-number .product-id').text().trim().split('\r\n')[0];
                const priceContainer = $(this).find('#product-content .upper-product-price .product-price');

                productInfo = productInfo.merge(self.crawlStandardPrice($, priceContainer));
                productInfo = productInfo.merge(self.crawlSalePrice($, priceContainer));
                productInfo = productInfo.merge(self.crawlSavingPrice($, priceContainer, productInfo));
                productInfo = productInfo.merge(self.crawlOfferEndDate($, priceContainer));

                productInfo = productInfo.merge({
                  name,
                  description,
                  barcode,
                });

                return 0;
              });

              return 0;
            });

            productInfo = productInfo.merge(self.crawlBenefitAndFeatures($, mainContainer));

            return 0;
          });

          this.updateProductDetails(product, storeTags, productInfo, updatePriceDetails, sessionToken).then(() => done()).catch((internalError) => {
            done();
            reject(internalError);
          });
        },
      });

      crawler.on('drain', () => resolve());
      crawler.queue(product.get('productPageUrl'));
    });

  crawlStandardPrice = ($, priceContainer) => {
    const self = this;
    let result = Map();

    priceContainer.find('.standardprice .pv-price').filter(function filterstandardPrice() {
      const currentPriceWithDollarSign = $(this).text().trim();
      const currentPrice = self.removeDollarSignFromPrice(currentPriceWithDollarSign);

      result = Map({ currentPrice });

      return 0;
    });

    return result;
  };

  crawlSalePrice = ($, priceContainer) => {
    const self = this;
    let result = Map();

    priceContainer.find('.price-sales .pv-price').filter(function filterStandardPrice() {
      const currentPriceWithDollarSign = $(this).text().trim();
      const currentPrice = self.removeDollarSignFromPrice(currentPriceWithDollarSign);

      result = Map({ currentPrice });

      return 0;
    });

    return result;
  };

  crawlSavingPrice = ($, priceContainer, productInfo) => {
    const self = this;
    let result = Map();

    priceContainer.find('.promotion .save-amount').filter(function filterSalePrice() {
      const savingText = $(this).text().trim();
      const savingWithDollarSign = savingText.substring(savingText.indexOf('$'));
      const saving = self.removeDollarSignFromPrice(savingWithDollarSign);

      result = Map({
        saving,
        wasPrice: saving ? Math.round((productInfo.get('currentPrice') + saving) * 100) / 100 : undefined,
      });

      return 0;
    });

    return result;
  };

  crawlOfferEndDate = ($, priceContainer) => {
    let result = Map();

    priceContainer.find('.offers-end').filter(function filterOfferEndDate() {
      const offerEndDateText = $(this).text().trim();
      const offerEndDate = offerEndDateText.substring(offerEndDateText.lastIndexOf(' ')).trim();

      result = Map({ offerEndDate: moment(offerEndDate, 'DD/MM/YYYY').toDate() });

      return 0;
    });

    return result;
  };

  crawlBenefitAndFeatures = ($, mainContainer) => {
    let benefitsAndFeatures = List();

    mainContainer.find('.row .product-features-print .product-features .featuresbenefits-text ul').children().filter(function filterFeatureBenefit() {
      benefitsAndFeatures = benefitsAndFeatures.push($(this).text().trim());

      return 0;
    });

    return Map({ benefitsAndFeatures });
  };

  updateProductDetails = async (product, storeTags, productInfo, updatePriceDetails, sessionToken) => {
    const masterProductId = product.get('masterProductId');
    const storeId = product.get('storeId');

    if (updatePriceDetails) {
      let priceDetails;
      let priceToDisplay;

      if ((productInfo.has('wasPrice') && productInfo.get('wasPrice')) || (productInfo.has('offerEndDate') && productInfo.get('offerEndDate'))) {
        priceDetails = Map({
          specialType: 'special',
        });

        priceToDisplay = productInfo.get('currentPrice');
      } else {
        priceDetails = Map({
          specialType: 'none',
        });

        priceToDisplay = productInfo.get('currentPrice');
      }

      const currentPrice = productInfo.get('currentPrice');
      const wasPrice = productInfo.get('wasPrice');
      const offerEndDate = productInfo.get('offerEndDate');
      let saving = 0;
      let savingPercentage = 0;

      if (wasPrice && currentPrice) {
        saving = wasPrice - currentPrice;

        const temp = saving * 100;

        savingPercentage = temp / wasPrice;
      }

      priceDetails = priceDetails
        .merge(currentPrice ? Map({ currentPrice }) : Map())
        .merge(wasPrice ? Map({ wasPrice }) : Map())
        .merge(offerEndDate ? Map({ offerEndDate }) : Map())
        .merge(Map({ saving, savingPercentage }));

      const masterProductPrice = Map({
        masterProductId,
        storeId,
        name: product.get('name'),
        storeName: 'Warehouse',
        status: 'A',
        priceDetails,
        priceToDisplay,
        saving,
        savingPercentage,
      }).merge(offerEndDate ? Map({ offerEndDate }) : Map());

      await this.createOrUpdateMasterProductPrice(masterProductId, storeId, masterProductPrice, priceDetails, sessionToken);
    }

    StoreMasterProductService.update(
      product.merge({
        name: productInfo.get('name'),
        description: productInfo.get('name'),
        barcode: productInfo.get('barcode'),
        imageUrl: productInfo.get('imageUrl'),
        lastCrawlDateTime: updatePriceDetails ? new Date() : productInfo.get('lastCrawlDateTime'),
        storeTagIds: storeTags
          .filter(storeTag => productInfo.get('tagUrls').find(tagUrl => tagUrl.localeCompare(storeTag.get('url')) === 0))
          .map(storeTag => storeTag.get('id')),
      }),
      sessionToken,
    );
  };
}
