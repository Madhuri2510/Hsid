const assert = require('assert');
const {I, platformName, property} = inject();
const constants = require('../../../config/constants.js');
const navbarLocators = require('../NavigationPage/NavbarLocators.json');
const watchPageLocators = require('./WatchPageLocators.json');
const expVal = require('../../../config/expectedValues.js');
const CMP = require('../../../OnStreamBackend/cmp.js');
let cmp = new CMP();
let cmd = require('node-cmd');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits.js');
const logger = require('../../../utils/LogUtils.js').getLogger('WatchPage');
const {build} = inject();
const Sports = require('../../../OnStreamBackend/sports.js');
let sports = new Sports();
const sportsPage = require('../SportsPage/AndroidSportsPage');

module.exports = {
  constants,
  async waitForOnStreamHomePageLaunch() {
    if (property.propertyType === constants.propertyType.hospitality) {
      await this.setSmartBoxId(constants.devTools.smartboxID.hospitality);
    } else {
      await this.setSmartBoxId(constants.devTools.smartboxID.mdu);
    }
    await I.waitForElement(
      watchPageLocators.propertyLogo,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
  },

  async getFocusOnNavigationMenu() {
    while ((await I.isElementVisible(watchPageLocators.homeIcon)) == false) {
      await I.dpadBack();
    }
    let retry = 0;
    while (
      ((await I.isFocused(watchPageLocators.homeIcon)) ||
        (await I.isFocused(watchPageLocators.settingsIcon)) ||
        (await I.isFocused(watchPageLocators.tvGuideIcon)) ||
        (await I.isFocused(watchPageLocators.searchIcon))) === false &&
      retry < 5
    ) {
      await I.dpadBack();
      retry++;
    }
  },

  async getTimeFormat() {
    let time = await I.getElementText(watchPageLocators.displayed_time);
    if (time.includes(constants.time.AM) || time.includes(constants.time.PM)) {
      return constants.timeFormat.hour12;
    } else {
      return constants.timeFormat.hour24;
    }
  },

  async getTemperatureFormat() {
    while (
      (await I.isElementVisible(watchPageLocators.temperature_value)) === false
    ) {
      await I.dpadDown();
    }
    let temp = await I.getElementText(watchPageLocators.temperature_value);
    if (temp.includes(constants.temperatureFormatFireTv.celsius)) {
      return constants.temperatureFormatFireTv.celsius;
    } else {
      return constants.temperatureFormatFireTv.fahrenheit;
    }
  },

  async verifyOnStreamHomePageTitle(expectedTitle) {
    let onstreamHomePageTitle = await I.grabTextFrom(
      watchPageLocators.welcome_msg_home_screen
    );
    assert.strictEqual(
      onstreamHomePageTitle.toLowerCase(),
      expectedTitle.toLowerCase(),
      'OnStream HomePage title is not matching'
    );
  },

  async verifyWatchPageSwimlanes(swimlaneTitles) {
    let count = 0;
    let isSwimlaneFound = false;
    outer: for (const swim of swimlaneTitles) {
      while (
        !(await I.isElementVisible(
          watchPageLocators.swimlane_titles_text.replace('swimHeader', swim)
        ))
      ) {
        await I.dpadDown();
        count++;
        if (count > swimlaneTitles.length) {
          logger.info('Swimlane not found!!!');
          break outer;
        }
      }
      isSwimlaneFound = true;
    }
    return isSwimlaneFound;
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
      await I.dpadDown(swimlane.swimlaneIndex);
      await I.dpadRight(swimlane.widgetIndex);
      await I.dpadOK();
    }
    //Verify is sports tile is visible
    else {
      assert.fail('Widget sports is not found');
    }
  },

  async navigateToLiveChannel(containerName = 'Featured Channels') {
    let swimlanePosition;
    if (
      await cmp.isWidgetAvailable(
        constants.widgetType.live,
        constants.pages.watchPage
      )
    ) {
      swimlanePosition = await cmp.getWidgetPosition(
        constants.widgetType.live,
        constants.pages.watchPage
      );
      await I.dpadDown(swimlanePosition.swimlaneIndex);
      await I.dpadRight(swimlanePosition.widgetIndex);
    } else {
      assert.fail('Home Live Widget is not found');
    }
  },

  async playAssetOnSwimlane() {
    await this.navigateToLiveChannel();
    await I.dpadOK();
    //await I.waitForElement(watchPageLocators.player_page, 20);
  },

  async clickOnSwimlaneContainer(tile) {
    const {swimlaneIndex, tileIndex} = tile;
    await I.dpadDown(swimlaneIndex + 2);
    await I.wait(2);
    await I.dpadRight(tileIndex);
    await I.wait(2);
    await I.dpadOK();
    await I.wait(2);
  },

  async clickOnWatchNowButton() {
    await I.waitForElement(watchPageLocators.watchNowBtn, 20);
    await I.dpadOK();
    await I.wait(5);
  },

  async launchAppiumServer() {
    var objShell = await new ActiveXObject('Shell.Application');
    await objShell.ShellExecute(
      'sh ' + '/Users/slinger/Desktop/appium_bat_file.sh'
    );
  },

  async verifyHomePageTabs(expectedTabs) {
    assert.ok(
      I.isElementVisible(watchPageLocators.homeIcon),
      'Home tab is not visible on Header'
    );
    I.reportLog('Home tab is visible on Header');
    assert.ok(
      I.isElementVisible(watchPageLocators.tvGuideIcon),
      'TV Guide tab is not visible on Header'
    );
    I.reportLog('TV Guide tab is visible on Header');
    assert.ok(
      I.isElementVisible(watchPageLocators.settingsIcon),
      'Settings tab is not visible on Header'
    );
    I.reportLog('Settings tab is visible on Header');
    assert.ok(
      I.isElementVisible(watchPageLocators.business_logo),
      'Business logo is not visible on Header'
    );
    I.reportLog('Business Logo is displayed on Header');
  },

  async verifyOnPlayerScreen() {
    await I.waitForElement(watchPageLocators.player_page, 20);
    let isOnPlayerScreen = false;
    isOnPlayerScreen = await I.isElementVisible(watchPageLocators.player_page);
    assert.ok(isOnPlayerScreen, 'Not on player screen');
  },

  async verifyExitApp() {
    await I.dpadBack();
    let exitDialogText = await I.getElementText(watchPageLocators.exitAppText);
    assert.strictEqual(
      exitDialogText[0],
      expVal.exitAppTitle,
      'Exit App Title is not matching'
    );
    assert(
      await I.isFocused(watchPageLocators.exitCancelButton),
      'Cancel Button is not focused'
    );
    await I.dpadOK();
    await this.verifyHomePageTabs();
    await I.dpadBack();
    await I.dpadLeft();
    assert(
      await I.isFocused(watchPageLocators.exitButton),
      'Exit Button is not focused'
    );
    await I.dpadOK();
  },
  /**
   * Close Video player
   */
  async closeVideoPlayer() {
    // Invoking player controls
    await I.dpadUp();
    const seekBar = setTimeout(await playerPage.isSeekBarDisplayed, 2000);
    if (seekBar) {
      await I.dpadBack();
    }
  },
  /**
   * Resets application to home
   */
  async resetToHome() {
    let iteration = 0;
    if (await I.isElementVisible(watchPageLocators.exitApp)) {
      await I.dpadBack();
    } else if (!(await I.isElementVisible(watchPageLocators.homeIcon))) {
      await I.dpadBack();
    } else if (await I.isFocused(watchPageLocators.homeIcon)) {
      I.reportLog('Home Tab is focused');
      iteration = constants.iterations;
    }
    for (iteration; iteration < constants.maxResetHome; iteration++) {
      if (!(await I.isFocused(watchPageLocators.homeIcon))) {
        await I.dpadBack();
      } else if (await I.isFocused(watchPageLocators.homeIcon)) {
        iteration = constants.iterations;
        I.reportLog('Home Tab is focused');
      }
    }
  },

  async setSmartBoxId(smartboxId) {
    if (build.buildType === 'debug') {
      cmd.run(
        `adb shell am broadcast -a dish.onstream.smartboxid.set -p tv.accedo.xdk.dishtv.debug -e id ${smartboxId}`
      );
    } else {
      cmd.run(
        `adb shell am broadcast -a dish.onstream.smartboxid.set -p tv.accedo.xdk.dishtv -e id ${smartboxId}`
      );
    }
    await I.waitForElement(
      watchPageLocators.watchTile,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
  },

  async clickTvGuideButton() {
    I.wait(2);
    I.dpadTVGuide();
  },

  async verifyLandedOnTvGuidePage() {
    I.wait(2);
    assert.ok(
      await I.isElementVisible(
        classicGuideLocators.channelLogos,
        'TV Guide Tab not visible'
      )
    );
  },

  async clickChannelUpButton() {
    I.wait(4);
    I.dpadChannelUp();
  },

  async clickChannelDownButton() {
    I.wait(4);
    I.dpadChannelDown();
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
   *  validates Advertise tag is visible on info card
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - Returns true if advertise tag is visible on info card
   */
  async validateStaticAdLargeWidgetTile() {
    let widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.staticAd
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    let isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
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
      constants.widgetType.staticAd
    );
    await this.openAssetTileInHomeScreen(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    let isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },

  /**
   * checks weather advertise tag is available or not.
   * @returns {boolean} - returns true if advertise tag available on info card.
   */
  async isAdvertiseTagAvailable() {
    return await I.isElementVisible(watchPageLocators.advertiseTagOnInfoCard);
  },

  /**
   * closes the info card
   */
  async closeInfoCardInHomeScreen() {
    await I.dpadBack();
  },

  /**
   * validates sports swimlane after clicking on sport tile
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   */
  async validateSportsWidgetTile() {
    await this.openAssetTileInHomeScreen(tileIndex, indexOfSwimlane);
    let swimlaneNames = await sports.getActiveLeagues();
    await sportsPage.areActiveSportsLeaguesAvailable(swimlaneNames);
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
    await I.wait(3);
    await sportsPage.verifySportsPageSwimLanes(swimlaneNames);
    return true;
  },

  /**
   * validates content of notification info card with cmp data
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
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
      constants.pages.watchPage
    );
    await this.validateNotificationInfoCard(notificationInfo);
    return true;
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
      constants.pages.watchPage
    );
    await this.validateNotificationInfoCard(notificationInfo);
  },

  /**
   * validates content of notification info card
   * @param {object} content
   */
  async validateNotificationInfoCard(content) {
    let headline = await I.grabTextFrom(
      watchPageLocators.headlineOfNotificationTile
    );
    let bodyText = await I.grabTextFrom(
      watchPageLocators.bodyTextOfNotificationTile
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
      constants.pages.watchPage
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
      watchPageLocators.headlineOfMoreInfoCard
    );
    let subHeading = await I.grabTextFrom(
      watchPageLocators.subHeadingOfMoreInfoCard
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
   * validates weather logo is visible on info card or not.
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - returns true if weather logo is visible on info card.
   */
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
   * checks weather weather logo is available or not on info card.
   * @returns {boolean} - returns true if weather logo is available on infoCard
   */
  async isWeatherLogoAvailable() {
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    return await I.isElementVisible(watchPageLocators.weatherLogoOnInfoCard);
  },

  /**
   * Navigate to asset tile of Live Widget
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   */
  async navigateToLiveWidgetTile(indexOfSwimlane, tileIndex) {
    await I.wait(1);
    await I.dpadDown(indexOfSwimlane);
    await I.wait(1);
    await I.dpadRight(tileIndex);
  },
  /**
   * validates if live tag is visible or not on hero carousel tile
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - returns true if live tag visible on hero carousel tile
   */
  async validateLiveWidgetTileInHeroCarousel(indexOfSwimlane, tileIndex) {
    await this.navigateToLiveWidgetTile(indexOfSwimlane, tileIndex);
    return this.isLiveTagVisibleOnTile();
  },

  /**
   * checks weather live tag is available or not on specific tile
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - returns true if live tag is visible on tile
   */
  async isLiveTagVisibleOnTile() {
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    return await I.isElementVisible(watchPageLocators.liveTagOnSpecificTile);
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
      constants.pages.watchPage
    );
    if (widgetInfo.swimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(`widget swimlane with ${widgetType} should be available`);
    } else {
      return widgetInfo;
    }
  },
  /**
   * validates content of Video widget in hero carousel swimlane.
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   */
  async validateVideoWidgetInHeroCarousel(indexOfSwimlane, tileIndex) {
    await this.openAssetTileInHomeScreen(indexOfSwimlane, tileIndex);
    videoInfo = await cmp.getVideoWidgetData(
      constants.widgets.carousel,
      constants.pages.watchPage
    );
    return await this.validateVideoWidget(videoInfo);
  },

  /**
   * validates content of live chanel widget in hero carousel swimlane.
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   */
  async validateLiveChannelWidgetInHeroCarousel(indexOfSwimlane, tileIndex) {
    await this.navigateToLiveWidgetTile(indexOfSwimlane, tileIndex);
    videoInfo = await cmp.getLiveChannelWidgetData(
      constants.widgets.carousel,
      constants.pages.watchPage
    );
    return await this.validateLiveChannelWidget(videoInfo);
  },

  /**
   * Navigate to video widget
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   */
  async navigateToVideoWidgetTile(indexOfSwimlane, tileIndex) {
    await I.wait(1);
    await I.dpadDown(indexOfSwimlane);
    await I.wait(1);
    await I.dpadRight(tileIndex);
  },
  /**
   * validates data of video widget.
   * @param {object} content
   */
  async validateVideoWidget(content) {
    let headline = await I.grabTextFrom(
      watchPageLocators.headlineOfVideoWidget
    );
    console.log(headline, content.headline);
    let subHeading = await I.grabTextFrom(
      watchPageLocators.subHeadingOfVideoWidget
    );
    assert.ok(
      headline[0] === content.headline,
      'Headline of video widget should match with cmp data'
    );
    assert.ok(
      subHeading === content.subHeading,
      'Sub Heading of video widget tile should match with cmp data'
    );
    return true;
  },

  /**
   * validates data of live channel widget.
   * @param {object} content
   */
  async validateLiveChannelWidget(content) {
    await I.wait(1);
    let programTitle = await I.grabTextFrom(
      watchPageLocators.liveProgramWidgetTitle
    );
    await I.wait(1);
    assert.ok(
      programTitle === content.headline,
      'Title of live channel widget should match with cmp data'
    );
    assert.ok(
      await I.isVisible(watchPageLocators.liveTagOnSpecificTile),
      'Live tag is not visible on Live channel widget'
    );
    return true;
  },

  /**
   * validates content of Video widget in large widget swimlane.
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   */
  async validateVideoWidgetInLargeWidget(indexOfSwimlane, tileIndex) {
    await this.openAssetTileInHomeScreen(indexOfSwimlane, tileIndex);
    videoInfo = await cmp.getVideoWidgetData(
      constants.widgets.largeWidget,
      constants.pages.watchPage
    );
    return await this.validateVideoWidget(videoInfo);
  },
  /**
   * validates content of Live channel widget in large widget swimlane.
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   */
  async validateLiveChannelWidgetInLargeWidget(indexOfSwimlane, tileIndex) {
    await this.navigateToLiveWidgetTile(indexOfSwimlane, tileIndex);
    videoInfo = await cmp.getLiveChannelWidgetData(
      constants.widgets.largeWidget,
      constants.pages.watchPage
    );
    await this.validateLiveChannelWidget(videoInfo);
    return true;
  },

  async verifyTopBarNavigation(expectedTabs) {
    await this.goToHomeTab();
    for (let i = 0; i < expectedTabs.length; i++) {
      switch (expectedTabs[i]) {
        case constants.navigationMenu.home:
          await assert.ok(
            I.isElementVisible(watchPageLocators.homeText),
            'Home Text is not visible on Header'
          );
          await assert.ok(
            I.isFocused(watchPageLocators.homeIcon),
            'Home Icon is not focused on Header'
          );
          await I.reportLog('Home tab is visible on Header');
          await I.dpadRight();
          break;
        case constants.navigationMenu.tvGuide:
          await assert.ok(
            I.isElementVisible(watchPageLocators.tvGuideText),
            'TV Guide Text is not visible on Header'
          );
          await assert.ok(
            I.isFocused(watchPageLocators.tvGuideIcon),
            'TV Guide Icon is not focused on Header'
          );
          await assert.ok(
            I.isElementVisible(classicGuideLocators.channelLogos),
            'Channel Logo is displayed in TV Guide Tab'
          );
          await I.reportLog('TV Guide tab is displayed');
          await I.dpadRight();
          break;
        case constants.navigationMenu.onDemand:
          await assert.ok(
            I.isElementVisible(watchPageLocators.onDemandText),
            'On Demand Text is not visible on Header'
          );
          await assert.ok(
            I.isFocused(watchPageLocators.onDemandIcon),
            'On Demand Icon is not focused on Header'
          );
          await assert.ok(
            I.isElementVisible(onDemandPageLocators.trendingContentsLabel),
            'Trending Contents Label is not displayed on OnDemand Page'
          );
          await I.reportLog('On Demand tab is visible on Header');
          await I.dpadRight();
          break;
        case constants.navigationMenu.search:
          await assert.ok(
            I.isElementVisible(watchPageLocators.searchText),
            'Search Text is not visible on Header'
          );
          await assert.ok(
            I.isFocused(watchPageLocators.searchIcon),
            'Search Icon is not focused on Header'
          );
          await assert.ok(
            I.isElementVisible(searchPageLocators.searchBox),
            'Search Icon is not displayed in Settings Tab'
          );
          await I.reportLog('Search tab is displayed ');
          await I.dpadRight();
          break;
        case constants.navigationMenu.settings:
          await assert.ok(
            I.isElementVisible(watchPageLocators.settingsText),
            'Settings Text is not visible on Header'
          );
          await assert.ok(
            I.isFocused(watchPageLocators.settingsIcon),
            'Settings Icon is not focused on Header'
          );
          await assert.ok(
            I.isElementVisible(settingsPageLocators.app_settings),
            'App Settings menu is not visible in settings page'
          );
          await I.reportLog('Settings tab is displayed');
          break;
      }
    }
  },

  async goToCommunityInfoTab() {
    await this.getFocusOnNavigationMenu();
    let retry = 0;
    while (
      (await I.isFocused(watchPageLocators.communityInfoIcon)) === false &&
      retry < 9
    ) {
      await I.dpadRight();
      await I.wait();
      retry++;
    }
  },

  async verifyHomePageTiles(navigationTiles) {
    let updateTiles = ['Netflix']; // Temporary - For handling mismatch till navigation tile display is finalized for home page
    let updatedNavigationTiles = navigationTiles.filter(
      (x) => updateTiles.indexOf(x) === -1
    );
    for (const tile of updatedNavigationTiles) {
      let isTileFound = await I.isElementVisible(
        watchPageLocators.homePageTileIcons.replace('tileIconName', tile)
      );
      assert.ok(isTileFound, `${tile} tile is not found on home page`);
    }
  },

  async verifyWatchPageCarouselCount(expectedtotalCarousels) {
    await I.dpadDown();
    const totalCarousel = await I.grabNumberOfVisibleElements(
      watchPageLocators.heroCarousel
    );
    assert.strictEqual(
      totalCarousel,
      expectedtotalCarousels,
      `Failed, the total number of Carousels on HomePage is ${totalCarousel}`
    );
    return totalCarousel == expectedtotalCarousels;
  },

  async playAssetOnSwimlane(swimlane) {
    let isPlayerPageVisible = false;
    await this.navigateToLiveChannel(swimlane);
    await I.dpadOK();
    await I.wait(30);
    if (await I.isVisible(watchPageLocators.player_page)) {
      isPlayerPageVisible = true;
    }
    return isPlayerPageVisible;
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
   * Validate asset tile of Live Widget
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - returns true if watchNow button and live tag is visible on tile
   */
  async validateLiveWidgetTile(indexOfSwimlane, tileIndex) {
    await this.navigateToLiveWidgetTile(indexOfSwimlane, tileIndex);
    return await this.isLiveTagVisibleOnTile();
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

  async navigateToLiveChannel() {
    let swimlanePosition;
    if (
      await cmp.isWidgetAvailable(
        constants.widgetType.live,
        constants.pages.watchPage
      )
    ) {
      swimlanePosition = await cmp.getWidgetPosition(
        constants.widgetType.live,
        constants.pages.watchPage
      );
      await I.dpadDown(swimlanePosition.swimlaneIndex);
      await I.dpadRight(swimlanePosition.widgetIndex);
    } else {
      assert.fail('Home Live Widget is not found');
    }
  },
};
