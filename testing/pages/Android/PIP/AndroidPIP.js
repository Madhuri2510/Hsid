const {I, playerPage} = inject();
const pipLocators = require('./PIPLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const EPG = require('../../../OnStreamBackend/epg');
let epg = new EPG();

module.exports = {
  /**
   * This method is used to invoke PIP Mode
   * Player screen should be visible before invoking this method
   */
  async invokePipMode() {
    //wait till loader dismiss
    await playerPage.waitForSpinnerToDisappear();
    await I.dpadBack();
    await I.wait(testExecutionWaits.WAIT_FOR_PIP_TO_APPEAR);
  },

  /**
   * This method is used to exit PIP Mode
   * PIP screen should be visible before invoking this method
   */
  async expandPipMode() {
    await I.dpadPlayPause();
  },

  /**
   * Checks PIP screen is visible or not
   * @returns {boolean} true if screen is visible else false
   */
  async isPipScreenVisible() {
    return await I.isElementVisible(pipLocators.pipWindowPlayerId);
  },

  /**
   * Checks TV Guide is loaded or not
   * @returns {boolean} true if screen is visible else false
   */
  async hasTVGuideLoaded() {
    // await I.dpadLeft();
    return await I.isElementVisible(pipLocators.tvGuideMenu);
  },
  /**
   * Verify if the vertical navigation while showing PIP window is working on guide
   * @returns {boolean} true if navigation is working else false
   */
  async verifyVerticalNavigationOnTVGuide(channelNum) {
    let result = true;
    let expectedTotal = await epg.getTotalChannels();
    let count = channelNum;
    while (count < expectedTotal) {
      await I.dpadDown();
      result = await this.isPipScreenVisible();
      if (!result) {
        await I.reportLog(
          'verifyVerticalNavigationOnTVGuide : PIP window should be visible'
        );
        break;
      }
      count++;
    }
    return result;
  },

  /**
   * Verify if the horizontal navigation while showing PIP window is working on guide
   * @returns {boolean} true if navigation is working else false
   */
  async verifyHorizontalNavigationOnTVGuide(channelNum) {
    let result = true;
    await I.dpadDown();
    let expectedTotal = await epg.getTotalPrograms(channelNum);
    let count = 0;
    while (count < expectedTotal) {
      await I.dpadRight();
      result = await this.isPipScreenVisible();
      if (!result) {
        await I.reportLog(
          'verifyHorizontalNavigationOnTVGuide : PIP window should be visible'
        );
        break;
      }
      count++;
    }
    return result;
  },
  /**
   * This methods exits TV Guide
   */
  async exitTVGuide() {
    await I.dpadBack();
  },
};
