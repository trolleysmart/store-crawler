// @flow

import Crawler from 'crawler';
import { List, Map, Range } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService } from 'smart-grocery-parse-server-common';
import { ServiceBase } from '../common';

export default class CountdownWebCrawlerService extends ServiceBase {
  getHighLevelProductCategoriesDetails = (config, $) => {
    let highLevelProductCategories = List();

    $('#BrowseSlideBox').filter(function filterHighLevelProductCategoriesCallback() {
      // eslint-disable-line array-callback-return
      // eslint-disable-line array-callback-return
      const data = $(this);

      data.find('.toolbar-slidebox-item').each(function onNewProductExtracted() {
        const highLevelProductCategory = $(this).find('.toolbar-slidebox-link').attr('href');

        highLevelProductCategories = highLevelProductCategories.push(
          highLevelProductCategory.substring(highLevelProductCategory.lastIndexOf('/') + 1, highLevelProductCategory.length),
        );
      });
    });

    return config.get('highLevelProductCategoriesFilterList')
      ? highLevelProductCategories.filterNot(_ =>
          config.get('highLevelProductCategoriesFilterList').find(item => item.trim().toLowerCase().localeCompare(_.trim().toLowerCase()) === 0),
        )
      : highLevelProductCategories;
  };

  getProductDetails = (config, $) => {
    const self = this;
    let products = List();

    $('#product-list').filter(function filterProductListCallback() {
      // eslint-disable-line array-callback-return
      // eslint-disable-line array-callback-return
      const data = $(this);

      data.find('.product-stamp .details-container').each(function onNewProductExtracted() {
        const product = $(this);
        const imageUrl = config.get('baseImageUrl') + product.find('.product-stamp-thumbnail img').attr('src');
        const barcode = self.getBarcodeFromImageUrl(imageUrl);
        const description = product.find('.description').text().trim();
        const productTagSource = product.find('.product-tag-desktop img').attr('src');
        const productTagSourceString = productTagSource ? productTagSource.toLowerCase().trim() : '';
        const special = productTagSourceString.includes('badge-special');
        const lockdownPrice = productTagSourceString.includes('badge-pricelockdown');
        const lowPriceEveryDay = productTagSourceString.includes('low_price');
        const glutenFree = productTagSourceString.includes('badge-gluten-free');
        const newItem = productTagSourceString.includes('badge-new');
        const onecard = productTagSourceString.includes('badge-onecard');
        const viewNutritionInfo = productTagSourceString.includes('view-nutrition-info');
        const fairTradePromotion = productTagSourceString.includes('fairtrade-promo');
        const specialMultiBuyIconUrl = productTagSourceString.match(/\dfor\d/);
        const specialMultiBuyText = specialMultiBuyIconUrl
          ? productTagSourceString.substring(productTagSourceString.lastIndexOf('/') + 1, productTagSourceString.indexOf('.'))
          : '';
        const multipleBuyTextLink = product.find('.product-tag-desktop .visible-phone .multi-buy-text-link');
        const multiBuyText = multipleBuyTextLink ? multipleBuyTextLink.attr('title') : undefined;
        const price = product.find('.price').text().trim();
        const wasPrice = product.find('.was-price').text().trim();
        const clubPriceTag = product.find('.club-price-wrapper');
        const clubPrice = clubPriceTag ? clubPriceTag.text().trim() : undefined;
        const nonClubPriceTag = product.find('.grid-non-club-price');
        const nonClubPrice = nonClubPriceTag ? nonClubPriceTag.text().trim() : undefined;

        products = products.push(
          Map({
            description: self.convertStringValToObjectProperty(description),
            barcode: self.convertStringValToObjectProperty(barcode),
            imageUrl: self.convertStringValToObjectProperty(imageUrl),
            special: self.convertBoolValToObjectProperty(special),
            lowPriceEveryDay: self.convertBoolValToObjectProperty(lowPriceEveryDay),
            lockdownPrice: self.convertBoolValToObjectProperty(lockdownPrice),
            glutenFree: self.convertBoolValToObjectProperty(glutenFree),
            newItem: self.convertBoolValToObjectProperty(newItem),
            onecard: self.convertBoolValToObjectProperty(onecard),
            viewNutritionInfo: self.convertBoolValToObjectProperty(viewNutritionInfo),
            fairTradePromotion: self.convertBoolValToObjectProperty(fairTradePromotion),
            specialMultiBuyText: self.convertStringValToObjectProperty(specialMultiBuyText),
            multiBuyText: self.convertStringValToObjectProperty(multiBuyText),
            price: self.convertStringValToObjectProperty(price),
            wasPrice: self.convertStringValToObjectProperty(wasPrice),
            clubPrice: self.convertStringValToObjectProperty(clubPrice),
            nonClubPrice: self.convertStringValToObjectProperty(nonClubPrice),
          }),
        );
      });
    });

    return products;
  };

  convertBoolValToObjectProperty = (val) => {
    if (val) {
      return val ? true : undefined;
    }

    return undefined;
  };

