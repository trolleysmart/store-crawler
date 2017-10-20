// @flow

import BluebirdPromise from 'bluebird';
import Immutable, { List, Map } from 'immutable';
import { ImmutableEx } from 'micro-business-common-javascript';
import { ParseWrapperService } from 'micro-business-parse-server-common';
import {
  CrawledProductPriceService,
  CrawledStoreProductService,
  ProductPriceService,
  StoreProductService,
  StoreService,
  StoreTagService,
  TagService,
} from 'trolley-smart-parse-server-common';
import TargetCrawledDataStoreType from './TargetCrawledDataStoreType';

export default class StoreCrawlerServiceBase {
  static removeDollarSignFromPrice = priceWithDollarSign =>
    parseFloat(priceWithDollarSign
      .substring(priceWithDollarSign.indexOf('$') + 1)
      .trim()
      .replace(',', ''));

  static safeGetUri = res => (res && res.request && res.request.uri ? res.request.uri.href : '');

  constructor(
    storeKey,
    {
      sessionToken, logVerboseFunc, logInfoFunc, logErrorFunc, targetCrawledDataStoreType, concurrentCrawlingCount,
    } = {
      targetCrawledDataStoreType: TargetCrawledDataStoreType.CRAWLED_SPECIFIC_DESIGNED_TABLES,
      concurrentCrawlingCount: 20,
    },
  ) {
    this.storeKey = storeKey;
    this.sessionToken = sessionToken;
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;
    this.targetCrawledDataStoreType = targetCrawledDataStoreType || TargetCrawledDataStoreType.CRAWLED_SPECIFIC_DESIGNED_TABLES;
    this.concurrentCrawlingCount = concurrentCrawlingCount || 20;
    this.config = null;
    this.store = null;
  }

  getConfig = async () => {
    if (this.config) {
      return this.config;
    }

    const configs = await ParseWrapperService.getConfig();
    const config = configs.get(this.storeKey);

    if (config) {
      this.config = Immutable.fromJS(config);

      return this.config;
    }

    throw new Error(`Failed to retrieve configuration for ${this.storeKey} store crawler.`);
  };

  getStore = async () => {
    if (this.store) {
      return this.store;
    }

    const criteria = Map({
      conditions: Map({
        key: this.storeKey,
      }),
    });

    const storeService = new StoreService();
    const stores = await storeService.search(criteria, this.sessionToken);

    if (stores.count() > 1) {
      throw new Error(`Multiple store found with store key: ${this.storeKey}.`);
    }

    this.store = stores.isEmpty()
      ? await storeService.read(
        await storeService.create(Map({ key: this.storeKey }, null, this.sessionToken), null, this.sessionToken),
        null,
        this.sessionToken,
      )
      : stores.first();

    return this.store;
  };

  getStoreId = async () => (await this.getStore()).get('id');

