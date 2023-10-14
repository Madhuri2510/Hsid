const assert = require('assert');
const {I, constants} = inject();
const navbarMenuLocators = require('./NavbarLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const CMP = require('../../../OnStreamBackend/cmp.js');
let cmp = new CMP();

module.exports = {
  async navigateToNavBar() {
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if (await I.isElementVisible(navbarMenuLocators.hamburgerMenuIcon)) {
      await I.click(navbarMenuLocators.hamburgerMenuIcon);
    } else {
      await I.reportLog('No Hamburger menu found');
    }
  },

  async clickOnHomePageTile() {
    //todo - make it more generic method while implementing homePage test cases. time being it's used
    await I.waitForElement(
      navbarMenuLocators.watchIconInHomePage,
      testExecutionWaits.WAIT_FOR_SPINNER_TO_DISAPPEAR
    );

    if (await I.isElementVisible(navbarMenuLocators.watchIconInHomePage)) {
      await I.click(navbarMenuLocators.watchIconInHomePage);
    } else {
      I.reportLog('Watch tile is not present on home page');
    }
  },

  async navigateTo(menuItem) {
    await this.navigateToNavBar();
    let navBarOrder = await cmp.getNavBarOrder();
    positionOfDesiredMenuItem = navBarOrder.indexOf(menuItem) + 1;
    await I.forceClick(
      navbarMenuLocators.menuLocator + '[' + positionOfDesiredMenuItem + ']'
    );
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.reportLog('Clicked on menu Item');
  },

  async closeCastModal() {
    if (await I.isElementVisible(navbarMenuLocators.closeButtonInCast)) {
      await I.click(navbarMenuLocators.closeButtonInCast);
      await I.reportLog('Closed cast modal');
    } else {
      await I.reportLog('Close button in cast should be present ');
    }
  },
};
