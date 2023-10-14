const assert = require('assert');
const {I, constants} = inject();
const searchPageLocators = require('./SearchPageLocators.json');
const constantsRoku = require('../../../config/constantsRoku');
const watchPage = require('../WatchPage/RokuWatchPage');
const logger = require('../../../utils/LogUtils').getLogger('RokuSettingsPage');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits.js');
const CLEARBUTTON_TEXT = '';
const SPACEBUTTON_TEXT = 'SPACE';
const CLEARALL_TEXT = 'CLEAR SEARCH';

module.exports = {
  constants,
  /**
   * General method
   */
  async search(title) {
    logger.debug(`[search]: ${title}`);
    await I.typeTextByEcp(title);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await this.moveToLastElements(SPACEBUTTON_TEXT, CLEARBUTTON_TEXT);
    await this.moveToPlayerStep();
  },

  async openFromOnDemandResults() {
    //On Demand is not support this sprint so verify the result on search page.
    await I.dpadNavByEcp(constants.remoteKey.ok);
    let popUpWindow = await I.isVisible(searchPageLocators.labelControl);
    assert.ok(popUpWindow, 'The search results is not visible');
  },

  // Checks if recent searches are visible  : Returns boolean
  async isRecentSearchesVisible() {
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    let recentSearchCount = await I.getAttribute(searchPageLocators.recentSearchLabel,'count');
    return recentSearchCount<=0?false:true;
  },

  async closeModal() {
    await I.dpadNavByEcp(constants.remoteKey.back);
    assert.ok(
      await I.isVisible(searchPageLocators.search),
      'Can not close model player'
    );
  },

  /**
   * click on program found from search results. Returns boolean
   */
  async playFromTvGuideResults() {
    await I.waitForElementVisible(searchPageLocators.SearchLiveChannelItem);
    if (
      (await I.isVisible(searchPageLocators.SearchLiveChannelItem)) &&
      (await I.getAttribute(
        searchPageLocators.SearchWrapperItem,
        'focused'
      )) !== 'true'
    ) {
      await I.dpadNavByEcp(constants.remoteKey.right);
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
    let infoView = await I.isVisible(searchPageLocators.infoView);
    assert.ok(infoView, 'The search results is not visible');
    let watchNowButton = await I.isVisible(searchPageLocators.watchNowButton);
    assert.ok(watchNowButton, 'Watch Now Button is not visible');
    await I.dpadNavByEcp(constants.remoteKey.ok);
    
    return true;
  },

  /**
   * Get data method
   */

  async getRecentSearchResult() {
    await watchPage.goToSearchTab();
    await this.moveToLastElements(SPACEBUTTON_TEXT, CLEARBUTTON_TEXT);
    await I.dpadNavByEcp(constants.remoteKey.right);
    return await I.getTextInContainer();
  },

  async getFirstTrendingProgram(title) {
    let dynamicTitleLocator = searchPageLocators.title;
    dynamicTitleLocator.elementData[0].value = title;
    let popularContent = await I.isVisible(dynamicTitleLocator);
    return popularContent;
  },

  async getFirstTVGuideProgram() {
    await watchPage.goToTVGuideTab();
    await I.dpadNavByEcp(constants.remoteKey.down);
    await I.selectProgramAbleToPlay();
    return await I.getTextInContainer();
  },

  /**
   * Clear data method
   */

  async clearSearch(titleDetails) {
    await I.dpadNavByEcp(constants.remoteKey.up);
    const textLength = titleDetails.length;
    await I.dpadNavByEcp(constants.remoteKey.ok, textLength);
    return await this.isSearchCleared();
  },

  async clearRecentSearch() {
    await I.waitForElementVisible(searchPageLocators.clearAll);
    await this.moveToLastElements(SPACEBUTTON_TEXT, CLEARBUTTON_TEXT);
    await I.dpadNavByEcp(constants.remoteKey.right, 2);
    await I.dpadNavByEcp(constants.remoteKey.ok);
    assert.ok(!this.isRecentSearchesVisible(), 'Can not clear recent search');
  },

  async clearRecentSearches() {
    let retry = 0;
    await I.waitForElementVisible(searchPageLocators.clearAll);
    if (await I.isVisible(searchPageLocators.clearAll)) {
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    // await I.dpadNavByEcp(constants.remoteKey.up);
    while (
      !(await I.isElementFocused(CLEARALL_TEXT)) &&
      retry < constantsRoku.numberRetry
    ) {
      if (await I.isElementFocused(CLEARALL_TEXT)) {
        break;
      }
      await I.dpadNavByEcp(constants.remoteKey.down);
      retry++;
    }
    if (await I.isElementFocused(CLEARALL_TEXT)) {
      await I.dpadNavByEcp(constants.remoteKey.ok);
    }
  },

  /**
   * Verify method
   */

  async verifyPopularContent(title) {
    let popularContent = await this.getFirstTrendingProgram(title);
    assert.ok(popularContent, 'Popular content should be visible');
  },

  async verifyRecentSearch(title) {
    let titleDetails = title.toUpperCase().trim();
    let isFound = false ; 
    await I.waitForElementVisible(searchPageLocators.recentSearchGroup);
    let recentSearchGroupElement = await I.getElements(
      searchPageLocators.recentSearchGroup
    );
    let firstValRecentSearch = await I.getText(
      recentSearchGroupElement[0].Nodes[2]
    );
    firstValRecentSearch = firstValRecentSearch.trim();
    if (titleDetails.includes(firstValRecentSearch)) {
      isFound = true;
    }
    assert.ok(isFound,'Recent Search not display right program');
    return isFound;
  },

  /**
   * Moving step by step method
   */

  async moveToLastElements(button1, button2, numberRetry = 10) {
    let retry = 0;
    while (
      !(
        (await I.isElementFocused(button1, 0)) ||
        (await I.isElementFocused(button2, 0))
      ) &&
      retry < numberRetry
    ) {
      if (await I.isElementFocused(button2, 0)) {
        break;
      }
      await I.dpadNavByEcp(constants.remoteKey.down);
      retry++;
    }
    if (await I.isElementFocused(button1, 0)) {
      await I.dpadNavByEcp(constants.remoteKey.right);
    }
  },

  // dpad right will always focus to tv guide search results if the focus is on recent search or on backspace
  async moveToPlayerStep() {
      await I.dpadNavByEcp(constants.remoteKey.right);
  },

  async openTvGuideResult() {
    return await this.playFromTvGuideResults();
  },

  // Checks if the search title is cleared or not : Returns boolean 
  async isSearchCleared(){
    return await I.isVisible(searchPageLocators.SearchForLiveContent)?true:false;
  },

  // Checks if the live content is display or not
   /**
   * verify No Result data
   * @returns true if No Result data seen else false
   */
  async isNoResultSeen() {
    let isVisible = false;
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    let noSearchElements = await I.getElements(searchPageLocators.noSearchResult);
    if(noSearchElements.length!=0 && (await I.isVisible(searchPageLocators.errorDescription))){
      isVisible=true;
    }
    assert.ok(isVisible,' Warning Image,Error Title,Error description should be visible ');
    return isVisible;
  },
  /**
   * verifies contents to check the channel name
   * @param {titleDetails} titleDetails
   */
  async verifyContentDisplayed() {
    await I.waitForElementVisible(searchPageLocators.SearchLiveChannelItem);
    if (
      (await I.isVisible(searchPageLocators.SearchLiveChannelItem)) &&
      (await I.getAttribute(
        searchPageLocators.SearchWrapperItem,
        'focused'
      )) !== 'true'
    ) {
      await I.dpadNavByEcp(constants.remoteKey.right);
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
    let infoView = await I.isVisible(searchPageLocators.infoView);
    assert.ok(infoView, 'The search results is not visible');
  }
};
