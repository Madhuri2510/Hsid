const assert = require('assert');
const {I, sportsPage, platformName, constants} = inject();
const watchPageLocators = require('./WatchPageLocators.json');
const playerPageLocators = require('../PlayerPage/PlayerPageLocators.json');
const settingsPageLocators = require('../SettingsPage/SettingsPageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const CMP = require('../../../OnStreamBackend/cmp');
let cmp = new CMP();
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();

module.exports = {
  constants,
  async waitForOnStreamHomePageLaunch() {
    await I.amOnPage('/');
    await I.waitForElement(
      watchPageLocators.businessLogo,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
  },

  async verifyOnStreamHomePageTitle(expectedTitle) {
    let onstreamHomePageTitle = await I.getTextContent(
      watchPageLocators.welcomeMsgHomeScreen
    );
    assert.strictEqual(
      onstreamHomePageTitle,
      expectedTitle,
      'OnStream HomePage title is not matching'
    );
  },

  async verifyHomePageTabs(expectedTabs) {
    assert.ok(
      I.isElementVisible(watchPageLocators.businessLogo),
      'Home tab is not visible on Header'
    );
    I.reportLog('Home tab is visible on Header');
    assert.ok(
      I.isElementVisible(watchPageLocators.tvGuide),
      'TV guide tab is not visible on Header'
    );
    I.reportLog('TV Guide tab is visible on Header');
    assert.ok(
      I.isElementVisible(watchPageLocators.settings),
      'Settings tab is not visible on Header'
    );
    I.reportLog('Settings tab is visible on Header');
    assert.ok(
      I.isElementVisible(watchPageLocators.businessLogo),
      'Business logo is not visible on Header'
    );
    I.reportLog('Business Logo is displayed on Header');
  },

  async goToSettingsTab() {
    await I.forceClick(watchPageLocators.settingsTab);
    await I.waitForElement(
      settingsPageLocators.appSettings,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  async goToTVGuideTab() {
    await I.forceClick(watchPageLocators.tvGuide);
    await I.waitForElement(
      watchPageLocators.tvGuideChannelLogos,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  async goToSearchTab() {
    await I.forceClick(watchPageLocators.searchHeader);
    await I.wait(3);
  },

  async goToOnDemandTab() {
    await I.forceClick(watchPageLocators.onDemandHeader);
    await I.wait(10);
  },

  async goToWatchLaterTab() {
    await I.forceClick(watchPageLocators.watchLater);
    await I.wait(3);
  },

  async verifyHomePageSwimlanes(swimlaneTitles) {
    await I.wait(10);
    let swimlaneText = await I.getElementLabel(
      watchPageLocators.swimlaneTitlesAll
    );
    for (
      let swimlaneIndex = 0;
      swimlaneIndex < swimlaneText.length;
      swimlaneIndex++
    ) {
      assert.strictEqual(
        swimlaneText[swimlaneIndex],
        swimlaneTitles[swimlaneIndex],
        'OnStream swimlane Text is not matching'
      );
    }
  },

  async verifyWatchPageCarouselCount(expectedtotalCarousels) {
    await I.wait(10);
    const totalCarousel = await I.grabNumberOfVisibleElements(
      watchPageLocators.totalCarousels
    );
    assert.strictEqual(
      totalCarousel,
      expectedtotalCarousels,
      `Failed, the total number of Carousels on HomePage is ${totalCarousel}`
    );
  },

  async getSwimlanesCount() {
    let swimlanesCount = await I.grabNumberOfVisibleElements(
      watchPageLocators.swimlane
    );
    return swimlanesCount;
  },

  async getSwimlaneTitles() {
    let swimlaneTitles = [];
    let swimlanesCount = await this.getSwimlanesCount();
    for (let i = 0; i < swimlanesCount; i++) {
      let title = await I.getElementLabel(
        watchPageLocators.swimlane_heading.replace(constants.index, i)
      );
      swimlaneTitles.push(title);
    }
    return swimlaneTitles;
  },

  async getSwimlaneContainerCount(swimlaneIndex) {
    let containerLocator = watchPageLocators.swimlane_tile_element.replace(
      constants.index,
      swimlaneIndex + 1
    );
    let containersCount = await I.grabNumberOfVisibleElements(containerLocator);
    return containersCount;
  },

  async getSwimlaneTilesContentNames(swimlaneIndex) {
    if (swimlaneIndex >= this.getSwimlanesCount()) {
      throw new Error('lane index passed does not exist - verify manually');
    }
    let swimlaneContentNames = [];
    let tileNameLocator = watchPageLocators.swimlane_tiles_content_title.replace(
      new RegExp(constants.laneIndex, 'g'),
      swimlaneIndex
    );
    let tilesCount = await this.getSwimlaneContainerCount(swimlaneIndex);
    for (let i = 0; i < tilesCount; i++) {
      let name = await I.getElementLabel(
        tileNameLocator.replace('tileIndex', i)
      );
      swimlaneContentNames.push(name);
    }
    return swimlaneContentNames;
  },

  async clickOnSwimlaneContainer(tile) {
    const {swimlaneIndex, tileIndex} = tile;
    if (swimlaneIndex >= this.getSwimlanesCount()) {
      throw new Error('lane index passed does not exist - verify manually');
    }
    if (tileIndex >= this.getSwimlaneContainerCount(swimlaneIndex)) {
      throw new Error(
        'container index passed does not exist - verify manually'
      );
    }
    await I.scrollIntoView(
      watchPageLocators.swimlane_tile
        .replace('swimLaneIndex', swimlaneIndex + 1)
        .replace('TileIndex', tileIndex + 2)
    );
    await I.wait(5);
    await I.click(
      watchPageLocators.swimlane_tile
        .replace('swimLaneIndex', swimlaneIndex + 1)
        .replace('TileIndex', tileIndex + 2)
    ); // TO-DO : force click did not work -> check in safari
    await I.wait(5);
  },

  async clickOnWatchNowButton() {
    await I.waitForElement(watchPageLocators.watchNowButton, 5);
    await I.click(watchPageLocators.watchNowButton);
    await I.waitForElement(playerPageLocators.playerCaptionButton, 60);
  },

  async isNavigatedToPlayerScreen() {
    return (await I.getPageUrl()).includes(constants.player);
  },

  async navigateToHomeLiveChannel() {
    let swimlaneIndex, liveTileIndex, liveTile, swimlanePosition;
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
      swimlaneIndex = swimlanePosition.swimlaneIndex + 1;
      liveTileIndex = swimlanePosition.widgetIndex + 1;

      liveTile = watchPageLocators.swimlaneWithSwimlaneAndWidgetIndex
        .replace(constants.swimlaneIndex, swimlaneIndex)
        .replace(constants.tileIndex, liveTileIndex);
      await I.waitForElement(
        liveTile,
        testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
      );
      await I.scrollIntoView(liveTile, {
        block: 'center',
        inline: 'center',
      });
      await I.click(liveTile);
      await I.wait(3);
    } else {
      assert.fail('Home Live channel is not found');
    }
  },

  async playAssetOnSwimlane() {
    await this.navigateToHomeLiveChannel();
    if (!(await I.isElementVisible(watchPageLocators.watchNowButton))) {
      throw new Error('Not a playable asset - please verify manually');
    }
    await this.clickOnWatchNowButton();
    await I.wait(30);
    assert.ok(
      await this.isNavigatedToPlayerScreen(),
      'Failed to redirect to the player'
    );
    I.reportLog('Redirected to the player');
  },

  async verifyHomePageLearnMoreSection(learnMoreText) {
    await I.elementClick(watchPageLocators.learnMore);
    let textRetrieved = await I.grabTextFrom(watchPageLocators.learn_more_texts);
    for (let startIndex = 0; startIndex < textRetrieved.length; startIndex++) {
      assert.strictEqual(
        textRetrieved[startIndex],
        learnMoreText[startIndex],
        'OnStream Home Page Learn More text is not matching'
      );
    }
    await this.clickonCloseIcon();
  },

  async verifyHomePageAddTileDetails() {
    let isAddTagVisible = await I.isElementVisible(watchPageLocators.add_tag);
    assert(isAddTagVisible);
    let isMoreInfoButtonVisible = await I.isElementVisible(
      watchPageLocators.moreInfo
    );
    assert(isMoreInfoButtonVisible);
    await this.clickonCloseIcon();
  },

  async verifyHomePagePetFriendlyTitle() {
    let isPetFriendlyTitleVisible = await I.isElementVisible(
      watchPageLocators.pet_friendly
    );
    assert.ok(isPetFriendlyTitleVisible, 'Pet friendly title is not visible');
    await this.clickonCloseIcon();
  },

  async navigateToSwimlaneTile(swimlaneName, swimlaneIndex) {
    await I.scrollIntoView(
      watchPageLocators.swimlane_carousel
        .replace(constants.swimlaneName, swimlaneName)
        .replace(constants.swimlaneIndex, swimlaneIndex),
      {block: 'center', inline: 'center'}
    );
    await I.wait(2);
    await I.click(
      watchPageLocators.swimlane_carousel
        .replace(constants.swimlaneName, swimlaneName)
        .replace(constants.swimlaneIndex, swimlaneIndex)
    );
    await I.wait(2);
  },

  async clickonCloseIcon() {
    await I.forceClick(watchPageLocators.close_icon);
    await I.wait(5);
  },

  async goToHomeTab() {
    await I.forceClick(watchPageLocators.businessLogo);
    await I.forceClick(watchPageLocators.watchIconInHomePage);
    await I.wait(3);
    await I.waitForVisible(watchPageLocators.swimlaneWidgets, 10);
  },

  async getTimeFormat() {
    // TO-DO - Find time displayed on browser
    console.log('Yet to be Implemented on Browser');
    return '';
  },

  async getTemperatureFormat() {
    // TO-DO - Find temoerature displayed on browser
    console.log('Yet to be Implemented on Browser');
    return '';
  },

  async clickOnPlayIconfromSwimLaneTile(swimlaneName, swimlaneIndex, tileNo) {
    await I.scrollIntoView(
      watchPageLocators.swimlaneTilePlayIcon
        .replace(constants.swimlaneName, swimlaneName)
        .replace(constants.swimlaneIndex, swimlaneIndex + 1)
    );
    await I.wait(2);
    await I.forceClick(
      watchPageLocators.swimlaneTilePlayIcon
        .replace(constants.swimlaneName, swimlaneName)
        .replace(constants.swimlaneIndex, swimlaneIndex + 1)
    );
    try {
      await I.waitForElement(watchPageLocators.playIcon, 30);
    } catch (err) {
      console.log(err);
    }
    if (await I.isElementVisible(watchPageLocators.playIcon)) {
      await I.click(watchPageLocators.playIcon);
      await I.wait(3);
    }
  },

  async verifyOnPlayerScreen() {
    let isOnPlayerScreen = await this.isNavigatedToPlayerScreen();
    assert.ok(isOnPlayerScreen, 'Failed to navigate to the player screen');
  },

  /**
   * Resets application to home
   */
  async resetToHome() {
    await this.goToHomeTab();
  },

  /**
   * Navigate to Sports page
   */
  async navigateToSportsTile() {
    if (
      await cmp.isWidgetAvailable(
        constants.widgetType.sports,
        constants.pages.watchPage
      )
    ) {
      let swimlane = await cmp.getWidgetPosition(
        constants.widgetType.sports,
        constants.pages.watchPage
      );
      let swimlanePosition = swimlane.swimlaneIndex + 1;
      let sportsTileIndex = swimlane.widgetIndex + 1;
      let sportsTilePosition = watchPageLocators.swimlaneWithSwimlaneAndWidgetIndex
        .replace(constants.swimlaneIndex, swimlanePosition)
        .replace(constants.tileIndex, sportsTileIndex);
      await I.waitForElement(
        sportsTilePosition,
        testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
      );
      await I.scrollIntoView(sportsTilePosition);
      await I.click(sportsTilePosition);
      await I.wait(3);
    } else {
      assert.fail('Widget sports is not found');
    }
  },

  async setSmartBoxId(smartboxId) {
    await I.amOnPage('/devTools');
    await I.waitForElement(
      watchPageLocators.passwordDevTools,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
    await I.fillField(
      watchPageLocators.passwordDevTools,
      constants.devTools.password
    );
    await I.click(watchPageLocators.verifyPassword)
    await I.waitForElement(
      watchPageLocators.updateDevTools,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.fillField(watchPageLocators.smartboxIdPlaceHolder, smartboxId);
    await I.click(watchPageLocators.updateDevTools);
    await I.waitForElement(
      watchPageLocators.businessLogo,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
    await I.amOnPage('/');
  },

  /**
   * validates content of more info card with cmp data.
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   */
  async validateMoreInfoWidgetTile() {
    let widgetInfo, moreInfoData;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.moreInfo
    );
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    moreInfoData = await cmp.getMoreInfoWIdgetData(
      constants.widgets.largeWidget,
      constants.pages.watchPage
    );

    await this.validateMoreInfoCard(moreInfoData);
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
    await this.navigateToSpecificTileInHome(
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
    await I.click(watchPageLocators.closeIconOnInfoCard);
  },

  /**
   * Validate asset tile of Live Widget
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - returns true if watchNow button and live tag is visible on tile
   */
  async validateLiveWidgetTile(indexOfSwimlane, tileIndex) {
    let tile = watchPageLocators.swimlaneIndexWithWidgetIndex
      .replace(constants.swimlaneIndex, indexOfSwimlane + 1)
      .replace(constants.tileIndex, tileIndex);
    await I.waitForElement(tile, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.scrollIntoView(tile);
    let liveTagOnTile = await this.isLiveTagVisibleOnTile(
      tileIndex,
      indexOfSwimlane
    );
    await I.click(tile);
    let watchNowButtonOnInfoCard = await this.isWatchNowButtonAvailable();
    await this.closeInfoCardInHomeScreen();
    return liveTagOnTile && watchNowButtonOnInfoCard;
  },

  /**
   * checks weather live tag is available or not on specific tile
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - returns true if live tag is visible on tile
   */
  async isLiveTagVisibleOnTile(tileIndex, indexOfSwimlane) {
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    let tileWithLiveTag = watchPageLocators.liveTagOnSpecificTile
      .replace(constants.swimlaneIndex, indexOfSwimlane + 1)
      .replace(constants.tileIndex, tileIndex);
    return await I.isElementVisible(tileWithLiveTag);
  },

  /**
   * checks weather watchNow button is available or not.
   * @returns {boolean} - returns true if watch now button is available.
   */
  async isWatchNowButtonAvailable() {
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    return await I.isElementVisible(watchPageLocators.watchNowButton);
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
      headline === content.title,
      'Headline of More Info tile should match with cmp data'
    );
    assert.ok(
      subHeading === content.subHeading,
      'Sub Heading of More Info  tile should match with cmp data'
    );
    assert.ok(
      await I.isElementVisible(watchPageLocators.moreInfoImage),
      'More Info Image should be visible on More Info Card'
    );
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
    let str = content.bodyText;

    assert.ok(
      bodyText == str.replace(/\s+/g, ' '),
      'Body Text of notification tile should match with cmp data'
    );
  },

  /**
   * checks weather advertise tag is available or not.
   * @returns {boolean} - returns true if advertise tag available on info card.
   */
  async isAdvertiseTagAvailable() {
    return await I.isElementVisible(watchPageLocators.advertiseTagOnInfoCard);
  },

  /**
   * validates if live tag is visible or not on hero carousel tile
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - returns true if live tag visible on hero carousel tile
   */
  async validateLiveWidgetTileInHeroCarousel(indexOfSwimlane, tileIndex) {
    let tile = watchPageLocators.swimlaneIndexWithWidgetIndex
      .replace(constants.swimlaneIndex, indexOfSwimlane + 1)
      .replace(constants.tileIndex, tileIndex);
    await I.waitForElement(tile, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.scrollIntoView(tile);
    let liveTagOnTile = await this.isLiveTagVisibleOnTile(
      tileIndex,
      indexOfSwimlane
    );
    return liveTagOnTile;
  },

  /**
   * validates if advertise tag is available on info card of hero carousel swimlane
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @returns {boolean} - returns true if advertise tag is available on info card
   */
  async validateStaticAdWidgetInHeroCarousel(indexOfSwimlane, tileIndex) {
    let tile = watchPageLocators.swimlaneIndexWithWidgetIndex
      .replace(constants.swimlaneIndex, indexOfSwimlane + 1)
      .replace(constants.tileIndex, tileIndex);
    await I.waitForElement(tile, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.scrollIntoView(tile);
    let moreInfoButton = watchPageLocators.moreInformationButtonInSpecificTile.replace(
      constants.tileNo,
      tile
    );
    await I.waitForVisible(
      moreInfoButton,
      testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR
    );
    await I.click(moreInfoButton);
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    let isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },

  /**
   * validates content of moreInfo info card in hero carousel swimlane.
   * @param {integer} tileIndex
   * @param {integer} indexOfSwimlane
   * @param {object} content
   */
  async validateMoreInfoWidgetInHeroCarousel(
    tileIndex,
    indexOfSwimlane,
    content
  ) {
    let tile = watchPageLocators.swimlaneIndexWithWidgetIndex
      .replace(constants.swimlaneIndex, indexOfSwimlane + 1)
      .replace(constants.tileIndex, tileIndex);
    await I.waitForElement(tile, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.scrollIntoView(tile);
    let moreInfoButton = watchPageLocators.moreInformationButtonInSpecificTile.replace(
      constants.tileNo,
      tile
    );
    await I.waitForVisible(
      moreInfoButton,
      testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR
    );
    await I.click(moreInfoButton);
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    await this.validateMoreInfoCard(content);
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
    console.log("widgetinfo", widgetInfo)
    if (widgetInfo.swimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(`widget swimlane with ${widgetType} should be available`);
    } else {
      return widgetInfo;
    }
  },

  /**
   * Validates advertise tag is visible in a infocard.
   * @returns {boolean} - returns true if advertise tag is visible else false
   */
  async validateStaticAdLargeWidgetTile() {
    let widgetInfo, isAdvertiseTagVisible;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.largeWidget,
      constants.widgetType.staticAd
    );
    console.log("widgetInfo", widgetInfo)
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },

  /**
   * navigates to specific tile and opens it.
   * @param {integer} swimlaneIndex
   * @param {integer} tileIndex
   */
  async navigateToSpecificTileInHome(swimlaneIndex, tileIndex) {
    let tile = watchPageLocators.swimlaneIndexWithWidgetIndex
      .replace(constants.swimlaneIndex, swimlaneIndex + 1)
      .replace(constants.tileIndex, tileIndex);
    await I.waitForElement(tile, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.scrollIntoView(tile);
    await I.wait(3);
    await I.click(tile);
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
  },

  /**
   * Validates advertise tag is visible in a infoCard.
   * @returns {boolean} - returns true if advertise tag is visible else false
   */
  async validateStaticAdSmallWidgetTile() {
    let widgetInfo, isAdvertiseTagVisible;
    widgetInfo = await this.getWidgetInfo(
      platformName.platform,
      constants.widgets.smallWidget,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInHome(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },

  /**
   * validates sports widget in small widget swimlane
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
    let swimlaneNames = await sports.getActiveLeagues();
    await I.wait(3);
    await sportsPage.verifySportsPageSwimLanes(swimlaneNames);
  },

  /**
   * validates notification infoCard in small widget swimlane
   */
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
    notificationInfo = await cmp.getNotificationWIdgetData(
      constants.widgets.smallWidget,
      constants.pages.watchPage
    );
    if (
      notificationInfo.headline === null ||
      notificationInfo.bodyText === null
    ) {
      assert.fail(
        'Notification data for Small widget swimlane should be available'
      );
    }
    await this.validateNotificationInfoCard(notificationInfo);
  },

  /**
   * validates notification infoCard in large widget swimlane
   */
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
    notificationInfo = await cmp.getNotificationWIdgetData(
      constants.widgets.largeWidget,
      constants.pages.watchPage
    );
    if (
      notificationInfo.headline === null ||
      notificationInfo.bodyText === null
    ) {
      assert.fail(
        'Notification data for Large widget swimlane should be available'
      );
    }
    await this.validateNotificationInfoCard(notificationInfo);
  },
};
