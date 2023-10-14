/* eslint-disable no-undef */
const assert = require('assert');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const {getRandomNumberInRange} = require('../pages/CommonUtil/Util');
const logger = require('../utils/LogUtils').getLogger('PIP_test');
const constants = require('../config/constants');
let beforeHook = () => {};
let afterHook = () => {};
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();
const CMP = require('../OnStreamBackend/cmp');
let cmp = new CMP();

Feature('OnStream PIP - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-PIP start');
  let smartBoxId = await cmp.getSmartBoxId();
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
    await logcat.captureLog('PIP_Test');
  }
  logger.info('Before Suite-PIP end');
});

Before(async (homePage, navBar) => {
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
    if (
      platformName.platform !== constants.platform.firetv &&
      platformName.platform !== constants.platform.evolve2
    ) {
      await playerPage.closeDialogModel();
    }
    // await homePage.resetToHome();
    logger.info('[After] end');
  };
});

AfterSuite(async (homePage, platformName) => {
  if (platformName.platform === constants.platform.browser) {
    // await homePage.resetToHome();
  }
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.killLogProcess();
  }
});

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify that playback start in PIP mode on pressing BACK dpad key on player.'
  ),
  async (pip, playerPage, tvGuidePage) => {
    await beforeHook();
    logger.info(
      '[Verify that playback start in PIP mode on pressing BACK dpad key on player] start'
    );
    await tvGuidePage.clickPlayButton();
    await playerPage.verifyVideoStarted();
    await pip.invokePipMode();
    assert.ok(await pip.isPipScreenVisible(), 'PIP Screen should be visible');
    assert.ok(await pip.hasTVGuideLoaded(), 'Failed to load Guide Screen');
    await pip.expandPipMode();
    await playerPage.verifyVideoStarted();
    await playerPage.closePlayerBtn();
    logger.info(
      '[Verify that playback start in PIP mode on pressing BACK dpad key on player] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('pip')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify that user can browse vertically among channel while watching in PIP.'
  ),
  async (pip, playerPage, tvGuidePage) => {
    await beforeHook();
    logger.info(
      `[Verify that user can browse vertically among channel while watching in PIP.] start`
    );
    let channelNum = getRandomNumberInRange(1, 7);
    await tvGuidePage.clickPlayButton(channelNum);
    await playerPage.verifyVideoStarted();
    await pip.invokePipMode();
    assert.ok(await pip.isPipScreenVisible(), 'PIP Screen should be visible');
    assert.ok(await pip.hasTVGuideLoaded(), 'Failed to load Guide Screen');
    assert.ok(
      await pip.verifyVerticalNavigationOnTVGuide(channelNum),
      'Vertical navigation should work on guide while in PIP mode'
    );
    logger.info(
      `[Verify that user can browse vertically among channel while watching in PIP.] end`
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('pip')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify that user can browse horizontally among channel while watching in PIP.'
  ),
  async (pip, playerPage, tvGuidePage) => {
    await beforeHook();
    logger.info(
      `[Verify that user can browse horizontally among channel while watching in PIP] start`
    );
    let channelNum = getRandomNumberInRange(1, 7);
    await tvGuidePage.clickPlayButton(channelNum);
    await playerPage.verifyVideoStarted();
    await pip.invokePipMode();
    assert.ok(await pip.isPipScreenVisible(), 'PIP Screen should be visible');
    assert.ok(await pip.hasTVGuideLoaded(), 'Failed to load Guide Screen');
    assert.ok(
      await pip.verifyHorizontalNavigationOnTVGuide(channelNum),
      'Horizontal navigation should work on guide while in PIP mode'
    );
    logger.info(
      `[Verify that user can browse horizontally among channel while watching in PIP] end`
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('pip')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify that PIP screen is not visible once user is out of TV Guide'
  ),
  async (pip, playerPage, tvGuidePage, navBar) => {
    await beforeHook();
    logger.info(
      `[Verify that PIP screen is not visible once user is out of TV Guide] start`
    );
    await tvGuidePage.clickPlayButton();
    await playerPage.verifyVideoStarted();
    await pip.invokePipMode();
    assert.ok(await pip.isPipScreenVisible(), 'PIP Screen should be visible');
    assert.ok(await pip.hasTVGuideLoaded(), 'Failed to load Guide Screen');
    await pip.exitTVGuide();
    await navBar.navigateTo(constants.navigationMenu.search);
    assert.ok(
      !(await pip.isPipScreenVisible()),
      'PIP Screen should not be visible'
    );
    await navBar.navigateTo(constants.navigationMenu.watch);
    assert.ok(
      !(await pip.isPipScreenVisible()),
      'PIP Screen should not be visible'
    );
    await navBar.navigateTo(constants.navigationMenu.onDemand);
    assert.ok(
      !(await pip.isPipScreenVisible()),
      'PIP Screen should not be visible'
    );
    await navBar.navigateTo(constants.navigationMenu.settings);
    assert.ok(
      !(await pip.isPipScreenVisible()),
      'PIP Screen should not be visible'
    );
    logger.info(
      `[Verify that PIP screen is not visible once user is out of TV Guide] end`
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('pip')
  .tag('FireTv')
  .tag('evolve2');
