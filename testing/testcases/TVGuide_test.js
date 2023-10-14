/* eslint-disable no-undef */
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const EPG = require('../OnStreamBackend/epg');
const logger = require('../utils/LogUtils').getLogger('TVGuide_test');
let epg = new EPG();
let beforeHook = () => {};
let afterHook = () => {};
const constants = require('../config/constants');
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();
const assert = require('assert');
const CMP = require('../OnStreamBackend/cmp');
const onStreamTestExecutionWaits = require('../config/onStreamTestExecutionWaits');
let cmp = new CMP();

Feature('OnStream TV Guide - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-TV Guide start');
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
    await logcat.captureLog('TVGuide_Test');
  }
  logger.info('Before Suite-TV Guide end');
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
    'Verify OnStream Guide Page Title is highlighted'
  ),
  async (tvGuidePage) => {
    await beforeHook();
    logger.info('[Verify OnStream Guide Page Title is highlighted] start');
    await tvGuidePage.verifyTvGuideIsHighlighted();
    logger.info('[Verify OnStream Guide Page Title is highlighted] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('title')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('TVGuide')
  .tag('mobile')
  .tag('onstream')
  .tag('portrait')
  .tag('Verizon')
  .tag('Roku');

//Commenting out Roku , due to incorrect locator
Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Channel Logos on TV Guide page'
  ),
  async (tvGuidePage, platformName) => {
    await beforeHook();
    logger.info('[Verify OnStream Channel Logos on TV Guide page] start');
    if (platformName.platform == constants.platform.browser) {
      assert.ok(
        (await tvGuidePage.verifyChannelLogos()) ===
          constants.maxNoOfChannelsTVGuideForBrowser,
        'Channel Logos are displayed in TV Guide'
      );
    } else {
      assert.ok(
        (await tvGuidePage.verifyChannelLogos()) ===
          constants.maxNoOfChannelsTVGuide,
        "Channel Logos displayed in TV Guide doesn't match configured values"
      );
      logger.info('[Verify OnStream Channel Logos on TV Guide page] end');
    }
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('disable')
  .tag('TVGuide')
  .tag('onstream')
  .tag('mobile')
  .tag('onstreamTVGuidePage')
  .tag('Verizon')
  .tag('portrait');
//.tag('Roku');

xScenario(
  UtilsCodecept.appendDateTime('Verify OnStream play buttons are visible'),
  async (tvGuidePage) => {
    await beforeHook();
    logger.info('[Verify OnStream play buttons are visible] start');
    await tvGuidePage.verifyPlayButtonVisible();
    logger.info('[Verify OnStream play buttons are visible] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('TVGuide')
  .tag('channelandPlayBtnCount')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('mobile')
  .tag('onstream')
  .tag('portrait');
//.tag('Roku');

xScenario(
  UtilsCodecept.appendDateTime('Verify OnStream current program info card'),
  async (tvGuidePage) => {
    await beforeHook();
    logger.info('[Verify OnStream current program info card] start');
    await tvGuidePage.verifyCurrentProgramInfoCard();
    logger.info('[Verify OnStream current program info card] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('infocard')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('TVGuide')
  .tag('mobile')
  .tag('onstream')
  .tag('portrait');
//.tag('Verizon')
// .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime('Verify OnStream future program info card'),
  async (tvGuidePage) => {
    await beforeHook();
    logger.info('[Verify OnStream future program info card] start');
    assert.ok(
      await tvGuidePage.verifyFutureProgramInfoCard(),
      'Future Program Info Card is not displayed correctly'
    );
    logger.info('[Verify OnStream future program info card] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('infocard')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('TVGuide')
  .tag('mobile')
  .tag('onstream')
  .tag('portrait')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime('Verify OnStream closing the info card'),
  async (tvGuidePage) => {
    await beforeHook();
    logger.info('[Verify OnStream closing the info card] start');
    await tvGuidePage.verifyFutureProgramInfoCard();
    assert.ok(await tvGuidePage.closeInfoScreen(), 'Info Card is not closed');
    logger.info('[Verify OnStream closing the info card] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('infocard')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('TVGuide')
  .tag('onstream')
  .tag('portrait')
  .tag('mobile')
  .tag('Verizon')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify total channels available on TV Guide page'
  ),
  async (tvGuidePage) => {
    await beforeHook();
    logger.info('[Verify total channels available on TV Guide page] start');
    let expectedTotal = await epg.getTotalChannels();
    await tvGuidePage.verifyTotalChannelsCount(expectedTotal);
    logger.info('[Verify total channels available on TV Guide page] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('channels')
  .tag('onstream')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('TVGuide')
  .tag('Roku');

xScenario(
  UtilsCodecept.appendDateTime(
    'Verify the focus need to be working in TV Guide'
  ),
  async (tvGuidePage) => {
    await beforeHook();
    logger.info('[Verify the focus need to be working in TV Guide] start');
    await tvGuidePage.verifyFocusOnEveryProgram();
    logger.info('[Verify the focus need to be working in TV Guide] end');
    await afterHook();
  }
); //skipping this case as it will end up in infinity RC-1072

Scenario(
  UtilsCodecept.appendDateTime('Verify channel change in TV Guide'),
  async (tvGuidePage, playerPage) => {
    await beforeHook();
    logger.info('[Verify channel change in TV Guide] start');
    let counter = 0;
    while (counter < 2) {
      await tvGuidePage.clickPlayButton();
      await playerPage.verifyVideoPlayerPage();
      await playerPage.verifyVideoStarted();
      await playerPage.verifyPlayerTimerRunning();
      //await tvGuidePage.goBack();
      counter++;
    }
    logger.info('[Verify channel change in TV Guide] end');
    await afterHook();
  }
)
  //.tag('browser')
  .tag('TVGuide');
