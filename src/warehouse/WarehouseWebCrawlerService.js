// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import Immutable, { List, Map, Range, Set } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService } from 'smart-grocery-parse-server-common';
import { ServiceBase } from '../common';

export default class WarehouseWebCrawlerService extends ServiceBase {
  crawlProductCategories = async (config) => {
    const result = await this.createNewCrawlSessionAndGetStoreCrawlerConfig('Warehouse Product Categories', config, 'Warehouse');
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
            description: menuItem.find('.level-1').text().trim(),
            weight: 1,
            subCategories: self.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem),
          }),
        );

        return 0;
      });

      return 0;
    });

    return productCategories;
  };

  crawlLevelTwoProductCategoriesAndSubProductCategories = (config, $, parentNode) => {
    const self = this;
    let productCategories = Set();

    parentNode.find('.menu-navigation .menu-container-level-2 .inner').filter(function filterMenuItems() {
      $(this).find('.category-column').each(function onEachColumn() {
        $(this).children().each(function onEachMenuItem() {
          const menuItem = $(this).find('.category-level-2');
          const categoryKey = menuItem.attr('data-gtm-cgid');

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
              description: menuItem.text().trim(),
              weight: 2,
              subCategories: self.crawlLevelThreeProductCategoriesAndSubProductCategories(config, $, $(this)),
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

  crawlLevelThreeProductCategoriesAndSubProductCategories = (config, $, parentNode) => {
    let productCategories = Set();

    parentNode.find('.menu-container-level-3').filter(function filterMenuItems() {
      $(this).children().each(function onEachMenuItem() {
        const menuItem = $(this).find('.category-level-3');
        const categoryKey = menuItem.attr('data-gtm-cgid');

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
            description: menuItem.text().trim(),
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
    const storeTags = await this.getExistingStoreTags(storeId);
    const splittedLevelOneProductCategories = this.splitIntoChunks(productCategories, 100);

    await BluebirdPromise.each(splittedLevelOneProductCategories.toArray(), productCategoryChunks =>
      Promise.all(productCategoryChunks.map(productCategory => this.createOrUpdateLevelOneProductCategory(productCategory, storeTags, storeId))),
    );

    const storeTagsWithUpdatedLevelOneProductCategories = await this.getExistingStoreTags(storeId);
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

    const storeTagsWithUpdatedLevelTwoProductCategories = await this.getExistingStoreTags(storeId);
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
    const finalConfig = config || (await this.getStoreCrawlerConfig('Warehouse')).get('config');
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
      const description = $(this).find('.product-info-wrapper .name-link').attr('title');
      const productPageUrl = $(this).find('.product-info-wrapper .name-link').attr('href');

      products = products.push(Map({ description, productPageUrl }));

      return 0;
    });

    return products;
  };

  crawlProductsDetails = async (config) => {
    const result = await this.createNewCrawlSessionAndGetStoreCrawlerConfig('Warehouse Products', config, 'Warehouse');
    const sessionInfo = result.get('sessionInfo');
    const sessionId = sessionInfo.get('id');
    const finalConfig = result.get('config');

    try {
      const store = await this.getStore('Warehouse');
      const storeId = store.get('id');
      const products = await this.getProducts(finalConfig, storeId, false);

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

            $('.breadcrumb').children().filter(function filterProductTags() {
                const tag = $(this).find('a').attr('href');

                tags = tags.push(tag);

            return 0;
            });

            tags = tags.skip(1).pop();

                productInfo = productInfo.merge({ tags });
        },
      });

      crawler.on('drain', () => resolve());
      crawler.queue(product.get('productPageUrl'));
    });

}
