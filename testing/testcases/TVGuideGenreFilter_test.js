/* eslint-disable no-undef */
const assert = require('assert');
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const CMP = require('../OnStreamBackend/cmp.js');
let cmp = new CMP();
let beforeHook = () => {};
const logger = require('../utils/LogUtils').getLogger('GenresFilter_test');
let afterHook = () => {};
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();

Feature('OnStream TV Guide Genre Filter - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-Genre Filters start');
  let smartBoxId = await cmp.getSmartBoxId();
  if (
    platformName.platform !== constants.platform.firetv &&
    platformName.platform !== constants.platform.android &&
    platformName.platform !== constants.platform.evolve2
  ) {
    await homePage.setSmartBoxId(smartBoxId);
  }
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.captureLog('GenreFilter_Test');
  }
  logger.info('Before Suite-Genre Filters end');
});

Before(async (homePage, navBar) => {
  beforeHook = async () => {
    logger.info('[beforeHook] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.tvGuide);
    logger.info('[beforeHook] end');
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
  console.log('After Suite-Home start');
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.killLogProcess();
  }
});

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify that genre Filters are displayed when user navigates to TV guide page'
  ),
  async (tvGuidePage, genreFilterPage, platformName) => {
    await beforeHook();
    logger.info(
      '[Verify that genre Filters are displayed when user navigates to TV guide page] start'
    );
    if (
      platformName.platform !== constants.platform.firetv &&
      platformName.platform !== constants.platform.evolve2
    ) {
      await tvGuidePage.verifyTvGuideIsHighlighted();
    }
    assert.ok(
      await genreFilterPage.areAllGenreFiltersVisibleInTvGuide(),
      'All Genre Filter should be visible'
    );
    logger.info(
      '[Verify that genre Filters are displayed when user navigates to TV guide page] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku')
  .tag('TVGuideGenreFilter');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify Guide data is loaded after navigating to guide filters'
  ),
  async (genreFilterPage) => {
    await beforeHook();
    logger.info(
      '[Verify Guide data is loaded after navigating to guide filters] start'
    );
    assert.ok(
      await genreFilterPage.isGenreDataLoaded(),
      'TV Guide data should be loaded'
    );
    logger.info(
      '[Verify Guide data is loaded after navigating to guide filters] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku')
  .tag('TVGuideGenreFilter');

/**
 * Below Test case is commented for Fire Tv where focus is going to main menu instead of genre filters
 */
Scenario(
  UtilsCodecept.appendDateTime(
    'verify that genre filter is focused when user presses back button from guide content'
  ),
  async (genreFilterPage) => {
    await beforeHook();
    logger.info(
      '[verify that genre filter is focused when user presses back button from guide content] start'
    );
    assert.ok(
      await genreFilterPage.isGenreFilterFocusedAfterPressBack(),
      'GenreFilter should be focused ,when back button is pressed from guide content'
    );
    logger.info(
      '[verify that genre filter is focused when user presses back button from guide content] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku')
  .tag('TVGuideGenreFilter');

Scenario(
  UtilsCodecept.appendDateTime('verify if genre filters are in order'),
  async (genreFilterPage) => {
    await beforeHook();
    logger.info('[verify if genre filters are in order] start');
    assert.ok(
      await genreFilterPage.areAllGenreFiltersVisibleInTvGuide(),
      'All Genre Filters should be visible'
    );
    assert.ok(
      await genreFilterPage.isGenreFilterInOrder(),
      'All Genre Filters should be in order'
    );
    logger.info('[verify if genre filters are in order] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku')
  .tag('TVGuideGenreFilter');

Scenario(
  UtilsCodecept.appendDateTime(
    'Compare how many channels are listed under genre filters with backend data' // 'sports', 'movies', 'news', 'kids'
  ),
  async (genreFilterPage) => {
    await beforeHook();
    logger.info(
      '[Compare how many channels are listed under genre filters with backend data] start'
    );
    assert.ok(
      await genreFilterPage.isChannelCountMatchedInGenreFilters(),
      'Channel count should be match'
    );
    logger.info(
      '[Compare how many channels are listed under genre filters with backend data] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku')
  .tag('TVGuideGenreFilter');
