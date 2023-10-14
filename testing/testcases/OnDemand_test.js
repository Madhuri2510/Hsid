/* eslint-disable no-undef */
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const logger = require('../utils/LogUtils').getLogger('OnDemand_test');
const constants = require('../config/constants');
let beforeHook = () => {};
let afterHook = () => {};
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();
let property = inject();
const assert = require('assert');
const CMP = require('../OnStreamBackend/cmp');
let cmp = new CMP();

Feature('OnStream On Demand page - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-On Demand start');
  let smartboxId = await cmp.getSmartBoxId();
  if (
    platformName.platform !== constants.platform.firetv &&
    platformName.platform !== constants.platform.evolve2
  ) {
    await homePage.setSmartBoxId(smartboxId);
  }
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.captureLog('OnDemand_Test');
  }
  logger.info('Before Suite-On Demand end');
});

Before(async (navBar, homePage) => {
  beforeHook = async () => {
    logger.info('[Before] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.onDemand);
    logger.info('[Before] end');
  };
});

After(async (homePage) => {
  afterHook = async () => {
    logger.info('[After] start');
    // await homePage.resetToHome();
    logger.info('[After] end');
  };
});

AfterSuite(async (platformName) => {
  if (platformName.platform == constants.platform.firetv) {
    await logcat.killLogProcess();
  }
});

Scenario(
  UtilsCodecept.appendDateTime('Verify On Demand page with 3 swimlanes'),
  async (onDemandPage) => {
    await beforeHook();
    assert.ok(
      await onDemandPage.areSwimlanesVisible(),
      'On Demand Swimlanes are not visible'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime('Verify Trending content tiles'),
  async (onDemandPage) => {
    await beforeHook();
    assert.ok(
      await onDemandPage.isTrendingContentTilesVisible(),
      'Trending Content Tiles are not visible'
    );
    await onDemandPage.validateNavigation();
    await afterHook();
  }
)
  .tag('p1')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime('Verify Trending Contents see all titles'),
  async (onDemandPage) => {
    await beforeHook();
    await onDemandPage.navigateToSeeAll(
      constants.onDemandSwimlane.trendingContents
    );
    assert.ok(
      await onDemandPage.validateAllTitles(
        constants.onDemandSwimlane.trendingContents
      ),
      'All Tiles are not available'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime('Verify Popular Show tiles'),
  async (onDemandPage) => {
    await beforeHook();
    assert.ok(
      await onDemandPage.isPopularShowTilesVisible(),
      'Popular Shows Tiles are not visible'
    );
    await onDemandPage.validateNavigation();
    await afterHook();
  }
)
  .tag('p1')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime('Verify Popular Shows see all tiles'),
  async (onDemandPage) => {
    await beforeHook();
    await onDemandPage.navigateToSeeAll(
      constants.onDemandSwimlane.popularShows
    );
    assert.ok(
      await onDemandPage.validateAllTitles(
        constants.onDemandSwimlane.popularShows
      ),
      'All Tiles are not available'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime('Verify Popular Movie titles'),
  async (onDemandPage) => {
    await beforeHook();
    assert.ok(
      await onDemandPage.isPopularMoviesTilesVisible(),
      'Popular Movies Tiles are not visible'
    );
    await onDemandPage.validateNavigation();
    await afterHook();
  }
)
  .tag('p1')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime('Verify Popular Movies see all titles'),
  async (onDemandPage) => {
    await beforeHook();
    await onDemandPage.navigateToSeeAll(
      constants.onDemandSwimlane.popularMovies
    );
    assert.ok(
      await onDemandPage.validateAllTitles(
        constants.onDemandSwimlane.popularMovies
      ),
      'All Tiles are not available'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime('Verify the content modal'),
  async (onDemandPage) => {
    await beforeHook();
    await onDemandPage.clickRandomTitle();
    assert.ok(
      await onDemandPage.verifyContent(),
      'Content Description not displayed'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime('Verify the platform modal'),
  async (onDemandPage, platformName) => {
    await beforeHook();
    await onDemandPage.clickRandomTitle();
    await onDemandPage.verifyPlatformOptions();
    if (
      platformName.platform === constants.platform.browser ||
      platformName.platform === constants.platform.android
    ) {
      await onDemandPage.closeDialogModel();
    }
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('landscape')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('cmpCutover')
  .tag('onstream');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify the third party playing option on-demand'
  ),
  async (onDemandPage, platformName) => {
    await beforeHook();
    await onDemandPage.clickRandomTitle();
    await onDemandPage.verifyPlatformOptions();
    await onDemandPage.verifyOptionLink();
    if (
      platformName.platform === constants.platform.browser ||
      platformName.platform === constants.platform.android
    ) {
      await onDemandPage.closeDialogModel();
    }
    await afterHook();
  }
)
  .tag('p1')
  .tag('onDemand')
  .tag('browser')
  .tag('mobile')
  .tag('portrait')
  .tag('onstream')
  .tag('landscape');