  getStoreTags = async ({ includeTag } = {}) => {
    const storeId = await this.getStoreId();
    const result = new StoreTagService().searchAll(Map({ include_tag: !!includeTag, conditions: Map({ storeId }) }), this.sessionToken);

    try {
      let storeTags = List();

      result.event.subscribe((info) => {
        storeTags = storeTags.push(info);
      });

      await result.promise;

      return storeTags;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  updateExistingStoreTag = async (storeTag) => {
    await new StoreTagService().update(storeTag, this.sessionToken);
  };

  getTags = async (level) => {
    const result = new TagService().searchAll(Map({ conditions: Map({ level: level || undefined }) }), this.sessionToken);

    try {
      let tags = List();

      result.event.subscribe((info) => {
        tags = tags.push(info);
      });

      await result.promise;

      return tags;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  createOrUpdateCrawledStoreProduct = async (productInfo) => {
    const storeId = await this.getStoreId();
    const service = this.getCrawledStoreProductService();
    const crawledStoreProducts = await service.search(
      Map({
        conditions: Map({
          productPageUrl: productInfo.get('productPageUrl'),
          storeId,
        }),
      }),
      this.sessionToken,
    );

    if (crawledStoreProducts.isEmpty()) {
      await service.create(
        productInfo.merge(Map({
          storeId,
        })),
        null,
        this.sessionToken,
      );
    } else if (crawledStoreProducts.count() > 1) {
      throw new Error(`Multiple crawled store product found for store Id: ${storeId} and productPageUrl: ${productInfo.get('productPageUrl')}`);
    } else {
      await service.update(crawledStoreProducts.first().merge(productInfo), this.sessionToken);
    }
  };

  createOrUpdateLevelOneProductCategory = async (productCategory, storeTags) => {
    const storeId = await this.getStoreId();
    const storeTagService = new StoreTagService();
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0);

    if (foundStoreTag) {
      await storeTagService.update(
        foundStoreTag.merge(Map({
          name: productCategory.get('name'),
          level: productCategory.get('level'),
          url: productCategory.get('url'),
        })),
        this.sessionToken,
      );
    } else {
      await storeTagService.create(
        Map({
          key: productCategory.get('categoryKey'),
          storeId,
          name: productCategory.get('name'),
          level: 1,
          url: productCategory.get('url'),
        }),
        null,
        this.sessionToken,
      );
    }
  };

  createOrUpdateLevelTwoProductCategory = async (productCategory, storeTags) => {
    const storeId = await this.getStoreId();
    const storeTagService = new StoreTagService();
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.first().get('categoryKey')) === 0);
    const parentStoreTagIds = productCategory
      .map(_ => _.get('parent'))
      .map(parent => storeTags.find(storeTag => storeTag.get('key').localeCompare(parent) === 0))
      .map(_ => _.get('id'));

    if (foundStoreTag) {
      await storeTagService.update(
        foundStoreTag.merge(Map({
          parentStoreTagId: parentStoreTagIds.first(),
          name: productCategory.first().get('name'),
          level: productCategory.first().get('level'),
          url: productCategory.first().get('url'),
        })),
        this.sessionToken,
      );
    } else {
      await storeTagService.create(
        Map({
          parentStoreTagId: parentStoreTagIds.first(),
          key: productCategory.first().get('categoryKey'),
          storeId,
          name: productCategory.first().get('name'),
          level: 2,
          url: productCategory.first().get('url'),
        }),
        null,
        this.sessionToken,
      );
    }
  };

  createOrUpdateLevelThreeProductCategory = async (productCategory, storeTags) => {
    const storeId = await this.getStoreId();
    const storeTagService = new StoreTagService();
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.first().get('categoryKey')) === 0);
    const parentStoreTagIds = productCategory
      .map(_ => _.get('parent'))
      .map(parent => storeTags.find(storeTag => storeTag.get('key').localeCompare(parent) === 0))
      .map(_ => _.get('id'));

