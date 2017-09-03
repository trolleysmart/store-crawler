// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import { List, Map, Range, Set } from 'immutable';
import { ImmutableEx } from 'micro-business-common-javascript';
import { StoreMasterProductService } from 'trolley-smart-parse-server-common';
import { StoreCrawlerServiceBase } from '../';

export default class CountdownWebCrawlerService extends StoreCrawlerServiceBase {
  static urlPrefix = '/Shop/Browse/';

  constructor(context) {
    super('countdown', context);
  }

  crawlAllProductCategories = async () =>
    this.crawlLevelThreeProductCategories(await this.crawlLevelTwoProductCategories(await this.crawlLevelOneProductCategories()));

  crawlLevelOneProductCategories = async () => {
    const config = await this.getConfig();
    let productCategories = List();

    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product categories for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const $ = res.$;

          $('#BrowseSlideBox .row-fluid')
            .children()
            .filter(function filterCategoriesColumns() {
              $(this)
                .find('.toolbar-slidebox-item')
                .each(function filterProductCategory() {
                  const menuItem = $(this).find('.toolbar-slidebox-link');
                  const url = menuItem.attr('href');
                  const categoryKey = url.substring(url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length);

                  if (
                    config.get('categoryKeysToExclude') &&
                    config.get('categoryKeysToExclude').find(
                      _ =>
                        _.toLowerCase()
                          .trim()
                          .localeCompare(categoryKey.toLowerCase().trim()) === 0,
                    )
                  ) {
                    return 0;
                  }

                  productCategories = productCategories.push(
                    Map({
                      categoryKey,
                      name: menuItem.text().trim(),
                      url: `${config.get('baseUrl')}${url}`,
                      level: 1,
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

  crawlLevelTwoProductCategories = async (productCategories) => {
    const config = await this.getConfig();
    let updatedProductCategories = productCategories;

    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product categories for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const levelOneProductCategoryIdx = productCategories.findIndex(
            _ => _.get('url').localeCompare(StoreCrawlerServiceBase.safeGetUri(res)) === 0,
          );

          if (levelOneProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(() => `Failed to match retrieved URL ${StoreCrawlerServiceBase.safeGetUri(res)} against provided level one category.`);

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
                const categoryKey = url.substring(url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length);

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(
                    _ =>
                      _.toLowerCase()
                        .trim()
                        .localeCompare(categoryKey.toLowerCase().trim()) === 0,
                  )
                ) {
                  return 0;
                }

                levelTwoProductCategories = levelTwoProductCategories.push(
                  Map({ categoryKey, name: menuItem.text().trim(), url: `${config.get('baseUrl')}${url}`, level: 2 }),
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

  crawlLevelThreeProductCategories = async (productCategories) => {
    const config = await this.getConfig();
    let updatedProductCategories = productCategories;

    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product categories for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const levelOneProductCategoryIdx = updatedProductCategories.findIndex(
            _ => StoreCrawlerServiceBase.safeGetUri(res).indexOf(_.get('url')) !== -1,
          );

          if (levelOneProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(() => `Failed to match retrieved URL ${StoreCrawlerServiceBase.safeGetUri(res)} against provided level one category.`);

            return;
          }

          const levelOneProductCategory = updatedProductCategories.get(levelOneProductCategoryIdx);
          const levelOneProductSubCategoriesCategory = levelOneProductCategory.get('subCategories');
          const levelTwoProductCategoryIdx = levelOneProductSubCategoriesCategory.findIndex(
            _ => _.get('url').localeCompare(StoreCrawlerServiceBase.safeGetUri(res)) === 0,
          );

          if (levelTwoProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(() => `Failed to match retrieved URL ${StoreCrawlerServiceBase.safeGetUri(res)} against provided level two category.`);

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
                const categoryKey = url.substring(url.indexOf(CountdownWebCrawlerService.urlPrefix) + CountdownWebCrawlerService.urlPrefix.length);

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(
                    _ =>
                      _.toLowerCase()
                        .trim()
                        .localeCompare(categoryKey.toLowerCase().trim()) === 0,
                  )
                ) {
                  return 0;
                }

                levelThreeProductCategories = levelThreeProductCategories.push(
                  Map({ categoryKey, name: menuItem.text().trim(), url: `${config.get('baseUrl')}${url}`, level: 3 }),
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

  crawlStoreTagsTotalItemsInfo = async (storeTags) => {
    const config = await this.getConfig();
    let storeTagsWithTotalItemsInfo = List();

    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(
              `Failed to receive product category page info for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`,
            );

            return;
          }

          const productCategory = storeTags.find(_ => _.get('url').localeCompare(StoreCrawlerServiceBase.safeGetUri(res)) === 0);

          if (!productCategory) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            done();

            return;
          }

          storeTagsWithTotalItemsInfo = storeTagsWithTotalItemsInfo.push(productCategory.set('totalItems', this.crawlTotalItemsInfo(res.$)));
          done();
        },
      });

      crawler.on('drain', () => resolve(storeTagsWithTotalItemsInfo));
      storeTags.forEach(productCategory => crawler.queue(productCategory.get('url')));
    });
  };

  crawlTotalItemsInfo = ($) => {
    let total = 0;

    $('#middle-panel .side-gutter #content-panel .paging-container .paging-description').filter(function filterPagingDescription() {
      const info = $(this)
        .text()
        .trim();
      const spaceIdx = info.indexOf(' ');

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

  crawlProductsForEachStoreTag = async (storeTags) => {
    const config = await this.getConfig();

    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(
              `Failed to receive product category page info for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`,
            );

            return;
          }

          const urlOffset = StoreCrawlerServiceBase.safeGetUri(res).indexOf('?');
          const baseUrl = StoreCrawlerServiceBase.safeGetUri(res).substring(0, urlOffset);
          const productCategory = storeTags.find(_ => _.get('url').localeCompare(baseUrl) === 0);

          if (!productCategory) {
            done();
            reject(`Failed to find product category page info for Url: ${baseUrl}`);

            return;
          }

          const productInfos = this.crawlProductInfo(config, res.$);

          Promise.all(
            productInfos
              .filter(productInfo => productInfo.get('productPageUrl'))
              .map(productInfo => this.createOrUpdateStoreProduct(productCategory, productInfo)),
          )
            .then(() => done())
            .catch((storeProductUpdateError) => {
              done();
              reject(storeProductUpdateError);
            });
        },
      });

      crawler.on('drain', () => resolve());
      storeTags.forEach(productCategory =>
        Range(0, Math.ceil(productCategory.get('totalItems') / 24)).forEach(offset =>
          crawler.queue(`${productCategory.get('url')}?page=${offset + 1}`),
        ),
      );
    });
  };

  crawlProductInfo = (config, $) => {
    let products = List();
    $('#middle-panel .side-gutter #content-panel #product-list')
      .children()
      .filter(function filterProductList() {
        $(this)
          .find('.product-stamp .details-container')
          .each(function filterProductDetails() {
            const productPageUrl =
              config.get('baseUrl') +
              $(this)
                .find('._jumpTop')
                .attr('href');

            products = products.push(Map({ productPageUrl }));

            return 0;
          });
        return 0;
      });

    return products;
  };

  crawlProductsDetails = async (config, sessionToken) => {
    const finalConfig = config || (await this.getConfig('Countdown'));
    const store = await this.getStore('Countdown', sessionToken);
    const storeId = store.get('id');
    const storeTags = await this.getStoreTags(storeId, false, sessionToken);
    const products = await this.getAllStoreMasterProducts(storeId, sessionToken);
    const splittedProducts = ImmutableEx.splitIntoChunks(products, 20);

    await BluebirdPromise.each(splittedProducts.toArray(), productChunk =>
      Promise.all(productChunk.map(product => this.crawlProductDetails(finalConfig, product, storeTags, false, store.get('name'), sessionToken))),
    );
  };

  crawlProductsPriceDetails = async (config, sessionToken) => {
    const finalConfig = config || (await this.getConfig('Countdown'));
    const store = await this.getStore('Countdown', sessionToken);
    const storeId = store.get('id');
    const storeTags = await this.getStoreTags(storeId, false, sessionToken);
    const lastCrawlDateTime = new Date();

    lastCrawlDateTime.setDate(new Date().getDate() - 1);

    const products = await this.getStoreMasterProductsWithMasterProduct(storeId, lastCrawlDateTime, sessionToken);
    const splittedProducts = ImmutableEx.splitIntoChunks(products, 20);

    await BluebirdPromise.each(splittedProducts.toArray(), productChunk =>
      Promise.all(productChunk.map(product => this.crawlProductDetails(finalConfig, product, storeTags, true, store.get('name'), sessionToken))),
    );
  };

  crawlProductDetails = (config, product, storeTags, updatePriceDetails, storeName, sessionToken) =>
    new Promise((resolve, reject) => {
      let productInfo = Map();

      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive product categories for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const $ = res.$;
          const self = this;
          let tagUrls = Set();

          $('#breadcrumb-panel .breadcrumbs')
            .children()
            .filter(function filterProductTags() {
              const tagUrl = $(this).attr('href');

              if (tagUrl) {
                tagUrls = tagUrls.add(config.get('baseUrl') + tagUrl);
              }

              return 0;
            });

          productInfo = productInfo.merge({ tagUrls });

          $('#content-container #content-panel #product-details').filter(function filterProductDetails() {
            const productTagWrapperContainer = $(this).find('.product-tag-wrapper');
            const productTagDesktop = productTagWrapperContainer.find('.main-product .product-tag-desktop');

            productTagDesktop.children().each(function filterBadges() {
              const badgeSrc = $(this).attr('src');

              if (badgeSrc) {
                productInfo = productInfo.merge(self.translateBadge(badgeSrc));
              } else {
                const badgeUrl = $(this)
                  .find('a img')
                  .attr('src');

                if (badgeUrl) {
                  productInfo = productInfo.merge(self.translateBadge(badgeUrl));
                } else {
                  const multiBuyLinkContainer = $(this).find('.multi-buy-link');

                  if (multiBuyLinkContainer) {
                    const awardQuantityFullText = multiBuyLinkContainer
                      .find('.multi-buy-award-quantity')
                      .text()
                      .trim();
                    const awardQuantity = parseFloat(awardQuantityFullText.substring(0, awardQuantityFullText.indexOf(' ')));
                    const awardValue = parseFloat(
                      multiBuyLinkContainer
                        .find('.multi-buy-award-value')
                        .text()
                        .trim(),
                    );

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
            const size = titleContainer
              .find('span')
              .text()
              .trim();
            const sizeOffset = title.indexOf(size);
            const name = sizeOffset === -1 || size.length === 0 ? title : title.substring(0, sizeOffset).trim();
            const description = productDetailsBasicInfo
              .find('.product-info-panel .product-description p')
              .text()
              .trim();

            productInfo = productInfo.merge({
              name,
              description,
              barcode,
              imageUrl,
              size,
            });

            productDetailsBasicInfo.find('.cost-container .price-container').filter(function filterPriceDetails() {
              const priceContent = $(this).find('.product-price');
              const currentPrice = self.getCurrentPrice(priceContent);
              const wasPrice = self.getWasPrice(priceContent);
              const unitPrice = self.getUnitPrice($(this));

              productInfo = productInfo.merge({
                currentPrice,
                wasPrice: wasPrice || undefined,
                unitPrice,
              });

              return 0;
            });

            productDetailsBasicInfo.find('.cost-container .club-price-container').filter(function filterClubPriceDetails() {
              const clubPriceContent = $(this).find('.drop-down-club-price-wrapper');
              const currentPrice = self.getClubPrice(clubPriceContent);
              const nonClubPriceContent = $(this)
                .find('.grid-non-club-price')
                .text()
                .trim();
              const wasPrice = self.removeDollarSignFromPrice(nonClubPriceContent.substring(nonClubPriceContent.indexOf('$')));
              const unitPrice = self.getUnitPrice($(this));

              productInfo = productInfo.merge({
                currentPrice,
                wasPrice: wasPrice || undefined,
                unitPrice,
              });

              return 0;
            });

            return 0;
          });

          this.updateProductDetails(product, storeTags, productInfo, updatePriceDetails, storeName, sessionToken)
            .then(() => done())
            .catch((internalError) => {
              done();
              reject(internalError);
            });
        },
      });

      crawler.on('drain', () => resolve());
      crawler.queue(product.get('productPageUrl'));
    });

  getCurrentPrice = (productPriceContent) => {
    const currentPriceContent = productPriceContent
      .find('.price')
      .text()
      .trim();
    const currentPriceTails = productPriceContent
      .find('.price .visible-phone')
      .text()
      .trim();
    const currentPriceContentIncludingDollarSign = currentPriceContent.substring(0, currentPriceContent.indexOf(currentPriceTails));

    return StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceContentIncludingDollarSign);
  };

  getWasPrice = (productPriceContent) => {
    const wasPriceContent = productPriceContent
      .find('.was-price')
      .text()
      .trim();

    return parseFloat(wasPriceContent.substring(wasPriceContent.indexOf('$') + 1));
  };

  getUnitPrice = (priceContainer) => {
    const unitPriceContent = priceContainer
      .find('.cup-price')
      .text()
      .trim();
    const price = StoreCrawlerServiceBase.removeDollarSignFromPrice(unitPriceContent.substring(0, unitPriceContent.indexOf('/')));
    const size = unitPriceContent.substring(unitPriceContent.indexOf('/') + 1);

    if (!price && !size) {
      return undefined;
    }

    return Map({
      price: price || undefined,
      size: size || undefined,
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
      const multiBuyFullText = lowerCaseUrl
        .substring(lowerCaseUrl.lastIndexOf('/') + 1)
        .trim()
        .match(/\d+/g);
      const awardQuantity = parseInt(multiBuyFullText[0], 10);
      let awardValue = parseFloat(multiBuyFullText[1]);

      if (awardValue >= 100) {
        awardValue /= 100;
      }

      return Map({
        multiBuyInfo: Map({
          awardQuantity,
          awardValue,
        }),
      });
    }

    return Map();
  };

  getClubPrice = (productPriceContent) => {
    const currentPriceContent = productPriceContent.text().trim();
    const currentPriceTails = productPriceContent
      .find('.visible-phone')
      .text()
      .trim();
    const currentPriceContentIncludingDollarSign = currentPriceContent.substring(0, currentPriceContent.indexOf(currentPriceTails));

    return StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceContentIncludingDollarSign);
  };

  getBarcodeFromImageUrl = (imageUrl) => {
    const largeIndex = imageUrl.indexOf('large/');

    if (largeIndex !== -1) {
      const str = imageUrl.substr(largeIndex + 6);

      return str.substr(0, str.indexOf('.jpg'));
    }

    const bigIndex = imageUrl.indexOf('big/');

    if (bigIndex !== -1) {
      const str = imageUrl.substr(bigIndex + 4);

      return str.substr(0, str.indexOf('.jpg'));
    }

    const zoomIndex = imageUrl.indexOf('zoom/');
    const str = imageUrl.substr(zoomIndex + 5);

    return str.substr(0, str.indexOf('.jpg'));
  };

  updateProductDetails = async (product, storeTags, originalProductInfo, updatePriceDetails, storeName, sessionToken) => {
    const masterProductId = product.get('masterProductId');
    const storeId = product.get('storeId');
    let productInfo = originalProductInfo;

    if (updatePriceDetails) {
      let priceDetails;
      let priceToDisplay;

      if (productInfo.has('onecard') && productInfo.get('onecard')) {
        priceDetails = Map({
          specialType: 'onecard',
        });

        priceToDisplay = productInfo.get('currentPrice');
      } else if (productInfo.has('multiBuyInfo') && productInfo.get('multiBuyInfo')) {
        priceDetails = Map({
          specialType: 'multiBuy',
        });

        priceToDisplay = productInfo.getIn(['multiBuyInfo', 'awardValue']) / productInfo.getIn(['multiBuyInfo', 'awardQuantity']);
        productInfo = productInfo.set('wasPrice', productInfo.get('currentPrice')).set('currentPrice', priceToDisplay);
      } else if (productInfo.has('wasPrice') && productInfo.get('wasPrice')) {
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
      const multiBuyInfo = productInfo.get('multiBuyInfo');
      const unitPrice = productInfo.get('unitPrice');
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
        .merge(multiBuyInfo ? Map({ multiBuyInfo }) : Map())
        .merge(unitPrice ? Map({ unitPrice }) : Map())
        .merge(Map({ saving, savingPercentage }));

      const masterProductPrice = Map({
        masterProductId,
        storeId,
        name: product.getIn(['masterProduct', 'name']),
        description: product.getIn(['masterProduct', 'description']),
        storeName,
        status: 'A',
        priceDetails,
        priceToDisplay,
        saving,
        savingPercentage,
        tagIds: product.getIn(['masterProduct', 'tagIds']),
      });

      await this.createOrUpdateMasterProductPrice(masterProductId, storeId, masterProductPrice, priceDetails, sessionToken);
    }

    await StoreMasterProductService.update(
      product.merge({
        name: productInfo.get('name'),
        description: productInfo.get('description'),
        barcode: productInfo.get('barcode'),
        imageUrl: productInfo.get('imageUrl'),
        size: productInfo.get('size'),
        lastCrawlDateTime: updatePriceDetails ? new Date() : productInfo.get('lastCrawlDateTime'),
        storeTagIds: storeTags
          .filter(storeTag => productInfo.get('tagUrls').find(tagUrl => tagUrl.localeCompare(storeTag.get('url')) === 0))
          .map(storeTag => storeTag.get('id')),
      }),
      sessionToken,
    );
  };
}
