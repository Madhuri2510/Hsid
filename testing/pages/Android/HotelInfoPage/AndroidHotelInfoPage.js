const assert = require('assert');
const {I, platformName} = inject();
const constants = require('../../../config/constants.js');
const hotelInfoPageLocators = require('./HotelInfoPageLocators.json');
const sportsPage = require('../SportsPage/AndroidSportsPage');
const CMP = require('../../../OnStreamBackend/cmp');
let cmp = new CMP();
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();

module.exports = {
  constants,

  /**
   * verify the property logo in Hotel Info Page
   * @returns {boolean} : true if Hotel Logo is seen in Hotel Info Page
   */
  async isOnStreamPropertyLogoSeen() {
    return await I.isElementVisible(
      hotelInfoPageLocators.onStreamPropertyLogo,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  async verifyHotelInfoPageCarouselCount(expectedTotalCarousels) {
    let totalCarousel = 0;
    let totalHeroCarouselRails = await I.getElements(
      hotelInfoPageLocators.HeroCarouselMoreInfoItem
    );
    totalCarousel = totalHeroCarouselRails.length;
    logger.debug(`[getTotalCarousel] : ${totalCarousel}`);
    assert.strictEqual(
      totalCarousel,
      expectedTotalCarousels,
      `Failed, the total number of Carousels on HomePage is ${totalCarousel}`
    );
  },

  async validateWeatherWidgetTile() {
    let widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.weather
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    let isLogoVisible = await this.isWeatherLogoAvailable();
    return isLogoVisible;
  },

  /**
   * closes the info card
   */
  async closeInfoCardInHomeScreen() {
    await I.dpadBack();
  },

  async verifyHotelInfoPageLearnMoreSection(learnMoreText) {
    await I.dpadOK();
    await I.wait(2);
    let headlineOfLearnMore = await I.grabTextFrom(
      hotelInfoPageLocators.headlineOfLearnMore
    );
    let subHeadingOfLearnMore = await I.grabTextFrom(
      hotelInfoPageLocators.subHeadingOfLearnMore
    );
    console.log(
      learnMoreText.headline.toLowerCase().trim(),
      headlineOfLearnMore[0].toLowerCase().trim()
    );
    assert.equal(
      learnMoreText.headline,
      headlineOfLearnMore[0],
      'LearnMore Headline is not matching'
    );

    assert.equal(
      learnMoreText.subHeading,
      subHeadingOfLearnMore,
      'LearnMore subheading is not matching'
    );

    await I.dpadBack();
    return true;
  },

  /**
   * gets swimlaneIndex and widgetIndex of specific widgetType
   * @param {string} platform
   * @param {string} widgetStyle
   * @param {string} widgetType
   * @returns {object} - returns swimlaneIndex and widgetIndex
   */
  async getWidgetInfo(platform, widgetStyle, widgetType) {
    let widgetInfo;
    widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      widgetStyle,
      widgetType,
      constants.pages.hotelInfoPage
    );
    if (widgetInfo.swimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(`widget swimlane with ${widgetType} should be available`);
    } else {
      return widgetInfo;
    }
  },

  /**
   * gets swimlaneIndex and widgetIndex of specific widgetType and specific swimlane
   * @param {string} platform
   * @param {string} widgetStyle
   * @param {string} widgetType
   * @param {string} swimlaneHeading
   * @returns {object} - returns swimlaneIndex and widgetIndex
   */
  async getWidgetInfoForSwimlane(
    platform,
    widgetStyle,
    widgetType,
    swimlaneHeading
  ) {
    let widgetInfo;
    widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificSwimlaneWidget(
      widgetStyle,
      widgetType,
      swimlaneHeading,
      constants.pages.hotelInfoPage
    );
    if (widgetInfo.swimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(`widget swimlane with ${widgetType} should be available`);
    } else {
      return widgetInfo;
    }
  },

  /**
   * opens specific asset tile in Home Screen
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   */
  async openAssetTileInHomeScreen(indexOfSwimlane, tileIndex) {
    await I.wait(1);
    await I.dpadDown(indexOfSwimlane);
    await I.wait(1);
    await I.dpadRight(tileIndex);
    await I.dpadOK();
  },
  /**
   * checks weather weather logo is available or not on info card.
   * @returns {boolean} - returns true if weather logo is available on infoCard
   */
  async isWeatherLogoAvailable() {
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    return await I.isElementVisible(
      hotelInfoPageLocators.weatherLogoOnInfoCard
    );
  },

  /**
   * validates sports swimlane after clicking on sport tile
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   */
  async validateSportsSmallWidgetTile() {
    let widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.sports
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    let swimlaneNames = await sports.getActiveLeagues();
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    await sportsPage.areActiveSportsLeaguesAvailable(swimlaneNames);
    return true;
  },

  /**
   *  validates Advertise tag is visible on info card in small widget
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - Returns true if advertise tag is visible on info card
   */
  async validateStaticAdSmallWidgetTile() {
    let widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.staticAd,
      constants.pages.hotelInfoPage
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget,
      widgetInfo.pages
    );
    let isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },

  /**
   * checks weather advertise tag is available or not.
   * @returns {boolean} - returns true if advertise tag available on info card.
   */
  async isAdvertiseTagAvailable() {
    return await I.isElementVisible(
      hotelInfoPageLocators.advertiseTagOnInfoCard
    );
  },

  /**
   * validates content of notification info card with cmp data
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   * @returns {boolean} true if Notification Widget is displayed correctly in Hotel Info Page
   */
  async validateNotificationInSmallWidgetTile() {
    let widgetInfo = await this.getWidgetInfoForSwimlane(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.notification,
      constants.swimlaneHeadings.exploreMore
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    notificationInfo = await cmp.getNotificationWIdgetDataForSpecificSwimlane(
      constants.widgets.smallWidget,
      constants.swimlaneHeadings.exploreMore,
      constants.pages.hotelInfoPage
    );
    await this.validateNotificationInfoCard(notificationInfo);
    return true;
  },

  /**
   * validates content of notification info card
   * @param {object} content
   */
  async validateNotificationInfoCard(content) {
    let headline = await I.grabTextFrom(
      hotelInfoPageLocators.headlineOfNotificationTile
    );
    let bodyText = await I.grabTextFrom(
      hotelInfoPageLocators.bodyTextOfNotificationTile
    );
    assert.ok(
      headline === content.headline,
      'Headline of notification tile should match with cmp data'
    );
    assert.ok(
      bodyText === content.bodyText,
      'Body Text of notification tile should match with cmp data'
    );
  },

  /**
   * validates content of more info card with cmp data.
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   */
  async validateMoreInfoWidgetTile() {
    let widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.moreInfo
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    let moreInfoData = await cmp.getMoreInfoWIdgetData(
      constants.widgets.largeWidget,
      constants.pages.hotelInfoPage
    );
    await this.validateMoreInfoCard(moreInfoData);
    return true;
  },

  /**
   * validates data of moreInfo info card.
   * @param {object} content
   */
  async validateMoreInfoCard(content) {
    let headline = await I.grabTextFrom(
      hotelInfoPageLocators.headlineOfMoreInfoCard
    );
    let subHeading = await I.grabTextFrom(
      hotelInfoPageLocators.subHeadingOfMoreInfoCard
    );
    assert.ok(
      headline[0] === content.headline,
      'Headline of More Info tile should match with cmp data'
    );
    assert.ok(
      subHeading === content.subHeading,
      'Sub Heading of More Info  tile should match with cmp data'
    );
  },

  /**
   * validates content of notification info card with cmp data
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   */
  async validateNotificationInLargeWidgetTile() {
    let widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.notification
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    notificationInfo = await cmp.getNotificationWIdgetData(
      constants.widgets.largeWidget,
      constants.pages.hotelInfoPage
    );
    await this.validateNotificationInfoCard(notificationInfo);
    return true;
  },

  /**
   *  validates Advertise tag is visible on info card
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - Returns true if advertise tag is visible on info card
   */
  async validateStaticAdLargeWidgetTile() {
    let widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.staticAd,
      constants.pages.hotelInfoPage
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget,
      widgetInfo.pages
    );
    let isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
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
      constants.widgetType.staticAd,
      constants.pages.hotelInfoPage
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget,
      widgetInfo.pages
    );
    let isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },

  /**
   * validates widget-More Info in Hero carousel swimlane
   */
  async validateMoreInfoWidgetInHeroCarousel() {
    let widgetInfo, moreInfoWidgetData;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.carousel,
      constants.widgetType.moreInfo,
      constants.pages.hotelInfoPage
    );
    let moreInfoData = await cmp.getMoreInfoWIdgetData(
      constants.widgets.carousel,
      constants.pages.hotelInfoPage
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget,
      widgetInfo.pages
    );
    await this.validateMoreInfoCard(moreInfoData);
    return true;
  },

  /**
   * Navigate to Home Sports tile
   */
  async navigateToSportsTile() {
    let swimlane;
    if (
      await cmp.isWidgetAvailable(
        constants.widgetType.sports,
        constants.pages.hotelInfoPage
      )
    ) {
      swimlane = await cmp.getWidgetPosition(
        constants.widgetType.sports,
        constants.pages.hotelInfoPage
      );
      await this.navigateToWidgetTile(
        swimlane.swimlaneIndex,
        swimlane.widgetIndex
      );
      if (await I.isFocused(hotelInfoPageLocators.sportsTile)) {
        await I.dpadOK();
        await I.waitForElement(hotelInfoPageLocators.container, 5);
      } else {
        assert.fail('Sports tile is not focused');
      }
      //Verify is sports tile is visible
    } else {
      assert.fail('Widget sports is not found');
    }
  },

  /**
   * Navigate to  Widget tile
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   */
  async navigateToWidgetTile(indexOfSwimlane, tileIndex) {
    await I.wait(1);
    await I.dpadDown(indexOfSwimlane);
    await I.wait(1);
    await I.dpadRight(tileIndex);
  },
};
