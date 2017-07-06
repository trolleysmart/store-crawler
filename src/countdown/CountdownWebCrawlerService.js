// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import Immutable, { List, Map, Range } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService } from 'smart-grocery-parse-server-common';
import { ServiceBase } from '../common';

export default class CountdownWebCrawlerService extends ServiceBase {
  static urlPrefix = '/Shop/Browse/';

  crawlProductCategories = async (config) => {
    const result = await this.createNewCrawlSessionAndGetConfig('Countdown Product Categories', config, 'Countdown');
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
          productCategories,
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
              const categoryKey = url.substring(url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length + 1);

              if (
                config.get('categoryKeysToExclude') &&
                config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
              ) {
                return 0;
              }

              productCategories = productCategories.push(
                Map({
                  categoryKey,
                  name: menuItem.text().trim(),
                  url: `${config.get('baseUrl')}${url}`,
                  weight: 1,
                  subCategories: List(),
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
                const categoryKey = url.substring(
                  url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length + 1,
                );

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
                ) {
                  return 0;
                }

                levelTwoProductCategories = levelTwoProductCategories.push(
                  Map({ categoryKey, name: menuItem.text().trim(), url: `${config.get('baseUrl')}${url}`, weight: 2 }),
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
                const categoryKey = url.substring(
                  url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length + 1,
                );

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(_ => _.toLowerCase().trim().localeCompare(categoryKey.toLowerCase().trim()) === 0)
                ) {
                  return 0;
                }

                levelThreeProductCategories = levelThreeProductCategories.push(
                  Map({ categoryKey, name: menuItem.text().trim(), url: `${config.get('baseUrl')}${url}`, weight: 3 }),
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
    const finalConfig = config || (await this.getConfig('Countdown'));
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
        const productPageUrl = config.get('baseUrl') + $(this).find('._jumpTop').attr('href');

        products = products.push(Map({ productPageUrl }));

        return 0;
      });
      return 0;
    });

