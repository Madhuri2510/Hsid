const assert = require('assert');
const {getRandomNumberInRange} = require('../../CommonUtil/Util');
const {I, constants} = inject();
const watchPageLocators = require('../WatchPage/WatchPageLocators.json');
const tvGuideLocators = require('./TVGuidePageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,
  /**
   * To verify TV guide title is highlighted
   */
  async verifyTvGuideIsHighlighted() {
    await I.wait(2);
    await I.dpadBack();
    await I.wait(2);
    assert.ok(
      I.isFocused(tvGuideLocators.tvGuideMenu),
      'TV guide Tab is not focused'
    );
    I.reportLog('Focus is on TV Guide tab heading');
  },

  /**
   * gets random number between 1 and total channel numbers
   * @returns {integer} - returns random number
   */
  async getRandomChannel() {
    return getRandomNumberInRange(1, await this.getTotalChannels);
  },
  /**
   * Method to return the total no of channel logos displayed in TV Guide SCreen
   * @returns {integer}:'channelLogoCount' displayed in TV Guide
   */
  async verifyChannelLogos() {
    await I.wait(2);
    let channelLogosCount = await I.grabNumberOfVisibleElements(
      tvGuideLocators.channelLogos
    );
    return channelLogosCount;
  },

  /**
   * Get total count of the no of channels
   * @returns {number} - total no of channels
   */
  async getTotalChannels() {
    let count = 0;
    let channelLogos = await I.grabNumberOfVisibleElements(tvGuideLocators.channelLogos)
    if (channelLogos >= 6
    ) {
      await I.dpadDown(4);
      count = 4;
    } else {
      count = await I.grabNumberOfVisibleElements(
        tvGuideLocators.channelLogos
      );
      return count;
    }
    while (await I.isFocused(tvGuideLocators.fourthRowClassicGuidePage)) {
      await I.dpadDown();
      await I.wait();
      count++;
    }
    do {
      await I.dpadDown();
      await I.wait(2);
      count++;
    } while (
      (await I.isFocused(tvGuideLocators.lastRowClassicGuidePage)) == false
    ); // check lastRow locator if channel lineup changes
    return count;
  },

  /**
   * Get total count of the no of play icons
   * @returns {number} - total no of play icons
   */
  async getTotalPlayIcons() {
    let count = 1;
    if (
      (await I.grabNumberOfVisibleElements(tvGuideLocators.playArrowIcons)) > 4
    ) {
      await I.dpadDown(4); // go to 4th channel
      count = 5;
    } else {
      count = await I.grabNumberOfVisibleElements(
        tvGuideLocators.playArrowIcons
      );
    }
    while (await I.isFocused(tvGuideLocators.fourthRowClassicGuidePage)) {
      await I.dpadDown();
      count++;
    }
    do {
      await I.dpadDown();
      count++;
    } while (
      (await I.isFocused(tvGuideLocators.lastRowClassicGuidePage)) == false
    );
    return count - 1;
  },

  /**
   * Verifies total channels count is same as expected count
   */
  async verifyTotalChannelsCount(expectedCount) {
    assert.strictEqual(
      await this.getTotalChannels(),
      expectedCount,
      'Total channels and expected count are not equal'
    );
    I.reportLog('Total guide channels are ' + expectedCount + 'as expected');
  },

  /**
   * To click on the watch now button
   */
  async clickOnWatchNowButton() {
    // if (I.isFocused(tvGuideLocators.infoCardWatchNow)) {
    await I.dpadOK();
    // }
    I.reportLog('Clicked on Watch button');
  },

  /**
   * To click on the play button
   */
  async clickPlayButton(channelInput) {
    //channelNum = await this.getRandomChannel();
    let channelNum;
    if (channelInput != undefined) {
      channelNum = channelInput;
    } else {
      channelNum = getRandomNumberInRange(1, 7);
    }
    await I.wait();
    await I.dpadDown(channelNum);
    await I.dpadOK();
    //Uncomment the below code if able to see info card
    // await this.clickOnWatchNowButton();
    I.reportLog('Clicked on channel number ' + channelNum);
  },

  /**
   * Verifies the current program info card
   */
  async verifyCurrentProgramInfoCard() {
    let channelNum = getRandomNumberInRange(4, 65);
    await I.dpadDown(channelNum);
    //let title = await I.grabTextFrom(tvGuideLocators.currentProgName);
    //let subtitle = await I.grabTextFrom(tvGuideLocators.currentEpisodeName);
    //I.reportLog('title and episode details shown on guide page: '+title+' ');
    await I.dpadOK();
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCard),
      'Info card is not visible'
    );
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCardProgSchedule),
      'Program schedule is not visible'
    );
    //let progSchedule = await I.grabTextFrom(tvGuideLocators.infoCardProgSchedule);
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCardProgDescription),
      'program description is not visible'
    );
    //let progDescription = await I.grabTextFrom(tvGuideLocators.infoCardProgDescription);
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCardShowTitle),
      'program title is not available'
    );
    //let progTitle = await I.grabTextFrom(tvGuideLocators.infoCardShowTitle);
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCardWatchNow),
      'Watch Now button is not visible for current program'
    );
    //I.reportLog("Program details shown on Info card are Title: "+progTitle+" Program Description: "+progDescription+" Schedule: "+progSchedule);
  },
  /**
   * Method to return true if Future Program Info Card is displayed correctly.
   * @returns {boolean}: true if Future Program Info Card is displayed correctly.
   */
  async verifyFutureProgramInfoCard() {
    let channelNum = getRandomNumberInRange(4, 7);
    await I.dpadDown(channelNum);
    await I.dpadRight(5);
    await I.dpadOK();
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCard),
      'Info card is not visible'
    );
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCardProgSchedule),
      'Program schedule is not visible'
    );
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCardProgDescription),
      'program description is not visible'
    );
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCardShowTitle),
      'program title is not available'
    );
    assert.ok(
      I.isElementVisible(tvGuideLocators.infoCardCloseButton),
      'Info card Close button is not visible for current program'
    );
    return true;
  },

  /**
   * Method to click on the future program info card
   */
  async clickOnFutureInfoCard() {
    let channelNum = getRandomNumberInRange(4, 65);
    await I.dpadDown(channelNum);
    await I.dpadRight();
    await I.dpadOK();
    I.reportLog('Info Card opened');
  },

  /**
   * To close the info card screen
   */
  async closeInfoScreen() {
    if (await I.isElementVisible(tvGuideLocators.infoCard)) {
      await I.dpadBack();
    } else {
      I.reportLog('Info Card should be visible');
    }
    assert.ok(
      !(await I.isElementVisible(tvGuideLocators.infoCard)),
      'Info card should not visible'
    );
    return true;
  },

  async verifyPlayButtonVisible() {
    await I.wait(5);
    let channelTilecount = 0,
      playButtonCount = 0;
    if (
      (await I.grabNumberOfVisibleElements(tvGuideLocators.channelLogos)) > 4 &&
      (await I.grabNumberOfVisibleElements(tvGuideLocators.playArrowIcons)) > 4
    ) {
      await I.dpadDown(4); // go to 4th channel
      await I.wait(2);
      channelTilecount = 4;
      playButtonCount = 4;
    } else {
      channelTilecount = await I.grabNumberOfVisibleElements(
        tvGuideLocators.channelLogos
      );
      playButtonCount = await I.grabNumberOfVisibleElements(
        tvGuideLocators.playArrowIcons
      );
    }
    do {
      await I.dpadDown();
      await I.wait(2);
      channelTilecount++;
      let isPlayBtnVisible = await I.isElementVisible(
        tvGuideLocators.tilePlayButton
      );
      if (isPlayBtnVisible) {
        playButtonCount++;
      } else {
        I.saveScreenshot(`${playButtonCount}.png`);
      }
    } while (
      (await I.isElementVisible(tvGuideLocators.lastRowClassicGuidePage)) ==
        false &&
      channelTilecount < 100
    );
    let playicons = await I.grabNumberOfVisibleElements(
      tvGuideLocators.playArrowIcons
    );
    assert.strictEqual(
      playicons === 7,
      'Play icons are not visible for all channels in last page'
    );
    await I.dpadDown(3);
    channelTilecount += 3;
    playButtonCount += 3;
    I.reportLog(
      'Total Channel count: ' +
        channelTilecount +
        ' and Total Play icons count: ' +
        playButtonCount
    );
    assert.strictEqual(
      channelTilecount === playButtonCount,
      'channel count is not equal to play icons'
    );
    await I.saveScreenshot('channelList.png');
    assert.ok(
      await I.isFocused(tvGuideLocators.lastRowClassicGuidePage),
      'Focus is not on last row of classic guide'
    );
  },

  /**
   * wait for guide page to load
   */
  async waitForGuidePageToLoadInClassicFormat() {
    await I.waitForVisible(
      tvGuideLocators.channelLogos,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * To get the current show title
   * @returns {string} - title of the current program
   */
  async getCurrentShowTitle() {
    await I.wait(2);
    let titles = await I.grabTextFrom(tvGuideLocators.currentProgName);
    return titles[0];
  },

  /**
   * This method checks if the Tv guide screen is in the classic format
   * @returns {boolean} true if seen else false
   */
  async isClassicGuideFormatSeen() {
    return await I.isElementVisible(tvGuideLocators.channelLogos);
  },

  /**
   * verify the classic guide page
   * @returns {boolean} true if visible else false
   */
  async verifyClassicGuidePage() {
    let isClassicGuidePage = false;
    if (await this.isClassicGuideFormatSeen()) {
      isClassicGuidePage = true;
    } else {
      await I.reportLog('Classic guide format should be seen');
    }
    return isClassicGuidePage;
  },
};
