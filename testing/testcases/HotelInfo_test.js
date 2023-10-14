/* eslint-disable no-undef */
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept.js');
const assert = require('assert');
const CMP = require('../OnStreamBackend/cmp.js');
let cmp = new CMP();
let beforeHook = () => {};
const logger = require('../utils/LogUtils.js').getLogger(
  'Hotel_Info_Page_test'
);
let afterHook = () => {};
const LogCat = require('../pages/CommonUtil/LogCat.js');
let logcat = new LogCat();

Feature('OnStream Hotel Info Page - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-Hotel Info start');
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
    await logcat.captureLog('HotelInfo_Test');
  }
  logger.info('Before Suite-HotelInfo end');
});

Before(async (navBar, homePage) => {
  beforeHook = async () => {
    logger.info('[beforeHook] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.hotelInfo);
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
  UtilsCodecept.appendDateTime('Verify the property logo on Hotel Info page'),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info('[Verify the property logo on Hotel Info page] start');
    assert.ok(
      await hotelInfoPage.isOnStreamPropertyLogoSeen(),
      'OnStream Property Logo is not visible'
    );
    logger.info('[Verify the property logo on Hotel Info page] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

//TODO : Roku is commented out , due to Incorrect locator
Scenario(
  UtilsCodecept.appendDateTime('To verify the carousels on Hotel Info page'),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Hotel Info Page total Carousels] start');
    let heroCarouselCount = await cmp.getHeroCarouselCount(
      constants.pages.hotelInfoPage
    );
    await hotelInfoPage.verifyHotelInfoPageCarouselCount(heroCarouselCount);
    logger.info('[Verify OnStream Hotel Info Page total Carousels] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo');
//.tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Weather widget on small widget swimlane'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info('[Validate Weather widget on small widget swimlane] start');
    assert.ok(
      await hotelInfoPage.validateWeatherWidgetTile(),
      'Weather logo should be visible on info card'
    );
    await hotelInfoPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Weather widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify OnStream Hotel Info Page Learn More Section'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Hotel Info Page Learn More Section] start');
    let learnMoreData = await cmp.getMoreInfoWIdgetData(
      constants.carousel,
      constants.pages.hotelInfoPage
    );
    assert.ok(
      await hotelInfoPage.verifyHotelInfoPageLearnMoreSection(learnMoreData),
      'Learn More Section is not correctly displayed'
    );
    logger.info('[Verify OnStream Hotel Info Page Learn More Section] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Sports widget on small widget swimlane'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info('[Validate Sports widget on small widget swimlane] start');
    assert.ok(
      await hotelInfoPage.validateSportsSmallWidgetTile(),
      'Sports Widget in Small Widgets is not displayed correctly'
    );
    logger.info('[Validate Sports widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static Ad widget on small widget swimlane'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info('[Validate Static Ad widget on small widget swimlane] start');
    assert.ok(
      await hotelInfoPage.validateStaticAdSmallWidgetTile(),
      'Advertise Tag should be visible on a infoCard'
    );
    await hotelInfoPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Static Ad widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Notification widget on small widget swimlane'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info(
      '[Validate Notification widget on small widget swimlane] start'
    );
    assert.ok(
      await hotelInfoPage.validateNotificationInSmallWidgetTile(),
      'Notification Widget is not displayed correctly in Hotel Info Page'
    );
    await hotelInfoPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Notification widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate More Info widget on large widget swimlane'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info('[Validate More Info widget on large widget swimlane] start');
    assert.ok(
      await hotelInfoPage.validateMoreInfoWidgetTile(),
      'More Info Widget in Large Widget is not displayed correctly'
    );
    await hotelInfoPage.closeInfoCardInHomeScreen();
    logger.info('[Validate More Info widget on large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static Ad widget on large widget swimlane'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info('[Validate Static Ad widget on large widget swimlane] start');
    assert.ok(
      await hotelInfoPage.validateStaticAdLargeWidgetTile(),
      'Advertise Tag should be visible on a infoCard'
    );
    await hotelInfoPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Static Ad widget on large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static-Ad widget on Hero carousel widget swimlane'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info(
      '[Validate Static-Ad widget on Hero carousel widget swimlane] start'
    );
    assert.ok(
      await hotelInfoPage.validateStaticAdWidgetInHeroCarousel(),
      'Advertise Tag should be visible on a infoCard'
    );
    await hotelInfoPage.closeInfoCardInHomeScreen();
    logger.info(
      '[Validate Static-Ad widget on Hero carousel widget swimlane] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('sanity')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  .tag('evolve2')
  .tag('Roku');

//Roku is commented out because of no proper locator
Scenario(
  UtilsCodecept.appendDateTime(
    'Validate More Info widget on Hero Carousel widget swimlane'
  ),
  async (hotelInfoPage) => {
    await beforeHook();
    logger.info(
      '[Validate More Info widget on Hero Carousel widget swimlane] start'
    );
    assert.ok(
      await hotelInfoPage.validateMoreInfoWidgetInHeroCarousel(),
      'More Info Widget is not correctly displayed in Hero Carousel'
    );
    await hotelInfoPage.closeInfoCardInHomeScreen();
    logger.info(
      '[Validate More Info widget on Hero Carousel widget swimlane] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('browser')
  .tag('HotelInfo')
  .tag('FireTv')
  //.tag('Roku')
  .tag('evolve2');
