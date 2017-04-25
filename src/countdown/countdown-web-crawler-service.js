import Crawler from 'crawler';
import {
  List,
  Map,
  Range,
} from 'immutable';
import {
  Maybe,
} from 'monet';
import {
  CrawlResultService,
  CrawlSessionService,
  StoreCrawlerConfigurationService,
} from 'smart-grocery-parse-server-common';

class CountdownWebCrawlerService {
  static getHighLevelProductCategoriesDetails(config, $) {
    let highLevelProductCategories = List();

    $('#BrowseSlideBox')
      .filter(function filterHighLevelProductCategoriesCallback() { // eslint-disable-line array-callback-return
        const data = $(this);

        data.find('.toolbar-slidebox-item')
          .each(function onNewProductExtracted() {
            const highLevelProductCategory = $(this)
              .find('.toolbar-slidebox-link')
              .attr('href');

            highLevelProductCategories = highLevelProductCategories.push(highLevelProductCategory.substring(highLevelProductCategory.lastIndexOf(
                '/') + 1,
              highLevelProductCategory.length));
          });
      });

    return config.get('highLevelProductCategoriesFilterList') ?
      highLevelProductCategories
      .filterNot(_ => config.get('highLevelProductCategoriesFilterList')
        .find(item => item.trim()
          .toLowerCase()
          .localeCompare(_.trim()
            .toLowerCase()) === 0)) :
      highLevelProductCategories;
  }

  static getProductDetails(config, $) {
    let products = List();

    $('#product-list')
      .filter(function filterProductListCallback() { // eslint-disable-line array-callback-return
        const data = $(this);

        data.find('.product-stamp .details-container')
          .each(function onNewProductExtracted() {
            const product = $(this);
            const imageUrl = config.get('baseImageUrl') + product.find('.product-stamp-thumbnail img')
              .attr('src');
            const barcode = CountdownWebCrawlerService.getBarcodeFromImageUrl(imageUrl);
            const description = product.find('.description')
              .text()
              .trim();
            const productTagSource = product.find('.product-tag-desktop img')
              .attr('src');
            const special = productTagSource ? productTagSource
              .toLowerCase()
              .includes('badge-special') : undefined;
            const lockdownPrice = productTagSource ? productTagSource
              .toLowerCase()
              .includes('badge-pricelockdown') : undefined;
            const lowPriceEveryDay = productTagSource ? productTagSource
              .toLowerCase()
              .includes('low_price') : undefined;
            const glutenFree = productTagSource ? productTagSource
              .toLowerCase()
              .includes('badge-gluten-free') : undefined;
            const newItem = productTagSource ? productTagSource
              .toLowerCase()
              .includes('badge-new') : undefined;
            const onecard = productTagSource ? productTagSource
              .toLowerCase()
              .includes('badge-onecard') : undefined;
            const viewNutritionInfo = productTagSource ? productTagSource
              .toLowerCase()
              .includes('view-nutrition-info') : undefined;
            const fairTradePromotion = productTagSource ? productTagSource
              .toLowerCase()
              .includes('fairtrade-promo') : undefined;
            const multipleBuyTextLink = product.find('.product-tag-desktop .visible-phone .multi-buy-text-link');
            const multiBuyText = multipleBuyTextLink ? multipleBuyTextLink.attr('title') : undefined;
            const price = product.find('.price')
              .text()
              .trim();
            const wasPrice = product.find('.was-price')
              .text()
              .trim();

            products = products.push(Map({
              description,
              barcode: barcode.length > 0 ? barcode : undefined,
              imageUrl: imageUrl.length > 0 ? imageUrl : undefined,
              special: special ? true : undefined,
              lowPriceEveryDay: lowPriceEveryDay ? true : undefined,
              lockdownPrice: lockdownPrice ? true : undefined,
              glutenFree: glutenFree ? true : undefined,
              newItem: newItem ? true : undefined,
              onecard: onecard ? true : undefined,
              viewNutritionInfo: viewNutritionInfo ? true : undefined,
              fairTradePromotion: fairTradePromotion ? true : undefined,
              multiBuyText,
              price: price.length > 0 ? price : undefined,
              wasPrice: wasPrice.length > 0 ? wasPrice : undefined,
            }));
          });
      });

    return products;
  }

