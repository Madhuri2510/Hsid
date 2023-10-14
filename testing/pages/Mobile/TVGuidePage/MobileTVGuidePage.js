const assert = require('assert');
const {I, constants} = inject();
const homePageLocators = require('../WatchPage/WatchPageLocators.json');
const classicGuideLocators = require('./TVGuidePageLocators.json');
const baseOnStreamClassGuidePage = require('../../Browser/TVGuidePage/BrowserTVGuidePage');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = Object.assign(baseOnStreamClassGuidePage, {
  /**
   * verify the time schedule bar in classic guide page
   * @returns {boolean} true if visible else false
   */
  async isTimeScheduleBarSeen() {
    let scheduleBarSeen = false;
    scheduleBarSeen = await I.isElementVisible(
      classicGuideLocators.timeScheduleBar
    );
    if (!scheduleBarSeen) {
      await I.reportLog('Time Schedule bar should be seen');
    }
    return scheduleBarSeen;
  },

  /**
   * verify the classic guide page
   * @returns {boolean} true if visible else false
   */
  async verifyClassicGuidePage() {
    let isClassicGuidePage = false;
    if (await this.isTimeScheduleBarSeen()) {
      isClassicGuidePage = true;
    } else {
      await I.reportLog(
        'tvGuidePage : verifyClassicGuidePage : Time Schedule bar should be seen'
      );
    }
    return isClassicGuidePage;
  },

  /**
   * verify the classic guide page
   * @returns {boolean} true if visible else false
   */
  async verifyTvGuideIsHighlighted() {
    assert.ok(
      (await I.grabCssPropertyFrom(
        homePageLocators.tvGuide,
        constants.guide.colorLabel
      )[0]) === constants.whiteColor,
      'Title color should be white.'
    );
    assert.ok(
      (await I.grabCssPropertyFrom(
        homePageLocators.tvGuide,
        constants.guide.fontWeight
      )[0]) === constants.bold,
      'Title font should be bold'
    );
    I.reportLog('TV Guide title is White, Bold and Highlighted');
  },

  /**
   * verifies if channel logo is on left of the page
   */
  async verifyChannelLogos() {
    let channelNum = await baseOnStreamClassGuidePage.getRandomChannel();
    let backgroundImageLocator =
      classicGuideLocators.channelLogos + `[${channelNum}]`;
    await I.waitForElement(
      `${classicGuideLocators.channelLogos}[${channelNum}]`
    );
    await I.scrollIntoViewToElement(
      `${classicGuideLocators.channelLogos}[${channelNum}]`
    );
    let backgroundImage = await I.grabAttributeFrom(
      backgroundImageLocator,
      'src'
    );
    assert.ok(
      backgroundImage.toString().includes(constants.guide.png),
      'TV Guide Channel does not have logo with png'
    );
  },

  /**
   * click on the play icon
   * @param {number} channelInput - channel no
   */
  async clickPlayButton(channelInput = undefined) {
    let channelNum;
    if (channelInput != undefined) {
      channelNum = channelInput;
    } else {
      channelNum = await this.getRandomChannel();
    }
    await I.waitForElement(
      classicGuideLocators.playButton + `[${channelNum}]`,
      testExecutionWaits.WAIT_FOR_GUIDE_LOAD
    );
    await I.scrollIntoViewToElement(
      classicGuideLocators.playButton + `[${channelNum}]`
    );
    await I.click(classicGuideLocators.playButton + `[${channelNum}]`);
    await I.reportLog(`Clicked on channel number ${channelNum}`);
  },

  /**
   * To play the show with rating
   * @param {integer} rating - rating of the show
   * @returns {boolean} - true if played else false
   */
  async playShowWithRating(rating) {
    await baseOnStreamClassGuidePage.waitForGuidePageToLoadInClassicFormat();
    let currentProgramCount = await I.grabNumberOfVisibleElements(
      classicGuideLocators.playButton
    );
    for (let channelNum = 1; channelNum <= currentProgramCount; channelNum++) {
      await I.reportLog('CH NO: ' + channelNum);
      await I.scrollIntoViewToElement(
        classicGuideLocators.currentShowTitle + `[${channelNum}]`
      );
      await I.click(classicGuideLocators.currentShowTitle + `[${channelNum}]`);
      await I.wait(testExecutionWaits.WAIT_FOR_1_SEC);
      let currentRating;
      if (await I.isElementVisible(classicGuideLocators.infoCardTimeRating)) {
        currentRating = await (
          await I.grabTextFrom(classicGuideLocators.infoCardTimeRating)
        ).split('•')[1];
      } else {
        await I.forceClick(classicGuideLocators.closeInfoCard);
        await I.reportLog('CLOSED CONTENT UNAVAILABLE MODAL');
        continue;
      }
      if (currentRating == undefined) {
        currentRating = constants.guide.unrated;
      }
      currentRating = currentRating.trim();
      if (currentRating == rating) {
        await I.click(classicGuideLocators.infoCardWatchNow);
        return [true, channelNum];
      }
      await I.forceClick(classicGuideLocators.closeInfoCard);
      await I.wait(testExecutionWaits.WAIT_FOR_1_SEC);
    }
    await I.reportLog('NO SHOW FOUND, SKIPPING ' + rating + ' RATING TESTS');
    return [false, 0];
  },

  /**
   * To verify the play buttons are visible
   */
  async verifyPlayButtonVisible() {
    let channelCount = await this.getTotalChannels();
    let playIcons = await I.grabNumberOfVisibleElements(
      classicGuideLocators.playButton
    );
    assert.equal(
      channelCount,
      playIcons,
      'ChannelCount is not equal to PlayIcons'
    );
    I.reportLog('TV Guide Play buttons visible for all channels');
  },

  async getTotalChannels() {
    let totalChannels = 1;
    while (
      await I.isElementVisible(
        `${classicGuideLocators.channelLanes}[${totalChannels}]`
      )
    ) {
      await I.scrollIntoViewToElement(
        `${classicGuideLocators.channelLanes}[${totalChannels}]`
      );
      totalChannels++;
    }
    await I.scrollIntoViewToElement(`${classicGuideLocators.channelLanes}[1]`);
    return totalChannels - 1;
  },

  /**
   * To verify the total channels is same as expected count
   * @param {number} expectedCount - expected no of channels
   */
  async verifyTotalChannelsCount(expectedCount) {
    assert.strictEqual(
      expectedCount,
      await this.getTotalChannels(),
      'Expect count is not equal to total channel'
    );
    await I.reportLog(
      'Total guide channels are ' + expectedCount + 'as expected'
    );
  },
});
