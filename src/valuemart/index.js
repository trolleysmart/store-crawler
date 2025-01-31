// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import Immutable, { List, Map, Set } from 'immutable';
import { ImmutableEx } from '@microbusiness/common-javascript';
import { StoreCrawlerServiceBase } from '../common';

export default class Valuemart extends StoreCrawlerServiceBase {
  constructor(context) {
    super('valuemart', context);
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
    let categories = List();

    $('.sidebar .category_accordion').each(function onEachCategory() {
      $(this)
        .find('.cat-item .round')
        .each(function onEachCategoryItem() {
          const url = $(this).attr('href');
          const name = $(this).text();
          const keys = Immutable.fromJS(url.substring(url.indexOf(config.get('baseUrl')) + config.get('baseUrl').length).split('/'))
            .skip(1)
            .filter(_ => _);

          categories = categories.push(Map({
            url,
            categoryKey: keys.reduce((acc, key) => `${acc}/${key}`),
            name,
            level: keys.count(),
          }));
        });

      return 0;
    });

    if (config.get('categoryKeysToExclude')) {
      categories = categories.filterNot(category =>
        config.get('categoryKeysToExclude').find(_ =>
          _.toLowerCase()
            .trim()
            .localeCompare(category
              .get('categoryKey')
              .toLowerCase()
              .trim()) === 0));
    }

    const levelTwoCategories = categories
      .filter(_ => _.get('level') === 2)
      .map(category =>
        category.set(
          'subCategories',
          categories.filter(_ => _.get('level') === category.get('level') + 1 && _.get('categoryKey').indexOf(category.get('categoryKey')) === 0),
        ));

    return categories
      .filter(_ => _.get('level') === 1)
      .map(category =>
        category.set(
          'subCategories',
          levelTwoCategories.filter(_ => _.get('level') === category.get('level') + 1 && _.get('categoryKey').indexOf(category.get('categoryKey')) === 0),
        ));
  };

  crawlStoreTagsTotalItemsInfo = async storeTags => storeTags;

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
          }

          const productInfos = this.crawlProductInfo(res.$).filter(productInfo => productInfo.get('productPageUrl'));
          const splittedProductInfo = ImmutableEx.splitIntoChunks(productInfos, 100);

          BluebirdPromise.each(splittedProductInfo.toArray(), productInfosChunks =>
            Promise.all(productInfosChunks.map(productInfo => this.createOrUpdateStoreProduct(productInfo, true))))
            .then(() => done())
            .catch((storeProductUpdateError) => {
              done();
              this.logError(() => storeProductUpdateError);
            });
        },
      });

      crawler.on('drain', () => resolve());
      storeTags.forEach(storeTag => crawler.queue(`${storeTag.get('url')}?product_count=10000`));
    });
  };

  crawlProductInfo = ($) => {
    let products = Set();

    $('.products')
      .children()
      .filter(function filterSearchResultItems() {
        const productPageUrl = $(this)
          .find('.product-details .product-details-container .product-title a')
          .attr('href');

        products = products.add(Map({ productPageUrl }));

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
          let tagUrls = List();

          $('.fusion-breadcrumbs span a').each(function filterTags() {
            const tagUrl = $(this).attr('href');

            tagUrls = tagUrls.push(tagUrl);
            return 0;
          });

          tagUrls = tagUrls.skip(1).butLast();

          productInfo = productInfo.merge({ tagUrls });

          $('.entry-summary .summary-container').filter(() => {
            $('.product_title').filter(function filterProductTitle() {
              const title = $(this).text();
              const spaceIdx = title.lastIndexOf(' ');

              if (spaceIdx === -1) {
                productInfo = productInfo.set('name', title.trim());
              } else if (title.endsWith('g') || title.endsWith('KG')) {
                productInfo = productInfo.merge(Map({
                  name: title.substring(0, spaceIdx).trim(),
                  size: title.substring(spaceIdx).trim(),
                }));
              } else {
                productInfo = productInfo.set('name', title.trim());
              }

              return 0;
            });

            $('p span').filter(function filterPrice() {
              const price = $(this).text();

              productInfo = productInfo.has('currentPrice')
                ? productInfo
                : productInfo.set('currentPrice', StoreCrawlerServiceBase.removeDollarSignFromPrice(price));

              return 0;
            });

            return 0;
          });

          $('.woocommerce-container #content .product .avada-single-product-gallery-wrapper div figure div a').filter(function filterImage() {
            const imageUrl = $(this).attr('href');

            productInfo = productInfo.set('imageUrl', imageUrl);

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

  updateProductDetails = async (product, storeTags, productInfo) => {
    const storeId = await this.getStoreId();
    let priceDetails = Map({
      specialType: 'none',
    });
    const priceToDisplay = productInfo.get('currentPrice');

    const currentPrice = productInfo.get('currentPrice');
    const wasPrice = productInfo.get('wasPrice');
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
      this.createOrUpdateProductPrice(storeProductId, productPrice, true),
      this.updateExistingStoreProduct(
        product.merge({
          name: productInfo.get('name'),
          imageUrl: productInfo.get('imageUrl'),
          lastCrawlDateTime: new Date(),
          tagIds,
          storeTagIds: storeTags
            .filter(storeTag => productInfo.get('tagUrls').find(tagUrl => tagUrl.localeCompare(storeTag.get('url')) === 0))
            .map(storeTag => storeTag.get('id'))
            .toSet()
            .toList(),
        }),
        true,
      ),
    ]);
  };
}
