const assert = require('assert');
const {I} = inject();
const searchPageLocators = require('./SearchPageLocators.json');
const baseSearchPage = require('../../Browser/SearchPage/BrowserSearchPage');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = Object.assign(baseSearchPage, {
  /**
   * searches the specific title
   * @param {string} keword
   */
  async search(keyword) {
    await I.waitForVisible(
      searchPageLocators.searchBox,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.fillField(searchPageLocators.searchBox, keyword);
    await I.hideDeviceKeyboard();
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    assert.ok(
      (await I.isElementVisible(searchPageLocators.onDemandLabel)) ||
        (await I.isElementVisible(searchPageLocators.tvGuideLabel)),
      `Unable to search given keyword / Failed to find result for given keyword ${keyword}.`
    );
  },

  /**
   * clears the search field
   */
  async clearSearch() {
    // let orientation = await I.getOrientation();
    // if (orientation === constants.orientation.landscape) {
    await I.wait(2);
    let searchKeyword = await I.grabAttributeFrom(
      searchPageLocators.searchBox,
      'value'
    );
    let count = 0;
    while (count < searchKeyword.toString().length) {
      await I.pressKey('Backspace');
      count++;
    }
    await I.hideDeviceKeyboard();
    // }
  },

  /**
   * verifies whether recently searched keyword is present in recent searches or not.
   * @param {string} recentlySearchKeyword
   * @returns {boolean} - returns true if recently searched keyword is present in recent searches.
   */
  async verifyRecentSearch(recentlySearchKeyword) {
    let iteration = 1;
    let isVisible = false;
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    while (iteration > 0 && iteration < 10) {
      let recentSearchesResultTitle = await I.grabTextFrom(
        searchPageLocators.recentSearchResultsInPortraitMode.replace(
          'index',
          iteration
        )
      );
      if (recentSearchesResultTitle === recentlySearchKeyword.toUpperCase()) {
        isVisible = true;
        break;
      }
      iteration++;
    }
    return isVisible;
  },

  /**
   * open from onDemand Results
   */
  async openFromOnDemandResults() {
    await I.waitForElement(
      searchPageLocators.firstResultOfOnDemand,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
    await I.scrollToElement(searchPageLocators.firstResultOfOnDemand);
    await I.click(searchPageLocators.firstResultOfOnDemand);
  },

  /**
   * clears recent searches
   */
  async clearRecentSearches() {
    await I.waitForElement(searchPageLocators.clearAllButton);
    await I.scrollToElement(searchPageLocators.clearAllButton);
    await I.click(searchPageLocators.clearAllButton);
    await I.wait(3);
  },
});
