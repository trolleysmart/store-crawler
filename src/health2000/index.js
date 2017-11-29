// @flow

import Crawler from 'crawler';
import { List, Map, Set } from 'immutable';
import { StoreProductService } from 'trolley-smart-parse-server-common';
import { StoreCrawlerServiceBase } from '../common';

export default class Health2000 extends StoreCrawlerServiceBase {
  constructor(context) {
    super('health2000', context);
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

          productCategories = this.crawlLevelOneProductCategories(config, res.$);
          done();
        },
      });

      crawler.on('drain', () => resolve(productCategories));
      crawler.queue(`${config.get('baseUrl')}/maincategory`);
    });
  };

  crawlLevelOneProductCategories = (config, $) => {
    let productCategories = Set();

    $('.container .row .categoryNavigation .nav-stacked li a').each(function onEachNavigationLink() {
      const navItem = $(this);
      const name = navItem.text().trim();
      const url = config.get('baseUrl') + navItem.attr('href');
      const categoryKey = url.substring(url.lastIndexOf('/') + 1);

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
        url,
        name,
        level: 1,
        subCategories: List(),
      }));

      return 0;
    });

    return productCategories;
  };

  crawlStoreTagsTotalItemsInfo = storeTags => storeTags;

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
          const url = StoreCrawlerServiceBase.safeGetUri(res);
          const productCategory = storeTags.find(_ => _.get('url').localeCompare(url) === 0);

          if (!productCategory) {
            done();
            this.logError(() => `Failed to find product category page info for Url: ${url}`);

            return;
          }

          const { $ } = res;
          let productInfos = List();

          $('.js-productContent .row .productTitle a').each(function onEachNavigationLink() {
            const productTitle = $(this);
            const productPageUrl = `${config.get('baseUrl')}${productTitle.attr('href')}`;

            productInfos = productInfos.push(Map({ productPageUrl, productKey: productPageUrl.substring(productPageUrl.lastIndexOf('/') + 1) }));

            return 0;
          });

          Promise.all(productInfos
            .filter(productInfo => productInfo.get('productPageUrl'))
            .groupBy(productInfo => productInfo.get('productKey'))
            .map(_ => _.first())
            .valueSeq()
            .map(productInfo => this.createOrUpdateStoreProductForHealth2000(productInfo, false)))
            .then(() => done())
            .catch((storeProductUpdateError) => {
              done();
              this.logError(() => storeProductUpdateError);
            });
        },
      });

      crawler.on('drain', () => resolve());
      storeTags.forEach(storeTag => crawler.queue(storeTag.get('url')));
    });
  };

  createOrUpdateStoreProductForHealth2000 = async (productInfo, authorizedToDisplay) => {
    const storeId = await this.getStoreId();
    const service = new StoreProductService();
    const storeProducts = await service.search(
      Map({
        conditions: Map({
          endsWith_productPageUrl: productInfo.get('productKey'),
          storeId,
        }),
      }),
      this.sessionToken,
    );

    if (storeProducts.isEmpty()) {
      await service.create(
        productInfo.merge(Map({
          storeId,
          createdByCrawler: true,
          authorizedToDisplay,
        })),
        null,
        this.sessionToken,
      );
    } else if (storeProducts.count() === 1) {
      await service.update(
        storeProducts
          .first()
          .merge(productInfo)
          .set('createdByCrawler', true)
          .set('authorizedToDisplay', authorizedToDisplay),
        this.sessionToken,
      );
    }
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

          $('.breadcrumb li a').each(function filterTags() {
            const tag = $(this);

            tagUrls = tagUrls.push(tag.attr('href'));

            return 0;
          });

          tagUrls = tagUrls
            .skip(1)
            .take(1)
            .map(tagUrl => config.get('baseUrl') + tagUrl);

          productInfo = productInfo.merge({ tagUrls });

          $('#ProductDisplay .js-productDetail').filter(function filterProductDetails() {
            const productDetails = $(this);

            productDetails.find('.productDetail .productTitle').filter(function filterName() {
              productInfo = productInfo.merge(Map({
                name: $(this)
                  .text()
                  .trim(),
              }));

              return 0;
            });

            productDetails.find('.productAccordion .m0-sm').filter(function filterDescription() {
              productInfo = productInfo.merge(Map({
                description: $(this)
                  .text()
                  .trim(),
              }));

              return 0;
            });

            productDetails.find('.productImages .mainImage .productMainImage img').filter(function filterMainImage() {
              productInfo = productInfo.merge(Map({ imageUrl: config.get('baseUrl') + $(this).attr('src') }));

              return 0;
            });

            productDetails.find('.productDetail .js-price').filter(function filterPrice() {
              $(this)
                .find('.was')
                .filter(function filterWasPrice() {
                  const priceStr = $(this)
                    .text()
                    .trim();

                  productInfo = productInfo.merge(Map({ wasPrice: StoreCrawlerServiceBase.removeDollarSignFromPrice(priceStr.substring(priceStr.lastIndexOf(' ') + 1)) }));

                  return 0;
                });

              $(this)
                .find('.is')
                .filter(function filterIsPrice() {
                  const priceStr = $(this)
                    .text()
                    .trim();

                  productInfo = productInfo.merge(Map({ currentPrice: StoreCrawlerServiceBase.removeDollarSignFromPrice(priceStr.substring(priceStr.lastIndexOf(' ') + 1)) }));
                  return 0;
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
    });

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
