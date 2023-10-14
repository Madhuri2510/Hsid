const assert = require('assert');
const {execSync} = require('child_process');
const rokuIP = require('../../../utils/ConfigUtils').getConfigValues('rokuIP');
const {I} = inject();
const watchPageLocators = require('./WatchPageLocators.json');
const sportsPageLocators = require('../SportsPage/SportsPageLocators.json');
const sportsPage = require('../SportsPage/RokuSportsPage');
const expVal = require('../../../config/expectedValuesRoku.js');
const CMP = require('../../../OnStreamBackend/cmp');
const roku = require('../../../config/platform/roku');
let cmp = new CMP();
const {isRegressionType} = require('../../../utils/ConfigUtils');
const logger = require('../../../utils/LogUtils').getLogger(
  'BaseRokuOnStreamHomePage'
);
const platformName = require('../../../config/platform/roku.js');
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();
const navBar = require('../NavigationPage/RokuNavbarPage.js');
let property = require('../../../config/propertyType/hospitality.js');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const constants = require('../../../config/constants');

let navMenuMap = new Map([
  ['Home', 'pkg:/images/NewNavIcon/home.png'],
  ['TV Guide', 'pkg:/images/NewNavIcon/tvGuide.png'],
  ['Search', 'pkg:/images/NewNavIcon/search.png'],
  ['Settings', 'pkg:/images/NewNavIcon/settings.png'],
]);

