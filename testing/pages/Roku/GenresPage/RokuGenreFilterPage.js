const assert = require('assert');
const {I} = inject();
const tVGenreFilterLocators = require('./GenreFiltersPageLocators.json');
const constants = require('../../../config/constants');
let genres = require('../../../OnStreamBackend/genres');
const { RokuLibrary } = require('../../../helpers/RokuLibrary');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
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
    return await I.isVisible(tVGenreFilterLocators.allChannels);
  },

  /**
   * Verify is Favorites tab
   * @returns True if All channels tab visible else false
   */
  async isFavoritesFilterVisible() {
    return await I.isVisible(tVGenreFilterLocators.favorites);
  },

  /**
   * Verify is sports tab
   * @returns True if sports tab visible else false
   */
  async isSportsFilterVisible() {
    return await I.isVisible(tVGenreFilterLocators.sports);
  },

  /**
   * Verify is movies tab
   * @returns True if movies tab visible else false
   */
  async isMoviesFilterVisible() {
    return await I.isVisible(tVGenreFilterLocators.movies);
  },

  /**
   * Verify is news tab
   * @returns True if news tab visible else false
   */
  async isNewsFilterVisible() {
    return await I.isVisible(tVGenreFilterLocators.news);
  },

  /**
   * Verify is news tab
   * @returns True if news tab visible else false
   */
  async isKidsFilterVisible() {
    return await I.isVisible(tVGenreFilterLocators.kids);
  },
  
  /**
   * Verify if genre filter is available
   * @returns True if all the genre filters are available
   */
  async IsGenreFiltersVisible() {
    let availableGenres;
    // Getting available filters from back end
    availableGenres = await genres.getGenreNames();
    if (
      availableGenres != null &&
      availableGenres != '' &&
      availableGenres != undefined
    ) {
      // Sports
      if (availableGenres.includes(constants.tvGuideFilters.sports)) {
        if (!(await this.isSportsFilterVisible())) {
          assert.fail('Sports filter should be visible in TvGuide');
        }
      } else {
        I.reportLog('Sports filter is present');
      }
      // Movies
      if (availableGenres.includes(constants.tvGuideFilters.movies)) {
        if (!(await this.isMoviesFilterVisible())) {
          assert.fail('Movies filter should be visible in TvGuide');
        }
      } else {
        I.reportLog('Movies filter is present');
      }
      // News
      if (availableGenres.includes(constants.tvGuideFilters.news)) {
        if (!(await this.isNewsFilterVisible())) {
          assert.fail('News filter should be visible in TvGuide');
        }
      } else {
        I.reportLog('News filter is present');
      }
      // Kids
      if (availableGenres.includes(constants.tvGuideFilters.kids)) {
        if (!(await this.isKidsFilterVisible())) {
          assert.fail('Kids filter should be visible in TvGuide');
        }
      } else {
        I.reportLog('kids filter is present');
      }
    } else {
      assert.fail(`availableGenres is: ${availableGenres}`);
    }
    return true;
  },

  /**
   * Verify If All Genre Filters Visible In Tv Guide, WithOut SignIn to application
   * @returns True if AllChannels , other genrefilters are visible
   */
  async areAllGenreFiltersVisibleInTvGuide() {
    // All channels
    if (!(await this.isAllChannelsFilterVisible())) {
      assert.fail('All Channels Filter should be visible');
    }
    // 'sports', 'movies', 'news', 'kids'
    let isVisible = await this.IsGenreFiltersVisible();
    return isVisible;
  },

  /**
   * Verify if Guide filters data loaded
   * @returns True if GenreFilters data is loaded
   */
  async isGenreDataLoaded() {
    // Genre Filters are already focused
    for (let i = 0; i < 4; i++) {
      await I.dpadNavByEcp(constants.remoteKey.ok);
      await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
      if (!(await I.isVisible(tVGenreFilterLocators.guideFirstTile))) {
        assert.fail('Guide data is not loaded');
      } else {
        I.reportLog('Guide Data is loaded.');
        await I.dpadNavByEcp(constants.remoteKey.right);
        await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
      }
    }
    return true;
  },

  /**
   * Verify if Genre filters are in order
   * @returns {boolean} Returns `true` if genre filters are in order and available; 
   * otherwise, performs assertions.
   */
  async isGenreFilterInOrder() {
    let getGenreFilterLabels, currentFilter, availableGenres;
    // Getting available filters from back end
    availableGenres = await genres.getGenreNames();
    getGenreFilterLabels = await this.getGenreElementText(
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
          assert.fail(
            `${getGenreFilterLabels[i + 1]} Genre Filter should be in order`
          );
        }
      } else {
        I.reportLog(`Current Filter ${currentFilter} Not available`);
      }
    }
    // All checks passed without failing assertions
    return true; 
  },

  /**
   * Returns the genreElementText from the locator
   */
  async getGenreElementText(genreElement)
  {
    const genreElementsText = [];
    let element = await I.getElements(genreElement);
    for( i=0; i < element.length ; i++ )
    {
        //Get the genreFilter labels text from the elementData
        genreElementsText[i] = await I.getText(element[i]);
    }
    return genreElementsText;
  },

  /**
   * Verify Channel count under genre filters
   * @returns {boolean} Returns `true` if channel count in genrefilters matches; 
   * otherwise, performs assertions.
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
      // To focus All channels
      for (let i = 0; i < availableGenres.length; i++) {

        // Navigate & select next genre filter
        await I.dpadNavByEcp(constants.remoteKey.right);
        await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
        await I.dpadNavByEcp(constants.remoteKey.ok);
        //getting genre channels count from back end
        await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
        getChannelCount = await genres.getChannelCount(availableGenres[i]);
        await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
        if (getChannelCount != null && getChannelCount != undefined) {
          for (let j = 1; j <= getChannelCount; j++) {
            if (!(await I.isVisible(tVGenreFilterLocators.guideFirstTile))) {
              assert.fail('Channels count is not matching');
            }
          }
        } else {
          assert.fail(
            `Genres Filters channels count Should not be ${getChannelCount}`
          );
        }
      }
    } else {
      assert.fail(`Available Genres Should not be ${availableGenres}`);
    }
    // All checks passed without failing assertions
    return true;    
  },

  /**
   * Navigate to the first channel , when tv guide is focused 
   */
  async navigateToFirstChannelInTVGuide(){
    await I.dpadNavByEcp(constants.remoteKey.down);
    await I.dpadNavByEcp(constants.remoteKey.down);
  },

  /**
   * Verify if genrefilter is focused after navigated back from content in tv guide
   * @returns {boolean} Returns `true` if genre filters are focused , when backbutton is pressed 
   * otherwise, performs assertions.
   */
  async isGenreFilterFocusedAfterPressBack(){

    // Navigate to the first channel from tv guide 
    await this.navigateToFirstChannelInTVGuide();
    await I.dpadNavByEcp(constants.remoteKey.back);
    if(await I.isTvGuideGenreFilterFocussed(
      constants.tvGuideGenreFilterTabs.allChannels)){
      I.reportLog(` Genre Filter is focused , after navigating back from the content in tv guide `);
    }
    else{
      assert.fail(` Genre Filter is not focused , after navigating back from the content in tv guide `);
    }
    // All checks passed without failing assertions
    return true;
  }
};
