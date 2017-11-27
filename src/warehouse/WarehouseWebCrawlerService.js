// @flow

import Crawler from 'crawler';
import { List, Map, Range, Set } from 'immutable';
import moment from 'moment';
import { StoreCrawlerServiceBase } from '../';

export default class WarehouseWebCrawlerService extends StoreCrawlerServiceBase {
  constructor(context) {
    super('warehouse', context);
  }

  crawlAllProductCategories = async () => {
    const config = await this.getConfig();
    let productCategories;

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

          productCategories = this.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);
          done();
        },
      });

      crawler.on('drain', () => resolve(productCategories));
      crawler.queue(config.get('baseUrl'));
    });
  };

  crawlLevelOneProductCategoriesAndSubProductCategories = (config, $) => {
    const self = this;
    let productCategories = Set();

    $('.menu-container .level-1 .menu-category').filter(function filterMenuItems() {
      $(this)
        .children()
        .each(function onEachMenuItem() {
          const menuItem = $(this);
          const categoryKey = menuItem.attr('class');

          if (
            config.get('categoryKeysToExclude') &&
            config.get('categoryKeysToExclude').find(_ =>
              _.toLowerCase()
                .trim()
                .localeCompare(categoryKey.toLowerCase().trim()) === 0)
          ) {
            return 0;
          }

          productCategories = productCategories.add(Map({
            categoryKey,
            url: menuItem.find('.level-1').attr('href'),
            name: menuItem
              .find('.level-1')
              .text()
              .trim(),
            level: 1,
            subCategories: self.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem, categoryKey),
          }));

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
      $(this)
        .find('.category-column')
        .each(function onEachColumn() {
          $(this)
            .children()
            .each(function onEachMenuItem() {
              const menuItem = $(this).find('.category-level-2');
              const categoryKey = `${parentCategoryKey}/${menuItem.attr('data-gtm-cgid')}`;

              if (
                config.get('categoryKeysToExclude') &&
                config.get('categoryKeysToExclude').find(_ =>
                  _.toLowerCase()
                    .trim()
                    .localeCompare(categoryKey.toLowerCase().trim()) === 0)
              ) {
                return 0;
              }

              productCategories = productCategories.add(Map({
                categoryKey,
                url: menuItem.attr('href'),
                name: menuItem.text().trim(),
                level: 2,
                subCategories: self.crawlLevelThreeProductCategoriesAndSubProductCategories(config, $, $(this), categoryKey),
              }));

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
      $(this)
        .children()
        .each(function onEachMenuItem() {
          const menuItem = $(this).find('.category-level-3');
          const categoryKey = `${parentCategoryKey}/${menuItem.attr('data-gtm-cgid')}`;

          if (
            config.get('categoryKeysToExclude') &&
            config.get('categoryKeysToExclude').find(_ =>
              _.toLowerCase()
                .trim()
                .localeCompare(categoryKey.toLowerCase().trim()) === 0)
          ) {
            return 0;
          }

          productCategories = productCategories.add(Map({
            categoryKey,
            url: menuItem.attr('href'),
            name: menuItem.text().trim(),
            level: 3,
          }));

          return 0;
        });

      return 0;
    });

    return productCategories;
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
            // Ignoring the returned URL as looks like Warehouse forward the URL to other different categories
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

    $('.tab-content #results-products .pagination').filter(function filterPagination() {
      $(this)
        .children()
        .find('.results-hits')
        .filter(function filterResultHit() {
          const info = $(this)
            .text()
            .trim();
          const line2 = info.split('\n')[1].trim();
          const spaceIdx = line2.indexOf(' ');

          total = parseInt(
            line2
              .substring(0, spaceIdx)
              .replace(',', '')
              .trim(),
            10,
          );

          return 0;
        });

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
        Range(0, storeTag.get('totalItems'), 24).forEach(offset => crawler.queue(`${storeTag.get('url')}?sz=24&start=${offset}`)));
    });
  };

  crawlProductInfo = (config, $) => {
    let products = List();
    $('.tab-content .search-result-content .search-result-items')
      .children()
      .filter(function filterSearchResultItems() {
        const productPageUrl = $(this)
          .find('.product-info-wrapper .name-link')
          .attr('href');

        products = products.push(Map({ productPageUrl }));

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
          let tagUrls = List();

          $('.breadcrumb')
            .children()
            .filter(function filterTags() {
              const tag = $(this)
                .find('a')
                .attr('href');

              tagUrls = tagUrls.push(tag);

              return 0;
            });

          tagUrls = tagUrls.skip(1).pop();

          productInfo = productInfo.merge({ tagUrls });

          $('#pdpMain').filter(function filterMainContainer() {
            const mainContainer = $(this);

            mainContainer.find('.row-product-details').filter(function filterDetails() {
              $(this)
                .find('.product-image-container .product-primary-image .product-image .primary-image')
                .filter(function filterImage() {
                  productInfo = productInfo.merge({
                    imageUrl: $(this).attr('src'),
                  });

                  return 0;
                });

              $(this)
                .find('.product-detail')
                .filter(function filterDetail() {
                  const name = $(this)
                    .find('.product-name')
                    .text()
                    .trim();
                  const descriptionContainer = $(this).find('.product-description');
                  const description = descriptionContainer
                    .find('.description-text')
                    .text()
                    .trim()
                    .split('\n')[0];
                  const barcode = descriptionContainer
                    .find('.product-number .product-id')
                    .text()
                    .trim()
                    .split('\n')[0];
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

  crawlStandardPrice = ($, priceContainer) => {
    let result = Map();

    priceContainer.find('.standardprice .pv-price').filter(function filterstandardPrice() {
      const currentPriceWithDollarSign = $(this)
        .text()
        .trim();
      const currentPrice = StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceWithDollarSign);

      result = Map({ currentPrice });

      return 0;
    });

    return result;
  };

  crawlSalePrice = ($, priceContainer) => {
    let result = Map();

    priceContainer.find('.price-sales .pv-price').filter(function filterStandardPrice() {
      const currentPriceWithDollarSign = $(this)
        .text()
        .trim();
      const currentPrice = StoreCrawlerServiceBase.removeDollarSignFromPrice(currentPriceWithDollarSign);

      result = Map({ currentPrice });

      return 0;
    });

    return result;
  };

  crawlSavingPrice = ($, priceContainer, productInfo) => {
    let result = Map();

    priceContainer.find('.promotion .save-amount').filter(function filterSalePrice() {
      const savingText = $(this)
        .text()
        .trim();
      const savingWithDollarSign = savingText.substring(savingText.indexOf('$'));
      const saving = StoreCrawlerServiceBase.removeDollarSignFromPrice(savingWithDollarSign);

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
      const offerEndDateText = $(this)
        .text()
        .trim();
      const offerEndDate = offerEndDateText.substring(offerEndDateText.lastIndexOf(' ')).trim();

      result = Map({ offerEndDate: moment(offerEndDate, 'DD/MM/YYYY').toDate() });

      return 0;
    });

    return result;
  };

  crawlBenefitAndFeatures = ($, mainContainer) => {
    let benefitsAndFeatures = List();

    mainContainer
      .find('.row .product-features-print .product-features .featuresbenefits-text ul')
      .children()
      .filter(function filterFeatureBenefit() {
        benefitsAndFeatures = benefitsAndFeatures.push($(this)
          .text()
          .trim());

        return 0;
      });

    return Map({ benefitsAndFeatures });
  };

  updateProductDetails = async (product, storeTags, productInfo) => {
    const storeId = await this.getStoreId();
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

    const storeProductId = product.get('id');
    const productPrice = Map({
      name: productInfo.get('name'),
      description: productInfo.get('description'),
      barcode: productInfo.get('barcode'),
      size: productInfo.get('size'),
      imageUrl: product.get('imageUrl'),
      productPageUrl: product.get('productPageUrl'),
      priceDetails,
      priceToDisplay,
      saving,
      savingPercentage,
      status: 'A',
      special: priceDetails.get('specialType').localeCompare('none') !== 0,
      storeId,
      storeProductId,
      tagIds: storeTags
        .filter(storeTag => product.get('storeTagIds').find(_ => _.localeCompare(storeTag.get('id')) === 0))
        .map(storeTag => storeTag.get('tagId'))
        .filter(storeTag => storeTag)
        .toSet()
        .toList(),
    }).merge(offerEndDate ? Map({ offerEndDate }) : Map());

    return Promise.all([
      this.createOrUpdateProductPrice(storeProductId, productPrice, false),
      this.updateExistingStoreProduct(
        product.merge({
          name: productInfo.get('name'),
          description: productInfo.get('description'),
          barcode: productInfo.get('barcode'),
          imageUrl: productInfo.get('imageUrl'),
          lastCrawlDateTime: new Date(),
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
}
