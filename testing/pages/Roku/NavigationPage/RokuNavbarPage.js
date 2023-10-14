const assert = require('assert');
const {I, constants} = inject();
const navbarLocators = require('./NavbarLocators.json');
const tileName = ['Watch', 'Hotel Info', 'My Stay', 'Settings'];
const watchPageLocators = require('../WatchPage/WatchPageLocators.json');

module.exports = {
  constants,
  /**
   * Method to click on home page tile
   *  @param {string} tile
   */
  async clickOnHomePageTile(tile) {
    for (let i = 0; i < tileName.length; i++) {
      if (tile === tileName[i]) {
        await I.dpadNavByEcp(constants.remoteKey.left, i);
        await I.dpadNavByEcp(constants.remoteKey.ok);
        break;
      }
    }
  },

  /**
   * Navigate to Left Navigation Bar from any tile (Navigation Bar is expanded)
   */
  async navigateToNavBar() {
    let retry = 0;
    while (
      !(await I.isFocusOnElementByAttr(navbarLocators.navigationMenuLeft)) &&
      retry < constants.maxNoOfWidgets
    ) {
      await I.pressBackButton();
      retry++;
    }
  },

  /**
   *  Get LeftNavigationBar elements in order
   *  Store the NavBar elements data into an array
   */
  async getNavBarElements(elementData) {
    let element = await I.getElements(elementData);
    const leftNavBarElements = [];
    for (let i = 0; i < element.length; i++) {
      leftNavBarElements[i] = await I.getText(element[i]);
    }
    return leftNavBarElements;
  },

  /**
   *  Get Focused Navigation Bar Tab element
   *  Retrieve the focused tabElement and return the focusedElementText
   */
  async getFocusedNavBarElement() {
    let focusedNavBarElement = null;
    if (await I.isFocusOnElementByAttr(navbarLocators.searchFocused))
      focusedNavBarElement = constants.navigationMenu.search;
    else if (await I.isFocusOnElementByAttr(navbarLocators.homeFocused))
      focusedNavBarElement = constants.navigationMenu.home;
    else if (await I.isFocusOnElementByAttr(navbarLocators.watchFocused))
      focusedNavBarElement = constants.navigationMenu.watch;
    else if (await I.isFocusOnElementByAttr(navbarLocators.tvGuideFocused))
      focusedNavBarElement = constants.navigationMenu.tvGuide;
    else if (await I.isFocusOnElementByAttr(navbarLocators.myStayFocused))
      focusedNavBarElement = constants.navigationMenu.myStay;
    else if (await I.isFocusOnElementByAttr(navbarLocators.settingsFocused))
      focusedNavBarElement = constants.navigationMenu.settings;
    else if (await I.isFocusOnElementByAttr(navbarLocators.hotelInfoFocused))
      focusedNavBarElement = constants.navigationMenu.hotelInfo;

    return focusedNavBarElement;
  },

  /**
   *  Navigate to the given tab
   */
  async navigateTo(navigationTab) {
    await this.navigateToNavBar();
    // Get the LeftNavBar tab elements in order
    let navigationElements = await this.getNavBarElements(
      watchPageLocators.navigationHeaderText
    );
    await this.exitNavBar();
    let focusedElement = await this.getFocusedNavBarElement();
    if (focusedElement != navigationTab) {
      let retry = 0;
      let first = null,
        second = null;
      // Traverse through the navbar elements order & store the indexes of focusedTab element & tabElement(navigated to)
      // in first & second respectively
      while (retry < navigationElements.length) {
        if (first === null && navigationElements[retry] === focusedElement)
          first = retry;
        if (second === null && navigationElements[retry] === navigationTab)
          second = retry;
        if (first != null && second != null) break;
        retry++;
      }
      // Navigate to NavBar
      await this.navigateToNavBar();
      //// Difference of the indexes is the number of dpad ups or downs from the focused tab
      let status =
        first - second >= 0
          ? await I.dpadNavByEcp(constants.remoteKey.up, first - second)
          : await I.dpadNavByEcp(
              constants.remoteKey.down,
              (first - second) * -1
            );
      await I.dpadNavByEcp(constants.remoteKey.ok);
      // Validating if the respective tab is selected or not .
      let checkfocused = await this.getFocusedNavBarElement();
      if (checkfocused != navigationTab)
        assert.fail('Navigation to selected tab failed , Please try again!');
    } else assert.ok('You are already on the selected tile!!!');
  },

  /**
   *  Exiting from the left navigation bar ( Navigation bar is collapsed)
   */
  async exitNavBar() {
    let retry = 0;
    while (
      (await I.isFocusOnElementByAttr(navbarLocators.navigationMenuLeft)) &&
      retry < constants.maxNoOfWidgets
    ) {
      await I.dpadNavByEcp(constants.remoteKey.right);
      retry++;
    }
  },
};
