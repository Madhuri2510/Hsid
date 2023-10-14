/* eslint-disable no-undef */
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const constants = require('../config/constants.js');
const logger = require('../utils/LogUtils').getLogger('SearchPage_test');
const assert = require('assert');
let beforeHook = () => {};
let afterHook = () => {};
let currentTitle = undefined;
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();
const Cosmos = require('../OnStreamBackend/cosmos');
let cosmos = new Cosmos();
let getRandomNumberInRange =
  require('../pages/CommonUtil/Util').getRandomNumberInRange;
const EPG = require('../OnStreamBackend/epg');
let epg = new EPG();
const CMP = require('../OnStreamBackend/cmp');
let cmp = new CMP();

Feature('OnStream Search page - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-Search start');
  let smartBoxId = await cmp.getSmartBoxId();
  if (
    platformName.platform !== constants.platform.firetv &&
    platformName.platform !== constants.platform.android &&
    platformName.platform !== constants.platform.evolve2
  ) {
    await homePage.setSmartBoxId(smartBoxId);
  }
  if (platformName.platform == constants.platform.firetv) {
    console.log('Search_page test');
  }
  logger.info('Before Suite-Search end');
});

Before(async (navBar, homePage) => {
  beforeHook = async () => {
    logger.info('[Before] start');
    let retry = 0;
    while (retry < 10) {
      let channelNum = getRandomNumberInRange(1, await epg.getTotalChannels());
      currentTitle = await cosmos.getCurrentProgramName(channelNum);
      retry++;
      if (currentTitle != undefined) {
        break;
      }
    }
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.search);
    logger.info('[Before] end');
  };
});

After(async (homePage, playerPage, platformName) => {
  afterHook = async () => {
    logger.info('[After] start');
    // await homePage.resetToHome();
    logger.info('[After] end');
  };
});

AfterSuite(async (platformName) => {
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.killLogProcess();
  }
});

