const assert = require('assert');
const {I} = inject();
const sportsPageLocators = require('./SportsPageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();
const baseOnStreamSportsPage = require('../../Browser/SportsPage/BrowserSportsPage');

module.exports = Object.assign(baseOnStreamSportsPage, {
  /**
   * Click on any future scheduled program
   */
  async clickOnAnyFutureProgram() {
    await this.goToSeeAllTiles();
    await I.waitForVisible(
      sportsPageLocators.futureProgramTime,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.click(sportsPageLocators.futureProgramTime);
  },

  /**
   * click on See All
   */
  async goToSeeAllTiles() {
    await I.waitForElement(
      sportsPageLocators.seeAll,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.scrollIntoViewToElement(sportsPageLocators.seeAll);
    await I.click(sportsPageLocators.seeAll);
  },

  /**
   * Verify sports page swimlanes tiles count
   */
  async verifySportsPageSpecificSwimlanesTilesCount(league) {
    let gameCount = await sports.getGamesCount(league);
    await I.waitForElement(
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
});
