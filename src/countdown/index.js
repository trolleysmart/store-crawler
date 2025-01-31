// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import { List, Map, Range, Set } from 'immutable';
import { ImmutableEx } from '@microbusiness/common-javascript';
import { StoreCrawlerServiceBase } from '../common';

export default class Countdown extends StoreCrawlerServiceBase {
  static urlPrefix = '/Shop/Browse/';

  constructor(context) {
    super('countdown', context);
  }

  syncTags = async () => {
    const storeTags = await this.getStoreTags();

    await this.syncLevelOneTags(storeTags);
    await this.syncLevelTwoTags(storeTags);
    await this.syncLevelThreeTags(storeTags);
  };

  updateStoreTags = async () => {
    const storeTags = await this.getStoreTags();
    const tags = await this.getTags();
    const splittedStoreTags = ImmutableEx.splitIntoChunks(storeTags, 100);

    await BluebirdPromise.each(splittedStoreTags.toArray(), storeTagsChunks =>
      Promise.all(storeTagsChunks
        .map((storeTag) => {
          const foundTag = tags.find(tag => tag.get('key').localeCompare(storeTag.get('key')) === 0);

          return this.updateExistingStoreTag(storeTag.set('tagId', foundTag ? foundTag.get('id') : null));
        })
        .toArray()));
  };

  crawlAllProductCategories = async () =>
    this.crawlLevelThreeProductCategories(await this.crawlLevelTwoProductCategories(await this.crawlLevelOneProductCategories()));

