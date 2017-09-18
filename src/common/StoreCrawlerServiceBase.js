// @flow

import BluebirdPromise from 'bluebird';
import Immutable, { List, Map } from 'immutable';
import moment from 'moment';
import { ImmutableEx } from 'micro-business-common-javascript';
import { ParseWrapperService } from 'micro-business-parse-server-common';
import { ProductPriceService, StoreService, StoreProductService, StoreTagService, TagService } from 'trolley-smart-parse-server-common';

export default class StoreCrawlerServiceBase {
  static removeDollarSignFromPrice = priceWithDollarSign =>
    parseFloat(
      priceWithDollarSign
        .substring(priceWithDollarSign.indexOf('$') + 1)
        .trim()
        .replace(',', ''),
    );

  static safeGetUri = res => (res && res.request && res.request.uri ? res.request.uri.href : '');

  constructor(storeKey, { sessionToken, logVerboseFunc, logInfoFunc, logErrorFunc } = {}) {
    this.storeKey = storeKey;
    this.sessionToken = sessionToken;
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;
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

  createOrUpdateStoreProduct = async (productCategory, productInfo) => {
    const storeId = await this.getStoreId();
    const storeProductService = new StoreProductService();
    const storeProducts = await storeProductService.search(
      Map({
        conditions: Map({
          productPageUrl: productInfo.get('productPageUrl'),
          storeId,
        }),
      }),
      this.sessionToken,
    );

    if (storeProducts.isEmpty()) {
      await storeProductService.create(
        productInfo.merge(
          Map({
            lastCrawlDateTime: moment('01/01/1971', 'DD/MM/YYYY').toDate(),
            storeId,
          }),
        ),
        null,
        this.sessionToken,
      );
    } else if (storeProducts.count() > 1) {
      throw new Error(`Multiple store product found for store Id: ${storeId} and productPageUrl: ${productInfo.get('productPageUrl')}`);
    } else {
      await storeProductService.update(storeProducts.first().merge(productInfo), this.sessionToken);
    }
  };

  createOrUpdateLevelOneProductCategory = async (productCategory, storeTags) => {
    const storeId = await this.getStoreId();
    const storeTagService = new StoreTagService();
    const foundStoreTag = storeTags.find(storeTag => storeTag.get('key').localeCompare(productCategory.get('categoryKey')) === 0);

    if (foundStoreTag) {
      await storeTagService.update(
        foundStoreTag.merge(
          Map({
            name: productCategory.get('name'),
            level: productCategory.get('level'),
            url: productCategory.get('url'),
          }),
        ),
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
        foundStoreTag.merge(
          Map({
            parentStoreTagId: parentStoreTagIds.first(),
            name: productCategory.first().get('name'),
            level: productCategory.first().get('level'),
            url: productCategory.first().get('url'),
          }),
        ),
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
        foundStoreTag.merge(
          Map({
            parentStoreTagId: parentStoreTagIds.first(),
            name: productCategory.first().get('name'),
            level: productCategory.first().get('level'),
            url: productCategory.first().get('url'),
          }),
        ),
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

  getStoreProductsCriteria = async ({ lastCrawlDateTime } = {}) =>
    Map({
      conditions: Map({
        storeId: await this.getStoreId(),
        lessThanOrEqualTo_lastCrawlDateTime: lastCrawlDateTime || undefined,
      }),
    });

  getAllStoreProducts = async ({ lastCrawlDateTime } = {}) => {
    const result = new StoreProductService().searchAll(await this.getStoreProductsCriteria({ lastCrawlDateTime }), this.sessionToken);

    try {
      let storeProducts = List();

      result.event.subscribe((info) => {
        storeProducts = storeProducts.push(info);
      });

      await result.promise;

      return storeProducts;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  getStoreProducts = async ({ lastCrawlDateTime } = {}) =>
    new StoreProductService().search((await this.getStoreProductsCriteria({ lastCrawlDateTime })).set('limit', 1000), this.sessionToken);

  getActiveProductPrices = async (storeProductId) => {
    const storeId = await this.getStoreId();
    const criteria = Map({
      conditions: Map({
        storeProductId,
        storeId,
        status: 'A',
      }),
    });

    return new ProductPriceService().search(criteria, this.sessionToken);
  };

  updateExistingStoreProduct = async (storeProduct) => {
    await new StoreProductService().update(storeProduct, this.sessionToken);
  };

  createOrUpdateProductPrice = async (storeProductId, productPrice) => {
    const productPrices = await this.getActiveProductPrices(storeProductId);
    const productPriceService = new ProductPriceService();
    const priceDetails = productPrice.get('priceDetails');

    if (!priceDetails.has('currentPrice') || !priceDetails.get('currentPrice')) {
      if (!productPrices.isEmpty()) {
        await Promise.all(productPrices.map(_ => productPriceService.update(_.set('status', 'I'), this.sessionToken)).toArray());
      }

      return;
    }

    if (productPrices.isEmpty()) {
      await productPriceService.create(productPrice, null, this.sessionToken);
    } else {
      const notMatchedProductPrices = productPrices.filterNot(_ => _.get('priceDetails').equals(priceDetails));

      if (!notMatchedProductPrices.isEmpty()) {
        await Promise.all(notMatchedProductPrices.map(_ => productPriceService.update(_.set('status', 'I'), this.sessionToken)).toArray());
      }

      const matchedProductPrices = productPrices.filter(_ => _.get('priceDetails').equals(priceDetails));

      if (matchedProductPrices.count() > 1) {
        await Promise.all(
          matchedProductPrices
            .skip(1)
            .map(_ => productPriceService.update(_.set('status', 'I'), this.sessionToken))
            .toArray(),
        );
      } else if (matchedProductPrices.count() === 0) {
        await productPriceService.create(productPrice, null, this.sessionToken);
      }
    }
  };

  crawlAndSyncProductCategoriesToStoreTags = async () => {
    const productCategories = await this.crawlAllProductCategories();
    const storeTags = await this.getStoreTags();
    const splittedLevelOneProductCategories = ImmutableEx.splitIntoChunks(productCategories, 100);

    await BluebirdPromise.each(splittedLevelOneProductCategories.toArray(), productCategoryChunks =>
      Promise.all(productCategoryChunks.map(productCategory => this.createOrUpdateLevelOneProductCategory(productCategory, storeTags))),
    );

    const storeTagsWithUpdatedLevelOneStoreTags = await this.getStoreTags();
    const levelTwoProductCategories = productCategories
      .map(productCategory =>
        productCategory.update('subCategories', subCategories =>
          subCategories.map(subCategory => subCategory.set('parent', productCategory.get('categoryKey'))),
        ),
      )
      .flatMap(productCategory => productCategory.get('subCategories'));
    const levelTwoProductCategoriesGroupedByCategoryKey = levelTwoProductCategories.groupBy(productCategory => productCategory.get('categoryKey'));
    const splittedLevelTwoProductCategories = ImmutableEx.splitIntoChunks(levelTwoProductCategoriesGroupedByCategoryKey.valueSeq(), 100);

    await BluebirdPromise.each(splittedLevelTwoProductCategories.toArray(), productCategoryChunks =>
      Promise.all(
        productCategoryChunks.map(productCategory =>
          this.createOrUpdateLevelTwoProductCategory(productCategory, storeTagsWithUpdatedLevelOneStoreTags),
        ),
      ),
    );

    const storeTagsWithUpdatedLevelTwoStoreTags = await this.getStoreTags();
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
    const splittedLevelThreeProductCategories = ImmutableEx.splitIntoChunks(levelThreeProductCategoriesGroupedByCategoryKey.valueSeq(), 100);

    await BluebirdPromise.each(splittedLevelThreeProductCategories.toArray(), productCategoryChunks =>
      Promise.all(
        productCategoryChunks.map(productCategory =>
          this.createOrUpdateLevelThreeProductCategory(productCategory, storeTagsWithUpdatedLevelTwoStoreTags),
        ),
      ),
    );
  };

  crawlProducts = async () => {
    await this.crawlProductsForEachStoreTag(await this.crawlStoreTagsTotalItemsInfo(await this.getStoreTags()));
  };

  crawlProductsDetailsAndCurrentPrice = async () => {
    const storeTags = await this.getStoreTags();
    const lastCrawlDateTime = new Date();

    lastCrawlDateTime.setDate(new Date().getDate() - 1);

    const products = await this.getStoreProducts({ lastCrawlDateTime });
    const splittedProducts = ImmutableEx.splitIntoChunks(products, 20);

    await BluebirdPromise.each(splittedProducts.toArray(), productChunk =>
      Promise.all(productChunk.map(product => this.crawlProductDetails(product, storeTags))),
    );
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

  // These function must be overriden by the child classes
  crawlAllProductCategories = async () => List();
  crawlStoreTagsTotalItemsInfo = async () => List();
  crawlProductsForEachStoreTag = async () => {};
  crawlProductDetails = async () => {};
}
