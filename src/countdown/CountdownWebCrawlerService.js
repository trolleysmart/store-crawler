// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import Immutable, { List, Map, Range } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService } from 'smart-grocery-parse-server-common';
import { ServiceBase } from '../common';

export default class CountdownWebCrawlerService extends ServiceBase {
  crawlProductCategories = async (config) => {
    const result = await this.createNewCrawlSessionAndGetStoreCrawlerConfig('Countdown Product Categories', config, 'Countdown');
    const sessionInfo = result.get('sessionInfo');
    const sessionId = sessionInfo.get('id');
    const finalConfig = result.get('config');

    try {
      let productCategories = await this.crawlLevelOneProductCategories(finalConfig);
      productCategories = await this.crawlLevelTwoProductCategories(finalConfig, productCategories);
      productCategories = await this.crawlLevelThreeProductCategories(finalConfig, productCategories);

      const crawlResult = Map({
        crawlSessionId: sessionId,
        resultSet: Map({
          productCategories: productCategories.toJS(),
        }),
      });

      await CrawlResultService.create(crawlResult);

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

  crawlLevelOneProductCategories = (config) => {
    let productCategories = List();

    return new Promise((resolve, reject) => {
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

          $('#BrowseSlideBox .row-fluid').children().filter(function filterCategoriesColumns() {
            $(this).find('.toolbar-slidebox-item').each(function filterProductCategory() {
              const menuItem = $(this).find('.toolbar-slidebox-link');
              const url = menuItem.attr('href');
              const categoryKey = url.substring(url.lastIndexOf('/') + 1, url.length);

              if (
                config.get('categoryKeysToExclude') &&
                config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
              ) {
                return 0;
              }

              productCategories = productCategories.push(
                Map({
                  categoryKey,
                  description: menuItem.text().trim(),
                  url: `${config.get('baseUrl')}${url}`,
                  weight: 1,
                }),
              );

              return 0;
            });

            return 0;
          });

          done();
        },
      });

      crawler.on('drain', () => resolve(productCategories));
      crawler.queue(config.get('baseUrl'));
    });
  };

  crawlLevelTwoProductCategories = (config, productCategories) => {
    let updatedProductCategories = productCategories;

    return new Promise((resolve, reject) => {
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

          const levelOneProductCategoryIdx = productCategories.findIndex(_ => _.get('url').localeCompare(res.request.uri.href) === 0);

          if (levelOneProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(config, () => `Failed to match retrieved URL ${res.request.uri.href} against provided level one category.`);

            return;
          }

          const levelOneProductCategory = productCategories.get(levelOneProductCategoryIdx);
          const $ = res.$;
          let levelTwoProductCategories = List();

          $('#left-navigation #navigation-panel .single-level-navigation .navigation-toggle-children .clearfix')
            .children()
            .filter(function filterLeftNavigationPanel() {
              $(this).each(function filterProductCategory() {
                const menuItem = $(this).find('.din');
                const url = menuItem.attr('href');
                const categoryKey = url.substring(url.lastIndexOf('/') + 1, url.length);

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
                ) {
                  return 0;
                }

                levelTwoProductCategories = levelTwoProductCategories.push(
                  Map({ categoryKey, description: menuItem.text().trim(), url: `${config.get('baseUrl')}${url}`, weight: 2 }),
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

      crawler.on('drain', () => resolve(updatedProductCategories));
      productCategories.forEach(productCategory => crawler.queue(productCategory.get('url')));
    });
  };

  crawlLevelThreeProductCategories = (config, productCategories) => {
    let updatedProductCategories = productCategories;

    return new Promise((resolve, reject) => {
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

          const levelOneProductCategoryIdx = updatedProductCategories.findIndex(_ => res.request.uri.href.indexOf(_.get('url')) !== -1);

          if (levelOneProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(config, () => `Failed to match retrieved URL ${res.request.uri.href} against provided level one category.`);

            return;
          }

          const levelOneProductCategory = updatedProductCategories.get(levelOneProductCategoryIdx);
          const levelOneProductSubCategoriesCategory = levelOneProductCategory.get('subCategories');
          const levelTwoProductCategoryIdx = levelOneProductSubCategoriesCategory.findIndex(
            _ => _.get('url').localeCompare(res.request.uri.href) === 0,
          );

          if (levelTwoProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(config, () => `Failed to match retrieved URL ${res.request.uri.href} against provided level two category.`);

            return;
          }

          const levelTwoProductCategory = levelOneProductSubCategoriesCategory.get(levelTwoProductCategoryIdx);
          const $ = res.$;
          let levelThreeProductCategories = List();

          $('#left-navigation #navigation-panel .single-level-navigation .navigation-toggle-children .clearfix')
            .children()
            .filter(function filterLeftNavigationPanel() {
              $(this).each(function filterProductCategory() {
                const menuItem = $(this).find('.din');
                const url = menuItem.attr('href');
                const categoryKey = url.substring(url.lastIndexOf('/') + 1, url.length);

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
                ) {
                  return 0;
                }

                levelThreeProductCategories = levelThreeProductCategories.push(
                  Map({ categoryKey, description: menuItem.text().trim(), url: `${config.get('baseUrl')}${url}`, weight: 3 }),
                );

                return 0;
              });

              return 0;
            });

          updatedProductCategories = updatedProductCategories.set(
            levelOneProductCategoryIdx,
            levelOneProductCategory.update('subCategories', subcategories =>
              subcategories.set(levelTwoProductCategoryIdx, levelTwoProductCategory.set('subCategories', levelThreeProductCategories)),
            ),
          );

          done();
        },
      });

      crawler.on('drain', () => resolve(updatedProductCategories));
      productCategories
        .flatMap(productCategory => productCategory.get('subCategories'))
        .forEach(productCategory => crawler.queue(productCategory.get('url')));
    });
  };

  syncProductCategoriesToStoreTags = async () => {
    const store = await this.getStore('Countdown');
    const storeId = store.get('id');
    const productCategories = Immutable.fromJS(
      (await this.getMostRecentCrawlResults('Countdown Product Categories', info => info.getIn(['resultSet', 'productCategories']))).first(),
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
    const finalConfig = config || (await this.getStoreCrawlerConfig('Countdown')).get('config');
    const store = await this.getStore('Countdown');
    const storeId = store.get('id');
    const productCategoriesToCrawl = Immutable.fromJS(
      (await this.getMostRecentCrawlResults('Countdown Product Categories', info => info.getIn(['resultSet', 'productCategories']))).first(),
    );
    const productCategoriesToCrawlWithTotalItemsInfo = await this.crawlProductCategoriesTotalItemsInfo(finalConfig, productCategoriesToCrawl);

    await this.crawlProductsForEachProductCategories(finalConfig, productCategoriesToCrawlWithTotalItemsInfo, storeId);
  };

  crawlProductCategoriesTotalItemsInfo = (config, productCategories) => {
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
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
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

    $('#middle-panel .side-gutter #content-panel .paging-container .paging-description').filter(function filterPagingDescription() {
      const info = $(this).text().trim();
      const spaceIdx = info.indexOf(' ');

      total = parseInt(info.substring(0, spaceIdx).replace(',', '').trim(), 10);

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
        Range(0, Math.ceil(productCategory.get('totalItems') / 24)).forEach(offset =>
          crawler.queue(`${productCategory.get('url')}?page=${offset + 1}`),
        ),
      );
    });

  crawlProductInfo = (config, $) => {
    let products = List();
    $('#middle-panel .side-gutter #content-panel #product-list').children().filter(function filterProductList() {
      $(this).find('.product-stamp .details-container').each(function filterProductDetails() {
        const description = $(this).find('.description').text().trim();
        const imageUrl = $(this).get('baseUrl') + $(this).find('.product-stamp-thumbnail img').attr('src');
        const productPageUrl = config.get('baseUrl') + $(this).find('.grid-stamp-pull-top h3 a').attr('href');

        products = products.push(Map({ description, productPageUrl, imageUrl }));

        return 0;
      });
      return 0;
    });

    return products;
  };
}
