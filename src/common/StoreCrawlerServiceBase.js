// @flow

import Immutable, { List, Map } from 'immutable';
import moment from 'moment';
import { Exception } from 'micro-business-common-javascript';
import { ParseWrapperService } from 'micro-business-parse-server-common';
import {
  CrawlResultService,
  CrawlSessionService,
  ProductPriceService,
  StoreService,
  StoreProductService,
  StoreTagService,
} from 'trolley-smart-parse-server-common';

export default class StoreCrawlerServiceBase {
  static removeDollarSignFromPrice = priceWithDollarSign => parseFloat(priceWithDollarSign.substring(priceWithDollarSign.indexOf('$') + 1).trim());

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

    throw new Exception(`Failed to retrieve configuration for ${this.storeKey} store crawler.`);
  };

  createNewCrawlSession = async (sessionKey) => {
    const crawlSessionService = new CrawlSessionService();
    const sessionId = await crawlSessionService.create(Map({ sessionKey, startDateTime: new Date() }), null, this.sessionToken);

    return crawlSessionService.read(sessionId, null, this.sessionToken);
  };

  updateExistingCrawlSession = async (sessionInfo) => {
    await new CrawlSessionService().update(sessionInfo, this.sessionToken);
  };

  createNewCrawlResult = async (crawlSessionId, resultSet) => {
    const crawlResult = Map({
      crawlSessionId,
      resultSet,
    });

    await new CrawlResultService().create(crawlResult, null, this.sessionToken);
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
      throw new Exception(`Multiple store found with store key: ${this.storeKey}.`);
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

  getMostRecentCrawlSessionInfo = async (sessionKey) => {
    const crawlSessionInfos = await new CrawlSessionService().search(
      Map({
        conditions: Map({
          sessionKey,
        }),
        topMost: true,
      }),
      this.sessionToken,
    );

    if (crawlSessionInfos.isEmpty()) {
      throw new Exception(`No crawl session found with session key: ${sessionKey}.`);
    } else if (crawlSessionInfos.count() > 1) {
      throw new Exception(`Multiple crawl session found with session key: ${sessionKey}.`);
    }

    return crawlSessionInfos.first();
  };

  getMostRecentCrawlResults = async (sessionKey, mapFunc) => {
    const crawlSessionInfo = await this.getMostRecentCrawlSessionInfo(sessionKey, this.sessionToken);
    const crawlSessionId = crawlSessionInfo.get('id');
    let crawlResults = List();
    const result = new CrawlResultService().searchAll(
      Map({
        conditions: Map({
          crawlSessionId,
        }),
      }),
      this.sessionToken,
    );

    try {
      result.event.subscribe((info) => {
        crawlResults = crawlResults.push(mapFunc ? mapFunc(info) : info);
      });

      await result.promise;

      return crawlResults;
    } finally {
      result.event.unsubscribeAll();
    }
  };

  getStoreTags = async (includeTag) => {
    const storeId = await this.getStoreId();
    const result = new StoreTagService().searchAll(Map({ includeTag, conditions: Map({ storeId }) }), this.sessionToken);

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
      await StoreProductService.create(
        productInfo.megre(
          Map({
            lastCrawlDateTime: moment('01/01/1971', 'DD/MM/YYYY').toDate(),
            storeId,
          }),
        ),
        null,
        this.sessionToken,
      );
    } else if (storeProducts.count() > 1) {
      throw new Exception(`Multiple store product found for store Id: ${storeId} and productPageUrl: ${productInfo.get('productPageUrl')}`);
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
            storeTagIds: parentStoreTagIds,
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
          storeTagIds: parentStoreTagIds,
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
            storeTagIds: parentStoreTagIds,
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
          storeTagIds: parentStoreTagIds,
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
    new StoreProductService().search(await this.getStoreProductsCriteria({ lastCrawlDateTime }).set('limit', 1000), this.sessionToken);

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

  createOrUpdateProductPrice = async (storeProductId, productPrice, priceDetails) => {
    const productPrices = await this.getActiveProductPrices(storeProductId);
    const productPriceService = new ProductPriceService();

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
}
