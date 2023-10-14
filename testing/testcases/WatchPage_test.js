/* eslint-disable no-undef */
const expVal = require('../config/expectedValues.js');
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const assert = require('assert');
const CMP = require('../OnStreamBackend/cmp');
let cmp = new CMP();
const EPG = require('../OnStreamBackend/epg');
let epg = new EPG();
const Sports = require('../OnStreamBackend/sports');
let sports = new Sports();
let beforeHook = () => {};
const logger = require('../utils/LogUtils').getLogger('WatchPage_test');
let afterHook = () => {};
const Cosmos = require('../OnStreamBackend/cosmos');
let cosmos = new Cosmos();
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();
let genres = require('../OnStreamBackend/genres');
let cmpBackend = require('../OnStreamBackend/cmpBackend');
let property = require('../config/propertyType/hospitality.js');
const {getelementsinfo} = require('../pages/Roku/WatchPage/RokuWatchPage.js');
const {I} = inject();

Feature('OnStream Watch Page - Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  console.log('Before Suite - Watch Page start');
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
    await logcat.captureLog('WatchPage_Test');
  }
  console.log('Before Suite - Watch Page end');
});

Before(async (homePage, navBar) => {
  beforeHook = async () => {
    logger.info('[beforeHook] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    logger.info('[beforeHook] end');
  };
});

After(async (platformName, homePage) => {
  afterHook = async () => {
    logger.info('[afterHook] start');
    if (
      platformName.platform == constants.platform.firetv ||
      platformName.platform == constants.platform.evolve2
    ) {
      // await homePage.resetToHome();
    }
    logger.info('[afterHook] end');
  };
});

AfterSuite(async (platformName) => {
  console.log('After Suite - Watch Page start');
  if (
    platformName.platform == constants.platform.firetv ||
    platformName.platform == constants.platform.evolve2
  ) {
    await logcat.killLogProcess();
  }
  console.log('After Suite - Watch Page end');
});

Scenario(
  UtilsCodecept.appendDateTime('Verify OnStream Watch Page Swimlanes'),
  async (watchPage) => {
    await beforeHook();
    logger.info('[VerifyOnStream Watch Page Swimlanes] start');
    let swimlaneNames = await cmp.getSwimlaneNames(constants.pages.watchPage);
    assert.ok(
      await watchPage.verifyWatchPageSwimlanes(swimlaneNames),
      'Watch page swimlanes should match with CMP values'
    );
    logger.info('[VerifyOnStream Watch Page Swimlanes] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('sanity')
  .tag('browser')
  .tag('watchPage')
  .tag('portrait')
  .tag('mobile')
  .tag('Roku')
  .tag('evolve2');

//TODO : Roku is commented out , due to Incorrect locator
Scenario(
  UtilsCodecept.appendDateTime('VerifyOnStream Watch Page total Carousels'),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Watch Page total Carousels] start');
    let heroCarouselCount = await cmp.getHeroCarouselCount(
      constants.pages.watchPage
    );
    assert.ok(
      await watchPage.verifyWatchPageCarouselCount(heroCarouselCount),
      'Watch page carousels should match with CMP values'
    );
    logger.info('[Verify OnStream Watch Page total Carousels] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('watchPage')
  .tag('FireTv')
  .tag('mobile')
  .tag('portrait')
  //.tag('Roku')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'click on swimlane item and verify video is launched'
  ),
  async (watchPage, playerPage) => {
    await beforeHook();
    let swimlaneNames = await cmp.getSwimlaneNames(constants.pages.watchPage);
    assert.ok(
      await watchPage.playAssetOnSwimlane(swimlaneNames[1]),
      'Unable to play asset from watch page swimlane'
    );
    await playerPage.closePlayerBtn();
    await afterHook();
  }
)
  .tag('swim')
  .tag('disable');
// .tag('FireTv');
// .tag('evolve2');

Scenario(
  'TC_homepage_property_logo - To verify  the property logo',
  async (I, watchPage) => {
    await beforeHook();
    assert.ok(
      await watchPage.isOnStreamPropertyLogoSeen(),
      'Propertylogo should be visible'
    );
    await afterHook();
  }
)
  .timeout(1200)
  .tag('portrait')
  .tag('watchPage')
  .tag('evolve2')
  .tag('FireTv');

xScenario(
  'TC_homepage_Verify_Exit_App - To verify on clicking Back Button Exit Back dialog box opens',
  async (watchPage) => {
    await watchPage.waitForOnStreamHomePageLaunch();
    await watchPage.verifyExitApp();
  }
)
  .timeout(1200)
  .tag('p1')
  .tag('watchPage')
  .tag('FireTv')
  .tag('evolve2');

Scenario('Verify the property logo in Watch Page', async (I, watchPage) => {
  await beforeHook();
  assert.ok(
    await watchPage.isOnStreamPropertyLogoSeen(),
    'Propertylogo should be visible'
  );
  await afterHook();
})
  .tag('p1')
  .tag('watchPage')
  .tag('FireTv')
  .tag('portrait')
  .tag('Roku')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify the focus need to be working in Watch Page'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Verify the focus need to be working in Watch Page] start');
    await watchPage.verifyFocusOnEveryProgram();
    logger.info('[Verify the focus need to be working in Watch Page] end');
    await afterHook();
  }
).tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify TV Guide Button functionality from all tabs'
  ),
  async (tvGuidePage, watchPage) => {
    await beforeHook();
    logger.info('[Verify TV Guide Button functionality from all tabs] start');
    await watchPage.waitForOnStreamHomePageLaunch();
    await watchPage.clickTvGuideButton();
    await tvGuidePage.verifyTvGuideIsHighlighted();
    await watchPage.verifyLandedOnTvGuidePage();
    await watchPage.goToOnDemandTab();
    await watchPage.clickTvGuideButton();
    await tvGuidePage.verifyTvGuideIsHighlighted();
    await watchPage.goToSearchTab();
    await watchPage.clickTvGuideButton();
    await tvGuidePage.verifyTvGuideIsHighlighted();
    await watchPage.goToSettingsTab();
    await watchPage.clickTvGuideButton();
    await tvGuidePage.verifyTvGuideIsHighlighted();
    logger.info('[Verify TV Guide Button functionality from all tabs] end');
    await afterHook();
  }
).tag('Verizon');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify Channel Up-Down Button functionality from all tabs'
  ),
  async (tvGuidePage, watchPage) => {
    await beforeHook();
    logger.info(
      '[Verify Channel Up-Down Button functionality from all tabs] start'
    );
    await watchPage.waitForOnStreamHomePageLaunch();
    await watchPage.clickChannelUpButton();
    await tvGuidePage.verifyTvGuideIsHighlighted();
    await watchPage.verifyLandedOnTvGuidePage();
    await watchPage.goToHomeTab();
    await watchPage.clickChannelDownButton();
    await tvGuidePage.verifyTvGuideIsHighlighted();
    await watchPage.verifyLandedOnTvGuidePage();
    logger.info('[Verify Channel Up-Down functionality from all tabs] end');
    await afterHook();
  }
).tag('Verizon');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static Ad widget on large widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Validate Static Ad widget on large widget swimlane] start');
    assert.ok(
      await watchPage.validateStaticAdLargeWidgetTile(),
      'Advertise Tag should be visible on a infoCard'
    );
    await watchPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Static Ad widget on large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('watchPage')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static Ad widget on small widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Validate Static Ad widget on small widget swimlane] start');
    assert.ok(
      await watchPage.validateStaticAdSmallWidgetTile(),
      'Advertise Tag should be visible on a infoCard'
    );
    await watchPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Static Ad widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('watchPage')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Sports widget on small widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Validate Sports widget on small widget swimlane] start');
    assert.ok(
      await watchPage.validateSportsSmallWidgetTile(),
      'Sports Widget is not displayed correctly in small widget'
    );
    logger.info('[Validate Sports widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('watchPage')
  .tag('onstream')
  .tag('Roku');

Scenario(
  //notification in large widget not applicable?
  UtilsCodecept.appendDateTime(
    'Validate Notification widget on small widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info(
      '[Validate Notification widget on small widget swimlane] start'
    );
    assert.ok(
      await watchPage.validateNotificationInSmallWidgetTile(),
      'Notification Widget is not displayed correctly in small widget'
    );
    await watchPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Notification widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('watchPage')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate More Info widget on large widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Validate More Info widget on large widget swimlane] start');
    assert.ok(
      await watchPage.validateMoreInfoWidgetTile(),
      'More Info Widget Title is not displayed correctly'
    );
    await watchPage.closeInfoCardInHomeScreen();
    logger.info('[Validate More Info widget on large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('watchPage')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Weather widget on small widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Validate Weather widget on small widget swimlane] start');
    assert.ok(
      await watchPage.validateWeatherWidgetTile(),
      'Weather logo should be visible on info card'
    );
    await watchPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Weather widget on small widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('watchPage')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime('Validate Live widget on large widget swimlane'),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Validate Live widget on large widget swimlane] start');
    let widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      constants.widgets.largeWidget,
      constants.widgetType.live,
      constants.pages.watchPage
    );
    if (widgetInfo.swimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail('Large widget swimlane with Live widget should be available');
    }
    assert.ok(
      await watchPage.validateLiveWidgetTile(
        widgetInfo.indexOfSwimlaneName,
        widgetInfo.indexOfWidget
      ),
      'Content related to live channel should be visible'
    );
    logger.info('[Validate Live widget on large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('sanity')
  .tag('browser')
  .tag('watchPage')
  .tag('Roku')
  .tag('onstream');
// .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Live widget on Hero carousel widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info(
      '[Validate Live widget on Hero carousel widget swimlane] start'
    );
    let widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      constants.widgets.carousel,
      constants.widgetType.live,
      constants.pages.watchPage
    );
    if (widgetInfo.swimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(
        'Hero carousel widget swimlane with Live widget should be available'
      );
    }
    assert.ok(
      await watchPage.validateLiveWidgetTileInHeroCarousel(
        widgetInfo.indexOfSwimlaneName,
        widgetInfo.indexOfWidget
      ),
      'Content related to live channel should be visible'
    );
    logger.info('[Validate Live widget on Hero carousel widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('Roku')
  .tag('browser')
  .tag('watchPage')
  .tag('onstream')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Static-Ad widget on Hero carousel widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info(
      '[Validate Static-Ad widget on Hero carousel widget swimlane] start'
    );
    assert.ok(
      await watchPage.validateStaticAdWidgetInHeroCarousel(),
      'Advertise Tag should be visible on a infoCard'
    );
    logger.info(
      '[Validate Static-Ad widget on Hero carousel widget swimlane] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('watchPage')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate More Info widget on Hero Carousel widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info(
      '[Validate More Info widget on Hero Carousel widget swimlane] start'
    );
    assert.ok(
      await watchPage.validateMoreInfoWidgetInHeroCarousel(),
      'More Info widget should be visible on Hero Carousel widget swimlane'
    );
    await watchPage.closeInfoCardInHomeScreen();
    logger.info(
      '[Validate More Info widget on Hero Carousel widget swimlane] end'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('FireTv')
  .tag('evolve2')
  .tag('watchPage')
  .tag('onstream')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Video widget on Hero Carousel widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info(
      '[Validate Video widget on Hero Carousel widget swimlane] start'
    );
    let widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      constants.widgets.carousel,
      constants.widgetType.video,
      constants.pages.watchPage
    );
    if (widgetInfo.SwimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(
        'Hero carousel widget swimlane with video widget should be available'
      );
    }
    assert.ok(
      await watchPage.validateVideoWidgetInHeroCarousel(
        widgetInfo.indexOfSwimlaneName,
        widgetInfo.indexOfWidget
      ),
      'Video widget is unavailable on hero carousel widget swimlane or does not conform with CMP data'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('watchPage')
  .tag('FireTv')
  .tag('Roku')
  .tag('evolve2');

//Roku is commented out because as it is duplicated scenario
Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Live channel widget on Hero Carousel widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info(
      '[Validate Live channel on Hero Carousel widget swimlane] start'
    );
    let widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      constants.widgets.carousel,
      constants.widgetType.live,
      constants.pages.watchPage
    );
    if (widgetInfo.SwimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(
        'Hero carousel widget swimlane with Live widget should be available'
      );
    }
    assert.ok(
      await watchPage.validateLiveChannelWidgetInHeroCarousel(
        widgetInfo.indexOfSwimlaneName,
        widgetInfo.indexOfWidget
      ),
      'Live widget is unavailable on hero carousel widget swimlane or does not conform with CMP data'
    );
    await afterHook();
  }
)
  .tag('p1')
  .tag('watchPage');
