const assert = require('assert');
const {I, playerPage, constants} = inject();
const onDemandPageLocators = require('./OnDemandPageLocators.json');
const {getRandomNumberInRange} = require('../../CommonUtil/Util');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,

  async areSwimlanesVisible() {
    let istrendingContentVisible, isPopularShowsVisible, isPopularMoviesVisible;
    await I.waitForElement(onDemandPageLocators.trendingContentsLabel, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    istrendingContentVisible = await I.isElementVisible(
      onDemandPageLocators.trendingContentsLabel
    );
    isPopularShowsVisible = await I.isElementVisible(
      onDemandPageLocators.popularShowsLabel
    );
    await I.waitForElement(onDemandPageLocators.popularMoviesLabel, testExecutionWaits.WAIT_FOR_5_SEC);
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

  async isTrendingContentTilesVisible() {
    let isTrendingContentTilesVisible = false;
    let tileCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.trendingTiles
    );

    if (tileCount === 10) {
      isTrendingContentTilesVisible = true;
    }
    return isTrendingContentTilesVisible;
  },

  async validateNavigation() {  //todo - Make it more specific
    let rightArrow = onDemandPageLocators.rightArrow;
    assert.ok(
      await I.isElementVisible(rightArrow),
      'Right arrow is not visible to navigation'
    );
    await I.click(rightArrow);
    await I.waitForElement(onDemandPageLocators.leftArrow, 5);
    assert.ok(
      await I.isElementVisible(onDemandPageLocators.leftArrow),
      'Left arrow is not visible to navigate'
    );
  },

  async navigateToSeeAll(laneNumber) {
    switch (laneNumber)
     {
      case constants.onDemandSwimlane.trendingContents:
        laneNumber = 1;
        break;
      case constants.onDemandSwimlane.popularShows:
        laneNumber = 2;
        break;
      case constants.onDemandSwimlane.popularMovies:
        laneNumber = 3;
        break;
    }

    let rightArrow = onDemandPageLocators.rightArrow + `[${laneNumber}]`;
    let seeAllButton = onDemandPageLocators.seeAll + `[${laneNumber}]`;
    await I.click(rightArrow);
    await I.wait(3);
    await I.click(seeAllButton);
    await I.waitForElement(onDemandPageLocators.backButton, 10);
  },

  async validateAllTitles(laneNumber) {
    await I.waitForElement(onDemandPageLocators.backButton, 10);
    let tileCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.flexTiles
    );
    console.log("tileCount", tileCount)
    if(tileCount === 30) {
      return true;
    }
  },

  async isPopularShowTilesVisible() {
    let isPopularShowsVisible = false;
    let tileCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.popShowTiles
    );
    await I.reportLog(tileCount);
    if (tileCount === 10) {
      isPopularShowsVisible = true;
    }
    return isPopularShowsVisible;
  },

  async isPopularMoviesTilesVisible() {
    let isPopularMoviesVisible = false;
    let tileCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.popMovieTiles
    );
    await I.reportLog(tileCount);
    if (tileCount === 10) {
      isPopularMoviesVisible = true;
    }
    return isPopularMoviesVisible;
  },

  async clickRandomTitle() {
    let tileNumber = getRandomNumberInRange(0, 5);
    let laneNumber = getRandomNumberInRange(1, 3);
    let randomTile = onDemandPageLocators.randomTile
      .replace('index1', tileNumber)
      .replace('index2', laneNumber);
    await I.waitForElement(randomTile, 20);
    //wait for to settle dom
    await playerPage.waitForSpinnerToDisappear();
    await I.wait(2);
    await I.click(randomTile);
    await I.waitForElement(onDemandPageLocators.contentTitle, 20);
  },

  async verifyContent() {
    await I.waitForElement(onDemandPageLocators.contentDescription, 20);
    await I.waitForElement(onDemandPageLocators.contentPlayButton, 10);
    let isContentTitleVisible = 
      await I.isElementVisible(onDemandPageLocators.contentTitle);

    let isContentRatingVisible = 
      await I.isElementVisible(onDemandPageLocators.contentRating);

    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);

    let isContentDescriptionVisible =
      await I.isElementVisible(onDemandPageLocators.contentDescription);

    let isContentPlayButtonVisible =
      await I.isElementVisible(onDemandPageLocators.contentPlayButton);

    await I.click(onDemandPageLocators.closeButton);
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

  async verifyPlatformOptions() {
    await I.waitForElement(onDemandPageLocators.contentDescription, 20);
    await I.click(onDemandPageLocators.contentPlayButton);
    await I.waitForElement(onDemandPageLocators.platformOptions, 10);
    await I.wait(1);
    let optionsCount = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.platformOptions
    );
    if(optionsCount >= 1, 'No platforms for user to choose'){
      return true;
    }
  },

  async verifyOptionLink() {
    let optionsNames = await I.grabTextFrom(
      onDemandPageLocators.platformOptions
    );
    let firstOption =
      optionsNames && typeof optionsNames === 'object'
        ? optionsNames[0]
        : optionsNames;
    await I.click(onDemandPageLocators.platformOptions);
    await I.wait(25);
    await I.switchToNextTab();

    await I.reportLog(`I selected ${firstOption} application`);
    // await I.seeInSource(
    //   constants.onDemand.platformNames[firstOption.toUpperCase()]
    // );
    await I.switchToPreviousTab();
    await I.waitForVisible(
      onDemandPageLocators.platformOptions,
      testExecutionWaits.WAIT_FOR_ON_DEMAND_PLATFORM_OPTIONS
    );
  },

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
    await I.wait(3);
    if (!(await I.isElementVisible(onDemandPageLocators.videoPlayButton))) {
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
    if (await I.isElementVisible(onDemandPageLocators.videoPlayButton)) {
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
    await I.wait(3);
    if (await I.isElementVisible(onDemandPageLocators.seasonButton)) {
      //I.click(onDemandPageLocators.seasonButton);
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
    await I.wait(3);
    if (await I.isElementVisible(onDemandPageLocators.activeEpisodeTile)) {
      isFocus = true;
    }
    return isFocus;
  },

  /**
   * verify all seasons and related date in the asset iView
   * @returns true if all seasons and related date visible else false
   */
  async verifySeasonsAndData() {
    let isPlatformAvailable = true;
    let seasonCount = await this.grabSeasonsCountOfFranchise();
    let currentSeason = 0;
    while (currentSeason < seasonCount) {
      await I.click(onDemandPageLocators.seasonButton);
      await I.waitForVisible(
        `${onDemandPageLocators.seasonOptionInSeasonTab}[${currentSeason + 1}]`
      );
      await I.click(
        `${onDemandPageLocators.seasonOptionInSeasonTab}[${currentSeason + 1}]`
      );
      await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
      await I.waitForElement(onDemandPageLocators.activeEpisodeTile,
         testExecutionWaits.WAIT_FOR_ELEMENT_LOAD)
      await I.click(onDemandPageLocators.activeEpisodeTile);
      await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
      if (
        (await I.isElementVisible(onDemandPageLocators.primeVideoButton)) ||
        (await I.isElementVisible(onDemandPageLocators.googlePlayButton)) ||
        (await I.isElementVisible(onDemandPageLocators.hboMaxButton)) ||
        (await I.isElementVisible(onDemandPageLocators.iTunesButton)) ||
        (await I.isElementVisible(onDemandPageLocators.vuduButton)) ||
        (await I.isElementVisible(onDemandPageLocators.youTubeButton)) ||
        (await I.isElementVisible(onDemandPageLocators.maxButton))

      ) {
        await I.reportLog(
          'Season' + (currentSeason + 1) + ' Episode1 has platform'
        );
        isPlatformAvailable = true;
      } else {
        await I.reportLog(
          'Season' + (currentSeason + 1) + " Episode1 doesn't have any platform"
        );
        isPlatformAvailable = false;
        return isPlatformAvailable;
      }
      await I.click(onDemandPageLocators.closeDialogButton);
      currentSeason++;
    }
    return isPlatformAvailable;
  },

  /**
   * Close the dialog box
   */
  async closeDialogModel() {
    await I.click(onDemandPageLocators.closeDialogButton);
    await I.waitForVisible(onDemandPageLocators.contentDescription, 20);
    await I.click(onDemandPageLocators.closeButton);
  },

  async clickRandomShow() {
    let tileNumber = getRandomNumberInRange(0, 5);
    let randomTile = onDemandPageLocators.randomTile
      .replace('index1', tileNumber)
      .replace('index2', 2);
    await this.clickRandomTitleWith(randomTile);
    return randomTile;
  },

  async clickRandomTitleWith(tile) {
    await I.waitForElement(tile, 20);
    await I.wait(3);
    await I.click(tile);
    await I.waitForElement(onDemandPageLocators.contentTitle, 20);
  },

  async clickRandomMovie() {
    let tileNumber = getRandomNumberInRange(0, 5);
    let randomTile = onDemandPageLocators.randomTile
      .replace('index1', tileNumber)
      .replace('index2', 3);
    await this.clickRandomTitleWith(randomTile);
    return randomTile;
  },

  async getEpisodeCount() {
    return await I.grabNumberOfVisibleElements(
      onDemandPageLocators.episodeImages
    );
  },

  async getShowTitle() {
    await I.wait(5);
    let showTitle = await I.grabTextFrom(onDemandPageLocators.onDemandTitle);
    let count = 0;
    while (count < 3 && showTitle.trim().length == 0) {
      await I.wait(3);
      showTitle = await I.grabTextFrom(onDemandPageLocators.onDemandTitle);
      count++;
    }
    return showTitle;
  },

  async escapeDialog() {
    await I.pressKey(constants.esc);
  },

  /**
   * grabs the season count of a franchise
   * @returns {integer} - Returns season count of a franchise
   */
  async grabSeasonsCountOfFranchise() {
    await I.waitForElement(
      onDemandPageLocators.seasonButton,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.scrollIntoView(
      onDemandPageLocators.seasonButton
      // { block: 'center', inline: 'center' }
    );
    await I.click(onDemandPageLocators.seasonButton);
    let count = await I.grabNumberOfVisibleElements(
      onDemandPageLocators.seasonOptionInSeasonTab
    );
    await I.click(onDemandPageLocators.firstSeasonOptionInSeasonTab);
    return count;
  },
};
