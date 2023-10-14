/* eslint-disable no-undef */
const {platformName} = inject();
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const assert = require('assert');
let beforeHook = () => {};
const logger = require('../utils/LogUtils').getLogger('SettingsPage_test');
let afterHook = () => {};
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();
const CMP = require('../OnStreamBackend/cmp');
let cmp = new CMP();

Feature('OnStream Settings Page - Verification').retry(0);

BeforeSuite(async (watchPage, platformName) => {
  let smartBoxId = await cmp.getSmartBoxId();
  if (
    platformName.platform !== constants.platform.firetv &&
    platformName.platform !== constants.platform.android &&
    platformName.platform !== constants.platform.evolve2
  ) {
    await watchPage.setSmartBoxId(smartBoxId);
  }
  logger.info('Before Suite-Settings start');
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.captureLog('Settings_Test');
  }
  logger.info('Before Suite-Settings end');
});

Before(async (navBar, homePage) => {
  beforeHook = async () => {
    logger.info('[Before] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.settings);
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

AfterSuite(async () => {
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.killLogProcess();
  }
});

Scenario(
  UtilsCodecept.appendDateTime('Verify OnStream Settings Page Options'),
  async (settingsPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Settings Page Options] start');
    assert.ok(
      await settingsPage.verifySettingsPageOptions(),
      ' All Settings options should be displayed '
    );
    logger.info('[Verify OnStream Settings Page Options] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('settings')
  .tag('cmpCutover')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('mobile')
  .tag('portrait')
  .tag('Verizon')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Settings Page change Time Format'
  ),
  async (settingsPage, watchPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Settings Page change Time Format] start');
    await settingsPage.clickOnAppSettings();
    let currentTimeFormat = await settingsPage.getCurrentSettingFormat(
      constants.settings.time
    );
    let newTimeFormat = await settingsPage.switchFormatFrom(currentTimeFormat);
    await settingsPage.clickOnSetting(constants.settings.time);
    await settingsPage.setFormatTo(newTimeFormat);
    await settingsPage.clickOnAppSettings();
    currentTimeFormat = await settingsPage.getCurrentSettingFormat(
      constants.settings.time
    );
    logger.info('[Verify OnStream Settings Page change Time Format] end');
    assert.ok(
      newTimeFormat === currentTimeFormat,
      'New settings format is not same as current settings format'
    );
    logger.info('[Verify OnStream Settings Page change Time Format] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('settings')
  .tag('cmpCutover')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('mobile')
  .tag('Verizon')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Settings Page change Temp Format'
  ),
  async (settingsPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Settings Page change Temp Format] start');
    await settingsPage.clickOnAppSettings();
    let currentTempFormat = await settingsPage.getCurrentSettingFormat(
      constants.settings.temperature
    );
    let newTempFormat = await settingsPage.switchFormatFrom(currentTempFormat);
    await settingsPage.clickOnSetting(constants.settings.temperature);
    await settingsPage.setFormatTo(newTempFormat);
    await settingsPage.clickOnAppSettings();
    currentTempFormat = await settingsPage.getCurrentSettingFormat(
      constants.settings.temperature
    );
    assert.ok(
      newTempFormat === currentTempFormat,
      'New Temperature format is not same as current Temperature format'
    );
    logger.info('[Verify OnStream Settings Page change Temp Format] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('settings')
  .tag('cmpCutover')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2')
  .tag('onstream')
  .tag('mobile')
  .tag('Verizon')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify the sub headings in settings page under App settings category'
  ),
  async (settingsPage) => {
    await beforeHook();
    logger.info(
      '[Verify the sub headings in settings page under App settings category] start'
    );
    assert.ok(
      await settingsPage.isAppSettingsOptionSeen(),
      'App Settings option should be visible'
    );
    await settingsPage.clickOnAppSettings();
    assert.ok(
      await settingsPage.isSubHeadingsUnderAppSettingsOptionVisible(),
      "'TV GUIDE OPTIONS' and 'FORMAT OPTIONS' headings should be visible under App Settings option"
    );
    logger.info(
      '[Verify the sub headings in settings page under App settings category] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .timeout(1200)
  .tag('portrait')
  .tag('browser')
  .tag('settings')
  .tag('Roku')
  .tag('cmpCutover')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify the Time formatting options available in settings page'
  ),
  async (settingsPage) => {
    await beforeHook();
    logger.info(
      '[Verify the Time formatting options available in settings page] start'
    );
    assert.ok(
      await settingsPage.isAppSettingsOptionSeen(),
      'App Settings option should be visible'
    );
    await settingsPage.clickOnAppSettings();
    assert.ok(
      await settingsPage.isSubHeadingsUnderAppSettingsOptionVisible(),
      "'TV GUIDE OPTIONS' and 'FORMAT OPTIONS' sub headings should be visible under App Settings option"
    );
    await settingsPage.clickOnSetting(constants.settings.time);
    assert.ok(
      await settingsPage.verifyOptionsAvailableInTimeFormatOption(),
      "'12 HOURS' and '24 HOURS' formatting options should be visible in Time format option"
    );
    logger.info(
      '[Verify the Time formatting options available in settings page] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .timeout(1200)
  .tag('portrait')
  .tag('browser')
  .tag('settings')
  .tag('Roku')
  .tag('cmpCutover')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Settings Page click and verify LegalAndAbout'
  ),
  async (settingsPage) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream Settings Page click and verify LegalAndAbout] start'
    );
    assert.ok(
      await settingsPage.clickOnLegalAbout(),
      'Legal & About should be visible'
    );
    assert.ok(
      await settingsPage.checkElementsOnLegalAbout(),
      'Legal & About data should be visible'
    );
    logger.info(
      '[Verify OnStream Settings Page click and verify LegalAndAbout] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('settings')
  .tag('browser')
  .tag('onstream')
  .tag('FireTv')
  .tag('evolve2')
  .tag('portrait')
  .tag('cmpCutover')
  .tag('mobile')
  .tag('Verizon')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Settings Page click and verify FAQs'
  ),
  async (settingsPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Settings Page click and verify FAQs] start');
    assert.ok(await settingsPage.clickOnFAQs(), 'FAQs option is not displayed');
    assert.ok(
      await settingsPage.checkForFAQs(),
      'FAQs data is not displayed correctly'
    );
    logger.info('[Verify OnStream Settings Page click and verify FAQs] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('onstream')
  .tag('FireTv')
  .tag('evolve2')
  .tag('settings')
  .tag('portrait')
  .tag('mobile')
  .tag('Verizon')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Settings Page click and select LegalAndAbout, verify Terms Of Services'
  ),
  async (settingsPage) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream Settings Page click and select LegalAndAbout, verify Terms Of Services] start'
    );
    assert.ok(
      await settingsPage.clickOnLegalAbout(),
      'Legal & About should be visible to select'
    );
    assert.ok(
      await settingsPage.selectTermsOfService(),
      'TermsOfService should be visible to select'
    );
    assert.ok(
      await settingsPage.verifyData(),
      'Terms Of Service Data should be visible'
    );
    logger.info(
      '[Verify OnStream Settings Page click and select LegalAndAbout, verify Terms Of Services] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('settings')
  .tag('Verizon')
  .tag('FireTv')
  .tag('evolve2')
  .tag('cmpCutover')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Settings Page click and select LegalAndAbout, verify Privacy Policy'
  ),
  async (settingsPage) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream Settings Page click and select LegalAndAbout, verify Privacy Policy] start'
    );
    assert.ok(
      await settingsPage.clickOnLegalAbout(),
      'Legal & About should be visible to select'
    );
    assert.ok(
      await settingsPage.selectPrivacyPolicy(),
      'Privacy Policy should be visible to select'
    );
    assert.ok(
      await settingsPage.verifyData(),
      'Privacy Policy Data should be visible'
    );
    logger.info(
      '[Verify OnStream Settings Page click and select LegalAndAbout, verify Privacy Policy] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('settings')
  .tag('cmpCutover')
  .tag('Verizon')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream TV Guide Page with Time Format is 12 Hour'
  ),
  async (settingsPage, watchPage, navBar) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream TV Guide Page with Time Format is 12 Hour] start'
    );
    await settingsPage.clickOnAppSettings();
    await settingsPage.setTimeFormat(constants.timeFormat.hour12);
    await navBar.navigateTo(constants.navigationMenu.tvGuide);
    assert.ok(
      await settingsPage.verifyTimeFormatOnTVGuide(
        constants.timesFormat.tvGuide12H
      ),
      ' Time Format is not displayed correctly in TV Guide Page'
    );
    logger.info(
      '[Verify OnStream TV Guide Page with Time Format is 12 Hour] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('settings')
  .tag('Roku')
  .tag('browser')
  .tag('evolve2')
  .tag('FireTv');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream TV Guide Page with Time Format is 24 Hour'
  ),
  async (settingsPage, watchPage, navBar) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream TV Guide Page with Time Format is 24 Hour] start'
    );
    await settingsPage.clickOnAppSettings();
    await settingsPage.setTimeFormat(constants.timeFormat.hour24);
    if (platformName.platform === constants.platform.browser) {
      await watchPage.goToTVGuideTab();
      await watchPage.goToSettingsTab();
    } else {
      await navBar.navigateTo(constants.navigationMenu.tvGuide);
    }
    assert.ok(
      await settingsPage.verifyTimeFormatOnTVGuide(
        constants.timesFormat.tvGuide24H
      ),
      'Time Format is not displayed 24 Hour format in TV Guide Page'
    );
    logger.info(
      '[Verify OnStream TV Guide Page with Time Format is 24 Hour] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('settings')
  .tag('Roku')
  .tag('browser')
  .tag('evolve2')
  .tag('FireTv');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Sports Page with Time Format is 12 Hour'
  ),
  async (settingsPage, hotelInfoPage, sportsPage, navBar) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream Sports Page with Time Format is 12 Hour] start'
    );
    await settingsPage.clickOnAppSettings();
    await settingsPage.setTimeFormat(constants.timeFormat.hour12);
    await navBar.navigateTo(constants.navigationMenu.hotelInfo);
    await hotelInfoPage.navigateToSportsTile();
    await sportsPage.clickOnAnyFutureProgram();
    if (
      platformName.platform == constants.platform.firetv ||
      platformName.platform == constants.platform.android ||
      platformName.platform == constants.platform.evolve2
    ){
      assert.ok(
        await settingsPage.verifyTimeFormatOnSportsPage(
          constants.timesFormat.androidSports12h
        ),
        'Time format is not displayed in 12 hour format in Sports Page'
      );}
    else{
     assert.ok(
       await settingsPage.verifyTimeFormatOnSportsPage(
         constants.timesFormat.sports12h
       ),
       'Time format is not displayed in 12 hour format in Sports Page'
     ); 
    }
    logger.info(
      '[Verify OnStream Sports Page with Time Format is 12 Hour] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('settings')
  .tag('Roku')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Sports Page with Time Format is 24 Hour'
  ),
  async (settingsPage, hotelInfoPage, sportsPage, navBar) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream Sports Page with Time Format is 24 Hour] start'
    );
    await settingsPage.clickOnAppSettings();
    await settingsPage.setTimeFormat(constants.timeFormat.hour24);
    await navBar.navigateTo(constants.navigationMenu.hotelInfo);
    await hotelInfoPage.navigateToSportsTile();
    await sportsPage.clickOnAnyFutureProgram();
    if (
      platformName.platform == constants.platform.firetv ||
      platformName.platform == constants.platform.android ||
      platformName.platform == constants.platform.evolve2
    ) {
      assert.ok(
        await settingsPage.verifyTimeFormatOnSportsPage(
          constants.timesFormat.androidSports24h
        ),
        'Time format is not displayed in 24 hour format in Sports Page'
      );
    } else {
      assert.ok(
        await settingsPage.verifyTimeFormatOnSportsPage(
          constants.timesFormat.sports24h
        ),
        'Time format is not displayed in 12 hour format in Sports Page'
      );
    }
    logger.info(
      '[Verify OnStream Sports Page with Time Format is 24 Hour] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('settings')
  .tag('Roku')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime('Verify OnStream Font Size'),
  async (settingsPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Settings Page Font Size] start');
    await settingsPage.clickOnAppSettings();
    await settingsPage.verifyChangeFontSize();
    logger.info('[Verify OnStream Settings Page Font Size] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('cmpCutover')
  .tag('settings')
  .tag('browser')
  .tag('Roku')
  .tag('FireTv')
  .tag('evolve2');