  crawlLevelOneProductCategories = async () => {
    const config = await this.getConfig();
    let productCategories = List();

    return new Promise((resolve) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            this.logError(() => `Failed to receive product categories for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const { $ } = res;

          $('#BrowseSlideBox .row-fluid')
            .children()
            .filter(function filterCategoriesColumns() {
              $(this)
                .find('.toolbar-slidebox-item')
                .each(function filterProductCategory() {
                  const menuItem = $(this).find('.toolbar-slidebox-link');
                  const url = menuItem.attr('href');
                  const categoryKey = url.substring(url.indexOf(Countdown.urlPrefix) + Countdown.urlPrefix.length);

                  if (
                    config.get('categoryKeysToExclude') &&
                    config.get('categoryKeysToExclude').find(_ =>
                      _.toLowerCase()
                        .trim()
                        .localeCompare(categoryKey.toLowerCase().trim()) === 0)
                  ) {
                    return 0;
                  }

                  productCategories = productCategories.push(Map({
                    categoryKey,
                    name: menuItem.text().trim(),
                    url: `${config.get('baseUrl')}${url}`,
                    level: 1,
                    subCategories: List(),
                  }));

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

    return new Promise((resolve) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            this.logError(() => `Failed to receive product categories for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const levelOneProductCategoryIdx = productCategories.findIndex(_ => _.get('url').localeCompare(StoreCrawlerServiceBase.safeGetUri(res)) === 0);

          if (levelOneProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(() => `Failed to match retrieved URL ${StoreCrawlerServiceBase.safeGetUri(res)} against provided level one category.`);

            return;
          }

          const levelOneProductCategory = productCategories.get(levelOneProductCategoryIdx);
          const { $ } = res;
          let levelTwoProductCategories = List();

          $('#left-navigation #navigation-panel .single-level-navigation .navigation-toggle-children .clearfix')
            .children()
            .filter(function filterLeftNavigationPanel() {
              $(this).each(function filterProductCategory() {
                const menuItem = $(this).find('.din');
                const url = menuItem.attr('href');
                const categoryKey = url.substring(url.indexOf(Countdown.urlPrefix) + Countdown.urlPrefix.length);

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(_ =>
                    _.toLowerCase()
                      .trim()
                      .localeCompare(categoryKey.toLowerCase().trim()) === 0)
                ) {
                  return 0;
                }

                levelTwoProductCategories = levelTwoProductCategories.push(Map({
                  categoryKey,
                  name: menuItem.text().trim(),
                  url: `${config.get('baseUrl')}${url}`,
                  level: 2,
                }));

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

    return new Promise((resolve) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            this.logError(() => `Failed to receive product categories for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const levelOneProductCategoryIdx = updatedProductCategories.findIndex(_ => StoreCrawlerServiceBase.safeGetUri(res).indexOf(_.get('url')) !== -1);

          if (levelOneProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(() => `Failed to match retrieved URL ${StoreCrawlerServiceBase.safeGetUri(res)} against provided level one category.`);

            return;
          }

          const levelOneProductCategory = updatedProductCategories.get(levelOneProductCategoryIdx);
          const levelOneProductSubCategoriesCategory = levelOneProductCategory.get('subCategories');
          const levelTwoProductCategoryIdx = levelOneProductSubCategoriesCategory.findIndex(_ => _.get('url').localeCompare(StoreCrawlerServiceBase.safeGetUri(res)) === 0);

          if (levelTwoProductCategoryIdx === -1) {
            // Ignoring the returned URL as looks like Countdown forward the URL to other different categories
            this.logError(() => `Failed to match retrieved URL ${StoreCrawlerServiceBase.safeGetUri(res)} against provided level two category.`);

            return;
          }

          const levelTwoProductCategory = levelOneProductSubCategoriesCategory.get(levelTwoProductCategoryIdx);
          const { $ } = res;
          let levelThreeProductCategories = List();

          $('#left-navigation #navigation-panel .single-level-navigation .navigation-toggle-children .clearfix')
            .children()
            .filter(function filterLeftNavigationPanel() {
              $(this).each(function filterProductCategory() {
                const menuItem = $(this).find('.din');
                const url = menuItem.attr('href');
                const categoryKey = url.substring(url.indexOf(Countdown.urlPrefix) + Countdown.urlPrefix.length);

                if (
                  config.get('categoryKeysToExclude') &&
                  config.get('categoryKeysToExclude').find(_ =>
                    _.toLowerCase()
                      .trim()
                      .localeCompare(categoryKey.toLowerCase().trim()) === 0)
                ) {
                  return 0;
                }

                levelThreeProductCategories = levelThreeProductCategories.push(Map({
                  categoryKey,
                  name: menuItem.text().trim(),
                  url: `${config.get('baseUrl')}${url}`,
                  level: 3,
                }));

                return 0;
              });

              return 0;
            });

          updatedProductCategories = updatedProductCategories.set(
            levelOneProductCategoryIdx,
            levelOneProductCategory.update('subCategories', subcategories =>
              subcategories.set(levelTwoProductCategoryIdx, levelTwoProductCategory.set('subCategories', levelThreeProductCategories))),
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

    return new Promise((resolve) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            this.logError(() =>
              `Failed to receive product category page info for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

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

      // Only go through level one product categories, all items are listed under level one, no need to crawl other product categories
      storeTags.filter(storeTag => storeTag.get('level') === 1).forEach(productCategory => crawler.queue(productCategory.get('url')));
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

    return new Promise((resolve) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            this.logError(() =>
              `Failed to receive product category page info for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const urlOffset = StoreCrawlerServiceBase.safeGetUri(res).indexOf('?');
          const baseUrl = StoreCrawlerServiceBase.safeGetUri(res).substring(0, urlOffset);
          const productCategory = storeTags.find(_ => _.get('url').localeCompare(baseUrl) === 0);

          if (!productCategory) {
            done();
            this.logError(() => `Failed to find product category page info for Url: ${baseUrl}`);

            return;
          }

          const productInfos = this.crawlProductInfo(config, res.$);

          Promise.all(productInfos
            .filter(productInfo => productInfo.get('productPageUrl'))
            .map(productInfo => this.createOrUpdateStoreProduct(productInfo, false)))
            .then(() => done())
            .catch((storeProductUpdateError) => {
              done();
              this.logError(() => storeProductUpdateError);
            });
        },
      });

      crawler.on('drain', () => resolve());
      storeTags.forEach(storeTag =>
        Range(0, Math.ceil(storeTag.get('totalItems') / 24)).forEach(offset => crawler.queue(`${storeTag.get('url')}?page=${offset + 1}`)));
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

  crawlProductDetails = async (product, storeTags) => {
    const config = await this.getConfig();

    return new Promise((resolve) => {
      let productInfo = Map();

      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(() => `Received response for: ${StoreCrawlerServiceBase.safeGetUri(res)}`);
          this.logVerbose(() => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            this.logError(() => `Failed to receive product categories for Url: ${StoreCrawlerServiceBase.safeGetUri(res)} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const { $ } = res;
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
                    const awardValue = parseFloat(multiBuyLinkContainer
                      .find('.multi-buy-award-value')
                      .text()
                      .trim());

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
              const wasPrice = StoreCrawlerServiceBase.removeDollarSignFromPrice(nonClubPriceContent.substring(nonClubPriceContent.indexOf('$')));
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

          this.updateProductDetails(product, storeTags, productInfo)
            .then(() => done())
            .catch((internalError) => {
              done();
              this.logError(() => internalError);
            });
        },
      });

      crawler.on('drain', () => resolve());
      crawler.queue(product.get('productPageUrl'));
    });
  };

  getCurrentPrice = (productPriceContent) => {
    const currentPriceContent = productPriceContent
      .find('.price')
      .text()
      .trim();
    const spaceIdx = currentPriceContent.indexOf(' ');
    const nonBreakableSaceIdx = currentPriceContent.indexOf(String.fromCharCode(160));

    if (spaceIdx !== -1) {
      return StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceContent.substring(0, spaceIdx));
    } else if (nonBreakableSaceIdx !== -1) {
      return StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceContent.substring(0, nonBreakableSaceIdx));
    }
    return undefined;
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
    const spaceIdx = currentPriceContent.indexOf(' ');
    const nonBreakableSaceIdx = currentPriceContent.indexOf(String.fromCharCode(160));

    if (spaceIdx !== -1) {
      return StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceContent.substring(0, spaceIdx));
    } else if (nonBreakableSaceIdx !== -1) {
      return StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceContent.substring(0, nonBreakableSaceIdx));
    }
    return undefined;
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

  updateProductDetails = async (product, storeTags, originalProductInfo) => {
    const storeId = product.get('storeId');
    let productInfo = originalProductInfo;

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

      priceToDisplay = productInfo.getIn(['multiBuyInfo', 'awardValue']);
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

    const storeProductId = product.get('id');
    const tagIds = storeTags
      .filter(storeTag => product.get('storeTagIds').find(_ => _.localeCompare(storeTag.get('id')) === 0))
      .map(storeTag => storeTag.get('tagId'))
      .filter(storeTag => storeTag)
      .toSet()
      .toList();
    const productPrice = Map({
      name: productInfo.get('name'),
      description: productInfo.get('description'),
      barcode: productInfo.get('barcode'),
      size: productInfo.get('size'),
      imageUrl: productInfo.get('imageUrl'),
      productPageUrl: product.get('productPageUrl'),
      priceDetails,
      priceToDisplay,
      saving,
      savingPercentage,
      status: 'A',
      special: priceDetails.get('specialType').localeCompare('none') !== 0,
      storeId,
      storeProductId,
      tagIds,
    });

    return Promise.all([
      this.createOrUpdateProductPrice(storeProductId, productPrice, false),
      this.updateExistingStoreProduct(
        product.merge({
          name: productInfo.get('name'),
          description: productInfo.get('description'),
          barcode: productInfo.get('barcode'),
          imageUrl: productInfo.get('imageUrl'),
          size: productInfo.get('size'),
          lastCrawlDateTime: new Date(),
          tagIds,
          storeTagIds: storeTags
            .filter(storeTag => productInfo.get('tagUrls').find(tagUrl => tagUrl.localeCompare(storeTag.get('url')) === 0))
            .map(storeTag => storeTag.get('id'))
            .toSet()
            .toList(),
        }),
        false,
      ),
    ]);
  };

  syncLevelOneTags = async (storeTags) => {
    const levelOneTags = await this.getTags(1);
    const levelOneStoreTags = storeTags.filter(storeTag => storeTag.get('level') === 1);
    const levelOneTagsToCreate = levelOneStoreTags.filterNot(storeTag =>
      levelOneTags.find(tag => tag.get('key').localeCompare(storeTag.get('key') === 0)));
    const splittedTags = ImmutableEx.splitIntoChunks(levelOneTagsToCreate, 100);

    await BluebirdPromise.each(splittedTags.toArray(), tagsChunks =>
      Promise.all(tagsChunks
        .map(tag =>
          this.createNewTag(tag
            .delete('storeTags')
            .delete('tag')
            .delete('store')
            .delete('url')))
        .toArray()));
  };

  syncLevelTwoTags = async (storeTags) => {
    const levelOneTags = await this.getTags(1);
    const levelTwoTags = await this.getTags(2);
    const levelOneStoreTags = storeTags.filter(storeTag => storeTag.get('level') === 1);
    const levelTwoStoreTags = storeTags.filter(storeTag => storeTag.get('level') === 2);
    const levelTwoTagsToCreate = levelTwoStoreTags.filterNot(storeTag =>
      levelTwoTags.find(tag => tag.get('key').localeCompare(storeTag.get('key') === 0)));
    const splittedTags = ImmutableEx.splitIntoChunks(levelTwoTagsToCreate, 100);

    await BluebirdPromise.each(splittedTags.toArray(), tagsChunks =>
      Promise.all(tagsChunks
        .map((tag) => {
          const parentStoreTag = levelOneStoreTags.find(levelOneStoreTag => levelOneStoreTag.get('id').localeCompare(tag.get('parentStoreTagId')) === 0);
          const parentTag = levelOneTags.find(levelOneTag => levelOneTag.get('key').localeCompare(parentStoreTag.get('key')) === 0);
          const parentTagId = parentTag.get('id');
          const tagToCreate = tag
            .delete('parentStoreTag')
            .delete('tag')
            .delete('store')
            .delete('url')
            .set('parentTagId', parentTagId);

          return this.createNewTag(tagToCreate);
        })
        .toArray()));
  };

  syncLevelThreeTags = async (storeTags) => {
    const levelTwoTags = await this.getTags(2);
    const levelThreeTags = await this.getTags(3);
    const levelTwoStoreTags = storeTags.filter(storeTag => storeTag.get('level') === 2);
    const levelThreeStoreTags = storeTags.filter(storeTag => storeTag.get('level') === 3);
    const levelThreeTagsToCreate = levelThreeStoreTags.filterNot(storeTag =>
      levelThreeTags.find(tag => tag.get('key').localeCompare(storeTag.get('key') === 0)));
    const splittedTags = ImmutableEx.splitIntoChunks(levelThreeTagsToCreate, 100);

    await BluebirdPromise.each(splittedTags.toArray(), tagsChunks =>
      Promise.all(tagsChunks
        .map((tag) => {
          const parentStoreTag = levelTwoStoreTags.find(levelTwoStoreTag => levelTwoStoreTag.get('id').localeCompare(tag.get('parentStoreTagId')) === 0);
          const parentTag = levelTwoTags.find(levelTwoTag => levelTwoTag.get('key').localeCompare(parentStoreTag.get('key')) === 0);
          const parentTagId = parentTag.get('id');
          const tagToCreate = tag
            .delete('parentStoreTag')
            .delete('tag')
            .delete('store')
            .delete('url')
            .set('parentTagId', parentTagId);

          return this.createNewTag(tagToCreate);
        })
        .toArray()));
  };
}
