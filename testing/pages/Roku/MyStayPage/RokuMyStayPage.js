const assert = require('assert');
const {I, constants} = inject();
const myStayPageLocators = require('./MyStayPageLocators.json');
const sportsPage = require('../SportsPage/RokuSportsPage');
const navbarPage = require('../NavigationPage/RokuNavbarPage');
const CMP = require('../../../OnStreamBackend/cmp');
let cmp = new CMP();
const logger = require('../../../utils/LogUtils').getLogger('myStayPage');
const platformName = require('../../../config/platform/roku.js');
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,
  /**
   * verify the property logo
   */
  async isOnStreamPropertyLogoSeen() {
    assert.ok(
      await I.isVisible(
        myStayPageLocators.onStreamPropertyLogo,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      ),
      'OnStream Property Logo is not visible'
    );
    return true;
  },

  async verifyMyStayPageCarouselCount(expectedTotalCarousels) {
    let totalCarousel = 0;
    let totalHeroCarouselRails = await I.getElements(
      myStayPageLocators.HeroCarouselItem
    );
    totalCarousel = totalHeroCarouselRails.length;
    logger.debug(`[getTotalCarousel] : ${totalCarousel}`);
    assert.strictEqual(
      totalCarousel,
      expectedTotalCarousels,
      `Failed, the total number of Carousels on MyStayPage is ${totalCarousel}`
    );
  },

  /**
   * verify Static ad in widget swimlane
   */

  async validateStaticAdSmallWidgetTile() {
    let widgetInfo,
      isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if (!(await this.isStaticAdWidgetDataVisible())) {
      isVisible = false;
    }
    return isVisible;
  },

  /**
   * verify Static ad in widget-large swimlane
   */

  async validateStaticAdLargeWidgetTile() {
    let widgetInfo,
      isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if (!(await this.isStaticAdWidgetDataVisible())) {
      isVisible = false;
    }
    return isVisible;
  },

  /**
   * verify Static ad in Hero carousel swimlane
   */
  async validateStaticAdWidgetInHeroCarousel() {
    let widgetInfo,
      isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.carousel,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    //Need to get specific locator from dev
    //Will add furtther validation , once locator is available 
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if (!(await I.isVisible(myStayPageLocators.infoCard))) {
      isVisible = false;
    }
    if (!(await I.isVisible(myStayPageLocators.advertLabel))) {
      isVisible = false;
    }
    return isVisible;
  },

  /**
   * verify Weather in widget swimlane
   */

  async validateWeatherWidgetTile() {
    let widgetInfo,
    isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.weather
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if (await this.isWeatherInfoCardDataVisible()) {
      return isVisible;
    } else {
      isVisible = false;
      return isVisible;
    }
  },

  async isStaticAdWidgetDataVisible() {
    let isVisible = true;
    if (!(await I.isVisible(myStayPageLocators.advertLabel))) {
      isVisible = false;
    }
    return isVisible;
  },

  async getWidgetInfo(platform, widgetStyle, widgetType) {
    let widgetInfo;
    widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      widgetStyle,
      widgetType,
      constants.pages.myStayPage
    );
    if (widgetInfo.indexOfSwimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(`widget swimlane with ${widgetType} should be available`);
    } else {
      return widgetInfo;
    }
  },

  async getNotificationWidgetData(platform, widgetStyle) {
    let content = await cmp.getNotificationWIdgetData(
      widgetStyle,
      constants.pages.myStayPage
    );
    if (content.headline === null || content.bodyText === null) {
      assert.fail('Data of notification widget should be available');
    } else {
      return content;
    }
  },
  async isWeatherInfoCardDataVisible() {
    let isVisible = true;
    // City
    if (!(await I.isVisible(myStayPageLocators.cityLabel))) {
      isVisible = false;
      I.reportLog('City Label should be visible in weather info card');
    }
    // Weather Status Message
    if (!(await I.isVisible(myStayPageLocators.messageLabel))) {
      isVisible = false;
      I.reportLog(
        'Weather Status Message should be visible in weather info card'
      );
    }
    // Upcoming Temperature Group
    if (!(await I.isVisible(myStayPageLocators.temperatureGroup))) {
      isVisible = false;
      I.reportLog(
        'Upcoming Temperature Group should be visible in weather info card'
      );
    }
    // Upcoming Weather Week Layout
    if (!(await I.isVisible(myStayPageLocators.weatherInWeekLayout))) {
      isVisible = false;
      I.reportLog(
        'Upcoming Weather Week Layout should be visible in weather info card'
      );
    }
    // Upcoming Weather Week Layout
    if (!(await I.isVisible(myStayPageLocators.okayBtn))) {
      isVisible = false;
      I.reportLog('Okay button should be visible in weather info card');
    }
    // Upcoming Weather Week Layout
    if (!(await I.isElementFocused(constants.okayBtn))) {
      isVisible = false;
      I.reportLog('Okay button should be focused in weather info card');
    }
    return isVisible;
  },

  async navigateToSpecificTileInMyStayPage(swimlaneIndex, TileIndex) {
    await I.dpadNavByEcp(constants.remoteKey.down, swimlaneIndex);
    await I.wait(testExecutionWaits.WAIT_FOR_3_SEC);
    if( swimlaneIndex !=0 && TileIndex !=0 )
    await I.dpadNavByEcp(constants.remoteKey.left); // This should be removed when focus issue is fixed 
    if (TileIndex !== 0) {
      await I.dpadNavByEcp(constants.remoteKey.right, TileIndex);
    } else {
      I.reportLog('Expected Tile is focused');
    }
  },

  /**
   * closes the info card
   */
  async closeInfoCardInHomeScreen() {
    if (await I.isElementFocused(constants.okayBtn)) {
      await I.dpadNavByEcp(constants.remoteKey.ok);
    } else {
      await I.dpadNavByEcp(constants.remoteKey.back);
    }
  },

  /**
   * validates sports swimlane after clicking on sport tile
   */
  async validateSportsSmallWidgetTile() {
    let widgetInfo;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.sports
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    let swimlaneNames = await sports.getActiveLeagues();
    isValid = await sportsPage.areActiveSportsLeaguesAvailable(swimlaneNames);
    return isValid;
  },

  /**
   * validates widget-Notification in widget swimlane
   */

  async validateNotificationInSmallWidgetTile() {
    let widgetInfo, notificationInfo;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.notification
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    notificationInfo = await this.getNotificationWidgetData(
      platformName.platform,
      constants.widgets.smallWidget
    );
    if (
      notificationInfo.headline === null ||
      notificationInfo.bodyText === null
    ) {
      assert.fail('Small Notification widget data should be available');
    }
    if (
      !(
        (await I.getElementText(
          myStayPageLocators.notificationHeading
        )) === notificationInfo.headline
      )
    ) {
      assert.fail('Small Notification widget Heading should be Same');
    }
    if (
      !(
        (await I.getElementText(myStayPageLocators.messageLabel)) ===
        notificationInfo.bodyText
      )
    ) {
      assert.fail('Small Notification widget Message should be same');
    }
    return true;
  },

  /**
   * validates widget-Notification in widget-large swimlane
   */

  async validateNotificationInLargeWidgetTile() {
    let widgetInfo, notificationInfo;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.notification
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.isVisible(myStayPageLocators.notificationHeading);
    notificationInfo = await this.getNotificationWidgetData(
      platformName.platform,
      constants.widgets.largeWidget
    );
    if (
      notificationInfo.headline === null ||
      notificationInfo.bodyText === null
    ) {
      assert.fail('Large Notification widget data should be available');
    }
    if (
      !(
        (await I.getElementText(
          myStayPageLocators.notificationHeading
        )) === notificationInfo.headline
      )
    ) {
      assert.fail(`Notification heading is ${notificationInfo.headline}`);
    }
    if (
      !(
        (await I.getElementText(myStayPageLocators.messageLabel)) ===
        notificationInfo.bodyText
      )
    ) {
      assert.fail(`Notification body is ${notificationInfo.bodyText}`);
    }
    return true;
  },

  /**
   * validates widget-More Info in widget-large swimlane
   */

  async validateMoreInfoWidgetTile() {
    let widgetInfo, moreInfoWidgetData;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.moreInfo
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget + 1
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    moreInfoWidgetData = await this.getMoreInfoWidgetData(
      platformName.platform,
      constants.widgets.largeWidget
    );
    if (
      moreInfoWidgetData.headline === null ||
      moreInfoWidgetData.subHeading === null
    ) {
      assert.fail('More Info widget data should be available');
    }
    return true;
  },
  async getMoreInfoWidgetData(platform, widgetStyle) {
    //Verifying the more-info data
    let content = await cmp.getMoreInfoWIdgetData(
      widgetStyle,
      constants.pages.myStayPage
    );
    if (content.headline === null || content.bodyText === null) {
      assert.fail('Data of notification widget should be available');
    } else {
      return content;
    }
  },
  /**
   * validates widget-More Info in Hero carousel swimlane
   */
  async validateMoreInfoWidgetInHeroCarousel() {
    let widgetInfo, moreInfoWidgetData;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.carousel,
      constants.widgetType.moreInfo
    );
    await this.navigateToSpecificTileInMyStayPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    moreInfoWidgetData = await this.getMoreInfoWidgetData(
      platformName.platform,
      constants.widgets.carousel
    );
    if (!(
        (await I.getAttribute(
          myStayPageLocators.homepageTitle,
          'text'
        )) === moreInfoWidgetData.headline
      )
    ) {
      assert.fail('Hero Carousel widget heading should be same');
    }
    if (
      !(
        (await I.getAttribute(
          myStayPageLocators.subTitleLabel,
          'text'
        )) === moreInfoWidgetData.subHeading
      )
    ) {
      assert.fail('Hero Carousel widget Sub heading should be same');
    }
    return true;
  },
};