  static getBarcodeFromImageUrl(imageUrl) {
    const str = imageUrl.substr(imageUrl.indexOf('big/') + 4);
    const barcode = str.substr(0, str.indexOf('.jpg'));

    return barcode;
  }

  constructor({
    logVerboseFunc,
    logInfoFunc,
    logErrorFunc,
  }) {
    this.logVerboseFunc = logVerboseFunc;
    this.logInfoFunc = logInfoFunc;
    this.logErrorFunc = logErrorFunc;

    this.crawlHighLevelProductCategories = this.crawlHighLevelProductCategories.bind(this);
    this.crawlProducts = this.crawlProducts.bind(this);
    this.getProductCategoriesPagingInfo = this.getProductCategoriesPagingInfo.bind(this);
    this.crawlHighLevelProductCategoriesAndSaveDetails = this.crawlHighLevelProductCategoriesAndSaveDetails.bind(this);
    this.crawlProductsAndSaveDetails = this.crawlProductsAndSaveDetails.bind(this);
    this.logVerbose = this.logVerbose.bind(this);
    this.logInfo = this.logInfo.bind(this);
    this.logError = this.logError.bind(this);
  }

  crawlHighLevelProductCategories(config) {
    return new Promise((resolve, reject) => {
      let sessionInfo;
      let finalConfig;

      return this.createNewSessionAndGetConfig('Countdown High Level Product Categories', config)
        .then((result) => {
          sessionInfo = result.get('sessionInfo');
          finalConfig = result.get('config');

          this.logInfo(finalConfig, () => 'Start fetching product categories paging info...');

          return this.crawlHighLevelProductCategoriesAndSaveDetails(sessionInfo.get('id'), finalConfig);
        })
        .then(() => {
          this.logInfo(finalConfig, () => 'Crawling high level product categories successfully completed. Updating crawl session info...');

          const updatedSessionInfo = sessionInfo.merge(Map({
            endDateTime: Maybe.Some(new Date()),
            additionalInfo: Maybe.Some(Map({
              status: 'success',
            })),
          }));

          CrawlSessionService.update(updatedSessionInfo)
            .then(() => {
              this.logInfo(finalConfig, () => 'Updating crawl session info successfully completed.');

              resolve();
            })
            .catch((error) => {
              this.logError(finalConfig, () => `Updating crawl session info ended in error. Error: ${JSON.stringify(error)}`);

              reject(error);
            });
        })
        .catch((error) => {
          if (!sessionInfo) {
            this.logError(finalConfig, () => `Crawling product high level categories ended in error. Error: ${JSON.stringify(error)}`);
            reject(error);

            return;
          }

          this.logError(finalConfig, () =>
            `Crawling product high level categories ended in error. Updating crawl session info... Error: ${JSON.stringify(error)}`);

          const updatedSessionInfo = sessionInfo.merge(Map({
            endDateTime: Maybe.Some(new Date()),
            additionalInfo: Maybe.Some(Map({
              status: 'failed',
              error,
            })),
          }));

          CrawlSessionService.update(updatedSessionInfo)
            .then(() => {
              this.logInfo(finalConfig, () => 'Updating crawl session info successfully completed.');

              reject(error);
            })
            .catch((err) => {
              this.logError(finalConfig, () => `Updating crawl session info ended in error. Error: ${JSON.stringify(err)}`);

              reject(`${JSON.stringify(error)} - ${JSON.stringify(err)}`);
            });
        });
    });
  }

