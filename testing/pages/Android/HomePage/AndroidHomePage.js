const assert = require('assert');
const {I, platformName, navBar, property} = inject();
const constants = require('../../../config/constants.js');
const homePageLocators = require('./HomePageLocators.json');
const CMP = require('../../../OnStreamBackend/cmp.js');
let cmp = new CMP();
let cmd = require('node-cmd');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits.js');
const {build} = inject();
const Sports = require('../../../OnStreamBackend/sports.js');
let sports = new Sports();
const logger = require('../../../utils/LogUtils.js').getLogger('HomePage');
module.exports = {
  constants,

  /**
   * Launches the application and checks for home page visibility
   */
  async waitForOnStreamHomePageLaunch() {
    property.propertyType == constants.propertyType.hospitality
      ? await this.setSmartBoxId(constants.devTools.smartboxID.hospitality)
      : await this.setSmartBoxId(constants.devTools.smartboxID.mdu);
    await I.waitForElement(
      homePageLocators.watchTile,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
  },

  /**
   * Verifies the title on home page
   */
  async verifyOnStreamHomePageTitle(expectedTitle) {
    let onstreamHomePageTitle = await I.grabTextFrom(
      homePageLocators.welcome_msg_home_screen
    );
    assert.strictEqual(
      onstreamHomePageTitle.toLowerCase(),
      expectedTitle.toLowerCase(),
      'OnStream HomePage title is not matching'
    );
  },
  /**
   * Resets application to home page
   */
  async resetToHome() {
    if (await I.isElementVisible(homePageLocators.watchTile)) {
      return;
    } else {
      await navBar.navigateTo(constants.navigationMenu.home);
    }

    // let iteration = 0;
    // while (await I.isElementVisible(navbarLocators.sideNavBar)) {
    //   await I.dpadBack();
    // }
  },

  /**
   * Sets the smartbosID on the application based on inherent build type environment
   */
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
      homePageLocators.watchTile,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
  },

  /**
   * Verify the tiles on home page
   */
  async verifyHomePageTiles(navigationTiles) {
    let isTileFound = false;
    let dpadCount = 0;
    let updateTiles = ['Netflix']; // Temporary - For handling mismatch till navigation tile display is finalized for home page
    let updatedNavigationTiles = navigationTiles.filter(
      (x) => updateTiles.indexOf(x) === -1
    );

    for (const tile of updatedNavigationTiles) {
      while (!isTileFound) {
        isTileFound = await I.isElementVisible(
          homePageLocators.homePageTileIcons.replace('tileIconName', tile)
        );
        if (!isTileFound) {
          await I.dpadRight();
          dpadCount++;
        }
        if (dpadCount > 10) break;
      }
      assert.ok(isTileFound, `${tile} tile is not found on home page`);
      isTileFound = false;
    }
  },

  async verifyHomePageDoesNotExitOnPressingBack() {
    await I.dpadBack();
    await I.wait(5);
    return await I.isVisible(homePageLocators.watchTile);
  },

  /**
   * verify the property logo
   */
  async isOnStreamPropertyLogoSeen() {
    return await I.isElementVisible(
      homePageLocators.propertyLogo,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * verify time and date is displayed on home page
   */
  async isTimeAndDateDisplayed() {
    return (
      (await I.isElementVisible(
        homePageLocators.time,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.date,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      ))
    );
  },

  /**
   * verify the welcome banner on home page
   */
  async isWelcomeBannerDisplayed() {
    return (
      (await I.isElementVisible(
        homePageLocators.welcomeMessageTitle,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.welcomeMessageDescription,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.welcomeMessageSubtitle,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      ))
    );
  },
  /**
   * verify the home page carousel
   */
  async isHomePageCarouselDisplayed() {
    return await I.isElementVisible(
      homePageLocators.homePageCarousel,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * verify the background image of home page
   */
  async isBackgroundImageDisplayed() {
    return await I.isElementVisible(
      homePageLocators.backgroundImage,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * To verify that widget rail is displayed to user in Home page
   */
  async isHomePageWidgetRailDisplayed() {
    return await I.isElementVisible(
      homePageLocators.homePageWidgetRail,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * To get the number of tiles visible on home page
   */
  async numberOfTilesVisibleOnHomePage() {
    return await I.grabNumberOfVisibleElements(homePageLocators.homePageTiles);
  },

  /**
   * To verify that property logo is configured via CMP
   */
  async isPropertyLogoConfiguredViaCmp() {
    let isPropertyLogoConfiguredOnCmp = await cmp.isPropertyLogoConfigured();
    let isPropertyLogoVisible = await this.isOnStreamPropertyLogoSeen();
    return isPropertyLogoConfiguredOnCmp && isPropertyLogoVisible;
  },

  /**
   * To verify that welcome banner is configured via CMP
   */
  async isWelcomeBannerConfiguredViaCmp() {
    let isWelcomeBannerConfiguredOnCmp = await cmp.isWelcomeBannerConfigured();
    let isWelcomeBannerVisible = await this.isWelcomeBannerDisplayed();
    return isWelcomeBannerConfiguredOnCmp && isWelcomeBannerVisible;
  },

  /**
   * To verify that text of the welcome banner is configured via CMP
   */
  async isWelcomeBannerTextConfiguredViaCmp() {
    let welcomeBannerText = null;
    let isWelcomeBannerTextMatchedWithCmp = false;
    welcomeBannerText = await cmp.getTextFromPageElements(
      constants.pages.homePage,
      constants.pageElements.homePage.welcomeBanner,
      constants.welcomeBanner.greeting,
      constants.welcomeBanner.message,
      constants.welcomeBanner.subHeadline
    );
    if (welcomeBannerText !== null) {
      if (await this.isWelcomeBannerDisplayed()) {
        let welcomeBannerGreetingText = (
          await I.grabTextFrom(homePageLocators.welcomeMessageTitle)
        ).trim();
        let welcomeBannerMessageText = (
          await I.grabTextFrom(homePageLocators.welcomeMessageDescription)
        ).trim();
        let welcomeBannerSubheadlineText = (
          await I.grabTextFrom(homePageLocators.welcomeMessageSubtitle)
        ).trim();
        isWelcomeBannerTextMatchedWithCmp =
          welcomeBannerGreetingText.trim() == welcomeBannerText[0].trim() &&
          welcomeBannerMessageText.trim() == welcomeBannerText[1].trim() &&
          welcomeBannerSubheadlineText.trim() == welcomeBannerText[2].trim();
        return [
          isWelcomeBannerTextMatchedWithCmp,
          'Welcome banner text mismatch against configured value in CMP',
        ];
      } else {
        return [false, 'Welcome banner is not displayed!!!'];
      }
    } else {
      logger.info('Welcome banner text not configured in CMP!!!');
      return true;
    }
  },

  /**
   * To verify that ad space carousel is configured via CMP
   */
  async isAdSpaceCarouselConfiguredViaCmp() {
    let adSapceWidgetcontents = null;
    let isAdSpaceCarouselConfigured = false;
    adSapceWidgetcontents = await cmp.getCarousels(
      constants.pages.homePage,
      constants.adSpaceCarousel
    );
    if (adSapceWidgetcontents !== null && adSapceWidgetcontents !== []) {
      if (await this.isHomePageCarouselDisplayed()) {
        isAdSpaceCarouselConfigured = true;
        return [
          isAdSpaceCarouselConfigured,
          'Welcome banner text mismatch against configured value in CMP',
        ];
      } else {
        return [false, 'Ad space carousel is not displayed!!!'];
      }
    } else {
      logger.info('Ad space carousel is not configured in CMP!!!');
      return true;
    }
  },

  async verifyHomePageDoesNotExitOnPressingBack() {
    await I.dpadBack();
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    return await I.isVisible(homePageLocators.watchTile);
  },

  /**
   * verify the property logo
   */
  async isOnStreamPropertyLogoSeen() {
    return await I.isElementVisible(
      homePageLocators.propertyLogo,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * verify time and date is displayed on home page
   */
  async isTimeAndDateDisplayed() {
    return (
      (await I.isElementVisible(
        homePageLocators.time,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.date,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      ))
    );
  },

  /**
   * verify the welcome banner on home page
   */
  async isWelcomeBannerDisplayed() {
    return (
      (await I.isElementVisible(
        homePageLocators.welcomeMessageTitle,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.welcomeMessageDescription,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.welcomeMessageSubtitle,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      ))
    );
  },
  /**
   * verify the home page carousel
   */
  async isHomePageCarouselDisplayed() {
    return await I.isElementVisible(
      homePageLocators.homePageCarousel,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * verify the background image of home page
   */
  async isBackgroundImageDisplayed() {
    return await I.isElementVisible(
      homePageLocators.backgroundImage,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * To verify that widget rail is displayed to user in Home page
   */
  async isHomePageWidgetRailDisplayed() {
    return await I.isElementVisible(
      homePageLocators.homePageWidgetRail,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * To get the number of tiles visible on home page
   */
  async numberOfTilesVisibleOnHomePage() {
    return await I.grabNumberOfVisibleElements(homePageLocators.homePageTiles);
  },
};
