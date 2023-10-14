const assert = require('assert');
const {I, constants, playerPage} = inject();
const searchPageLocators = require('./SearchPageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,

  /**
   * searches the specific title
   * @param {string} keword
   */
  async search(title) {
    await I.waitForVisible(searchPageLocators.searchBox, 10);
    await I.fillField(searchPageLocators.searchBox, title);
    await I.waitForVisible(searchPageLocators.searchLabel, 10);
    assert.ok(
      await I.isElementVisible(searchPageLocators.searchLabel),
      'Search unsuccessful'
    );
  },
  /**
   * plays a video from TV guide
   */
  async playFromTvGuideResults() {
    await I.wait(3);
    await I.waitForElement(searchPageLocators.tvGuideLabel, 10);
    await I.click(searchPageLocators.playButtonBrowser);
  },

  /**
   * open from OnDemand results
   */
  async openFromOnDemandResults() {
    await I.wait(3);
    await I.waitForElement(
      searchPageLocators.firstResultOfOnDemand,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
    await I.scrollIntoView(searchPageLocators.firstResultOfOnDemand);
    await playerPage.waitForSpinnerToDisappear();
    await I.click(searchPageLocators.firstResultOfOnDemand);
  },

  /**
   * clears the search field
   */
  async clearSearch() {
    const searchedKeyword = await I.grabValueFrom(searchPageLocators.searchBox);
    for (let i = 0; i < searchedKeyword.toString().length; i++) {
      await I.clearTextBox();
      await I.wait(1);
      return true;
    }
  },

  /**
   * verifies the Popular OnDemand label
   */
  async verifyPopularContent() {
    assert.ok(
      await I.isElementVisible(searchPageLocators.popularLabel),
      "'Popular On Demand' label should be visible"
    );
  },

  /**
   * gets count of the results
   */
  async getResultCount() {
    await I.wait(3);
    await I.waitForElement(searchPageLocators.firstResult, 10);
    return await I.grabNumberOfVisibleElements(searchPageLocators.firstResult);
  },

  /**
   * closes the dialog box
   */
  async closeModal() {
    await I.waitForElement(searchPageLocators.closeDialog, 10);
    await I.click(searchPageLocators.closeDialog);
  },

  /**
   * verifies whether recently searched keyword is present in recent searches or not.
   * @param {string} recentlySearchKeyword
   * @returns {boolean} - returns true if recently searched keyword is present in recent searches.
   */
  async verifyRecentSearch(title) {
    let iteration = 1,
      isVisible = false;
    await I.wait(3);
    while (iteration > 0 && iteration < 10) {
      I.wait(5);
      await I.reportLog('Inside while loop');
      if (await I.isElementVisible(searchPageLocators.recentSearchResults)) {
        await I.reportLog('element found and is visible');
        let assetTitle = await I.grabTextFrom(
          searchPageLocators.recentSearchResults
        );
        if (assetTitle === title.toUpperCase()) {
          await I.reportLog('Inside if ' + assetTitle + ' ' + title);
          isVisible = true;
          break;
        }
      }
      iteration++;
    }
    return isVisible;
  },

  /**
   * verifies the search results to check the whether search result count is same or not.
   * @param {number} resultCount
   */
  async verifySearchResults(resultCount) {
    let latestCount = await this.getResultCount();
    assert.equal(
      latestCount == resultCount,
      'Latest count is not same as Result count'
    );
  },

  /**
   * cleares recent searches
   */
  async clearRecentSearches() {
    await I.waitForElement(searchPageLocators.clearAllButton);
    await I.click(searchPageLocators.clearAllButton);
  },

  /**
   * verifies contents to check the title
   * @param {titleDetails} titleDetails
   */
  async verifyContentDetails(titleDetails) {
    await I.wait(10);
    let title = await I.grabTextFrom(searchPageLocators.dialogTitle);
    console.log('title is', title);
    let classification = await I.grabTextFrom(
      searchPageLocators.dialogClassification
    );
    let overview = await I.grabTextFrom(searchPageLocators.overview);
    console.log('title details grabbed are', title, classification, overview);
    assert.ok(
      title.includes(titleDetails.title),
      'Content details does not have title'
    );
    assert.ok(
      classification.includes(titleDetails.classification),
      'Content details does not have classification'
    );
    //assert(overview.includes(titleDetails.overview));
    assert.ok(
      await I.isElementVisible(searchPageLocators.overview),
      'Overview of the program should be seen'
    );
    await I.click(searchPageLocators.closeDialog);
    return true;
  },

  /**
   * verifies whether recent search is visible or not
   */
  async isRecentSearchesVisible() {
    await I.wait(3);
    return await I.isElementVisible(searchPageLocators.recentSearchesTitle);
  },

  /**
   * clicks first tile of TV Guide swimlane in search tab
   */
  async openTvGuideResult() {
    await I.waitForVisible(
      searchPageLocators.firstResultOfTvGuide,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
    await I.click(searchPageLocators.firstResultOfTvGuide);
    await I.wait(2);
    return true;
  },

  async goToSearchTab() {
    await I.forceClick(searchPageLocators.searchHeader);
    await I.wait(3);
  },
};