  crawlProducts(config) {
    return new Promise((resolve, reject) => {
      let sessionInfo;
      let finalConfig;

      return this.createNewSessionAndGetConfig('Countdown Products', config)
        .then((result) => {
          sessionInfo = result.get('sessionInfo');
          finalConfig = result.get('config');

          this.logInfo(finalConfig, () => 'Start fetching product categories paging info...');

          return this.getProductCategoriesPagingInfo(finalConfig);
        })
        .then((productsCategoriesPagingInfo) => {
          this.logInfo(finalConfig, () => 'Finished fetching product categories paging info.');
          this.logVerbose(finalConfig, () => `Fetched product categories paging info: ${productsCategoriesPagingInfo}`);

          this.logInfo(finalConfig, () => 'Start crawling products and save the details...');

          return this.crawlProductsAndSaveDetails(sessionInfo.get('id'), finalConfig,
            productsCategoriesPagingInfo);
        })
        .then(() => {
          this.logInfo(finalConfig, () => 'Crawling product successfully completed. Updating crawl session info...');

          const updatedSessionInfo = sessionInfo.merge(Map({
            endDateTime: Maybe.Some(new Date()),
            additionalInfo: Maybe.Some(Map({
              status: 'success',
            })),
          }));

          CrawlSessionService.update(updatedSessionInfo)
            .then(() => {
              this.logInfo(finalConfig, () => 'Updating crawl session info successfully completed.');

              resolve();
            })
            .catch((error) => {
              this.logError(finalConfig, () => `Updating crawl session info ended in error. Error: ${JSON.stringify(error)}`);

              reject(error);
            });
        })
        .catch((error) => {
          if (!sessionInfo) {
            this.logError(finalConfig, () => `Crawling product ended in error. Error: ${JSON.stringify(error)}`);
            reject(error);

            return;
          }

          this.logError(finalConfig, () => `Crawling product ended in error. Updating crawl session info... Error: ${JSON.stringify(error)}`);

          const updatedSessionInfo = sessionInfo.merge(Map({
            endDateTime: Maybe.Some(new Date()),
            additionalInfo: Maybe.Some(Map({
              status: 'failed',
              error,
            })),
          }));

          CrawlSessionService.update(updatedSessionInfo)
            .then(() => {
              this.logInfo(finalConfig, () => 'Updating crawl session info successfully completed.');

              reject(error);
            })
            .catch((err) => {
              this.logError(finalConfig, () => `Updating crawl session info ended in error. Error: ${JSON.stringify(err)}`);

              reject(`${JSON.stringify(error)} - ${JSON.stringify(err)}`);
            });
        });
    });
  }

  createNewSessionAndGetConfig(sessionKey, config) {
    return new Promise((resolve, reject) => {
      const sessionInfo = Map({
        sessionKey,
        startDateTime: Maybe.Some(new Date()),
        endDateTime: Maybe.None(),
        additionalInfo: Maybe.None(),
      });
      let promises = List.of(CrawlSessionService.create(sessionInfo));

      if (!config) {
        promises = promises.push(StoreCrawlerConfigurationService.search(Map({
          key: 'Countdown',
          latest: true,
        })));
      }

      let sessionId;
      let finalConfig = config;

      return Promise.all(promises.toArray())
        .then((results) => {
          sessionId = results[0];

          if (!finalConfig) {
            finalConfig = results[1].first()
              .get('config');
          }

          if (!finalConfig) {
            reject('Failed to retrieve configuration for Countdown store crawler.');

            return;
          }

          this.logInfo(finalConfig, () => `Created session and retrieved config. Session Id: ${sessionId}`);
          this.logVerbose(finalConfig, () => `Config: ${JSON.stringify(finalConfig)}`);

          resolve(Map({
            sessionInfo: sessionInfo.set('id', sessionId),
            config: finalConfig,
          }));
        })
        .catch((error) => {
          this.logError(finalConfig, () => `Failed to create session and/or retrieving config. Error: ${JSON.stringify(error)}`);
          reject(error);
        });
    });
  }

  getProductCategoriesPagingInfo(config) {
    return new Promise((resolve, reject) => {
      let productsCategoriesPagingInfo = List();

      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive page information for Url: ${res.request.uri.href} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const totalPageNumber = parseInt(res.$('.paging-container .paging .page-number')
            .last()
            .text(), 10);

          productsCategoriesPagingInfo = productsCategoriesPagingInfo.push(
            Map({
              productCategory: res.request.uri.href.replace(config.get('baseUrl'), ''),
              totalPageNumber: totalPageNumber || 1,
            }));

          done();
        },
      });

