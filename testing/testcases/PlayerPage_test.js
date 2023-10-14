/* eslint-disable no-undef */
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const assert = require('assert');
const testExecutionWaits = require('../config/onStreamTestExecutionWaits');
const logger = require('../utils/LogUtils').getLogger('PlayerPage_test');
let beforeHook = () => {};
let afterHook = () => {};
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();
let getRandomNumberInRange =
  require('../pages/CommonUtil/Util').getRandomNumberInRange;
const EPG = require('../OnStreamBackend/epg');
let epg = new EPG();
const Cosmos = require('../OnStreamBackend/cosmos');
let cosmos = new Cosmos();
const CMP = require('../OnStreamBackend/cmp');
let cmp = new CMP();

Feature('OnStream Player Screen - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-Player Screen start');
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
    await logcat.captureLog('PlayerPage_Test');
  }
  logger.info('Before Suite-Player Page end');
});

Before(async (navBar, homePage) => {
  beforeHook = async () => {
    logger.info('[Before] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.tvGuide);
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
  UtilsCodecept.appendDateTime(
    'ZephyrID:007001 - Verify OnStream Player Page UI'
  ),
  async (navBar, watchPage, playerPage, platformName) => {
    await beforeHook();
    logger.info('[Verify OnStream Player Page UI] start');
    await navBar.navigateTo(constants.navigationMenu.watch);
    await watchPage.playAssetOnSwimlane();
    if (
      platformName.platform !== constants.platform.firetv &&
      platformName.platform !== constants.platform.android &&
      platformName.platform !== constants.platform.evolve2
    ) {
      await playerPage.verifyPlayerPageOptions();
    }
    await playerPage.verifyVideoPlayerPage();
    assert.ok(
      await playerPage.verifyPlayerTimerRunning(),
      'Video player to play a video is not visible'
    );
    logger.info('[Verify OnStream Player Page UI] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('player')
  .tag('browser')
  .tag('mobile')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'ZephyrID:007002 - VerifyOnStream Player Page Video Time Running'
  ),
  async (navBar, watchPage, playerPage, platformName) => {
    await beforeHook();
    logger.info('[Verify OnStream Player Page Video Time Running] start');
    await navBar.navigateTo(constants.navigationMenu.watch);
    await watchPage.playAssetOnSwimlane();
    await playerPage.verifyVideoStarted();
    assert.ok(
      await playerPage.verifyPlayerTimerRunning(),
      'Video player to play a video is not visible'
    );
    if (platformName.platform === constants.platform.browser) {
      await playerPage.closePlayerBtn();
    }
    logger.info('[Verify OnStream Player Page Video Time Running] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('player')
  .tag('browser')
  .tag('mobile')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Live and Channel logo in video player'
  ),
  async (navBar, watchPage, playerPage) => {
    await beforeHook();
    await navBar.navigateTo(constants.navigationMenu.watch);
    await watchPage.playAssetOnSwimlane();
    assert.ok(
      await playerPage.isLiveAndChannelLogoVisible(),
      'Live and Channel logo should be visible in video player'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('player')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream play button launches the video'
  ),
  async (tvGuidePage, playerPage, platformName, navBar) => {
    await beforeHook();
    logger.info('[Verify OnStream play button launches the video] start');
    await navBar.navigateTo(constants.navigationMenu.tvGuide);
    await tvGuidePage.clickPlayButton();
    await playerPage.verifyVideoPlayerPage();
    assert.ok(
      await playerPage.verifyPlayerTimerRunning(),
      'Video player to play a video is not visible'
    );
    if (platformName.platform === constants.platform.browser) {
      await playerPage.closePlayerBtn();
    }
    logger.info('[Verify OnStream play button launches the video] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('player')
  .tag('TVGuide')
  .tag('mobile')
  .tag('onstream')
  .tag('portrait')
  .tag('Roku');

// Commented below TC for FireTv and Roku as Info Card is not present.
Scenario(
  UtilsCodecept.appendDateTime('Verify OnStream Watch Now on info card'),
  async (watchPage, settingsPage, tvGuidePage, playerPage, platformName) => {
    await beforeHook();
    logger.info('[Verify OnStream Watch Now on info card] start');
    await watchPage.goToSettingsTab();
    await settingsPage.switchToClassicGuide();
    await watchPage.goToTVGuideTab();
    await tvGuidePage.waitForGuidePageToLoadInClassicFormat();
    await tvGuidePage.clickOnCurrentInfoCard();
    await tvGuidePage.clickOnWatchNowButton();
    await playerPage.enterPinIfRequired(
      constants.pin1,
      constants.pin2,
      constants.pin3,
      constants.pin4
    );
    await playerPage.verifyVideoPlayerPage();
    await playerPage.verifyPlayerTimerRunning();
    await playerPage.verifyVideoStarted();
    if (platformName.platform === constants.platform.browser) {
      await playerPage.closePlayerBtn();
    }
    logger.info('[Verify OnStream Watch Now on info card] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('player')
  .tag('TVGuide')
  .tag('mobile')
  .tag('onstream')
  //.tag('FireTV')
  //.tag('Roku')
  .tag('portrait');

Scenario(
  UtilsCodecept.appendDateTime(
    'ZephyrID:005010 - Verify OnStream WatchPage PlayIcon from SwimLane Tile'
  ),
  async (navBar, watchPage, playerPage) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream WatchPage PlayIcon from SwimLane Tile] start'
    );
    await navBar.navigateTo(constants.navigationMenu.watch);
    await watchPage.playAssetOnSwimlane();
    await playerPage.verifyVideoPlayerPage();
    assert.ok(
      await playerPage.verifyPlayerTimerRunning(),
      'Video player to play a video is not visible'
    );
    await playerPage.closePlayerBtn();
    logger.info('[Verify OnStream WatchPage PlayIcon from SwimLane Tile] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('player')
  .tag('browser')
  .tag('onstream')
  .tag('portrait')
  .tag('mobile')
  .tag('Roku')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime('Verify Search and play a live show'),
  async (navBar, searchPage, playerPage, platformName) => {
    await beforeHook();
    let channelNum = getRandomNumberInRange(1, await epg.getTotalChannels());
    currentTitle = await cosmos.getCurrentProgramName(channelNum);
    console.log('current title: ', currentTitle);
    await navBar.navigateTo(constants.navigationMenu.search);
    await searchPage.search(currentTitle);
    await searchPage.playFromTvGuideResults();
    assert.ok(
      await playerPage.verifyPlayerTimerRunning(),
      'Video player to play a video is not visible'
    );
    if (platformName.platform === constants.platform.browser) {
      await playerPage.closePlayerBtn();
    }
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('portrait')
  .tag('mobile')
  .tag('player')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'check the functionality of play button on current program schedule'
  ),
  async (
    watchPage,
    onStreamModernGuidePage,
    settingsPage,
    playerPage,
    platformName
  ) => {
    await beforeHook();
    logger.info(
      '[check the functionality of play button on current program schedule] start'
    );
    await watchPage.goToTVGuideTab();
    if (!(await onStreamModernGuidePage.isModernGuideFormatSeen())) {
      await watchPage.goToSettingsTab();
      await settingsPage.switchToModernGuide();
      await watchPage.goToTVGuideTab();
      await onStreamModernGuidePage.waitForGuidePageToLoadInModernFormat();
    }
    await onStreamModernGuidePage.clickPlayButtonOnProgramSchedule();
    await playerPage.verifyVideoPlayerPage();
    await playerPage.enterPinIfRequired(
      constants.pin1,
      constants.pin2,
      constants.pin3,
      constants.pin4
    );
    // await playerPage.verifyVideoStarted();
    await playerPage.verifyPlayerTimerRunning();
    if (platformName.platform === constants.platform.browser) {
      await playerPage.closePlayerBtn();
    }
    logger.info(
      '[check the functionality of play button on current program schedule] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser');

Scenario(
  UtilsCodecept.appendDateTime(
    'check the functionality of watch now button on info card'
  ),
  async (
    watchPage,
    onStreamModernGuidePage,
    settingsPage,
    playerPage,
    platformName
  ) => {
    await beforeHook();
    logger.info(
      '[check the functionality of watch now button on info card] start'
    );
    await watchPage.goToTVGuideTab();
    if (!(await onStreamModernGuidePage.isModernGuideFormatSeen())) {
      await watchPage.goToSettingsTab();
      await settingsPage.switchToModernGuide();
      await watchPage.goToTVGuideTab();
      await onStreamModernGuidePage.waitForGuidePageToLoadInModernFormat();
    }
    await onStreamModernGuidePage.clickWatchNowButtonOnInfoCard();
    await playerPage.verifyVideoPlayerPage();
    await playerPage.enterPinIfRequired(
      constants.pin1,
      constants.pin2,
      constants.pin3,
      constants.pin4
    );
    // await playerPage.verifyVideoStarted();
    await playerPage.verifyPlayerTimerRunning();
    if (platformName.platform === constants.platform.browser) {
      await playerPage.closePlayerBtn();
    }
    logger.info(
      '[check the functionality of watch now button on info card] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser');
