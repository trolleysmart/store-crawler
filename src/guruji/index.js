// @flow

import BluebirdPromise from 'bluebird';
import Crawler from 'crawler';
import Immutable, { List, Map, Set } from 'immutable';
import { ImmutableEx } from 'micro-business-common-javascript';
import { StoreCrawlerServiceBase } from '../common';

export default class Guruji extends StoreCrawlerServiceBase {
  constructor(context) {
    super('guruji', context);
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

    $('.container .navbar-collapse .navbar-nav .dropdown .dropdown-submenu a').filter(function onEachCategory() {
      const url = $(this).attr('href');
      const name = $(this).text();
      const keys = Immutable.fromJS(url.substring(url.indexOf(config.get('baseUrl')) + config.get('baseUrl').length).split('/'))
        .skip(3)
        .filter(_ => _);

      categories = categories.push(Map({
        url,
        categoryKey: keys.reduce((acc, key) => `${acc}/${key}`),
        name,
        level: keys.count(),
      }));
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

          const productInfos = this.crawlProductInfo(config, res.$);
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
      storeTags.forEach(storeTag => crawler.queue(`${storeTag.get('url')}?shop_page=view-all`));
    });
  };

  crawlProductInfo = (config, $) => {
    let products = Set();

    $('.products')
      .children()
      .filter(function filterSearchResultItems() {
        const productPageUrl = $(this)
          .find('.product .text a')
          .attr('href');

        products = products.add(Map({ productPageUrl: config.get('baseUrl') + productPageUrl }));

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
          let stopFindingTags = false;

          $('.sidebar-menu .panel-body .category-menu').children(function filterTags() {
            if (stopFindingTags) {
              return 0;
            }

            const tagUrl = $(this)
              .find('a')
              .attr('href');

            if (!tagUrl) {
              stopFindingTags = true;

              return 0;
            }

            tagUrls = tagUrls.push(config.get('baseUrl') + tagUrl);
            return 0;
          });

          productInfo = productInfo.merge({ tagUrls });

          $('.container .product-name h2').filter(function filterProductName() {
            productInfo = productInfo.set(
              'name',
              $(this)
                .text()
                .trim(),
            );

            return 0;
          });

          $('.container .product-slider img').filter(function filterProductName() {
            productInfo = productInfo.set('imageUrl', config.get('baseUrl') + $(this).attr('src'));

            return 0;
          });

          let differentProductsFound = List();

          $('.container').each(function filterContainer() {
            const linePrefixToFind = "var variants = $.parseJSON('";
            const content = $(this).text();
            const linePrefixToFindIdx = content.indexOf(linePrefixToFind);
            const endOfLinePrefixToFindIdx = content.indexOf("');", linePrefixToFindIdx);

            if (linePrefixToFindIdx >= 0 && endOfLinePrefixToFindIdx >= 0) {
              const products = Immutable.fromJS(JSON.parse(content.substring(linePrefixToFindIdx + linePrefixToFind.length, endOfLinePrefixToFindIdx))).remove('child');

              differentProductsFound = products.valueSeq().map((_) => {
                const price = parseFloat(_.get('product_attributes_price'));
                const discountedPrice = parseFloat(_.get('product_attributes_disc_price'));

                return Map({
                  size: _.get('product_attributes_value'),
                  currentPrice: discountedPrice === 0.0 ? price : discountedPrice,
                  wasPrice: discountedPrice === 0.0 ? undefined : price,
                });
              });
            }

            return 0;
          });

          // TODO: 20171129 - Morteza: Only now reading the first product. In future, need to create extra product for each listed item
          productInfo = productInfo.merge(differentProductsFound.first());

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
    let priceDetails;
    let priceToDisplay;

    if (productInfo.has('wasPrice') && productInfo.get('wasPrice')) {
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
      tagIds: storeTags
        .filter(storeTag => product.get('storeTagIds').find(_ => _.localeCompare(storeTag.get('id')) === 0))
        .map(storeTag => storeTag.get('tagId'))
        .filter(storeTag => storeTag)
        .toSet()
        .toList(),
    });

    return Promise.all([
      this.createOrUpdateProductPrice(storeProductId, productPrice, true),
      this.updateExistingStoreProduct(
        product.merge({
          name: productInfo.get('name'),
          imageUrl: productInfo.get('imageUrl'),
          lastCrawlDateTime: new Date(),
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