    return products;
  };

  crawlProductsDetails = async (config) => {
    const result = await this.createNewCrawlSessionAndGetConfig('Countdown Products', config, 'Countdown');
    const sessionInfo = result.get('sessionInfo');
    const sessionId = sessionInfo.get('id');
    const finalConfig = result.get('config');

    try {
      const store = await this.getStore('Countdown');
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

          $('#breadcrumb-panel .breadcrumbs').children().last().filter(function filterProductTags() {
            const tags = Immutable.fromJS($(this).attr('href').split('/')).map(_ => _.trim()).filterNot(_ => _.length === 0).skip(2);

            productInfo = productInfo.merge({ tags });

            return 0;
          });

          $('#content-container #content-panel #product-details').filter(function filterProductDetails() {
            const productTagWrapperContainer = $(this).find('.product-tag-wrapper');
            const productTagDesktop = productTagWrapperContainer.find('.main-product .product-tag-desktop');

            productTagDesktop.children().each(function filterBadges() {
              const badgeSrc = $(this).attr('src');

              if (badgeSrc) {
                productInfo = productInfo.merge(self.translateBadge(badgeSrc));
              } else {
                const badgeUrl = $(this).find('a img').attr('src');

                if (badgeUrl) {
                  productInfo = productInfo.merge(self.translateBadge(badgeUrl));
                } else {
                  const multiBuyLinkContainer = $(this).find('.multi-buy-link');

                  if (multiBuyLinkContainer) {
                    const awardQuantityFullText = multiBuyLinkContainer.find('.multi-buy-award-quantity').text().trim();
                    const awardQuantity = awardQuantityFullText.substring(0, awardQuantityFullText.indexOf(' '));
                    const awardValue = multiBuyLinkContainer.find('.multi-buy-award-value').text().trim();

                    productInfo = productInfo.merge({
                      multiBuyInfo: Map({
                        awardQuantity,
                        awardValue,
                      }),
                    });
                  }
                }
              }

              return 0;
            });

            const imageUrl =
              config.get('baseUrl') + productTagWrapperContainer.find('.big-image-container .product-image .product-image').attr('src');
            const barcode = self.getBarcodeFromImageUrl(imageUrl);
            const productDetailsBasicInfo = $(this).find('#product-details-info-content .prod-details-basic-info');
            const titleContainer = productDetailsBasicInfo.find('.product-title h1');
            const title = titleContainer.text().trim();
            const size = titleContainer.find('span').text().trim();
            const name = title.substring(0, title.indexOf(size)).trim();
            const description = productDetailsBasicInfo.find('#product-details-rating p').text().trim();

            productInfo = productInfo.merge({
              name,
              description,
              size,
              imageUrl,
              barcode,
            });

            productDetailsBasicInfo.find('.cost-container .price-container').filter(function filterPriceDetails() {
              const priceContent = $(this).find('.product-price');
              const currentPrice = self.getCurrentPrice(priceContent);
              const wasPrice = self.getWasPrice(priceContent);
              const unitPrice = self.getUnitPrice($(this));

              productInfo = productInfo.merge({
                currentPrice,
                wasPrice,
                unitPrice,
              });

              return 0;
            });

            productDetailsBasicInfo.find('.cost-container .club-price-container').filter(function filterClubPriceDetails() {
              const clubPriceContent = $(this).find('.drop-down-club-price-wrapper');
              const currentPrice = self.getClubPrice(clubPriceContent);
              const nonClubPriceContent = $(this).find('.grid-non-club-price').text().trim();
              const noneClubPrice = self.removeDollarSignFromPrice(nonClubPriceContent.substring(nonClubPriceContent.indexOf('$')));
              const unitPrice = self.getUnitPrice($(this));

              productInfo = productInfo.merge({
                currentPrice,
                noneClubPrice,
                unitPrice,
              });

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

            return 0;
          });
        },
      });

      crawler.on('drain', () => resolve());
      crawler.queue(product.get('productPageUrl'));
    });

  getCurrentPrice = (productPriceContent) => {
    const currentPriceContent = productPriceContent.find('.price').text().trim();
    const currentPriceTails = productPriceContent.find('.price .visible-phone').text().trim();
    const currentPriceContentIncludingDollarSign = currentPriceContent.substring(0, currentPriceContent.indexOf(currentPriceTails));

    return this.removeDollarSignFromPrice(currentPriceContentIncludingDollarSign);
  };

  getWasPrice = (productPriceContent) => {
    const wasPriceContent = productPriceContent.find('.was-price').text().trim();

    return wasPriceContent.substring(wasPriceContent.indexOf('$') + 1);
  };

  getUnitPrice = (priceContainer) => {
    const unitPriceContent = priceContainer.find('.cup-price').text().trim();

    return Map({
      unitPrice: this.removeDollarSignFromPrice(unitPriceContent.substring(0, unitPriceContent.indexOf('/'))),
      unitSize: unitPriceContent.substring(unitPriceContent.indexOf('/') + 1),
    });
  };

  translateBadge = (url) => {
    const lowerCaseUrl = url.toLowerCase();
    if (lowerCaseUrl.indexOf('badge-special') !== -1) {
      return Map({ special: true });
    }

    if (lowerCaseUrl.indexOf('badge-pricelockdown') !== -1) {
      return Map({ priceLockDown: true });
    }

    if (lowerCaseUrl.indexOf('view-nutrition-info') !== -1) {
      return Map({ viewNutritionInfo: true });
    }

    if (lowerCaseUrl.indexOf('badge-gluten-free') !== -1) {
      return Map({ glutenFree: true });
    }

    if (lowerCaseUrl.indexOf('badge-onecard') !== -1) {
      return Map({ onecard: true });
    }

    if (lowerCaseUrl.indexOf('low_price') !== -1) {
      return Map({ lowPriceEveryday: true });
    }

    if (lowerCaseUrl.indexOf('badge-new') !== -1) {
      return Map({ new: true });
    }

    const multiBuyIconUrl = lowerCaseUrl.match(/\dfor\d/);

    if (multiBuyIconUrl) {
      const multiBuyFullText = lowerCaseUrl.substring(lowerCaseUrl.lastIndexOf('/') + 1, lowerCaseUrl.indexOf('.')).trim();

      return Map({
        multiBuyInfo: Map({
          awardQuantity: multiBuyFullText.substring(0, multiBuyFullText.indexOf('for')),
          awardValue: multiBuyFullText.substring(multiBuyFullText.indexOf('for') + 'for'.length),
        }),
      });
    }

    return Map();
  };

  getClubPrice = (productPriceContent) => {
    const currentPriceContent = productPriceContent.text().trim();
    const currentPriceTails = productPriceContent.find('.visible-phone').text().trim();
    const currentPriceContentIncludingDollarSign = currentPriceContent.substring(0, currentPriceContent.indexOf(currentPriceTails));

    return this.removeDollarSignFromPrice(currentPriceContentIncludingDollarSign);
  };

  getBarcodeFromImageUrl = (imageUrl) => {
    const str = imageUrl.substr(imageUrl.indexOf('large/') + 6);
    const barcode = str.substr(0, str.indexOf('.jpg'));

    return barcode;
  };
}
