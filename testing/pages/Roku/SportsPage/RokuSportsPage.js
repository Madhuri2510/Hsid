const assert = require('assert');
const {I, constants} = inject();
const sportsPageLocators = require('./SportsPageLocators.json');
const expVal = require('../../../config/expectedValuesRoku.js');
const logger = require('../../../utils/LogUtils').getLogger('RokuSportsPage');
const Sports = require('../../../OnStreamBackend/sports');
const {isRegressionType} = require('../../../utils/ConfigUtils');
const {getRandomNumberInRange} = require('../../CommonUtil/Util');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
let sports = new Sports();

module.exports = {
  constants,

  /**
   * Method to validate the Sports swimlane page which all sports league are avaialble or not
   * @returns boolean:'true' if all sports league are available
   */
  async areActiveSportsLeaguesAvailable(sportsSwimLanesNames) {
    let swimlanesLocator = sportsPageLocators.swimLanesText;
    for (
      let swimLanesTextIndex = 0;
      swimLanesTextIndex < sportsSwimLanesNames.length;
      swimLanesTextIndex++
    ) {
      swimlanesLocator.elementData[0].value =
        sportsSwimLanesNames[swimLanesTextIndex];
      let count = 0;
      while (!(await I.isVisible(swimlanesLocator, 0))) {
        if (count == 5) break;
        await I.dpadNavByEcp(constants.remoteKey.down);
        count++;
      }
      let actualText = await I.getElementText(swimlanesLocator);
      assert.strictEqual(
        actualText.toLowerCase(),
        sportsSwimLanesNames[swimLanesTextIndex],
        'Sports Page SwimLanes Names is not matching'
      );
    }
    return true;
  },

  /**
   * Method to verify specific swimlanes tiles count
   */
  async verifySportsPageSpecificSwimlanesTilesCount(league) {
    let activeLeagues = await this.updateActiveLeaguesForRoku(await sports.getActiveLeagues());
    logger.debug(
      `[verifySportsPageSpecificSwimlanesTilesCount]: ${activeLeagues}`
    );
    for (let index = 0; index < activeLeagues.length; index++) {
      if(activeLeagues[index] == league){
        await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
        let tileCount = await sports.getGamesCount(activeLeagues[index]);
        await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
        let actualTilesCount = await I.getTotalSportSwimlanesTiles(
        activeLeagues[index]
      );
      assert.strictEqual(
        actualTilesCount,
        tileCount,
        `Failed, the number of tiles on the sport swimlane ${activeLeagues[index]} is ${actualTilesCount}`
      );
      break;
      }
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
  },

  async updateActiveLeaguesForRoku(activeLeagues) {
    let ret = [];
    // On Roku, the order of leagues is different, then we have to change the order
    let rokuLeagues = ['mlb', 'nfl', 'nhl']; //nba is not present in roku
    rokuLeagues.forEach((league) => {
      if (activeLeagues.includes(league)) {
        ret.push(league);
      }
    });
    return ret;
  },

  async verifyLiveIconOnCurrentProgram() {
    let isSelectPlayableContainer = false;
    for (
      let swimlaneIndex = 0;
      swimlaneIndex < expVal.sportsSwimLanes.length;
      swimlaneIndex++
    ) {
      isSelectPlayableContainer = await I.selectLiveIconProgram();
      if (isSelectPlayableContainer) {
        break;
      } else {
        await I.dpadNavByEcp(constants.remoteKey.down);
      }
    }
    if (isSelectPlayableContainer) {
      logger.debug(
        '[verifyLiveIconOnCurrentProgram] Selected play icon container'
      );
      await I.dpadNavByEcp(constants.remoteKey.ok);
      let liveIconProgram = await I.getElementText(
        sportsPageLocators.timeLabel
      );
      assert.ok(
        liveIconProgram.startsWith(expVal.SportsProgram.currentProgram),
        'Current program is not displayed live icon'
      );
    } else {
      logger.warn('[verifyLiveIconOnCurrentProgram] Cannot found live program');
    }
    return true;
  },

  /**
   * Method to click on any future program
   */
  async clickOnAnyFutureProgram() {
    let activeLeagues = await this.updateActiveLeaguesForRoku(await sports.getActiveLeagues());
    let isSelectfutureProgram = false;
    for (let index = 0; index < activeLeagues.length; index++) {
      const totalContainer = await this.getTotalSwimlaneTilesCount(
        activeLeagues[index]
      );
      isSelectfutureProgram = await I.selectContainerHasSchedule(
        totalContainer
      );
      if (isSelectfutureProgram) {
        break;
      }
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    if (isSelectfutureProgram) {
      logger.debug('[clickOnAnyFutureProgram] Selected program has schedule');
      await I.dpadNavByEcp(constants.remoteKey.ok);
      await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    } else {
      logger.warn('[clickOnSwimlaneContainer] Cannot found future program');
    }
  },

  async getTotalSwimlaneTilesCount(activeLeagues) {
    let getGameCount = await sports.getGamesCount(activeLeagues);
    return getGameCount;
  },


  /**
   * Method to validate whether the sports league schedule or not for the future game
   * @returns boolean:'true' if sports league are schedule
   */
  async isSportsLeagueSchedule() {
    let isTimeLabelPresent = false;
    await I.waitForElementVisible(
      sportsPageLocators.gameInfoView,
      constants.timeWait.loading
    );
    let timeLabelText = await I.getElementText(
      sportsPageLocators.timeLabel
    );
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if(timeLabelText.includes("PM") || timeLabelText.includes("AM") ) {
      isTimeLabelPresent = true;
    }
    assert.ok(
      isTimeLabelPresent,
      'Future program is not displayed in schedule'
    );
    return isTimeLabelPresent;
  },

   /**
   * Method to navigate to Team stats card info
   */
  async navigateToSportsSeeTeamStats() {
    let activeLeagues = await sports.getActiveLeagues();
    let isSelectLiveProgram = false;
    let isSelectFutureProgram = false;
    outer: for (let index = 0; index < activeLeagues.length; index++) {
      const totalContainer = await this.getTotalSwimlaneTilesCount(
        activeLeagues[index]
      );
      for (let retry = 0; retry < totalContainer; retry++) {
        isSelectLiveProgram = await I.selectLiveIconProgram();
        isSelectFutureProgram = await I.checkContainerFuture();
        if (!isSelectLiveProgram && !isSelectFutureProgram) {
          break outer;
        }
        await I.dpadNavByEcp(constants.remoteKey.right);
      }
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    if (!isSelectLiveProgram && !isSelectFutureProgram) {
      await I.dpadNavByEcp(constants.remoteKey.ok);
    } else {
      logger.warn('[navigateToSportsSeeTeamStats] Cannot found past program');
    }
  },


  /**
   * Method to get one sports league board on sports widgets
   * @returns sports league stats in Text format
   */
  async getSportsWidgetOneMatchScoreBoard() {
    await I.dpadNavByEcp(constants.remoteKey.ok);
    let isHomeTeamIconPresent = await I.isVisible(
      sportsPageLocators.homeTeamIcon
    );
    let isAwayTeamIconPresent = await I.isVisible(
      sportsPageLocators.awayTeamIcon
    );
    assert.ok(isHomeTeamIconPresent, 'Home team icon not present');
    assert.ok(isAwayTeamIconPresent, 'Away team icon not present');
    if (isHomeTeamIconPresent && isAwayTeamIconPresent) {
      let gameTeamStatsText = await I.getElementText(
        sportsPageLocators.teamStatsText
      );
      return gameTeamStatsText;
    }
  },

  async verifySportsTileIsVisible() {
    await I.dpadNavByEcp(constants.remoteKey.back);
    let sportsTile = await I.checkSportsTile(constants.sportTile);
    assert.ok(sportsTile, 'Sport Tile is not Visible');
  },


  /**
   * Method to validate whether the sports page is available or not
   * @returns boolean:'true' if sports page is available
   */
  async verifySportsPageIsVisible() {
    let sportsPanel = await I.isVisible(sportsPageLocators.sportsPanel);
    return sportsPanel;
  },

  async verifySeeStatsButtonIsVisible() {
    let seeStatsButton = await I.isVisible(sportsPageLocators.seeStatsButton);
    assert.ok(seeStatsButton, 'See Stats Button is not visible');
  },

  /**
   * Method to validate whether the Pop Up Window is closed or not
   * @returns boolean:'false' if Pop Up Window is closed
   */
  async closePopUpWindowAndVerify() {
    await I.dpadNavByEcp(constants.remoteKey.back);
    let popUpWindow = await I.isVisible(sportsPageLocators.gameInfoView);
    return popUpWindow;
  },

  /**
   * verify every program is focused on sport page
   */
  async verifyFocusOnEveryProgram() {
    let activeLeagues = await sports.getActiveLeagues();
    let isRegression = isRegressionType();
    // check all program is focused.
    if (isRegression) {
      for (let leagueNum = 0; leagueNum < activeLeagues.length; leagueNum++) {
        logger.debug(
          `[verifyFocusOnEveryProgram] for ${activeLeagues[leagueNum]}`
        );
        let totalTileCount = await sports.getGamesCount(
          activeLeagues[leagueNum]
        );
        let checkFocus = await I.isProgramFocused(totalTileCount);
        assert.ok(checkFocus, 'The program is not focused');
        await I.dpadNavByEcp(constants.remoteKey.down);
      }
      // check random program is focused on 1 leagues.
    } else {
      let leagueNum = getRandomNumberInRange(1, activeLeagues.length);
      let totalTile = await sports.getGamesCount(activeLeagues[leagueNum - 1]);
      await I.dpadNavByEcp(constants.remoteKey.down, leagueNum - 1);
      let checkFocus = await I.isProgramFocused(totalTile);
      assert.ok(checkFocus, 'The program is not focused');
    }
  },
};