    if (foundStoreTag) {
      await storeTagService.update(
        foundStoreTag.merge(Map({
          parentStoreTagId: parentStoreTagIds.first(),
          name: productCategory.first().get('name'),
          level: productCategory.first().get('level'),
          url: productCategory.first().get('url'),
        })),
        this.sessionToken,
      );
    } else {
      await storeTagService.create(
        Map({
          key: productCategory.first().get('categoryKey'),
          storeId,
          parentStoreTagId: parentStoreTagIds.first(),
          name: productCategory.first().get('name'),
          level: 3,
          url: productCategory.first().get('url'),
        }),
        null,
        this.sessionToken,
      );
    }
  };

  getCrawledStoreProductService = () =>
    (this.targetCrawledDataStoreType === TargetCrawledDataStoreType.STORE_PRODUCT_AND_PRODUCT_PRICE_TABLES
      ? new StoreProductService()
      : new CrawledStoreProductService());

  getCrawledProductPriceService = () =>
    (this.targetCrawledDataStoreType === TargetCrawledDataStoreType.STORE_PRODUCT_AND_PRODUCT_PRICE_TABLES
      ? new ProductPriceService()
      : new CrawledProductPriceService());

  getCrawledStoreProducts = async ({ lastCrawlDateTime } = {}) => {
    const service = this.getCrawledStoreProductService();
    const promise1 = service.search(
      Map({
        limit: 1000,
        conditions: Map({
          storeId: await this.getStoreId(),
          lessThanOrEqualTo_lastCrawlDateTime: lastCrawlDateTime || undefined,
        }),
      }),
      this.sessionToken,
    );
    const promise2 = service.search(
      Map({
        limit: 1000,
        conditions: Map({
          storeId: await this.getStoreId(),
          doesNotExist_lastCrawlDateTime: true,
        }),
      }),
      this.sessionToken,
    );
    const results = await Promise.all([promise1, promise2]);

    return results[0].concat(results[1]);
  };

  getActiveCrawledProductPrices = async (crawledStoreProductId) => {
    const storeId = await this.getStoreId();
    const criteria =
      this.targetCrawledDataStoreType === TargetCrawledDataStoreType.STORE_PRODUCT_AND_PRODUCT_PRICE_TABLES
        ? Map({
          conditions: Map({
            storeProductId: crawledStoreProductId,
            storeId,
            status: 'A',
          }),
        })
        : Map({
          conditions: Map({
            crawledStoreProductId,
            storeId,
            status: 'A',
          }),
        });

    return this.getCrawledProductPriceService().search(criteria, this.sessionToken);
  };

  updateExistingCrawledStoreProduct = async (crawledStoreProduct) => {
    await this.getCrawledStoreProductService().update(crawledStoreProduct, this.sessionToken);
  };

  createOrUpdateCrawledProductPrice = async (crawledStoreProductId, crawledProductPrice) => {
    const crawledProductPrices = await this.getActiveCrawledProductPrices(crawledStoreProductId);
    const service = this.getCrawledProductPriceService();
    const priceDetails = crawledProductPrice.get('priceDetails');

    if (!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice')) {
      if (!crawledProductPrices.isEmpty()) {
        await Promise.all(crawledProductPrices.map(_ => service.update(_.set('status', 'I'), this.sessionToken)).toArray());
      }

      return;
    }

    if (crawledProductPrices.isEmpty()) {
      await service.create(crawledProductPrice, null, this.sessionToken);
    } else {
      const notMatchedCrawledProductPrices = crawledProductPrices.filterNot(_ => _.get('priceDetails').equals(priceDetails));

      if (!notMatchedCrawledProductPrices.isEmpty()) {
        await Promise.all(notMatchedCrawledProductPrices.map(_ => service.update(_.set('status', 'I'), this.sessionToken)).toArray());
      }

      const matchedCrawledProductPrices = crawledProductPrices.filter(_ => _.get('priceDetails').equals(priceDetails));

      if (matchedCrawledProductPrices.count() > 1) {
        await Promise.all(matchedCrawledProductPrices
          .skip(1)
          .map(_ => service.update(_.set('status', 'I'), this.sessionToken))
          .toArray());
      } else if (matchedCrawledProductPrices.count() === 0) {
        await service.create(crawledProductPrice, null, this.sessionToken);
      }
    }
  };

  createNewTag = async (tagInfo) => {
    await new TagService().create(tagInfo, null, this.sessionToken);
  };

  logVerbose = async (messageFunc) => {
    const config = await this.getConfig();

    if (this.logVerboseFunc && config.get('logLevel') && config.get('logLevel') >= 3 && messageFunc) {
      this.logVerboseFunc(messageFunc());
    }
  };

  logInfo = async (messageFunc) => {
    const config = await this.getConfig();

    if (this.logInfoFunc && config.get('logLevel') && config.get('logLevel') >= 2 && messageFunc) {
      this.logInfoFunc(messageFunc());
    }
  };

  logError = async (messageFunc) => {
    const config = await this.getConfig();

    if (this.logErrorFunc && config.get('logLevel') && config.get('logLevel') >= 1 && messageFunc) {
      this.logErrorFunc(messageFunc());
    }
  };

  crawlAndSyncProductCategoriesToStoreTags = async () => {
    const productCategories = await this.crawlAllProductCategories();
    const storeTags = await this.getStoreTags();
    const splittedLevelOneProductCategories = ImmutableEx.splitIntoChunks(productCategories, 100);

    await BluebirdPromise.each(splittedLevelOneProductCategories.toArray(), productCategoryChunks =>
      Promise.all(productCategoryChunks.map(productCategory => this.createOrUpdateLevelOneProductCategory(productCategory, storeTags))));

    const storeTagsWithUpdatedLevelOneStoreTags = await this.getStoreTags();
    const levelTwoProductCategories = productCategories
      .map(productCategory =>
        productCategory.update('subCategories', subCategories =>
          subCategories.map(subCategory => subCategory.set('parent', productCategory.get('categoryKey')))))
      .flatMap(productCategory => productCategory.get('subCategories'));
    const levelTwoProductCategoriesGroupedByCategoryKey = levelTwoProductCategories.groupBy(productCategory => productCategory.get('categoryKey'));
    const splittedLevelTwoProductCategories = ImmutableEx.splitIntoChunks(levelTwoProductCategoriesGroupedByCategoryKey.valueSeq(), 100);

    await BluebirdPromise.each(splittedLevelTwoProductCategories.toArray(), productCategoryChunks =>
      Promise.all(productCategoryChunks.map(productCategory =>
        this.createOrUpdateLevelTwoProductCategory(productCategory, storeTagsWithUpdatedLevelOneStoreTags))));

    const storeTagsWithUpdatedLevelTwoStoreTags = await this.getStoreTags();
    const levelThreeProductCategories = productCategories
      .flatMap(productCategory => productCategory.get('subCategories'))
      .map(productCategory =>
        productCategory.update('subCategories', subCategories =>
          subCategories.map(subCategory => subCategory.set('parent', productCategory.get('categoryKey')))))
      .flatMap(productCategory => productCategory.get('subCategories'));
    const levelThreeProductCategoriesGroupedByCategoryKey = levelThreeProductCategories.groupBy(productCategory =>
      productCategory.get('categoryKey'));
    const splittedLevelThreeProductCategories = ImmutableEx.splitIntoChunks(levelThreeProductCategoriesGroupedByCategoryKey.valueSeq(), 100);

    await BluebirdPromise.each(splittedLevelThreeProductCategories.toArray(), productCategoryChunks =>
      Promise.all(productCategoryChunks.map(productCategory =>
        this.createOrUpdateLevelThreeProductCategory(productCategory, storeTagsWithUpdatedLevelTwoStoreTags))));
  };

  crawlProducts = async () => {
    await this.crawlProductsForEachStoreTag(await this.crawlStoreTagsTotalItemsInfo(await this.getStoreTags()));
  };

  crawlProductsDetailsAndCurrentPrice = async (storeTags) => {
    const finalStoreTags = storeTags || (await this.getStoreTags());
    const lastCrawlDateTime = new Date();

    lastCrawlDateTime.setDate(new Date().getDate() - 1);

    const products = await this.getCrawledStoreProducts({ lastCrawlDateTime });
    const splittedProducts = ImmutableEx.splitIntoChunks(products, this.concurrentCrawlingCount);

    await BluebirdPromise.each(splittedProducts.toArray(), productChunk =>
      Promise.all(productChunk.map(product => this.crawlProductDetails(product, finalStoreTags))));

    return products.count();
  };

  // These function must be overriden by the child classes
  crawlAllProductCategories = async () => List();
  crawlStoreTagsTotalItemsInfo = async () => List();
  crawlProductsForEachStoreTag = async () => {};
  crawlProductDetails = async () => {};
}
