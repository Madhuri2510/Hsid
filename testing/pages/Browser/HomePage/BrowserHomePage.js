const assert = require('assert');
const {I, sportsPage, platformName, constants} = inject();
const homePageLocators = require('./HomePageLocators.json');
const playerPageLocators = require('../PlayerPage/PlayerPageLocators.json');
const settingsPageLocators = require('../SettingsPage/SettingsPageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const CMP = require('../../../OnStreamBackend/cmp');
let cmp = new CMP();
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();

module.exports = {
  constants,
  async waitForOnStreamHomePageLaunch() {
    await I.amOnPage('/');
    await I.waitForElement(
      homePageLocators.businessLogo,
      testExecutionWaits.WAIT_FOR_HOME_LOAD
    );
  },
  async goToHomeTab() {
    await I.forceClick(homePageLocators.businessLogo);
    await I.forceClick(homePageLocators.watchIconInHomePage);
    await I.wait(3);
    await I.waitForVisible(homePageLocators.swimlaneWidgets, 10);
  },

  /**
   * Resets application to home
   */
  async resetToHome() {
    await this.goToHomeTab();
  },
};
