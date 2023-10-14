const assert = require('assert');
const {I, constants} = inject();
const navbarLocators = require('./NavbarLocators.json');
const CMP = require('../../../OnStreamBackend/cmp.js');
let cmp = new CMP();
const tileNames = ['Watch', 'Hotel Info', 'Search', 'My Stay', 'Settings'];
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits.js');

module.exports = {
  /**
   * Method to click on home page tile
   *  @param {string} tile
   */
  async clickOnHomePageTile(tile) {
    let index = tileNames.indexOf(tile);
    await I.dpadLeft(index);
    await I.dpadOK();
  },
  /**
   * Navigate to Left Navigation Bar
   */
  async navigateToNavBar() {
    if (await I.isElementVisible(navbarLocators.focusedMenuItem)) {
      return;
    }
    let retry = 0;
    while (
      !(await I.isElementVisible(navbarLocators.focusedMenuItem)) &&
      retry < constants.maxNoOfWidgets
    ) {
      await I.dpadBack();
      retry++;
    }
  },

  async getFocusedMenuItem() {
    await this.navigateToNavBar();
    let focusedMenuItem = await I.getTextAttribute(
      navbarLocators.focusedMenuItem
    );
    return focusedMenuItem[0];
  },

  async getPositionOfFocusedMenuItem() {
    let focusedMenuItem = await this.getFocusedMenuItem();
    let navBarItems = await cmp.getNavBarOrder();
    let position = navBarItems.indexOf(focusedMenuItem) + 1;
    if (position === 0) {
      console.log('nav bar item not found');
    }
    return position;
  },

  async navigateTo(menuItem) {
    await this.navigateToNavBar();
    let navBarOrder = await cmp.getNavBarOrder();
    let positionCurrentMenuItem = await this.getPositionOfFocusedMenuItem();
    let positionOfDesiredMenuItem = navBarOrder.indexOf(menuItem) + 1;
    if (positionCurrentMenuItem - positionOfDesiredMenuItem === 0) {
      await I.dpadOK();
    } else if (positionCurrentMenuItem - positionOfDesiredMenuItem > 0) {
      let dpadTaps = positionCurrentMenuItem - positionOfDesiredMenuItem;
      I.dpadUp(dpadTaps);
      await I.dpadOK();
    } else {
      let dpadTaps = positionOfDesiredMenuItem - positionCurrentMenuItem;
      I.dpadDown(dpadTaps);
      await I.dpadOK();
    }
  },
};
