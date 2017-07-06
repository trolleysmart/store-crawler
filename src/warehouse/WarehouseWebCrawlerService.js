// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import Immutable, { List, Map, Range, Set } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService } from 'smart-grocery-parse-server-common';
import { ServiceBase } from '../common';

export default class WarehouseWebCrawlerService extends ServiceBase {
  crawlProductCategories = async (config) => {
    const result = await this.createNewCrawlSessionAndGetConfig('Warehouse Product Categories', config, 'Warehouse');
    const sessionInfo = result.get('sessionInfo');
    const sessionId = sessionInfo.get('id');
    const finalConfig = result.get('config');

    try {
      await this.crawlAllProductCategories(sessionId, finalConfig);

      const updatedSessionInfo = sessionInfo.merge(
        Map({
          endDateTime: new Date(),
          additionalInfo: Map({
            status: 'success',
          }),
        }),
      );

      await CrawlSessionService.update(updatedSessionInfo);
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

      await CrawlSessionService.update(updatedSessionInfo);
      throw ex;
    }
  };

  crawlAllProductCategories = (sessionId, config) =>
    new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product categories for Url: ${res.request.uri.href} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const productCategories = this.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);
          const crawlResult = Map({
            crawlSessionId: sessionId,
            resultSet: Map({
              productCategories,
            }),
          });

          CrawlResultService.create(crawlResult)
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

  syncProductCategoriesToStoreTags = async () => {
    const store = await this.getStore('Warehouse');
    const storeId = store.get('id');
    const productCategories = Immutable.fromJS(
      (await this.getMostRecentCrawlResults('Warehouse Product Categories', info => info.getIn(['resultSet', 'productCategories']))).first(),
    );
    const storeTags = await this.getStoreTags(storeId);
    const splittedLevelOneProductCategories = this.splitIntoChunks(productCategories, 100);

    await BluebirdPromise.each(splittedLevelOneProductCategories.toArray(), productCategoryChunks =>
      Promise.all(productCategoryChunks.map(productCategory => this.createOrUpdateLevelOneProductCategory(productCategory, storeTags, storeId))),
    );

    const storeTagsWithUpdatedLevelOneProductCategories = await this.getStoreTags(storeId);
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
          this.createOrUpdateLevelTwoProductCategory(productCategory, storeTagsWithUpdatedLevelOneProductCategories, storeId),
        ),
      ),
    );

    const storeTagsWithUpdatedLevelTwoProductCategories = await this.getStoreTags(storeId);
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
          this.createOrUpdateLevelThreeProductCategory(productCategory, storeTagsWithUpdatedLevelTwoProductCategories, storeId),
        ),
      ),
    );
  };

  crawlProducts = async (config) => {
    const finalConfig = config || (await this.getConfig('Warehouse'));
    const store = await this.getStore('Warehouse');
    const storeId = store.get('id');
    const productCategories = Immutable.fromJS(
      (await this.getMostRecentCrawlResults('Warehouse Product Categories', info => info.getIn(['resultSet', 'productCategories']))).first(),
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

    await this.crawlProductsForEachProductCategories(finalConfig, productCategoriesToCrawlWithTotalItemsInfo, storeId);
  };

  crawlProductCategoriesTotalItemsInfo = async (config, productCategories) => {
    let productCategoriesToCrawlWithTotalItemsInfo = List();

    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product category page info for Url: ${res.request.uri.href} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const productCategory = productCategories.find(_ => _.get('url').localeCompare(res.request.uri.href) === 0);

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

  crawlProductsForEachProductCategories = (config, productCategories, storeId) =>
    new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product category page info for Url: ${res.request.uri.href} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const urlOffset = res.request.uri.href.indexOf('?');
          const baseUrl = res.request.uri.href.substring(0, urlOffset);
          const productCategory = productCategories.find(_ => _.get('url').localeCompare(baseUrl) === 0);

          if (!productCategory) {
            done();
            reject(`Failed to find product category page info for Url: ${baseUrl}`);

            return;
          }

          const productInfos = this.crawlProductInfo(config, res.$);

          Promise.all(productInfos.map(productInfo => this.createOrUpdateStoreMasterProduct(productCategory, productInfo, storeId)))
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

  crawlProductsDetails = async (config) => {
    const result = await this.createNewCrawlSessionAndGetConfig('Warehouse Products', config, 'Warehouse');
    const sessionInfo = result.get('sessionInfo');
    const sessionId = sessionInfo.get('id');
    const finalConfig = result.get('config');

    try {
      const store = await this.getStore('Warehouse');
      const storeId = store.get('id');
      const lastCrawlDateTime = new Date();

      lastCrawlDateTime.setDate(new Date().getDate() - 1);

      const products = await this.getStoreProducts(finalConfig, storeId, false, lastCrawlDateTime);

      await BluebirdPromise.each(products.toArray(), product => this.crawlProductDetails(finalConfig, product, sessionId));

      const updatedSessionInfo = sessionInfo.merge(
        Map({
          endDateTime: new Date(),
          additionalInfo: Map({
            status: 'success',
          }),
        }),
      );

      await CrawlSessionService.update(updatedSessionInfo);
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

      await CrawlSessionService.update(updatedSessionInfo);
      throw ex;
    }
  };

  crawlProductDetails = (config, product, sessionId) =>
    new Promise((resolve, reject) => {
      let productInfo = Map();
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product categories for Url: ${res.request.uri.href} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const $ = res.$;
          const self = this;
          let tags = List();

          $('.breadcrumb').children().filter(function filterTags() {
            const tag = $(this).find('a').attr('href');

            tags = tags.push(tag);

            return 0;
          });

          tags = tags.skip(1).pop();

          productInfo = productInfo.merge({ tags });

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
                const barCode = descriptionContainer.find('.product-number .product-id').text().trim().split('\r\n')[0];
                const priceContainer = $(this).find('#product-content .upper-product-price .product-price');

                productInfo = productInfo.merge(self.crawlStandardPrice($, priceContainer));
                productInfo = productInfo.merge(self.crawlSalePrice($, priceContainer));
                productInfo = productInfo.merge(self.crawlSavingPrice($, priceContainer, productInfo));
                productInfo = productInfo.merge(self.crawlOfferEndDate($, priceContainer));

                productInfo = productInfo.merge({
                  name,
                  description,
                  barCode,
                });

                return 0;
              });

              return 0;
            });

            productInfo = productInfo.merge(self.crawlBenefitAndFeatures($, mainContainer));

            return 0;
          });

          const crawlResult = Map({
            crawlSessionId: sessionId,
            resultSet: Map({
              productId: product.get('id'),
              store: product.get('storeId'),
              productInfo,
            }),
          });

          CrawlResultService.create(crawlResult).then(() => done()).catch((crawlResultCreationError) => {
            done();
            reject(crawlResultCreationError);
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
        wasPrice: Math.round((productInfo.get('currentPrice') + saving) * 100) / 100,
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

      result = Map({ offerEndDate: new Date(offerEndDate) });

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
}
