const assert = require('assert');
const {I, constants} = inject();
const sportsPageLocators = require('./SportsPageLocators.json');
const Sports = require('../../../OnStreamBackend/sports');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
let sports = new Sports();

module.exports = {
  constants,

  /**
   * Verifies sports page swimlanes
   */
  async areActiveSportsLeaguesAvailable(swimlaneTitles) {
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
      return true;
    } else {
      assert.strictEqual(
        swimlaneText.toUpperCase(),
        swimlaneTitles.toString().toUpperCase(),
        'Sports swimlane Text is not matching'
      );
    }
    return false;
  },

  /**
   * Verifies sports widget score board
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
      I.wait(5);
      await I.isElementVisible(sportsPageLocators.firstGameTile);
      let gameTeamStatsText = await I.grabTextFrom(
        sportsPageLocators.teamStatsText
      );
      I.reportLog('gameTeamStatsText ' + gameTeamStatsText);
      await I.click(sportsPageLocators.closeButton);
      return gameTeamStatsText;
    }
  },

  /**
   * navigates and verify seeStats
   */
  async navigateToSportsSeeTeamStats() {
    for (let i = 1; i < 10; i++) {
      await I.click(
        sportsPageLocators.firstGameTileWithIndex.replace('index', i)
      );
      await I.wait(3);
      if (await I.isElementVisible(sportsPageLocators.wasLive)) {
        await I.click(sportsPageLocators.seeStats);
        break;
      } else {
        await I.click(sportsPageLocators.closeIcon);
      }
    }
  },

  /**
   * Verify sports page swimlanes tiles count
   */
  async verifySportsPageSpecificSwimlanesTilesCount(league) {
    let gameCount = await sports.getGamesCount(league);
    await I.waitForVisible(
      sportsPageLocators.seeAll,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await this.goToSeeAllTiles();
    await I.waitForVisible(
      sportsPageLocators.swimLaneTiles,
      testExecutionWaits.WAIT_FOR_ICON_TO_APPEAR
    );
    let actualTiles = await I.grabNumberOfVisibleElements(
      sportsPageLocators.swimLaneTiles
    );
    assert.strictEqual(
      actualTiles,
      gameCount,
      `Failed, the number of tiles on the sport swimlane ${league} is ${actualTiles}`
    );
  },

  /**
   * click on See All
   */
  async goToSeeAllTiles() {
    await I.waitForElement(
      sportsPageLocators.seeAll,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.scrollIntoView(sportsPageLocators.seeAll);
    await I.click(sportsPageLocators.seeAll);
  },

  /**
   * Click on any future scheduled program
   */
  async clickOnAnyFutureProgram() {
    await I.waitForVisible(
      sportsPageLocators.seeAll,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await this.goToSeeAllTiles();
    await I.waitForVisible(
      sportsPageLocators.futureProgramTime,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.click(sportsPageLocators.futureProgramTime);
  },

  /**
   * Verify schedule of future program is visible
   */
  async isSportsLeagueSchedule() {
    let isVisible = false;
    if (
      await I.isElementVisible(sportsPageLocators.scheduleTextWithGameStart)
    ) {
      await I.reportLog('Game will start soon!!!');
      isVisible = true;
    } else {
      await I.reportLog('Text: Game Starting @, was not found');
      isVisible = false;
    }
    await I.click(sportsPageLocators.closeButton);
    return isVisible;
  },

  /**
   *taps on future programme
   */
  async clickOnAnyFutureProgramDepriciated() {
    await I.reportLog('Inside clickOnAnyFutureProgram function');
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.waitForElement(sportsPageLocators.seeAll, 10);
    await I.scrollIntoView(sportsPageLocators.seeAll);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.click(sportsPageLocators.seeAll);
    await I.isElementVisible(sportsPageLocators.backButton);
    await I.click(sportsPageLocators.backButton);
    const isFutureProgram = await I.isElementVisible(
      sportsPageLocators.futureProgramTime
    );
    assert.ok(isFutureProgram, 'No future programme found');
  },
};