//.tag('Roku')
//.tag('FireTv');
//.tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'Validate Video widget on Large widget swimlane'
  ),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Validate Video widget on Large widget swimlane] start');
    let widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      constants.widgets.largeWidget,
      constants.widgetType.video,
      constants.pages.watchPage
    );
    if (widgetInfo.SwimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(
        'Hero carousel widget swimlane with Live widget should be available'
      );
    }
    assert.ok(
      await watchPage.validateVideoWidgetInLargeWidget(
        widgetInfo.indexOfSwimlaneName,
        widgetInfo.indexOfWidget
      ),
      'Video widget is unavailable on widget swimlane or does not conform with CMP data'
    );
    await watchPage.closeInfoCardInHomeScreen();
    logger.info('[Validate Video widget on Large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('watchPage')
  .tag('onstream')
  .tag('FireTv')
  .tag('Roku')
  .tag('evolve2');

//Roku is commented out because as it is duplicated scenario
Scenario(
  UtilsCodecept.appendDateTime('Validate Live widget on Large widget swimlane'),
  async (watchPage) => {
    await beforeHook();
    logger.info('[Validate Live widget on Large widget swimlane] start');
    let widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForLiveChannelWidget(
      constants.widgets.largeWidget,
      constants.widgetType.live,
      constants.pages.watchPage
    );
    if (widgetInfo.SwimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(
        'Hero carousel widget swimlane with Live widget should be available'
      );
    }
    assert.ok(
      await watchPage.validateLiveChannelWidgetInLargeWidget(
        widgetInfo.indexOfSwimlaneName,
        widgetInfo.indexOfWidget
      ),
      'Live widget is unavailable on widget swimlane or does not conform with CMP data'
    );
    logger.info('[Validate Live widget on Large widget swimlane] end');
    await afterHook();
  }
)
  .tag('p1')
  .tag('watchPage');
// .tag('Roku')
// .tag('evolve2');
// .tag('FireTv');