module.exports = {
  constants,
  async launchRokuApplication() {
    await I.launchRokuApp();
  },

  async waitForOnStreamHomePageLaunch() {
    await this.launchRokuApplication();
    await I.waitForElementVisible(
      watchPageLocators.loadingControls,
      constants.timeWait.loading
    );
    await I.waitForElementDisappear(
      watchPageLocators.loadingControls,
      constants.timeWait.loadingMessage
    );

    let isMduVisible = await I.isVisible(watchPageLocators.homeViewMDU);
    // To check if the default property is Hospitality or MDU home page.
    let isVisible = isMduVisible
      ? isMduVisible
      : await I.isVisible(watchPageLocators.homeViewHospitality);
    assert.ok(isVisible, 'OnStreamHomePage is not Launch');
  },

  async verifyOnStreamHomePageTitle(expectedTitle) {
    if (await I.isVisible(watchPageLocators.carouselItems)) {
      let dynamicTitleLocator = watchPageLocators.title;
      dynamicTitleLocator.elementData[0].value = expVal.homePageTitle;
      let homepageTitle = await I.getElementText(dynamicTitleLocator);
      assert.strictEqual(
        homepageTitle,
        expVal.homePageTitle,
        'OnStream HomePage title is not matching'
      );
    } else {
      logger.warn('homepage title is not visible');
    }
  },

  async verifyWatchPageSwimlanes(swimlanesNames) {
    if (await I.isVisible(watchPageLocators.carouselItems)) {
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    let swimlanesNameLocator = watchPageLocators.swimlane;
    for (
      let swimlaneIndex = 0;
      swimlaneIndex < swimlanesNames.length;
      swimlaneIndex++
    ) {
      await I.dpadNavByEcp(constants.remoteKey.down);
      swimlanesNameLocator.elementData[0].value = swimlanesNames[swimlaneIndex];
      let swimlanesName = await I.getElementText(swimlanesNameLocator);
      assert.strictEqual(
        swimlanesName,
        swimlanesNames[swimlaneIndex],
        'OnStream swimlane name is not matching'
      );
    }
    return true;
  },

  async navigateToSwimlaneTile(swimLane, swimLaneIndex) {
    if (await I.isVisible(watchPageLocators.carouselItems)) {
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    if (swimLane === constants.swimlanesName.sports) {
      swimLane = await this.getSportSwimlaneTile();
      logger.debug(`[getSportSwimlaneTile]  ${swimLane}`);
    }
    let swimlaneNames = await cmp.getSwimlaneNames(constants.pages.watchPage);
    for (let index = 0; index < swimlaneNames.length; index++) {
      await I.dpadNavByEcp(constants.remoteKey.down);
      if (swimLane === swimlaneNames[index]) {
        break;
      }
    }
  },

  async getSportSwimlaneTile() {
    let swimlane;
    let swimlaneNames = await cmp.getSwimlaneNames(constants.pages.watchPage);
    if (swimlaneNames.includes(constants.swimlanesName.sportsWeather)) {
      swimlane = constants.swimlanesName.sportsWeather;
    } else if (swimlaneNames.includes(constants.swimlanesName.sports)) {
      swimlane = constants.swimlanesName.sports;
    } else {
      assert.fail('Sports tile is not configured on CMP in report');
    }
    return swimlane;
  },

  async verifyHomePageTabs(expectedTabs) {
    //TODO : since Roku does not implement for On Demand, Search, Recordings
    //       so temporary remove them from expected tabs
    let doesNotImplementTabs = ['Cast', 'On Demand', 'Recordings'];
    let updatedExpectedTabs = expectedTabs.filter(
      (x) => doesNotImplementTabs.indexOf(x) === -1
    );
    let dynamicTitleLocator = watchPageLocators.menuTabs;
    for (const expectedTab of updatedExpectedTabs) {
      dynamicTitleLocator.elementData[0].value = navMenuMap.get(expectedTab);
      let isVisible = await I.isVisible(dynamicTitleLocator);
      assert.ok(isVisible, `${expectedTab} tab is not displayed`);
    }
  },

  async clickOnPlayIconfromSwimLaneTile(swimlaneName, swimlaneIndex, tileNo) {
    if (await I.isVisible(watchPageLocators.carouselItems)) {
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    await this.clickOnSwimlaneContainer();
    await this.clickOnWatchNowButton();
  },

  async verifyWatchPageCarouselCount(expectedTotalCarousels) {
    let totalCarousel = 0;
    let totalHeroCarouselRails = await I.getElements(
      watchPageLocators.HeroCarouselControl
    );
    totalCarousel = totalHeroCarouselRails.length;
    logger.debug(`[getTotalCarousel] : ${totalCarousel}`);
    assert.strictEqual(
      totalCarousel,
      expectedTotalCarousels,
      `Failed, the total number of Carousels on Watch page is ${totalCarousel}`
    );
    return true;
  },

  async verifyTotalSwimlanesTiles(swinlanesName, expectedTitles) {
    let actualTiles = await I.getTotalSwimlanesTiles();
    assert.strictEqual(
      actualTiles,
      expectedTitles,
      `Failed, the number of tiles on the swimlane ${swinlanesName} is ${actualTiles}`
    );
    for (let i = 1; i < expectedTitles; i++) {
      await I.dpadNavByEcp(constants.remoteKey.left);
    }
  },

  async playAssetOnSwimlane() {
    if (await I.isElementFocused(constants.buttonText.learnMore)) {
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    if( await I.isElementFocused(constants.buttonText.watchNow)){
      await this.clickOnWatchNowButton();
    }
    else{
    await this.clickOnSwimlaneContainer();
    await this.clickOnWatchNowButton();
    }
  },

  async clickOnSwimlaneContainer() {
    let swimlaneNames = await cmp.getSwimlaneNames(constants.pages.watchPage);
    let isSelectedPlayableContainer = false;
    if (await I.isElementFocused(constants.buttonText.learnMore)) {
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    for (const swimlaneName of swimlaneNames) {
      while (!(await I.isSwimlaneFocused(swimlaneName))) {
        await I.dpadNavByEcp(constants.remoteKey.down);
      }
      const totalContainer = await cmp.getSwimlaneTilesCount(
        swimlaneName,
        constants.pages.watchPage
      );
      isSelectedPlayableContainer = await I.selectContainerAbleToPlay(
        totalContainer
      );
      if (isSelectedPlayableContainer) {
        break;
      }
    }
    if (isSelectedPlayableContainer) {
      logger.debug('[clickOnSwimlaneContainer] Selected playable container');
      await I.dpadNavByEcp(constants.remoteKey.ok);
    } else {
      logger.warn('[clickOnSwimlaneContainer] Cannot found playable container');
    }
  },

  async clickOnWatchNowButton() {
    let watchNowBtn = await I.isElementFocused(constants.buttonText.watchNow);
    assert.ok(watchNowBtn, ' WatchNow button is not visible');
    await I.dpadNavByEcp(constants.remoteKey.ok);
  },

  async navigateToSportsTile() {
    let swimlane;
    if (
      await cmp.isWidgetAvailable(
        constants.widgetType.sports,
        constants.pages.watchPage
      )
    ) {
      swimlane = await cmp.getWidgetPosition(
        constants.widgetType.sports,
        constants.pages.watchPage
      );
      await I.dpadNavByEcp(
        constants.remoteKey.down,
        swimlane.swimlaneIndex
      );
      await I.dpadNavByEcp(
        constants.remoteKey.right,
        swimlane.widgetIndex-1
      );
      await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
      if (await I.checkSportsTile(constants.swimlanesName.sports)) {
        await I.dpadNavByEcp(constants.remoteKey.ok);
        await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
        await I.waitForElementDisappear(sportsPageLocators.loadingControls);
      } else {
        assert.fail('Sports tile is not visible');
      }
    } else {
      assert.fail('Widget sports is not found');
    }
  },

  /**
   * * Resets application to home
   */
  async resetToHome() {
    await navBar.navigateToNavBar();
    await navBar.navigateTo(constants.navigationMenu.home);
    let isVisible = await I.isVisible(watchPageLocators.homeViewHospitality);
    assert.ok(isVisible, 'Home page is not displayed');
  },

  /**
   * verify every program on home page is focused.
   */
  async verifyFocusOnEveryProgram() {
    if (await I.isVisible(watchPageLocators.carouselItems)) {
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    let swimlanesName = await cmp.getSwimlaneNames(constants.pages.watchPage);
    // check all program on home page is focused.
    let isRegression = isRegressionType();
    if (isRegression) {
      for (
        let swimlaneNum = 0;
        swimlaneNum < swimlanesName.length;
        swimlaneNum++
      ) {
        logger.debug(
          `[verifyFocusOnEveryProgram] for ${swimlanesName[swimlaneNum]}`
        );
        let tileCounts = await cmp.getSwimlaneTilesCount(
          swimlanesName[swimlaneNum],
          constants.pages.watchPage
        );
        await I.dpadNavByEcp(constants.remoteKey.down);
        let checkFocus = await I.isProgramFocused(tileCounts);
        assert.ok(checkFocus, 'The program is not focused');
      }
      // check random program on 1 swimlane is focused.
    } else {
      let tileCounts = await cmp.getSwimlaneTilesCount(
        swimlanesName[0],
        constants.pages.watchPage
      );
      await I.dpadNavByEcp(constants.remoteKey.down);
      let checkFocus = await I.isProgramFocused(tileCounts);
      assert.ok(checkFocus, 'The program is not focused');
    }
  },

  async setSmartBoxId() {
    await this.waitForOnStreamHomePageLaunch();
    execSync(
      `curl -d '' http://${rokuIP}:8060/launch/dev?hardcoded_sbxid=` +
        constants.devTools.smartboxID.hospitality
    );
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
  },

  async getWidgetInfo(platform, widgetStyle, widgetType) {
    let widgetInfo;
    widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      widgetStyle,
      widgetType,
      constants.pages.watchPage
    );
    if (widgetInfo.swimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(`widget swimlane with ${widgetType} should be available`);
    } else {
      return widgetInfo;
    }
  },

  async getNotificationWidgetData(platform, widgetStyle) {
    let content = await cmp.getNotificationWIdgetData(
      widgetStyle,
      constants.pages.watchPage
    );
    if (content.headline === null || content.bodyText === null) {
      assert.fail('Data of notification widget should be available');
    } else {
      return content;
    }
  },

  /**
   * Navigate to asset tile of any Widget
   * @param {integer} swimlaneIndex
   * @param {integer} TileIndex
   */
  async navigateToSpecificTileInHome(swimlaneIndex, TileIndex) {
    await I.dpadNavByEcp(constants.remoteKey.down, swimlaneIndex);
    if (TileIndex !== 0) {
      await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
      await I.dpadNavByEcp(constants.remoteKey.right, TileIndex);
    } else {
      I.reportLog('Expected Tile is focused');
    }
  },

  async isCityVisible() {
    return await I.isVisible(watchPageLocators.cityLabel);
  },

  async isWeatherInfoCardDataVisible() {
    let isVisible = true;
    // City
    if (!(await this.isCityVisible())) {
      isVisible = false;
      I.reportLog('City Label should be visible in weather info card');
    }
    // Weather Status Message
    if (!(await I.isVisible(watchPageLocators.messageLabel))) {
      isVisible = false;
      I.reportLog(
        'Weather Status Message should be visible in weather info card'
      );
    }
    // Upcoming Temperature Group
    if (!(await I.isVisible(watchPageLocators.temperatureGroup))) {
      isVisible = false;
      I.reportLog(
        'Upcoming Temperature Group should be visible in weather info card'
      );
    }
    // Upcoming Weather Week Layout
    if (!(await I.isVisible(watchPageLocators.weatherInWeekLayout))) {
      isVisible = false;
      I.reportLog(
        'Upcoming Weather Week Layout should be visible in weather info card'
      );
    }
    // Upcoming Weather Week Layout
    if (!(await I.isVisible(watchPageLocators.okayBtn))) {
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

  async validateWeatherWidgetTile() {
    let widgetInfo,
      isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.weather
    );
    await this.navigateToSpecificTileInHome(
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
   * @param {integer} tileIndex
   * @param {string} swimlaneName
   */
  async validateSportsSmallWidgetTile() {
    let widgetInfo;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.sports
    );
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    let swimlaneNames = await sports.getActiveLeagues();
    return await sportsPage.areActiveSportsLeaguesAvailable(swimlaneNames);
  },

  async isSmallStaticAdWidgetDataVisible() {
    let isVisible = true;
    if (!(await I.isVisible(watchPageLocators.AdvertCommonInfoSubView))) {
      isVisible = false;
    }
    return isVisible;
  },

  async validateStaticAdSmallWidgetTile() {
    let widgetInfo,
      isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if (!(await this.isSmallStaticAdWidgetDataVisible())) {
      isVisible = false;
    }
    return isVisible;
  },

  async validateStaticAdLargeWidgetTile() {
    let widgetInfo,
      isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if (!(await this.isSmallStaticAdWidgetDataVisible())) {
      isVisible = false;
    }
    return isVisible;
  },

  async validateNotificationInLargeWidgetTile() {
    let widgetInfo, notificationInfo;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.notification
    );
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.isVisible(watchPageLocators.notificationHeading);
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
        (await I.getElementText(watchPageLocators.notificationHeading)) ===
        notificationInfo.headline
      )
    ) {
      assert.fail(`Notification heading is ${notificationInfo.headline}`);
    }
    if (
      !(
        (await I.getElementText(watchPageLocators.messageLabel)) ===
        notificationInfo.bodyText
      )
    ) {
      assert.fail(`Notification body is ${watchPageLocators.notificationBody}`);
    }
  },

  async validateNotificationInSmallWidgetTile() {
    let widgetInfo, notificationInfo;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.notification
    );
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
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
        (await I.getElementText(watchPageLocators.notificationHeading)) ===
        notificationInfo.headline
      )
    ) {
      assert.fail('Small Notification widget Heading should be Same');
    }
    if (
      !(
        (await I.getElementText(watchPageLocators.messageLabel)) ===
        notificationInfo.bodyText
      )
    ) {
      assert.fail('Small Notification widget Message should be same');
    }
    return true;
  },

  async getMoreInfoWidgetData(platform, widgetStyle) {
    let content = await cmp.getMoreInfoWIdgetData(
      widgetStyle,
      constants.pages.watchPage
    );
    if (content.headline === null || content.bodyText === null) {
      assert.fail('Data of notification widget should be available');
    } else {
      return content;
    }
  },

  async getVideoWidgetData(platform, widgetStyle) {
    let content = await cmp.getVideoWidgetData(
      widgetStyle,
      constants.pages.watchPage
    );
    if (content.headline === null || content.bodyText === null) {
      assert.fail('Data of notification widget should be available');
    } else {
      return content;
    }
  },

  async validateMoreInfoWidgetTile() {
    let widgetInfo, moreInfoWidgetData;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.moreInfo
    );
    await this.navigateToSpecificTileInHome(
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
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    if (!(await I.isElementFocused(constants.buttonText.learnMore))) {
      assert.fail(
        'learn More button should be focus to select in MoreInfo Widget In HeroCarousel'
      );
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    moreInfoWidgetData = await this.getMoreInfoWidgetData(
      platformName.platform,
      constants.widgets.carousel
    );
    let moreInfoWidgetContent = await I.getElements(watchPageLocators.ArticleCommonInfoSubView);
    if (
      !(
        (await I.getText(moreInfoWidgetContent[0].Nodes[0].Nodes[0].Nodes[2])) ==
        moreInfoWidgetData.headline
      )
    ) {
      assert.fail('Hero Carousel widget heading should be same');
    }
    if (
      !(
        (await I.getText(moreInfoWidgetContent[0].Nodes[0].Nodes[1].Nodes[0])) ==
        moreInfoWidgetData.subHeading
      )
    ) {
      assert.fail('Hero Carousel widget Sub heading should be same');
    }
    return true;
  },

  async validateStaticAdWidgetInHeroCarousel() {
    let widgetInfo,
      isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.carousel,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    if (!(await I.isElementFocused(constants.buttonText.learnMore))) {
      assert.fail(
        'learn More button should be focus to select in Ad Widget in HeroCarousel'
      );
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
    if (!(await I.isVisible(watchPageLocators.infoCard))) {
      isVisible = false;
    }
    if (!(await I.isVisible(watchPageLocators.advertLabel))) {
      isVisible = false;
    }
    return isVisible;
  },

  /**
   * checks whether watch now button is available or not on live widget.
   * @returns {boolean} - returns true if watch now button is available on live widget
   */
  async isWatchNowButtonVisible() {
    return await I.isVisible(watchPageLocators.watchNowBtn);
  },

  async isLiveWidgetDataVisible() {
    let isVisible = true;
    // Watch now button
    if (!(await this.isWatchNowButtonVisible())) {
      isVisible = false;
      I.reportLog('Live widget should be available');
    }
    return isVisible;
  },

/**
   * validates if watch now button is visible or not on large widget swimlane
   * @param {integer} swimlaneIndex
   * @param {integer} TileIndex
   * @returns {boolean} - returns true if  watch now button visible on large widget swimlane
   */
  async validateLiveWidgetTile(swimlaneIndex, TileIndex) {
    let isVisible = true;
    await this.navigateToSpecificTileInHome(
      swimlaneIndex,
      TileIndex
    );
    await I.wait(testExecutionWaits.WAIT_FOR_3_SEC);
    await I.dpadNavByEcp(constants.remoteKey.ok);
    if (await this.isLiveWidgetDataVisible()) {
      return isVisible;
    } else {
      isVisible = false;
      return isVisible;
    }
  },

  /**
   * validates if watch now button is visible or not on hero carousel tile
   * @param {integer} swimlaneIndex
   * @param {integer} TileIndex
   * @returns {boolean} - returns true if  watch now button visible on hero carousel tile
   */
  async validateLiveWidgetTileInHeroCarousel(swimlaneIndex, TileIndex) {
    let isVisible = true;
    await this.navigateToSpecificTileInHome(
      swimlaneIndex,
      TileIndex
    );
    await I.wait(testExecutionWaits.WAIT_FOR_3_SEC);
    if (await this.isLiveWidgetDataVisible()) {
      return isVisible;
    } else {
      isVisible = false;
      return isVisible;
    }
  },

  /**
   * verify the property logo
   */
  async isOnStreamPropertyLogoSeen() {
    return await I.isElementVisible(
      watchPageLocators.propertyLogo,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },


  /**
   * validates Video widget in Hero carousel swimlane
   * @param {integer} swimlaneIndex
   * @param {integer} TileIndex
   * @returns {boolean} - returns true if  Video widget is visible on hero carousel tile
   */
  async validateVideoWidgetInHeroCarousel(swimlaneIndex, TileIndex) {
    let videoWidgetData;
    await this.navigateToSpecificTileInHome(
      swimlaneIndex,
      TileIndex
    );
    if (!(await I.isElementFocused(constants.buttonText.learnMore))) {
      assert.fail(
        'learn More button should be focus to select in Video Widget In HeroCarousel'
      );
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    videoWidgetData = await this.getVideoWidgetData(
      platformName.platform,
      constants.widgets.carousel
    );
    let videoWidgetContent = await I.getElements(watchPageLocators.contentGroup);
    console.log(videoWidgetContent.headline);
    if (
      !(
        (await I.getText(videoWidgetContent[0].Nodes[0])) ==
        videoWidgetData.headline
      )
    ) {
      assert.fail('Hero Carousel video widget heading should be same');
    }
    if (
      !(
        (await I.getText(videoWidgetContent[0].Nodes[1])) ==
        videoWidgetData.subHeading
      )
    ) {
      assert.fail('Hero Carousel video widget Sub heading should be same');
    }
    return true;
  },



  /**
   * validates Video widget on Large widget swimlane
   * @param {integer} swimlaneIndex
   * @param {integer} TileIndex
   * @returns {boolean} - returns true if  Video widget is visible on Large widget swimlanee
   */
  async validateVideoWidgetInLargeWidget(swimlaneIndex, TileIndex) {
    let videoWidgetData;
    await this.navigateToSpecificTileInHome(
      swimlaneIndex,
      TileIndex
    );
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    if (!(await I.isVisible(watchPageLocators.ArticleVideoCommonInfoSubView))) {
      assert.fail(
        'Video Widget should be visible on Large widget swimlanee'
      );
    }
    videoWidgetData = await this.getVideoWidgetData(
      platformName.platform,
      constants.widgets.carousel
    );
    let videoWidgetContent = await I.getElements(watchPageLocators.contentGroup);
    console.log(videoWidgetContent.headline);
    if (
      !(
        (await I.getText(videoWidgetContent[0].Nodes[0])) ==
        videoWidgetData.headline
      )
    ) {
      assert.fail('Large widget swimlanee video widget heading should be same');
    }
    if (
      !(
        (await I.getText(videoWidgetContent[0].Nodes[1])) ==
        videoWidgetData.subHeading
      )
    ) {
      assert.fail('Large widget swimlanee video widget Sub heading should be same');
    }
    return true;
  },

};
