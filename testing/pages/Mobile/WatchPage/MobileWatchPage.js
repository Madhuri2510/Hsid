const assert = require('assert');
const {I, constants} = inject();
const homePageLocators = require('./WatchPageLocators.json');
const playerPageLocators = require('../PlayerPage/PlayerPageLocators.json');
const settingsPageLocators = require('../SettingsPage/SettingsPageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const baseOnStreamHomePage = require('../../Browser/WatchPage/BrowserWatchPage');

module.exports = Object.assign(baseOnStreamHomePage, {
  /**
   * navigates to setting tab
   */
  async goToSettingsTab() {
    let orientation = await I.getOrientation();
    if (orientation === constants.orientation.portrait) {
      await I.waitForVisible(
        homePageLocators.moreIcon,
        testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
      );
      await I.click(homePageLocators.moreIcon);
      await I.wait(2);
      await I.waitForVisible(
        homePageLocators.settingsTabPotrait,
        testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
      );
      await I.click(homePageLocators.settingsTabPotrait);
      await I.waitForElement(
        settingsPageLocators.appSettings,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      );
    } else {
      if (await I.isElementVisible(homePageLocators.settings)) {
        await I.click(homePageLocators.settings);
        await I.waitForElement(
          settingsPageLocators.appSettings,
          testExecutionWaits.WAIT_FOR_TAB_LOAD
        );
      } else {
        await I.reportLog('Settings tab should be visible');
      }
    }
  },

  async goToSearchTab() {
    let orientation = await I.getOrientation();
    if (orientation === constants.orientation.portrait) {
      if (await I.isElementVisible(homePageLocators.searchLocatorPortrait)) {
        await I.click(homePageLocators.searchLocatorPortrait);
      } else {
        await I.waitForVisible(
          homePageLocators.moreIcon,
          testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
        );
        await I.click(homePageLocators.moreIcon);
        // await I.wait(2)
        await I.waitForVisible(
          homePageLocators.searchLocatorPortrait,
          testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
        );
        await I.click(homePageLocators.searchLocatorPortrait);
      }
    } else {
      await I.forceClick(homePageLocators.searchHeader);
      await I.wait(3);
    }
  },

  async goToHomeTab() {
    let orientation = await I.getOrientation();
    if (orientation === constants.orientation.portrait) {
      await I.forceClick(homePageLocators.homePotrait);
      await I.wait(3);
      await I.waitForVisible(homePageLocators.swimlaneWidgetsInPotrait, 10);
    } else {
      await I.forceClick(homePageLocators.home);
      await I.wait(3);
      await I.waitForVisible(homePageLocators.swimlaneWidgets, 10);
    }
  },

  async goToOnDemandTab() {
    await I.forceClick(homePageLocators.onDemandHeader);
    await I.wait(10);
  },

  /**
   * This method waits for the onStream application to get launched
   */
  async waitForOnStreamHomePageLaunch() {
    console.log(await I.getOrientation());
    await this.setSmartBoxId(constants.devTools.smartboxID);
    await I.amOnPage('/');
    await I.waitForElement(
      homePageLocators.home,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
  },

  /**
   * This method launch the onStream application
   * @returns {boolean} true if launched else false
   */
  async launchApplication() {
    await I.amOnPage('/');
    return true;
  },

  /**
   * This method wait for the home page to load
   * @returns {boolean} true if the home page get loaded else false
   */
  async isHomePageLoaded() {
    await I.waitForElement(
      homePageLocators.home,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
    return true;
  },

  /**
   * This method verify the OnStream property logo
   * @returns {boolean} true if visible else false
   */
  async isOnStreamPropertyLogoSeen() {
    return await I.isElementVisible(homePageLocators.businessLogo);
  },

  /**
   * This method verify the home page tabs
   */
  async verifyHomePageTabs(expectedTabs) {
    assert.ok(this.isHomeTabSeen(), 'Home tab should be visible');
    assert.ok(this.isTVGuideTabSeen(), 'TV Guide tab should be visible');
    assert.ok(this.isSettingsTabSeen(), 'Settings tab should be visible');
  },
  /**
   * Verifies if home tab is visible
   * @returns {boolean} true if visible else false
   */
  async isHomeTabSeen() {
    return await I.isElementVisible(homePageLocators.home);
  },

  /**
   * Verifies if TV Guide tab is visible
   * @returns {boolean} true if visible else false
   */
  async isTVGuideTabSeen() {
    return await I.isElementVisible(homePageLocators.tvGuide);
  },

  /**
   * Verifies if Settings tab is visible
   * @returns {boolean} true if visible else false
   */
  async isSettingsTabSeen() {
    return await I.isElementVisible(homePageLocators.settings);
  },

  /**
   * Verifies if Learn More button is visible
   * @returns {boolean} true if visible else false
   */
  async isLearnMoreButtonVisible() {
    return await I.isElementVisible(homePageLocators.learnMore);
  },

  /**
   * verifies carousel count in home tab
   * @param {integer} expectedTotalCarousels
   */
  async verifyHomePageCarouselCount(expectedTotalCarousels) {
    await I.wait(testExecutionWaits.WAIT_FOR_CAROUSELS_TO_LOAD);
    const totalCarousel = await I.grabNumberOfVisibleElements(
      homePageLocators.totalCarousels
    );
    assert.strictEqual(
      totalCarousel,
      expectedTotalCarousels,
      `Failed, the total number of Carousels on HomePage is ${totalCarousel}`
    );
  },

  /**
   * verifies title in home tab
   * @param {string} expectedTitle
   */
  async verifyOnStreamHomePageTitle(expectedTitle) {
    let onStreamHomePageTitle = await I.grabTextFrom(
      homePageLocators.welcomeMsgHomeScreen
    );
    assert.strictEqual(
      onStreamHomePageTitle.toLowerCase(),
      expectedTitle.toLowerCase(),
      'OnStream HomePage title is not matching'
    );
  },

  /**
   * checks whether first tile in Featured Channels ribbon is visible or not.
   * @returns {boolean} - returns true if first tile in Featured Channels ribbon visible
   */
  async isFirstTileOfFeaturedChannelsRibbon() {
    return await I.isElementVisible(
      homePageLocators.firstTileOfFeaturedChannelsRibbon
    );
  },

  /**
   * clicks on first tile in Featured Channels ribbon
   */
  async clickOnFirstTileOfFeaturedChannelsRibbon() {
    await I.click(homePageLocators.firstTileOfFeaturedChannelsRibbon);
  },

  /**
   * checks whether details are visible in info card or not. Eg: program image, program title, description etc.
   * @returns {boolean} - returns true if details are visible in info card of an asset
   */
  async isMetaDataDisplayedCorrectlyOnInfoCard() {
    let metaDataDisplayedCorrectly = true;
    await I.waitForVisible(
      homePageLocators.programTitleOfInfoCard,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
    if (!(await I.isElementVisible(homePageLocators.programImageOfInfoCard))) {
      metaDataDisplayedCorrectly = false;
      await I.reportLog('Program Image should be displayed on Info Card');
      return metaDataDisplayedCorrectly;
    }
    if (!(await I.isElementVisible(homePageLocators.programTitleOfInfoCard))) {
      metaDataDisplayedCorrectly = false;
      await I.reportLog('Program title should be displayed on Info Card');
      return metaDataDisplayedCorrectly;
    }
    if (
      !(await I.isElementVisible(homePageLocators.programDescriptionOfInfoCard))
    ) {
      metaDataDisplayedCorrectly = false;
      await I.reportLog('Program description should be displayed on Info Card');
      return metaDataDisplayedCorrectly;
    }
    if (
      !(
        (await this.isWatchNowButtonVisible()) &&
        (await this.isPlayIconSeenInWatchNowButton())
      )
    ) {
      metaDataDisplayedCorrectly = false;
      await I.reportLog('WATCH NOW button should be displayed on Info Card');
      return metaDataDisplayedCorrectly;
    }
    if (!(await this.isCloseButtonVisible())) {
      metaDataDisplayedCorrectly = false;
      await I.reportLog('Close button should be displayed on Info Card');
      return metaDataDisplayedCorrectly;
    }
    if (!(await I.isElementVisible(homePageLocators.programTimeOfInfoCard))) {
      metaDataDisplayedCorrectly = false;
      await I.reportLog('Program time should be displayed on Info Card');
      return metaDataDisplayedCorrectly;
    }
    return metaDataDisplayedCorrectly;
  },

  /**
   * checks whether WATCH NOW button is visible or not in Info Card
   * @returns {boolean} - returns true if WATCH NOW button is visible
   */
  async isWatchNowButtonVisible() {
    let watchNowButtonVisible = false;
    if (await I.isElementVisible(homePageLocators.watchNowButton)) {
      let watchNowButtonText = await I.grabTextFrom(
        homePageLocators.watchNowButton
      );
      if (watchNowButtonText === constants.buttonText.watchNow) {
        watchNowButtonVisible = true;
      }
    }
    return watchNowButtonVisible;
  },

  /**
   * checks whether play Icon in Watch Now button is visible or not.
   * @returns {boolean} - returns true if play Icon in watch now button is visible
   */
  async isPlayIconSeenInWatchNowButton() {
    return await I.isElementVisible(homePageLocators.playIconInWatchNowButton);
  },

  /**
   * checks whether Close button is visible or not in Info Card
   * @returns {boolean} - returns true if close button is visible
   */
  async isCloseButtonVisible() {
    return await I.isElementVisible(homePageLocators.closeButton);
  },

  /**
   * navigates to guide tab
   */
  async goToTVGuideTab() {
    let orientation = await I.getOrientation();
    if (orientation === constants.orientation.portrait) {
      if (await I.isElementVisible(homePageLocators.tvGuidePortrait)) {
        await I.click(homePageLocators.tvGuidePortrait);
        await I.reportLog('Clicked on tv guide tab');
      } else {
        await I.reportLog('Guide tab should be visible');
      }
    } else {
      if (await I.isElementVisible(homePageLocators.tvGuide)) {
        await I.click(homePageLocators.tvGuide);
        await I.reportLog('Clicked on tv guide tab');
      } else {
        await I.reportLog('Guide tab should be visible');
      }
    }
  },

  /**
   * verifies if the featured channel ribbon is visible
   * @returns {boolean} true if visible else false
   */
  async isFeaturedChannelRibbonSeen() {
    return await I.isElementVisible(homePageLocators.featuredChannel);
  },

  /**
   * verifies if the sports channel ribbon is visible
   * @returns {boolean} true if visible else false
   */
  async isSportsChannelRibbonSeen() {
    return await I.isElementVisible(homePageLocators.sportsChannel);
  },

  /**
   * verifies the home page swim lanes
   */
  async verifyHomePageSwimlanes() {
    assert.ok(
      this.isFeaturedChannelRibbonSeen(),
      'featured channel ribbon should be seen'
    );
    assert.ok(
      this.isSportsChannelRibbonSeen(),
      'sports channel ribbon should be seen'
    );
  },

  /**
   * clicks on playIcon of specific swimlane's specific tile
   * @param {string} swimlaneName
   * @param {integer} swimlaneIndex
   * @param {integer} tileNo
   */
  async clickOnPlayIconfromSwimLaneTile(swimlaneName, swimlaneIndex, tileNo) {
    const orientation = await I.getOrientation();
    const isPortrait = orientation === constants.orientation.portrait;
    const tileLocatorID = (isPortrait
      ? homePageLocators.swimlaneTilePlayIconInPortraitMode
      : homePageLocators.swimlaneTilePlayIcon
    )
      .replace(constants.swimlaneName, swimlaneName)
      .replace(constants.swimlaneIndex, swimlaneIndex + 1);
    await I.waitForElement(
      tileLocatorID,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.scrollToElement(tileLocatorID);
    await I.waitForVisible(
      tileLocatorID,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.forceClick(tileLocatorID);
    try {
      await I.waitForElement(homePageLocators.playIcon, 30);
    } catch (err) {
      console.log(err);
      await I.reportLog(err);
    }
    if (await I.isElementVisible(homePageLocators.playIcon)) {
      await I.click(homePageLocators.playIcon);
      await I.wait(3);
    }
  },

  async playAssetOnSwimlane(tile) {
    const {laneNum, ContNum} = tile;
    await I.wait(testExecutionWaits.WAIT_FOR_CAROUSELS_TO_LOAD);
    if (laneNum >= (await this.getSwimlanesCount())) {
      throw new Error('lane index passed does not exist - verify manually');
    }
    if (ContNum >= (await this.getSwimlaneContainerCount(laneNum))) {
      throw new Error(
        'container index passed does not exist - verify manually'
      );
    }
    await this.clickOnSwimlaneContainer({
      swimlaneIndex: laneNum + 1,
      tileIndex: ContNum + 2,
    });
    if (!(await I.isElementVisible(homePageLocators.watchNowButton))) {
      throw new Error('Not a playable asset - please verify manually');
    }
    await this.clickOnWatchNowButton();
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    assert.ok(
      await this.isNavigatedToPlayerScreen(),
      'Failed to redirect to the player'
    );
    I.reportLog('Redirected to the player');
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
      homePageLocators.swimlane_tile
        .replace('swimLaneIndex', swimlaneIndex)
        .replace('TileIndex', tileIndex)
    );
    await I.wait(5);
    await I.click(
      homePageLocators.swimlane_tile
        .replace('swimLaneIndex', swimlaneIndex)
        .replace('TileIndex', tileIndex)
    ); // TO-DO : force click did not work -> check in safari
    await I.wait(5);
  },

  async clickOnWatchNowButton() {
    await I.waitForElement(homePageLocators.watchNowButton, 5);
    await I.click(homePageLocators.watchNowButton);
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    if (await I.isElementVisible(playerPageLocators.unratedContentPopup))
      return;
    else await I.waitForElement(playerPageLocators.playerCaptionButton, 50);
  },

  async setSmartBoxId(smartBoxId) {
    await I.amOnPage('/devTools');
    await I.waitForVisible(homePageLocators.passwordDevTools, 15);
    await I.fillField(
      homePageLocators.passwordDevTools,
      constants.devTools.password
    );
    await I.waitForVisible(homePageLocators.updateDevTools, 15);
    await I.click(homePageLocators.smartboxIdPlaceHolder);
    await I.fillField(homePageLocators.smartboxIdPlaceHolder, smartBoxId);
    await I.wait(1);
    await I.click(homePageLocators.updateDevTools);
    await I.waitForVisible(
      homePageLocators.home,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
    await I.click(homePageLocators.home);
  },
});
