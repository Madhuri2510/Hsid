/* eslint-disable no-undef */
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept.js');
const assert = require('assert');
const logger = require('../utils/LogUtils.js').getLogger('MyStay_Page_test');
let cmpBackend = require('../OnStreamBackend/cmpBackend');
const CMP = require('../OnStreamBackend/cmp.js');
let cmp = new CMP();
const LogCat = require('../pages/CommonUtil/LogCat.js');
let logcat = new LogCat();
let beforeHook = () => {};
let afterHook = () => {};

Feature('OnStream My Stay Page - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-My Stay start');
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
    await logcat.captureLog('MyStay_Test');
  }
  logger.info('Before Suite-MyStay end');
});

Before(async (navBar, homePage) => {
  beforeHook = async () => {
    logger.info('[beforeHook] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.myStay);
    logger.info('[beforeHook] end');
  };
});

After(async (platformName, homePage) => {
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
  UtilsCodecept.appendDateTime('Verify the property logo on My Stay page'),
  async (myStayPage) => {
    await beforeHook();
    logger.info('[Verify the property logo on My Stay page] start');
    assert.ok(
      await myStayPage.isOnStreamPropertyLogoSeen(),
      'OnStream Property Logo is not visible'
    );
    logger.info('[Verify the property logo on My Stay page] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

//Roku is commented out because of incorrect locator issue
Scenario(
  UtilsCodecept.appendDateTime('To verify the carousels on My Stay page'),
  async (myStayPage) => {
    await beforeHook();
    logger.info('[Verify OnStream My Stay Page total Carousels] start');
    let heroCarouselCount = await cmp.getHeroCarouselCount(
      constants.pages.myStayPage
    );
    await myStayPage.verifyMyStayPageCarouselCount(heroCarouselCount);
    logger.info('[Verify OnStream My Stay Page total Carousels] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay');
//.tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Weather widget on small widget swimlane'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info('[Validate Weather widget on small widget swimlane] start');
    assert.ok(
      await myStayPage.validateWeatherWidgetTile(),
      'Weather logo should be visible on info card'
    );
    await myStayPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Weather widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Sports widget on small widget swimlane'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info('[Validate Sports widget on small widget swimlane] start');
    assert.ok(
      await myStayPage.validateSportsSmallWidgetTile(),
      'Sports Widget in Small Widgets is not displayed correctly'
    );
    await myStayPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Sports widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static Ad widget on small widget swimlane'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info('[Validate Static Ad widget on small widget swimlane] start');
    assert.ok(
      await myStayPage.validateStaticAdSmallWidgetTile(),
      'Advertise Tag should be visible on a infoCard'
    );
    await myStayPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Static Ad widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('MyStay')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Notification widget on small widget swimlane'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info(
      '[Validate Notification widget on small widget swimlane] start'
    );
    assert.ok(
      await myStayPage.validateNotificationInSmallWidgetTile(),
      'Notification Widget is not displayed correctly in My Stay Page'
    );
    await myStayPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Notification widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate More Info widget on large widget swimlane'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info('[Validate More Info widget on large widget swimlane] start');
    assert.ok(
      await myStayPage.validateMoreInfoWidgetTile(),
      'More Info Widget in Large Widget is not displayed correctly'
    );
    await myStayPage.closeInfoCardInHomeScreen();
    logger.info('[Validate More Info widget on large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('MyStay')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static Ad widget on large widget swimlane'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info('[Validate Static Ad widget on large widget swimlane] start');
    assert.ok(
      await myStayPage.validateStaticAdLargeWidgetTile(),
      'Advertise Tag should be visible on a infoCard'
    );
    await myStayPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Static Ad widget on large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static-Ad widget on Hero carousel widget swimlane'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info(
      '[Validate Static-Ad widget on Hero carousel widget swimlane] start'
    );
    assert.ok(
      await myStayPage.validateStaticAdWidgetInHeroCarousel(),
      'Advertise Tag should be visible on a infoCard'
    );
    logger.info(
      '[Validate Static-Ad widget on Hero carousel widget swimlane] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

//Roku is commented out because of no proper locator
Scenario(
  UtilsCodecept.appendDateTime(
    'Validate More Info widget on Hero Carousel widget swimlane'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info(
      '[Validate More Info widget on Hero Carousel widget swimlane] start'
    );
    assert.ok(
      await myStayPage.validateMoreInfoWidgetInHeroCarousel(),
      'More Info Widget is not correctly displayed in Hero Carousel'
    );
    await myStayPage.closeInfoCardInHomeScreen();
    logger.info(
      '[Validate More Info widget on Hero Carousel widget swimlane] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay')
  .tag('FireTv')
  //.tag('Roku')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Header and Greeting Message displayed correctly in MyStay Page'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info(
      '[Validate Header and Greeting Message displayed correctly in MyStay Page] start'
    );
    assert.ok(
      await myStayPage.validateHeaderAndGreetingInMyStay(),
      'Header and greeeting message are not displayed correctly'
    );
    logger.info(
      '[Validate Header and Greeting Message displayed correctly in MyStay Page] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate My Stay Page enabled and disabled from CMP correctly'
  ),
  async (myStayPage) => {
    await beforeHook();
    logger.info(
      '[Validate My Stay Page enabled and disabled from CMP correctly] start'
    );
    if (await cmpBackend.isPageEnabled(constants.pages.myStayPage)) {
      await cmpBackend.disablePage(constants.pages.myStayPage);
      assert.ok(
        !(await myStayPage.verifyMyStayPageDisplayed()),
        'My Stay Page should not be displayed'
      );
      await cmpBackend.enablePage(constants.pages.myStayPage);
    } else {
      assert.ok(
        !(await myStayPage.verifyMyStayPageDisplayed()),
        'My Stay Page should not be displayed'
      );
      await cmpBackend.enablePage(constants.pages.myStayPage);
      assert.ok(
        await myStayPage.verifyMyStayPageDisplayed(),
        'My Stay Page should be displayed'
      );
    }
    logger.info(
      '[Validate My Stay Page enabled and disabled from CMP correctly] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('MyStay');
