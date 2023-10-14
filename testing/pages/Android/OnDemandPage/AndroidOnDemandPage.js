const assert = require('assert');
const {getRandomNumberInRange} = require('../../CommonUtil/Util');
const {I, constants} = inject();
const onDemandPageLocators = require('./OnDemandPageLocators.json');
let onDemandSwimlanes = {
  trendingContentTiles: 0,
  popularShows: 1,
  popularMovies: 2,
};
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits.js');

module.exports = {
  constants,
  /**
   * Method to validate the visibility of swimlanes in OnDemand Menu - Trending Content, Popular Shows and Popular Movies
   * @returns boolean:'true' if all swimlane tiles of On Demand are visible
   */
  async areSwimlanesVisible() {
    let istrendingContentVisible, isPopularShowsVisible, isPopularMoviesVisible;
    await I.waitForElement(onDemandPageLocators.trendingContentsLabel, 20);
    istrendingContentVisible = await I.isElementVisible(
      onDemandPageLocators.trendingContentsLabel
    );
    isPopularShowsVisible = await I.isElementVisible(
      onDemandPageLocators.popularShowsLabel
    );
    await I.dpadDown(2);
    await I.waitForElement(onDemandPageLocators.popularMoviesLabel, 3);
    isPopularMoviesVisible = await I.isElementVisible(
      onDemandPageLocators.popularMoviesLabel
    );
    if (
      istrendingContentVisible &&
      isPopularMoviesVisible &&
      isPopularShowsVisible
    ) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * Method to validate Trending Content Tiles are visible in OnDemand
   * @returns boolean:'true' if tiles of Trending COntents are visible
   */
  async isTrendingContentTilesVisible() {
    let isTrendingContentTilesVisible = false;
    await I.waitForElement(onDemandPageLocators.trendingContentsLabel, 20);
    let tileCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.trendingContentTiles
    );
    await I.reportLog(tileCount);
    if (tileCount === 7) {
      isTrendingContentTilesVisible = true;
    }
    return isTrendingContentTilesVisible;
  },
  /**
   * Method to validate navigation from all swimlanes of OnDemand
   * @param {Object} onDemandSwimlane Trendind Content, popular Shows, Popular movies
   */
  async validateNavigation() {
    let tileCount = 0;
    while (
      (await I.isElementVisible(onDemandPageLocators.seeAllTile)) == false
    ) {
      await I.dpadRight();
      tileCount++;
      if (tileCount > 31) {
        throw new Error('Tile count is more than 31');
      }
    }
    await I.reportLog('total tiles available under' + tileCount - 1);
    await I.reportLog('Navigation successful on FireTV');
  },
  /**
   * Method to validate navigation to See All Tile from all swimlanes of OnDemand
   * @param {Object} onDemandSwimlane Trendind Content, popular Shows, Popular movies
   */
  async navigateToSeeAll(onDemandSwimlane) {
    let count = 1;
    await I.waitForElement(onDemandPageLocators.trendingContentsLabel, 20);
    switch (onDemandSwimlane) {
      case constants.onDemandSwimlane.trendingContents:
        break;
      case constants.onDemandSwimlane.popularShows:
        await I.dpadDown(onDemandSwimlanes.popularShows);
        break;
      case constants.onDemandSwimlane.popularMovies:
        await I.dpadDown(onDemandSwimlanes.popularMovies);
        break;
      default:
        I.reportLog('Enter valid swimlane name ');
        assert.ok(false, 'Enter valid swimlane name ');
        break;
    }
    while (
      (await I.isElementVisible(onDemandPageLocators.seeAllTile)) === false ||
      count < constants.maxNavBarItems
    ) {
      await I.dpadRight();
      count++;
    }
    await I.dpadOK();
    await I.wait(2);
  },
  /**
   * Method to validate navigation to See All Tile from all swimlanes of OnDemand
   * @param {Object} onDemandSwimlane Trending Content, popular Shows, Popular movies
   */
  async validateAllTitles(onDemandSwimlane) {
    switch (onDemandSwimlane) {
      case constants.onDemandSwimlane.trendingContents:
        assert.ok(
          await I.isElementVisible(onDemandPageLocators.trendingContentsLabel),
          'Trending contents label is not visible'
        );
        return true;
        break;
      case constants.onDemandSwimlane.popularShows:
        assert.ok(
          await I.isElementVisible(onDemandPageLocators.popularShowsLabel),
          'Popular shows label is not visible'
        );
        return true;
        break;
      case constants.onDemandSwimlane.popularMovies:
        assert.ok(
          await I.isElementVisible(onDemandPageLocators.popularMoviesLabel),
          'Popular movies label is not visible'
        );
        return true;
        break;
      default:
        I.reportLog('Enter valid swimlane name ');
        assert.ok(false, 'Enter valid swimlane name ');
        return false;
    }
  },
  /**
   * Method to validate Popular Shows Tiles are visible in OnDemand
   * @returns boolean:'true' if tiles of Popular Shows are visible
   */
  async isPopularShowTilesVisible() {
    let isPopularShowsVisible = false;
    await I.waitForElement(
      onDemandPageLocators.popularShowsLabel,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    let tileCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.popularShowsTiles
    );
    await I.reportLog(tileCount);
    if (tileCount == constants.maxNoOfTilesInAScreen) {
      isPopularShowsVisible = true;
    }
    return isPopularShowsVisible;
  },
  /**
   * Method to validate Popular Movies Tiles are visible in OnDemand
   * @returns boolean:'true' if tiles of Popular Movies are visible
   */
  async isPopularMoviesTilesVisible() {
    await I.waitForElement(
      onDemandPageLocators.trendingContentsLabel,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.dpadDown(2);
    let isPopularMoviesVisible = false;
    await I.waitForElement(
      onDemandPageLocators.popularMoviesLabel,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    let tileCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.popularMoviestTiles
    );
    await I.reportLog(tileCount);
    if (tileCount == constants.maxNoOfTilesInAScreen) {
      isPopularMoviesVisible = true;
    }
    return isPopularMoviesVisible;
  },
  /**
   * Method to click on any random content in OnDemand
   */
  async clickRandomTitle() {
    let tileNumber = getRandomNumberInRange(0, 5);
    let laneNumber = getRandomNumberInRange(1, 3);
    switch (laneNumber) {
      case 1:
        await I.dpadDown();
        await I.wait();
        break;
      case 2:
        await I.dpadDown(2);
        await I.wait();
        break;
      case 3:
        await I.dpadDown(3);
        await I.wait(2);
        break;
      default:
        I.reportLog('Invalid lane number');
        assert.ok(false, 'Valid lane number');
    }
    if (tileNumber > 0) {
      await I.dpadRight(tileNumber);
    }
    await I.dpadOK();
  },
  /**
   * Method to verify the content title and description of any OnDemand content
   * @returns boolean:'true' if content title and description are correctly displayed.
   */
  async verifyContent() {
    await I.waitForElement(onDemandPageLocators.contentDescription, 20);
    await I.waitForElement(onDemandPageLocators.contentPlayButton, 10);
    let isContentTitleVisible = await I.isElementVisible(
      onDemandPageLocators.contentTitle
    );
    let isContentRatingVisible = await I.isElementVisible(
      onDemandPageLocators.contentRating
    );
    await I.waitForElement(onDemandPageLocators.contentDescription, 20);
    let isContentDescriptionVisible = await I.isElementVisible(
      onDemandPageLocators.contentDescription
    );
    let isContentPlayButtonVisible = await I.isElementVisible(
      onDemandPageLocators.contentPlayButton
    );
    if (
      isContentTitleVisible &&
      isContentRatingVisible &&
      isContentDescriptionVisible &&
      isContentPlayButtonVisible
    ) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * Method to verify the platform options of anycontent in OnDemand
   */
  async verifyPlatformOptions() {
    await I.waitForElement(onDemandPageLocators.contentPlayButton, 5);
    assert.ok(
      await I.isFocused(onDemandPageLocators.contentPlayButton),
      'Play button is not focused'
    );
    await I.dpadOK();
    await I.waitForElement(onDemandPageLocators.platformOptions, 10);
    await I.wait(1);
    let optionsCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.platformOptions
    );
    assert.ok(optionsCount >= 1, 'Options count is lesser than 1');
    return true;
  },

  /**
   * verify Franchise Content Visible
   * @returns true if Franchise Content Visible else false
   */
  async isFranchiseContentVisible() {
    await I.wait(3);
    let isVisible = true;
    if (!(await I.isElementVisible(onDemandPageLocators.contentTitle))) {
      I.reportLog('Franchise Title should be Visible');
      isVisible = false;
    }
    if (!(await I.isElementVisible(onDemandPageLocators.contentRating))) {
      I.reportLog('Franchise Rating should be Visible');
      isVisible = false;
    }
    if (!(await I.isElementVisible(onDemandPageLocators.contentPlayButton))) {
      I.reportLog('Franchise Play Button should be Visible');
      isVisible = false;
    }
    if (!(await I.isElementVisible(onDemandPageLocators.seasonButton))) {
      I.reportLog('Franchise Seasons & Episodes Button should be Visible');
      isVisible = false;
    }
    return isVisible;
  },

  /**
   * verify Play button focused
   * @returns true if Play button focused else false
   */
  async isPlayButtonFocused() {
    let isFocused = false;
    if (await I.isFocused(onDemandPageLocators.contentPlayButton)) {
      isFocused = true;
    }
    return isFocused;
  },
  /**
   * verify Seasons & Episodes Button Focused
   * @returns true if Seasons & Episodes Button Focused else false
   */
  async isSeasonsAndEpisodesButtonFocused() {
    let isFocused = false;
    if (await I.isFocused(onDemandPageLocators.seasonButton)) {
      isFocused = true;
    }
    return isFocused;
  },

  /**
   * verify Seasons & Episodes Button Focused & selected
   * @returns true true if Seasons & Episodes Button Focused and selected else false
   */
  async selectSeasonsAndEpisodesButton() {
    let isSelect = false;
    await I.dpadDown();
    if (this.isSeasonsAndEpisodesButtonFocused) {
      await I.dpadOK();
      isSelect = true;
    }
    return isSelect;
  },

  /**
   * verify first Season Button Focused
   * @returns true if First Season Button Focused else false
   */
  async isFirstSeasonButtonFocused() {
    let isFocus = false;
    if (await I.isFocused(`${onDemandPageLocators.seasonButtons}1]`)) {
      isFocus = true;
    }
    return isFocus;
  },

  /**
   * verify all seasons and related date in the asset iView
   * @returns true if all seasons and related date visible else false
   */
  async verifySeasonsAndData() {
    let iteratorCount = 1,
      isVisible = false;
    while (
      iteratorCount < 25 &&
      (await I.isElementVisible(
        `${onDemandPageLocators.seasonButtons}${iteratorCount}]`
      ))
    ) {
      if (!(await this.isEpisodeAndDataVisible())) {
        isVisible = false;
        I.reportLog('Season Tile and data should be visible');
        break;
      } else {
        isVisible = true;
      }
      await I.dpadRight();
      await I.dpadOK();
      if (!(await this.selectToWatchData())) {
        isVisible = false;
        I.reportLog('Select platform to watch and platform should be visible');
        break;
      } else {
        isVisible = true;
        await I.dpadBack();
        await I.dpadLeft();
        await I.wait(2);
        await I.dpadDown();
        await I.dpadOK();
      }
      iteratorCount++;
    }
    return isVisible;
  },

  async selectToWatchData() {
    let isVisible = true;
    if (
      !(await I.isElementVisible(
        onDemandPageLocators.selectPlatformTitleWatchOn
      ))
    ) {
      I.reportLog('select Platform Title To Watch On should be visible');
      isVisible = false;
    }
    if (!(await I.isElementVisible(onDemandPageLocators.contentDescription))) {
      I.reportLog('Description should be visible');
      isVisible = false;
    }
    if (!(await I.isElementVisible(onDemandPageLocators.platformOptions))) {
      I.reportLog('Play button should be visible');
      isVisible = false;
    }
    return isVisible;
  },

  /**
   * verify Episodes & Data
   * @returns true if Episodes & Data Visible else false
   */
  async isEpisodeAndDataVisible() {
    await I.wait(3);
    let isVisible = true;
    if (!(await I.isElementVisible(onDemandPageLocators.seasonEpisodeImage))) {
      I.reportLog('Episode Image should be Visible');
      isVisible = false;
    }
    if (!(await I.isElementVisible(onDemandPageLocators.seasonEpisodeTitle))) {
      I.reportLog('Episode Title should be Visible');
      isVisible = false;
    }

    if (!(await I.isElementVisible(onDemandPageLocators.seasonEpisodeNumber))) {
      I.reportLog('Episode Number should be Visible');
      isVisible = false;
    }
    if (!(await I.isElementVisible(onDemandPageLocators.seasonDescription))) {
      I.reportLog('Season Description should be Visible');
      isVisible = false;
    }
    return isVisible;
  },
};
