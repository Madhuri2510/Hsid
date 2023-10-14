/* eslint-disable no-undef */
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept.js');
const assert = require('assert');
const CMP = require('../OnStreamBackend/cmp.js');
let cmp = new CMP();
let beforeHook = () => {};
const logger = require('../utils/LogUtils.js').getLogger('Apps_Page_test');
let afterHook = () => {};
const LogCat = require('../pages/CommonUtil/LogCat.js');
let logcat = new LogCat();

Feature('OnStream Apps Page - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-Apps start');
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
    await logcat.captureLog('Apps_Test');
  }
  logger.info('Before Suite-Apps end');
});

Before(async (navBar, homePage) => {
  beforeHook = async () => {
    logger.info('[beforeHook] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.apps);
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
  console.log('After Suite start');
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.killLogProcess();
  }
  console.log('After Suite end');
});

Scenario(
  UtilsCodecept.appendDateTime('Verify the property logo on My Apps page'),
  async (appsPage) => {
    await beforeHook();
    logger.info('[Verify the property logo on Apps page] start');
    assert.ok(
      await appsPage.isOnStreamPropertyLogoSeen(),
      'OnStream Proeprty Logo is not visible'
    );
    logger.info('[Verify the property logo on Apps page] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('Apps')
  .tag('FireTv')
  .tag('Roku')
  .tag('evolve2');
