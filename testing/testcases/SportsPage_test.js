/* eslint-disable no-undef */
const assert = require('assert');
const constants = require('../config/constants.js');
const UtilsCodecept = require('../codeceptSupport/UtilsCodecept');
const expVal = require('../config/expectedValues.js');
const logger = require('../utils/LogUtils').getLogger('SportsPage_test');
let property = inject();
const Sports = require('../OnStreamBackend/sports');
let sports = new Sports();
const CMP = require('../OnStreamBackend/cmp');
let cmp = new CMP();
const LogCat = require('../pages/CommonUtil/LogCat');
let logcat = new LogCat();
let beforeHook = () => {};
let afterHook = () => {};

Feature('OnStream Home Page Sports Section- Verification').retry(0);

BeforeSuite(async (homePage, platformName) => {
  logger.info('Before Suite-Sports Page start');
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
    await logcat.captureLog('SportsPage_Test');
  }
  logger.info('Before Suite-Sports Page end');
});

Before(async (homePage, hotelInfoPage, navBar) => {
  beforeHook = async () => {
    logger.info('[Before] start');
    await homePage.waitForOnStreamHomePageLaunch();
    await navBar.clickOnHomePageTile(constants.tileName.watch);
    await navBar.navigateTo(constants.navigationMenu.hotelInfo);
    await hotelInfoPage.navigateToSportsTile();
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
    'ZephyrID:008001 - Verify OnStream Sports Page SwimLanes'
  ),
  async (sportsPage) => {
    await beforeHook();
    logger.info('Verify OnStream Sports Page SwimLanes start');
    let swimlaneNames = await sports.getActiveLeagues();
    assert.ok(
      await sportsPage.areActiveSportsLeaguesAvailable(swimlaneNames),
      'Sports League is not available'
    );
    logger.info('[Verify OnStream Sports Page SwimLanes] end');
  }
)
  .tag('p1')
  .tag('sportsSwimLanes')
  .tag('sportsPage')
  .tag('FireTv')
  .tag('evolve2')
  .tag('browser')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'ZephyrID:008002 - Verify OnStream Sports widget scoreboard'
  ),
  async (sportsPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Sports widget scoreboard] Start');
    await sportsPage.navigateToSportsSeeTeamStats();
    let matchStatsText = await sportsPage.getSportsWidgetOneMatchScoreBoard();
    assert.strictEqual(
      matchStatsText,
      expVal.teamStatsText,
      'OnStream Match Stats Text is not matching'
    );
    logger.info('[Verify OnStream Sports widget scoreboard] end');
  }
)
  .tag('p1')
  .tag('browser')
  .tag('sportsWidgetScoreBoard')
  .tag('sportsPage')
  .tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'ZephyrID:008003 - Verify OnStream Swimlane tiles count on sport Page'
  ),
  async (sportsPage) => {
    await beforeHook();
    logger.info('[Verify OnStream Swimlane tiles count on sport Page] Start');
    assert.ok(
      await sports.areLeaguesActive(),
      'No leagues are currently active'
    );
    let activeLeagues = await sports.getActiveLeagues();
    await sportsPage.verifySportsPageSpecificSwimlanesTilesCount(
      activeLeagues[0]
    );
    logger.info('[Verify OnStream Swimlane tiles count on sport Page] end');
  }
)
  .tag('p1')
  .tag('Roku')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'ZephyrID:008004 - Verify OnStream Sports Live Icon is visible on current program'
  ),
  async (sportsPage) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream Sports Live Icon is visible on current program] Start'
    );
    assert.ok(
      await sportsPage.verifyLiveIconOnCurrentProgram(),
      'Current program is not displayed live icon'
    );
    logger.info(
      '[Verify OnStream Sports Live Icon is visible on current program] end'
    );
  }
).tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'ZephyrID:008005 - Verify OnStream schedule is visible on future program'
  ),
  async (sportsPage) => {
    await beforeHook();
    logger.info(
      '[Verify OnStream schedule is visible on future program] Start'
    );
    await sportsPage.clickOnAnyFutureProgram();
    assert.ok(
      await sportsPage.isSportsLeagueSchedule(),
      'schedule Sports League is not visible'
    );
    logger.info('[Verify OnStream schedule is visible on future program] end');
  }
)
  .tag('p1')
  .tag('Roku')
  .tag('browser')
  .tag('FireTv')
  .tag('evolve2');

Scenario(
  UtilsCodecept.appendDateTime(
    'ZephyrID:008007 - Verify the navigation to Sports page when clicked on the sports tile'
  ),
  async (sportsPage) => {
    await beforeHook();
    logger.info(
      '[Verify the navigation to Sports page when clicked on the sports tile] Start'
    );
    assert.ok(
      await sportsPage.verifySportsPageIsVisible(),
      'Sports page is not visible'
    );
    logger.info(
      '[Verify the navigation to Sports page when clicked on the sports tile] end'
    );
  }
).tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'ZephyrID:008008 - Verify to close the pop up window'
  ),
  async (sportsPage) => {
    await beforeHook();
    logger.info('[Verify to close the pop up window] Start');
    await sportsPage.navigateToSportsSeeTeamStats();
    await sportsPage.verifySeeStatsButtonIsVisible();
    assert.ok(
      !(await sportsPage.closePopUpWindowAndVerify()),
      'Pop Up Window is not close'
    );
    logger.info('[Verify to close the pop up window] end');
  }
).tag('Roku');

Scenario(
  UtilsCodecept.appendDateTime(
    'Verify the focus need to be working in Sport Page'
  ),
  async (sportsPage) => {
    await beforeHook();
    logger.info('[Verify the focus need to be working in Sport Page] start');
    await sportsPage.verifyFocusOnEveryProgram();
    logger.info('[Verify the focus need to be working in Sport Page] end');
  }
).tag('Roku');