      crawler.on('drain', () => resolve(productsCategoriesPagingInfo));

      config.get('productCategories')
        .forEach(productCategory => crawler.queue(config.get('baseUrl') + productCategory));
    });
  }

  crawlHighLevelProductCategoriesAndSaveDetails(sessionId, config) {
    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive high level product categories for Url: ${res.request.uri.href} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const highLevelProductCategories = CountdownWebCrawlerService.getHighLevelProductCategoriesDetails(config, res.$);

          this.logVerbose(config, () =>
            `Received high level product categories: ${JSON.stringify(highLevelProductCategories.toJS())}`);

          const crawlResult = Map({
            crawlSessionId: sessionId,
            resultSet: Map({
              highLevelProductCategories,
            }),
          });

          CrawlResultService.create(crawlResult)
            .then(() => {
              this.logInfo(config, () => 'Successfully added high level product categories.');

              done();
            })
            .catch((err) => {
              this.logError(config, () => `Failed to save high level product categories. Error: ${JSON.stringify(err)}`);

              done();
              reject(`Failed to save high level product categories. Error: ${JSON.stringify(err)}`);
            });
        },
      });

      crawler.on('drain', () => {
        resolve();
      });

      crawler.queue(config.get('baseUrl'));
    });
  }

  crawlProductsAndSaveDetails(sessionId, config, productsCategoriesPagingInfo) {
    return new Promise((resolve, reject) => {
      const crawler = new Crawler({
        rateLimit: config.get('rateLimit'),
        maxConnections: config.get('maxConnections'),
        callback: (error, res, done) => {
          this.logInfo(config, () => `Received response for: ${res.request.uri.href}`);
          this.logVerbose(config, () => `Received response for: ${JSON.stringify(res)}`);

          if (error) {
            done();
            reject(`Failed to receive products for Url: ${res.request.uri.href} - Error: ${JSON.stringify(error)}`);

            return;
          }

          const productCategoryAndPage = res.request.uri.href.replace(config.get('baseUrl'), '');
          const productCategory = productCategoryAndPage.substring(0, productCategoryAndPage.indexOf('?'));
          const products = CountdownWebCrawlerService.getProductDetails(config, res.$);

          this.logVerbose(config, () =>
            `Received products for: ${JSON.stringify(res)} - ${productCategory} - ${JSON.stringify(products.toJS())}`);

          const crawlResult = Map({
            crawlSessionId: sessionId,
            resultSet: Map({
              productCategory,
              products,
            }),
          });

          CrawlResultService.create(crawlResult)
            .then(() => {
              this.logInfo(config, () => `Successfully added products for: ${productCategory}.`);

              done();
            })
            .catch((err) => {
              this.logError(config, () => `Failed to save products for: ${productCategory}. Error: ${JSON.stringify(err)}`);

              done();
              reject(`Failed to save products for: ${productCategory}. Error: ${JSON.stringify(err)}`);
            });
        },
      });

      crawler.on('drain', () => {
        resolve();
      });

      productsCategoriesPagingInfo.forEach(productCategoryInfo => Range(0, productCategoryInfo.get('totalPageNumber'))
        .forEach(pageNumber => crawler.queue(
          `${config.get('baseUrl') + productCategoryInfo.get('productCategory')}?page=${pageNumber + 1}`)));
    });
  }

  logVerbose(config, messageFunc) {
    if (this.logVerboseFunc && config && config.get('logLevel') && config.get('logLevel') >= 3 && messageFunc) {
      this.logVerboseFunc(messageFunc());
    }
  }

  logInfo(config, messageFunc) {
    if (this.logInfoFunc && config && config.get('logLevel') && config.get('logLevel') >= 2 && messageFunc) {
      this.logInfoFunc(messageFunc());
    }
  }

  logError(config, messageFunc) {
    if (this.logErrorFunc && config && config.get('logLevel') && config.get('logLevel') >= 1 && messageFunc) {
      this.logErrorFunc(messageFunc());
    }
  }
}

export {
  CountdownWebCrawlerService,
};

export default CountdownWebCrawlerService;