Scenario(
  UtilsCodecept.appendDateTime('Verify Search and open a TV Guide show'),
  async (searchPage) => {
    await beforeHook();
    logger.info('[Verify Search and open a TV Guide show] start');
    await searchPage.search(currentTitle);
    assert.ok(
      await searchPage.openTvGuideResult(),
      'Player page is not opened from TV Guide Search Results'
    );
    logger.info('[Verify Search and open a TV Guide show] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('search')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('portrait')
  .tag('Verizon')
  .tag('mobile')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime('Verify clearing text'),
  async (searchPage) => {
    await beforeHook();
    logger.info('[Verify clearing text] start');
    await searchPage.search(currentTitle);
    assert.ok(
      await searchPage.clearSearch(currentTitle),
      'Unable to clear search keyword from search textbox.'
    );
    logger.info('[Verify clearing text] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('search')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('portrait')
  .tag('Verizon')
  .tag('mobile')
  .tag('Roku');

//RC-1553 :Unable to play live content from search results
Scenario(
  UtilsCodecept.appendDateTime('Verify the recent searches'),
  async (searchPage, navBar) => {
    await beforeHook();
    logger.info('[Verify the recent searches] start');
    await searchPage.search(currentTitle);
    await searchPage.openTvGuideResult();
    await searchPage.closeModal();
    assert.ok(
      await searchPage.isRecentSearchesVisible(),
      'Recent Searches should be visible'
    );
    assert.ok(
      await searchPage.verifyRecentSearch(currentTitle),
      `${currentTitle}, Title is not found in Recent Searches`
    );
    logger.info('[Verify the recent searches] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('search')
  .tag('browser')
  .tag('onstream')
  .tag('FireTv')
  .tag('evolve2')
  .tag('portrait')
  .tag('Verizon')
  .tag('mobile')
  .tag('Roku'); 

//RC-1553 :Unable to play live content from search results
Scenario(
  UtilsCodecept.appendDateTime(
    'Verify the clear recent searches functionality'
  ),
  async (searchPage, navBar) => {
    await beforeHook();
    logger.info('[Verify the clear recent searches functionality] start');
    await searchPage.search(currentTitle);
    await searchPage.openTvGuideResult();
    await searchPage.closeModal();
    await searchPage.clearSearch(currentTitle);
    assert.ok(
      await searchPage.verifyRecentSearch(currentTitle.trim()),
      `${currentTitle}, Title is not found in Recent Searches`
    );
    await searchPage.clearRecentSearches();
    assert.ok(
      !(await searchPage.isRecentSearchesVisible()),
      'Recent Searches should not visible'
    );
    logger.info('[Verify the clear recent searches functionality] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('search')
  .tag('browser')
  .tag('onstream')
  .tag('FireTv')
  .tag('evolve2')
  .tag('portrait')
  .tag('Verizon')
  .tag('mobile')
  .tag('Roku');

//Commented out Roku : On Demand is not supported for now
Scenario(
  UtilsCodecept.appendDateTime('Verify the content modal'),
  async (searchPage) => {
    await beforeHook();
    logger.info('[Verify the content modal] start');
    await searchPage.search(constants.titleDetails.title);
    await searchPage.openFromOnDemandResults();
    assert.ok(
      await searchPage.verifyContentDetails(constants.titleDetails),
      'OnDemand Content Details are not displayed correctly'
    );
    logger.info('[Verify the content modal] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('search')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('portrait')
  .tag('Verizon')
  //.tag('Roku')
  .tag('mobile');

//Commented out Roku : On Demand is not supported for now
Scenario(
  UtilsCodecept.appendDateTime('Verify the platform modal'),
  async (searchPage, onDemandPage, platformName) => {
    await beforeHook();
    logger.info('[Verify the platform modal] start');
    await searchPage.search(constants.titleDetails.title);
    await searchPage.openFromOnDemandResults();
    assert.ok(
      await onDemandPage.verifyPlatformOptions(),
      'Platform Options are nor correctly displayed for OnDemand Content'
    );
    if (platformName.platform === constants.platform) {
      await onDemandPage.closeDialogModel();
    }
    logger.info('[Verify the platform modal] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('search')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('portrait')
  .tag('Verizon')
  //.tag('Roku')
  .tag('mobile');

//Commented out Roku : On Demand is not supported for now
Scenario(
  UtilsCodecept.appendDateTime(
    'Search the Franchise Asset and verify Seasons and Episodes'
  ),
  async (searchPage, onDemandPage) => {
    await beforeHook();
    logger.info(
      '[Search the Franchise Asset and verify Seasons and Episodes] start'
    );
    await searchPage.search(constants.search.franchiseAssetChannelTitle);
    await searchPage.openFromOnDemandResults();
    assert.ok(
      await onDemandPage.isFranchiseContentVisible(),
      'Franchise Content Should be Visible'
    );
    assert.ok(
      await onDemandPage.isPlayButtonFocused(),
      'Play Button should be Visible'
    );
    assert.ok(
      await onDemandPage.selectSeasonsAndEpisodesButton(),
      'Seasons & Episodes button should be visible to select'
    );
    assert.ok(
      await onDemandPage.isFirstSeasonButtonFocused(),
      'First Seasons button should be focused'
    );
    assert.ok(
      await onDemandPage.verifySeasonsAndData(),
      'Tile and Data should be visible'
    );
    logger.info(
      '[Search the Franchise Asset and verify Seasons and Episodes] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('onstream')
  .tag('search')
  .tag('Verizon');
  //.tag('Roku')
  

Scenario(
  UtilsCodecept.appendDateTime('Verify Invalid search result'),
  async (searchPage) => {
    await beforeHook();
    logger.info('[Verify Invalid search result] start');
    await searchPage.search(constants.search.invalidSearchTitle);
    assert.ok(
      await searchPage.isNoResultSeen(),
      'No Result data should be visible'
    );
    logger.info('[Verify Invalid search result] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('Verizon')
  .tag('Roku')
  .tag('search');

//RC-1553 :Unable to play live content from search results
Scenario(
  UtilsCodecept.appendDateTime('Verify Search Live Channel'),
  async (searchPage, tvGuidePage, playerPage) => {
    await beforeHook();
    logger.info('[Verify Search Live Channel] start');
    await searchPage.search(constants.search.channelName);
    await searchPage.verifyContentDisplayed();
    assert.ok(await playerPage.verifyVideoStarted(), 'Unable to Search and play Live Channel');
    logger.info('[Verify Search Live Channel] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Verizon')
  .tag('Roku')
  .tag('search');
