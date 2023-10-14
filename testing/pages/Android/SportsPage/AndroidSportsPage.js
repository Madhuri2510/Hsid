const assert = require('assert');
const {I, constants} = inject();
const sportsPageLocators = require('./SportsPageLocators.json');
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits.js');

module.exports = {
  constants,
  /**
   * Method to validate the Sports swimlane page which all sports league are avaialble or not
   * @returns boolean:'true' if all sports league are available
   */
  async areActiveSportsLeaguesAvailable(leagueNames) {
    let areActiveSportsLeaguesAvailable;
    let leaguesAvailable = [];
    await I.waitForElement(sportsPageLocators.sportsSwimLanesText, 10);
    let sportsSwimLanesText = await I.getElementText(
      sportsPageLocators.sportsSwimLanesText
    );
    sportsSwimLanesText = sportsSwimLanesText.toString().toLowerCase();
    leagueNames.forEach((swimlane) => {
      if (sportsSwimLanesText.includes(swimlane)) {
        leaguesAvailable.push(true);
      } else {
        leaguesAvailable.push(false);
      }
    });
    if (leaguesAvailable.includes(false)) {
      areActiveSportsLeaguesAvailable = false;
    } else {
      areActiveSportsLeaguesAvailable = true;
    }
    return areActiveSportsLeaguesAvailable;
  },

  /**
   * Method to get one sports league board on sports widgets
   * @returns sports league stats in Text format
   */
  async getSportsWidgetOneMatchScoreBoard() {
    let isHomeTeamIconPresent = await I.isElementVisible(
      sportsPageLocators.homeTeamIcon
    );
    let isAwayTeamIconPresent = await I.isElementVisible(
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

  /**
   * Method to click on any future program
   */
  async clickOnAnyFutureProgram() {
    let isFutureProgramFound = false;
    await I.waitForElement(
      sportsPageLocators.container,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
    while (!isFutureProgramFound) {
      if (await I.isElementVisible(sportsPageLocators.futureSportsEventTile)) {
        while (!(await I.isFocused(sportsPageLocators.futureSportsEventTile))) {
          await I.dpadRight();
        }
        await I.dpadOK();
        isFutureProgramFound = true;
      } else if (await I.isElementVisible(sportsPageLocators.container)) {
        await I.dpadRight();
      } else {
        assert.fail('Sports page is not found!!!');
      }
    }
  },

  /**
   * Method to validate whether the sports league schedule or not for the future game
   * @returns boolean:'true' if sports league are schedule
   */
  async isSportsLeagueSchedule() {
    if (
      (await I.isElementVisible(
        sportsPageLocators.scheduleTextWithGameStart
      )) &&
      !(await I.isElementVisible(sportsPageLocators.seeStats))
    ) {
      I.reportLog('Game will start soon!!!');
      return true;
    } else {
      I.reportLog('Text: Game Starting @, was not found');
      return false;
    }
  },

  /**
   * Method to verify specific swimlanes tiles count
   */
  async verifySportsPageSpecificSwimlanesTilesCount(league) {
    let tileCount,
      visibleSportsTileCount = 4,
      iteration = 1;
    tileCount = await sports.getGamesCount(league);
    if (tileCount !== 0) {
      if (tileCount > visibleSportsTileCount) {
        tileCount = visibleSportsTileCount;
      }
    } else {
      assert.fail(`Tile count should not be:${tileCount}`);
    }
    I.reportLog('Tile Count: ', tileCount);
    if (await I.isFocused(sportsPageLocators.firstTileOfFirstRow)) {
      while (iteration <= tileCount) {
        if (
          await I.isFocused(
            `${sportsPageLocators.verifySportsSecondRow}${iteration}]`
          )
        ) {
          I.reportLog(`${iteration}`, 'Current tile is focused');
          await I.dpadRight();
          iteration++;
        } else {
          assert.fail('Expected tile is not focused or not present');
        }
      }
    } else {
      assert.fail('Sports first tile in first row should be focused');
    }
  },

  /**
   * Method to navigate to Team stats card info
   */
  async navigateToSportsSeeTeamStats() {
    let sportsLeagues = await sports.getActiveLeagues();
    for (let i = 0; i < sportsLeagues.length; i++) {
      let count = await sports.getCompletedGamesCount(sportsLeagues[i]);
      if (count > 0) {
        await I.dpadRight(
          (await sports.getCompletedGamesCount(sportsLeagues[i])) - 1
        );
        break;
      } else {
        await I.dpadDown();
      }
    }
    await I.dpadOK();
    await I.wait(5);
    await I.dpadOK();
    await I.wait(5);
  },

  /**
   * Verifies sports page swimlanes
   */
  async verifySportsPageSwimLanes(swimlaneTitles) {
    let swimlaneText = await I.grabTextFrom(
      sportsPageLocators.sportsSwimLanesText
    );
    if (typeof swimlaneText !== 'string') {
      for (
        let swimlaneIndex = 0;
        swimlaneIndex < swimlaneText.length;
        swimlaneIndex++
      ) {
        assert.strictEqual(
          swimlaneText[swimlaneIndex].toUpperCase(),
          swimlaneTitles[swimlaneIndex].toUpperCase(),
          'Sports swimlane Text is not matching'
        );
      }
    } else {
      assert.strictEqual(
        swimlaneText.toUpperCase(),
        swimlaneTitles.toString().toUpperCase(),
        'Sports swimlane Text is not matching'
      );
    }
  },
};
