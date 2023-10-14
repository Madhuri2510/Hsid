/* eslint-disable no-undef */
const expVal = require('../config/expectedValues.js');
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept.js');
const assert = require('assert');
const CMP = require('../OnStreamBackend/cmp.js');
let cmp = new CMP();
const EPG = require('../OnStreamBackend/epg.js');
let epg = new EPG();
const Sports = require('../OnStreamBackend/sports.js');
let sports = new Sports();
let beforeHook = () => {};
const logger = require('../utils/LogUtils.js').getLogger('HomePage_test');
let afterHook = () => {};
const Cosmos = require('../OnStreamBackend/cosmos.js');
let cosmos = new Cosmos();
const LogCat = require('../pages/CommonUtil/LogCat.js');
let logcat = new LogCat();
let genres = require('../OnStreamBackend/genres.js');
let cmpBackend = require('../OnStreamBackend/cmpBackend.js');
const {I} = inject();

Feature('OnStream Home Page - Verification').retry(0);

BeforeSuite(async (watchPage, platformName) => {
  console.log('Before Suite - Home Page start');
  let smartBoxId = await cmp.getSmartBoxId();
  if (
    platformName.platform !== constants.platform.firetv &&
    platformName.platform !== constants.platform.android &&
    platformName.platform !== constants.platform.evolve2
  ) {
    await watchPage.setSmartBoxId(smartBoxId);
  }
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.captureLog('HomePage_Test');
  }
  console.log('Before Suite - Home Page end');
});

Before(async (homePage) => {
  beforeHook = async () => {
    logger.info('[beforeHook] start');
    await homePage.waitForOnStreamHomePageLaunch();
    logger.info('[beforeHook] end');
  };
});

After(async (platformName, homePage) => {
  afterHook = async () => {
    logger.info('[afterHook] start');
    if (
      platformName.platform == constants.platform.firetv ||
      platformName.platform == constants.platform.evolve2
    ) {
      // await homePage.resetToHome();
    }
    logger.info('[afterHook] end');
  };
});
AfterSuite(async (platformName) => {
  console.log('After Suite - Home Page start');
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.killLogProcess();
  }
  console.log('After Suite - Home Page end');
});

//Currently fails due to absence of locator for Netflix - Bug raised to add locator : FC-1115
Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - Verify OnStream Home Page tiles'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info('[Verify OnStream Home Page tiles] start');
    let navigationTileNames = await cmp.getHomePageTileNames();
    // if ((await cmpBackend.getCastingDetails())[2].value == false) {
    //   const castIndex = navigationTileNames.indexOf(
    //     constants.navigationMenu.cast
    //   );
    //   if (castIndex > -1) {
    //     navigationTileNames.splice(castIndex, 1);
    //   }
    // }
    await homePage.verifyHomePageTiles(navigationTileNames);
    logger.info('[Verify OnStream Home Page tiles] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - Verify that user is not able to exit the app from Home Page'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info(
      '[Verify that user is not able to exit the app from Home Page] start'
    );
    assert.ok(
      await homePage.verifyHomePageDoesNotExitOnPressingBack(),
      'OnStream Home page should not exit on pressing back button'
    );
    logger.info(
      '[Verify that user is not able to exit the app from Home Page] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');

//Currently fails due to absence of locator for Netflix - Bug raised to add locator : FC-1115
Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - Verify that Home page information is properly displayed'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info(
      '[Verify that Home page information is properly displayed] start'
    );
    assert.ok(
      await homePage.isOnStreamPropertyLogoSeen(),
      'OnStream  property logo is not displayed'
    );
    assert.ok(
      await homePage.isTimeAndDateDisplayed(),
      'Time and date is not displayed on home page'
    );
    assert.ok(
      await homePage.isWelcomeBannerDisplayed(),
      'Welcome banner is not displayed on home page'
    );
    assert.ok(
      await homePage.isHomePageCarouselDisplayed(),
      'Carousel is not displayed on home page'
    );
    assert.ok(
      await homePage.isBackgroundImageDisplayed(),
      'Background image is not displayed on home page'
    );
    let navigationTileNames = await cmp.getHomePageTileNames();
    // if ((await cmpBackend.getCastingDetails())[2].value == false) {
    //   const castIndex = navigationTileNames.indexOf(
    //     constants.navigationMenu.cast
    //   );
    //   if (castIndex > -1) {
    //     navigationTileNames.splice(castIndex, 1);
    //   }
    // }
    await homePage.verifyHomePageTiles(navigationTileNames);
    logger.info(
      '[Verify that Home page information is properly displayed] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - To verfiy that Time/Day/Date is displayed in Home page'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info(
      '[To verfiy that Time/Day/Date is displayed in Home page] start'
    );
    assert.ok(
      await homePage.isTimeAndDateDisplayed(),
      'Time/Day/Date is not displayed in Home page'
    );
    logger.info('[To verfiy that Time/Day/Date is displayed in Home page] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - To verify that welcome banner is displayed in Home page'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info(
      '[To verify that welcome banner is displayed in Home page] start'
    );
    assert.ok(
      await homePage.isWelcomeBannerDisplayed(),
      'Welcome banner is not displayed in Home page'
    );
    logger.info(
      '[To verify that welcome banner is displayed in Home page] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - To verify that Carousel is displayed in Home page'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info('[To verify that Carousel is displayed in Home page] start');
    assert.ok(
      await homePage.isHomePageCarouselDisplayed(),
      'Carousel is not displayed in Home page'
    );
    logger.info('[To verify that Carousel is displayed in Home page] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - To verify that widget rail is displayed to user in Home page'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info(
      '[To verify that widget rail is displayed to user in Home page] start'
    );
    assert.ok(
      await homePage.isHomePageWidgetRailDisplayed(),
      'Widget rail is not displayed in Home page'
    );
    logger.info(
      '[To verify that widget rail is displayed to user in Home page] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - To verify that user is able to view only five tiles at any point of time in Home page'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info(
      '[Verify that user is able to view only five tiles at any point of time in Home page] start'
    );
    assert.equal(
      await homePage.numberOfTilesVisibleOnHomePage(),
      5,
      'More than 5 tiles are visible on home page'
    );
    logger.info(
      '[Verify that user is able to view only five tiles at any point of time in Home page] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'OnStream UI 3.0 - To verify that Background image is displayed to the user in Home page'
  ),
  async (homePage) => {
    await beforeHook();
    logger.info(
      '[To verify that Background image is displayed to the user in Home page] start'
    );
    assert.ok(
      await homePage.isBackgroundImageDisplayed(),
      'Background image is not displayed in Home page'
    );
    logger.info(
      '[To verify that Background image is displayed to the user in Home page] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HomePage')
  .tag('FireTv')
  .tag('evolve2');
