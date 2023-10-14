const assert = require('assert');
const {I, constants} = inject();
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const tVGenreFilterLocators = require('./GenreFiltersPageLocators.json');
const tvGuidePage = require('../TVGuidePage/AndroidGuidePage');
let genres = require('../../../OnStreamBackend/genres');
let tvGuideGenreFilterNames = [
  // Please don't change the order, incase of any changes make sure that following TV Guide order
  'sports',
  'movies',
  'news',
  'kids',
];
module.exports = {
  constants,

  /**
   * Verify is All Channels tab
   * @returns True if All channels tab visible else false
   */
  async isAllChannelsFilterVisible() {
    await I.wait(testExecutionWaits.WAIT_FOR_TAB_LABEL_APPEAR);
    return await I.isElementVisible(
      `${tVGenreFilterLocators.tvGuideFilters}${constants.tvGuideFilters.all_channels}')]`
    );
  },

  /**
   * Verify is Favorites tab
   * @returns True if All channels tab visible else false
   */
  async isFavoritesFilterVisible() {
    return await I.isElementVisible(
      `${tVGenreFilterLocators.tvGuideFilters}${constants.tvGuideFilters.favorites}')]`
    );
  },

  /**
   * Gets available Genre filters from back end
   * @returns {String} Filter Name - 'sports', 'movies', 'news', 'kids'
   */
  async getAvailableGenreFilters(index) {
    let currentFilter, availableGenres;
    // Getting available filters from back end
    availableGenres = await genres.getGenreNames();
    currentFilter = tvGuideGenreFilterNames[index];
    //verifying is expected filter avail
    if (availableGenres.includes(currentFilter)) {
      return currentFilter;
    } else {
      I.reportLog(`Current Filter ${currentFilter} Not available`);
    }
  },

  /**
   * Verify is Genre filters available
   * @return boolen: true - if all Genre filter available
   */
  async areGenreFiltersVisible() {
    let availableGenreFilter;
    let isGenreFilterAvailable;
    for (let i = 1; i < 6; i++) {
      availableGenreFilter = await this.getAvailableGenreFilters(i);
      //verifying is expected filter avail
      if (availableGenreFilter != null && availableGenreFilter !== undefined) {
        availableGenreFilter = availableGenreFilter.toUpperCase();
        if (
          await I.isElementVisible(
            `${tVGenreFilterLocators.tvGuideFilters}${availableGenreFilter}')]`
          )
        ) {
          I.reportLog(`Filter: ${availableGenreFilter} is visible in Tv Guide`);
        } else {
          I.reportLog(
            `Filter: ${availableGenreFilter} should be visible in Tv Guide`
          );
          isGenreFilterAvailable = false;
          break;
        }
      }
      isGenreFilterAvailable = true;
    }
    return isGenreFilterAvailable;
  },

  /**
   * Verify Is All Genre Filters Visible In Tv Guide
   * @return boolean: if all genre filters visible in tv guide
   */
  async areAllGenreFiltersVisibleInTvGuide() {
    // All channels
    if (!(await this.isAllChannelsFilterVisible())) {
      assert.fail('All Channels Filter should be visible');
    }
    // 'sports', 'movies', 'news', 'kids'
    return await this.areGenreFiltersVisible();
  },

  /**
   * Verify is Guide filters data loaded
   * @return boolean: if Genre filters data loaded
   */
  async isGenreDataLoaded() {
    let isGenreDataLoaded;
    for (let i = 0; i < 6; i++) {
      await I.dpadOK();
      await I.wait(testExecutionWaits.WAIT_FOR_TAB_LABEL_APPEAR);
      if (!(await I.isElementVisible(tVGenreFilterLocators.guideFirstTile))) {
        // assert.fail('Guide data is not loaded');
        isGenreDataLoaded = false;
        break;
      } else {
        I.reportLog('Guide Data is loaded.');
        await I.dpadRight();
      }
      isGenreDataLoaded = true;
    }
    return isGenreDataLoaded;
  },
  /**
   * Verify is Genre filters are in order
   * @return boolean - if Genre Filters are in order
   */
  async isGenreFilterInOrder() {
    let isGenreFilterInOrder;
    let getGenreFilterLabels, currentFilter, availableGenres;
    // Getting available filters from back end
    availableGenres = await genres.getGenreNames();
    getGenreFilterLabels = await I.getElementText(
      tVGenreFilterLocators.tvGuideGenreFilters
    );
    for (let i = 0; i < getGenreFilterLabels.length - 1; i++) {
      currentFilter = tvGuideGenreFilterNames[i];
      //verifying is expected filter avail
      if (availableGenres.includes(currentFilter)) {
        if (
          getGenreFilterLabels[i + 1] ===
          tvGuideGenreFilterNames[i].toLocaleUpperCase()
        ) {
          I.reportLog(
            `${getGenreFilterLabels[i + 1]} Genre Filter is in order`
          );
        } else {
          I.reportLog(
            `${getGenreFilterLabels[i + 1]} Genre Filter should be in order`
          );
          isGenreFilterInOrder = false;
          break;
        }
      } else {
        I.reportLog(`Current Filter ${currentFilter} Not available`);
        isGenreFilterInOrder = false;
        break;
      }
      isGenreFilterInOrder = true;
    }
    return isGenreFilterInOrder;
  },

  /**
   * Verify Channel count under genre filters
   * @return boolean: if any one of the genere filter of channel count should be matched
   */
  async isChannelCountMatchedInGenreFilters() {
    let getChannelCount, availableGenres, isChannelCountMatched;
    // getting available genre filters from back end
    availableGenres = await genres.getGenreNames();
    if (
      availableGenres != null &&
      availableGenres != '' &&
      availableGenres != undefined
    ) {
      for (let i = 0; i < availableGenres.length; i++) {
        await I.wait(testExecutionWaits.WAIT_FOR_3_SEC);
        // Navigate & select next genre filter
        await I.dpadRight(i + 1);
        await I.dpadOK();
        //getting genre channels count from back end
        getChannelCount = await genres.getChannelCount(availableGenres[i]);
        let channelCount = await tvGuidePage.getTotalChannels();
        if (getChannelCount === channelCount) {
          isChannelCountMatched = true;
        } else {
          isChannelCountMatched = false;
          return isChannelCountMatched;
        }
        if (channelCount > 6) {
          await I.dpadUp(channelCount);
        }
        await I.dpadBack();
      }
    }
    return isChannelCountMatched;
  },

  /**
   * Verify if genre filter is focused after navigated back from content in tv guide
   * @returns {boolean} Returns `true` if genre filters are focused , when backbutton is pressed
   * otherwise, performs assertions.
   */
  async isGenreFilterFocusedAfterPressBack() {
    // Navigate to the first channel from tv guide
    await I.wait(3);
    await this.navigateToFirstChannelInTVGuide();
    await I.dpadBack();
    if (await I.isFocused(tVGenreFilterLocators.AllChannelsGenreFilter)) {
      I.reportLog(
        ` Genre Filter is focused , after navigating back from the content in tv guide `
      );
    } else {
      assert.fail(
        ` Genre Filter is not focused , after navigating back from the content in tv guide `
      );
    }
    // All checks passed without failing assertions
    return true;
  },

  /**
   * Navigate to the first channel , when tv guide is focused
   */
  async navigateToFirstChannelInTVGuide() {
    await I.dpadDown();
  },
};
