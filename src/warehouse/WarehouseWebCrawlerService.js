// @flow

import Crawler from 'crawler';
import { Map, Set } from 'immutable';
import { Exception } from 'micro-business-parse-server-common';
import { CrawlResultService, CrawlSessionService } from 'smart-grocery-parse-server-common';
import { WebCrawlerService } from '../common';

export default class WarehouseWebCrawlerService extends WebCrawlerService {
  static crawlLevelOneProductCategoriesAndSubProductCategories = (config, $) => {
    let productCategories = Set();

    $('.menu-container .level-1 .menu-category').filter(function filterMenuItems() {
      $(this).children().each(function onEachMenuItem() {
        const menuItem = $(this);

        productCategories = productCategories.add(
          Map({
            categoryKey: menuItem.attr('class'),
            url: menuItem.find('.level-1').attr('href'),
            description: menuItem.find('.level-1').text().trim(),
            weight: 1,
            subCategories: WarehouseWebCrawlerService.crawlLevelTwoProductCategoriesAndSubProductCategories(config, $, menuItem),
          }),
        );
      });
    });

    return productCategories;
  };

  static crawlLevelTwoProductCategoriesAndSubProductCategories = (config, $, parentNode) => {
    let productCategories = Set();

    parentNode.find('.menu-navigation .menu-container-level-2 .inner').filter(function filterMenuItems() {
      $(this).children().each(function onEachMenuItem() {
        const menuItem = $(this).find('.category-column .parent-has-child .category-level-2');

        productCategories = productCategories.add(
          Map({
            categoryKey: menuItem.attr('data-gtm-cgid'),
            url: menuItem.attr('href'),
            description: menuItem.text().trim(),
            weight: 2,
            subCategories: WarehouseWebCrawlerService.crawlLevelThreeProductCategoriesAndSubProductCategories(
              config,
              $,
              $(this).find('.category-column .parent-has-child'),
            ),
          }),
        );
      });
    });

    return productCategories;
  };

  static crawlLevelThreeProductCategoriesAndSubProductCategories = (config, $, parentNode) => {
    let productCategories = Set();

    parentNode.find('.menu-container-level-3').filter(function filterMenuItems() {
      $(this).children().each(function onEachMenuItem() {
        const menuItem = $(this).find('.category-level-3');

        productCategories = productCategories.add(
          Map({
            categoryKey: menuItem.attr('data-gtm-cgid'),
            url: menuItem.attr('href'),
            description: menuItem.text().trim(),
            weight: 3,
          }),
        );
      });
    });

    return productCategories;
  };

  crawlProductCategories = async (config) => {
    const result = await this.createNewSessionAndGetConfig('Warehouse Product Categories', config, 'Warehouse');
    const sessionInfo = result.get('sessionInfo');
    const finalConfig = result.get('config');
    try {
      this.logInfo(finalConfig, () => 'Start fetching product categories...');

      await this.crawlAllProductCategories(sessionInfo.get('id'), finalConfig);

      this.logInfo(finalConfig, () => 'Crawling product categories successfully completed.');

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

  crawlAllProductCategories = (sessionId, config) =>
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

          const productCategories = WarehouseWebCrawlerService.crawlLevelOneProductCategoriesAndSubProductCategories(config, res.$);

          const crawlResult = Map({
            crawlSessionId: sessionId,
            resultSet: Map({
              productCategories,
            }),
          });

          CrawlResultService.create(crawlResult)
            .then(() => {
              this.logInfo(config, () => `Successfully added products for: ${productCategories}.`);

              done();
            })
            .catch((err) => {
              this.logError(config, () => `Failed to save products for: ${productCategories}. Error: ${JSON.stringify(err)}`);

              done();
              reject(`Failed to save products for: ${productCategories}. Error: ${JSON.stringify(err)}`);
            });

          done();
        },
      });

      crawler.on('drain', () => {
        resolve();
      });

      crawler.queue(config.get('baseUrl'));
    });
}
