const assert = require('assert');
const {I, platformName} = inject();
const constants = require('../../../config/constants.js');
const myStayPageLocators = require('./MyStayPageLocators.json');
const sportsPage = require('../SportsPage/AndroidSportsPage');
const CMP = require('../../../OnStreamBackend/cmp');
let cmp = new CMP();
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();

module.exports = {
  constants,

  /**
   * verify the property logo in My Stay Page
   * @returns {boolean} : true if Hotel Logo is seen in My Stay Page
   */
  async isOnStreamPropertyLogoSeen() {
    return await I.isElementVisible(
      myStayPageLocators.onStreamPropertyLogo,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  async verifyMyStayPageCarouselCount(expectedTotalCarousels) {
    let totalCarousel = 0;
    let totalHeroCarouselRails = await I.getElements(
      myStayPageLocators.HeroCarouselMoreInfoItem
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

  async verifyMyStayPageLearnMoreSection(learnMoreText) {
    await I.dpadOK();
    await I.wait(2);
    let headlineOfLearnMore = await I.grabTextFrom(
      myStayPageLocators.headlineOfLearnMore
    );
    let subHeadingOfLearnMore = await I.grabTextFrom(
      myStayPageLocators.subHeadingOfLearnMore
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
    let PwidgetInfo;
    widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      widgetStyle,
      widgetType,
      constants.pages.myStayPage
    );
    if (
      widgetInfo.indexOfSwimlaneName === -1 ||
      widgetInfo.indexOfWidget === -1
    ) {
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
  async openAssetTileInHomeScreen(indexOfSwimlane, tileIndex, pages) {
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
    return await I.isElementVisible(myStayPageLocators.weatherLogoOnInfoCard);
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
    await sportsPage.verifySportsPageSwimLanes(swimlaneNames);
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
      constants.pages.myStayPage
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
    return await I.isElementVisible(myStayPageLocators.advertiseTagOnInfoCard);
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
      constants.pages.myStayPage
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
    return await I.isElementVisible(myStayPageLocators.advertiseTagOnInfoCard);
  },

  /**
   * validates content of notification info card with cmp data
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   * @returns {boolean} true if Notification Widget is displayed correctly in My Stay Page
   */
  async validateNotificationInSmallWidgetTile() {
    let widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.notification
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    notificationInfo = await cmp.getNotificationWIdgetData(
      constants.widgets.smallWidget,
      constants.pages.myStayPage
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
      myStayPageLocators.headlineOfNotificationTile
    );
    assert.ok(
      headline === content.headline,
      'Headline of notification tile should match with cmp data'
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
      constants.pages.myStayPage
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
      myStayPageLocators.headlineOfMoreInfoCard
    );
    let subHeading = await I.grabTextFrom(
      myStayPageLocators.subHeadingOfMoreInfoCard
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
      constants.pages.myStayPage
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
      constants.pages.myStayPage
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
      constants.pages.myStayPage
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
      constants.pages.myStayPage
    );
    let moreInfoData = await cmp.getMoreInfoWIdgetData(
      constants.widgets.carousel,
      constants.pages.myStayPage
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
   * validates My Staty Page is displayed
   * @returns {boolean}: true if My Stay page is displayed
   */
  async verifyMyStayPageDisplayed() {
    return await I.isElementVisible(myStayPageLocators.myStayMenu);
  },
};
