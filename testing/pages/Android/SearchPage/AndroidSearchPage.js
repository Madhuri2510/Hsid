const assert = require('assert');
const {I, constants} = inject();
const searchPageLocators = require('./SearchPageLocators.json');
const watchPageLocators = require('../WatchPage/WatchPageLocators.json');
const onDemandPageLocators = require('../OnDemandPage/OnDemandPageLocators.json');
const classicGuideLocators = require('../TVGuidePage/TvGuidePageLocators.json');
const watchPage = require('../WatchPage/AndroidWatchPage');
const playerPage = require('../PlayerPage/AndroidPlayerPage');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,
  /**
   * This Method plays video from TV Guide results
   */
  async playFromTvGuideResults() {
    await I.waitForElement(searchPageLocators.tvGuideLabel, 10);
    await this.goToTvGuideFirstTile();
    await I.dpadOK();
    await playerPage.verifyVideoStarted();
  },

  /**
   * open from OnDemand results
   */
  async openFromOnDemandResults() {
    await this.goToOnDemandFirstTile();
    await I.waitForElement(searchPageLocators.onDemandLabel, 15);
    await I.dpadOK();
    await I.wait(2);
    await I.waitForElement(onDemandPageLocators.contentTitle, 10);
  },

  /**
   * clears the search field
   */
  async clearSearch() {
    await I.dpadLeft();
    let searchText = await I.grabTextFrom(searchPageLocators.searchBox);
    let searchTextLength = searchText.length;
    await I.dpadOK(searchTextLength);
    return await I.isElementVisible(searchPageLocators.searchBox);
  },

  /**
   * verifies the Popular OnDemand label
   */
  async verifyPopularContent() {
    return await I.isElementVisible(searchPageLocators.popularLabel);
  },

  /**
   * gets count of the results
   */
  async getResultCount() {
    //await I.waitForElement(searchPageLocators.firstResult);
    await I.waitForElement(searchPageLocators.onDemandFirstTile);
    assert.ok(
      await I.isElementVisible(searchPageLocators.onDemandFirstTile),
      'OnDemand first tile is not visible'
    );
    await this.goToOnDemandFirstTile();
    return await I.grabNumberOfVisibleElements(searchPageLocators.firstResult);
  },
  /**
   * closes the dialog box
   */
  async closeModal() {
    await I.dpadBack();
    await I.waitForElement(
      searchPageLocators.searchBox,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    I.reportLog('Landed to Search page');
  },

  /**
   *
   * @param {String} title: Slasher
   * @returns True if recent asset tile finds in Recent Searches
   */
  async verifyRecentSearch(title) {
    isFound = false;
    title= title.trim();
    await this.goToFirstRecentSearchText();
    if (!(await I.isFocused(searchPageLocators.clearSearchBtn))) {
      let recentSearch = await I.getTextAttribute(
        searchPageLocators.recentSearchFirstResult
      );
      if (recentSearch[0].includes(title)) {
        isFound = true;
      }
    } else {
      I.reportLog(Title, 'Not found in Recent Searches');
    }
    return isFound;
  },

  /**
   * navigates to search tab
   */
  async goToSearchTab() {
    await watchPage.getFocusOnNavigationMenu();
    let retry = 0;
    if (
      (await I.isFocused(watchPageLocators.homeIcon)) ||
      (await I.isFocused(watchPageLocators.tvGuideIcon))
    ) {
      while (
        (await I.isFocused(watchPageLocators.searchIcon)) === false &&
        retry < 5
      ) {
        await I.dpadRight();
        retry++;
      }
      await I.dpadOK();
    } else if (await I.isFocused(watchPageLocators.settingsIcon)) {
      while (
        (await I.isFocused(watchPageLocators.searchIcon)) === false &&
        retry < 5
      ) {
        await I.dpadLeft();
        retry++;
      }
      await I.dpadOK();
    } else {
      await I.dpadOK();
    }
    await I.waitForElement(searchPageLocators.searchBox, 10);
  },

  /**
   * selects first search result
   */

  async goToFirstRecentSearchText() {
    if (await I.isFocused(searchPageLocators.keyBoardItemKeyDelete)) {
      await I.dpadDown();
    } else {
      await I.dpadLeft(2);
      await I.dpadDown();
      await I.wait();
    }
    assert.ok(
      await I.isFocused(searchPageLocators.recentSearchFirstResult),
      'First result of recent search is not visible'
    );
  },
  /**
   * verifies the search results to check the whether search result count is same or not.
   * @param {number} resultCount
   */
  async verifySearchResults(resultCount) {
    let latestCount = await this.getResultCount();
    assert.equal(
      latestCount == resultCount,
      'Latest count is not same as the result count'
    );
  },

  /**
   * Clears Recent Searches
   */
  async clearRecentSearches() {
    while (!(await I.isFocused(searchPageLocators.clearSearchBtn))) {
      await I.dpadDown();
    }
    await I.dpadOK();
  },

  /**
   * verifies contents to check the title
   * @param {titleDetails} titleDetails
   */
  async verifyContentDetails(titleDetails) {
    await I.wait(10);
    let title = await I.grabTextFrom(onDemandPageLocators.contentTitle);
    console.log('title is', title);
    let classification = await I.grabTextFrom(
      onDemandPageLocators.contentRating
    );
    let overview = await I.grabTextFrom(
      onDemandPageLocators.contentDescription
    );
    I.reportLog(
      'title details grabbed are : ',
      title,
      classification,
      overview
    );
    assert.ok(
      title.includes(titleDetails.title),
      'Title is not present in content details'
    );
    assert.ok(
      classification.includes(titleDetails.classification),
      'Classification is not present in content details'
    );
    return true;
  },

  /**
   * searches the specific title
   * @param {string} keword
   */
  async search(term) {
    await I.isElementVisible(searchPageLocators.searchBox);
    await I.fillField(searchPageLocators.searchBox, term);
  },
  /**
   * selects the first tile of TV Guide
   */
  async goToTvGuideFirstTile() {
    await I.dpadRight(6);
    await I.waitForElement(searchPageLocators.tvGuideLabel, 10);
    if ((await I.isFocused(searchPageLocators.tvGuideFirstTile)) === false) {
      await I.dpadDown();
    }
  },

  /**
   * This method selects first tile in OnDemand
   */
  async goToOnDemandFirstTile() {
    await I.dpadDown();
    await I.dpadRight(6);
    await I.waitForElement(searchPageLocators.onDemandLabel, 15);
    if ((await I.isFocused(searchPageLocators.onDemandFirstTile)) === false) {
      await I.dpadDown();
    }
  },

  /**
   * Selects first tile of search result
   */
  async selectFirstSearchTile() {
    await this.goToSearchTab();
    await I.dpadDown();
    await I.wait(1);
    await I.dpadRight(6);
    await I.dpadOK();
  },

  /**
   * verify Recent Searches Visible
   * @returns true if Recent Searches Visible
   */
  async isRecentSearchesVisible() {
    return await I.isElementVisible(searchPageLocators.recentSearchFirstResult);
  },

  /**
   * verify No Result data
   * @returns true if No Result data seen else false
   */
  async isNoResultSeen() {
    let isVisible = true;
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    if (!(await I.isElementVisible(searchPageLocators.warningImage))) {
      isVisible = false;
      I.reportLog('Warning Image should be visible');
    }
    if (!(await I.isElementVisible(searchPageLocators.errorTitle))) {
      isVisible = false;
      I.reportLog('Error Title should be visible');
    }
    if (!(await I.isElementVisible(searchPageLocators.errorDescription))) {
      isVisible = false;
      I.reportLog('Error Description should be visible');
    }
    return isVisible;
  },
  /**
   * verifies contents to check the channel name
   * @param {titleDetails} titleDetails
   */
  async verifyContentDisplayed() {
    await I.waitForVisible(searchPageLocators.tvGuideLabel, 10);
    await I.isElementVisible(searchPageLocators.tvGuideLabel);
    await I.isElementVisible(searchPageLocators.tvGuideFirstTile);
    await I.dpadDown();
    while (!(await I.isFocused(searchPageLocators.tvGuideFirstTile))) {
      await I.dpadRight();
    }
    await I.dpadOK();
  },
  /**
   * This Method opens video from TV Guide results
   * @returns {boolean} - returns true if video is played from TV Guide Search results
   */
  async openTvGuideResult() {
    await this.playFromTvGuideResults();
    return true;
  },
};