  convertStringValToObjectProperty = (val) => {
    if (val) {
      return val.length > 0 ? val : undefined;
    }

    return undefined;
  };

  getBarcodeFromImageUrl = (imageUrl) => {
    const str = imageUrl.substr(imageUrl.indexOf('big/') + 4);
    const barcode = str.substr(0, str.indexOf('.jpg'));

    return barcode;
  };

  crawlHighLevelProductCategories = async (config) => {
    const result = await this.createNewCrawlSessionAndGetStoreCrawlerConfig('Countdown High Level Product Categories', config, 'Countdown');
    const sessionInfo = result.get('sessionInfo');
    const finalConfig = result.get('config');

    try {
      this.logInfo(finalConfig, () => 'Start fetching product categories paging info...');

      await this.crawlHighLevelProductCategoriesAndSaveDetails(sessionInfo.get('id'), finalConfig);

      this.logInfo(finalConfig, () => 'Crawling high level product categories successfully completed.');

      const updatedSessionInfo = sessionInfo.merge(
        Map({
          endDateTime: new Date(),
          additionalInfo: Map({
            status: 'success',
          }),
        }),
      );

      await CrawlSessionService.update(updatedSessionInfo);
    } catch (ex) {
      const errorMessage = ex instanceof Exception ? ex.getErrorMessage() : ex;
      const updatedSessionInfo = sessionInfo.merge(
        Map({
          endDateTime: new Date(),
          additionalInfo: Map({
            status: 'failed',
            error: errorMessage,
          }),
        }),
      );

      await CrawlSessionService.update(updatedSessionInfo);

      throw ex;
    }
  };

  crawlProducts = async (config) => {
    const result = await this.createNewCrawlSessionAndGetStoreCrawlerConfig('Countdown Products', config, 'Countdown');
    const sessionInfo = result.get('sessionInfo');
    const finalConfig = result.get('config');
    try {
      this.logInfo(finalConfig, () => 'Start fetching product categories paging info...');

      const productsCategoriesPagingInfo = await this.getProductCategoriesPagingInfo(finalConfig);
      this.logInfo(finalConfig, () => 'Finished fetching product categories paging info.');
      this.logVerbose(finalConfig, () => `Fetched product categories paging info: ${productsCategoriesPagingInfo}`);

      this.logInfo(finalConfig, () => 'Start crawling products and save the details...');

      await this.crawlProductsAndSaveDetails(sessionInfo.get('id'), finalConfig, productsCategoriesPagingInfo);

      this.logInfo(finalConfig, () => 'Crawling product successfully completed.');

      const updatedSessionInfo = sessionInfo.merge(
        Map({
          endDateTime: new Date(),
          additionalInfo: Map({
            status: 'success',
          }),
        }),
      );

      await CrawlSessionService.update(updatedSessionInfo);
    } catch (ex) {
      const errorMessage = ex instanceof Exception ? ex.getErrorMessage() : ex;
      const updatedSessionInfo = sessionInfo.merge(
        Map({
          endDateTime: new Date(),
          additionalInfo: Map({
            status: 'failed',
            error: errorMessage,
          }),
        }),
      );

      await CrawlSessionService.update(updatedSessionInfo);
      throw ex;
    }
  };

  getProductCategoriesPagingInfo = config =>
    new Promise((resolve, reject) => {
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

          const totalPageNumber = parseInt(res.$('.paging-container .paging .page-number').last().text(), 10);

          productsCategoriesPagingInfo = productsCategoriesPagingInfo.push(
            Map({
              productCategory: res.request.uri.href.replace(config.get('baseUrl'), ''),
              totalPageNumber: totalPageNumber || 1,
            }),
          );

          done();
        },
      });

      crawler.on('drain', () => resolve(productsCategoriesPagingInfo));

      config.get('productCategories').forEach(productCategory => crawler.queue(config.get('baseUrl') + productCategory));
    });

  crawlHighLevelProductCategoriesAndSaveDetails = (sessionId, config) =>
    new Promise((resolve, reject) => {
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

          const highLevelProductCategories = this.getHighLevelProductCategoriesDetails(config, res.$);

          this.logVerbose(config, () => `Received high level product categories: ${JSON.stringify(highLevelProductCategories.toJS())}`);

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

  crawlProductsAndSaveDetails = (sessionId, config, productsCategoriesPagingInfo) =>
    new Promise((resolve, reject) => {
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
          const products = this.getProductDetails(config, res.$);

          this.logVerbose(config, () => `Received products for: ${JSON.stringify(res)} - ${productCategory} - ${JSON.stringify(products.toJS())}`);

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

      productsCategoriesPagingInfo.forEach(productCategoryInfo =>
        Range(0, productCategoryInfo.get('totalPageNumber')).forEach(pageNumber =>
          crawler.queue(`${config.get('baseUrl') + productCategoryInfo.get('productCategory')}?page=${pageNumber + 1}`),
        ),
      );
    });
}
