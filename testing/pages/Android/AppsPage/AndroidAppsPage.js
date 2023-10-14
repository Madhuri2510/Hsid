const assert = require('assert');
const {I, platformName, constants} = inject();
const appsPageLocators = require('./AppsPageLocators.json');
const sportsPage = require('../SportsPage/AndroidSportsPage');
const CMP = require('../../../OnStreamBackend/cmp');
let cmp = new CMP();
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();

module.exports = {
  constants,

  /**
   * verify the property logo in My Stay Page
   * @returns {boolean} : true if Hotel Logo is seen in My Stay Page
   */
  async isOnStreamPropertyLogoSeen() {
    return await I.isElementVisible(
      appsPageLocators.onStreamPropertyLogo,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },
};
