const assert = require('assert');
const {I, constants} = inject();
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const tVGenreFilterLocators = require('./GenreFiltersPageLocators.json');
let genres = require('../../../OnStreamBackend/genres');
let tvGuideGenreFilterNames = [
  // Please don't change the order, incase of any changes make sure that following TV Guide order
  'All channels',
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
      tVGenreFilterLocators.tvGuideAllChannelFilter,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
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
    currentFilter = tvGuideGenreFilterNames[index - 1];
    //verifying is expected filter avail
    if (availableGenres.includes(currentFilter)) {
      return currentFilter;
    } else {
      I.reportLog(`Current Filter ${currentFilter} Not available`);
    }
  },

  /**
   * Verify is Genre filters available
   */
  async areGenreFiltersVisible() {
    let availableGenreFilter;
    let isGenreFilterAvailable;
    for (let i = 1; i < 6; i++) {
      availableGenreFilter = await this.getAvailableGenreFilters(i);
      //verifying is expected filter avail
      if (availableGenreFilter != null && availableGenreFilter !== undefined) {
        availableGenreFilter = availableGenreFilter.toUpperCase();
        let genreFilterFromPage = await I.grabTextFrom(
          tVGenreFilterLocators.tvGuideGenreFilters.replace(constants.index, i)
        );

        if (genreFilterFromPage === availableGenreFilter) {
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
   */
  async isGenreDataLoaded() {
    let isGenreDataLoaded;
    for (let i = 0; i < 6; i++) {
      await I.wait(testExecutionWaits.WAIT_FOR_TAB_LABEL_APPEAR);
      if (!(await I.isElementVisible(tVGenreFilterLocators.guideFirstTile))) {
        // assert.fail('Guide data is not loaded');
        isGenreDataLoaded = false;
        break;
      } else {
        I.reportLog('Guide Data is loaded.');
      }
      isGenreDataLoaded = true;
    }
    return isGenreDataLoaded;
  },
  /**
   * Verify is Genre filters are in order
   */
  async isGenreFilterInOrder() {
    let isGenreFilterInOrder;
    let getGenreFilterLabels, currentFilter, availableGenres;
    // Getting available filters from back end
    availableGenres = await genres.getGenreNames();
    getGenreFilterLabels = await I.grabTextFrom(
      tVGenreFilterLocators.tvGuideGenreFiltersWithoutIndex
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
   */
  async isChannelCountMatchedInGenreFilters() {
    let getChannelCount, availableGenres;
    // getting available genre filters from back end
    availableGenres = await genres.getGenreNames();
    if (
      availableGenres != null &&
      availableGenres != '' &&
      availableGenres != undefined
    ) {
      for (let i = 0; i < availableGenres.length; i++) {
        let isChannelCountMatched;
        await I.wait(testExecutionWaits.WAIT_FOR_3_SEC);
        // Navigate & select next genre filter
        await I.dpadRight();
        await I.dpadOK();
        //getting genre channels count from back end
        getChannelCount = await genres.getChannelCount(availableGenres[i]);
        if (getChannelCount != null && getChannelCount != undefined) {
          for (let j = 1; j <= getChannelCount; j++) {
            if (
              !(await I.isElementVisible(
                `${tVGenreFilterLocators.liveProgramImage}${j}]`
              ))
            ) {
              isChannelCountMatched = false;
              return isChannelCountMatched;
            }
          }
        } else {
          assert.fail(
            `Genres Filters channels count Should not be ${getChannelCount}`
          );
        }
      }
      isChannelCountMatched = true;
    } else {
      assert.fail(`Available Genres Should not be ${availableGenres}`);
    }
    return isChannelCountMatched;
  },
};
