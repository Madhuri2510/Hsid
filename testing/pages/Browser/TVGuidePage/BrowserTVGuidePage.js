const assert = require('assert');
const {assertText, getRandomNumberInRange} = require('../../CommonUtil/Util');
const {I} = inject();
const navBarLocators = require('../NavigationPage/NavbarLocators.json');
const tvGuideLocators = require('../TVGuidePage/TVGuidePageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const Cosmos = require('../../../OnStreamBackend/cosmos');
const CMP = require('../../../OnStreamBackend/cmp');
const onStreamTestExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
// let cmp = new CMP();

let cosmos = new Cosmos();

const constants = {
  colorLabel: 'color',
  colorCode: 'rgba(111, 0, 0, 1)',
  fontWeight: 'font-weight',
  bold: '400',
  png: '.png',
  player: 'player',
  unrated: 'NR',
  playButtonCount: 6,
};

module.exports = {
  constants,
  async verifyTvGuideIsHighlighted() {
    assertText(
      await I.grabCssPropertyFrom(
        navBarLocators.tvGuideIcon,
        constants.colorLabel
      ),
      constants.colorCode
    );
    assertText(
      await I.grabCssPropertyFrom(
        navBarLocators.tvGuideIcon,
        constants.fontWeight
      ),
      constants.bold
    );
    I.reportLog('TV Guide title is White, Bold and Highlighted');
  },

  /**
   * To verify the channel logo
   */
  async verifyChannelLogos() {
    await I.wait(onStreamTestExecutionWaits.WAIT_FOR_5_SEC);
    let channelLogosCount = await I.grabNumberOfVisibleElements(
      tvGuideLocators.channelLogos
    );

    return channelLogosCount;
  },

  /**
   * To verify the play buttons are visible
   */
  async verifyPlayButtonVisible() {
    let playIcons = await I.grabNumberOfVisibleElements(
      tvGuideLocators.playButton
    );
    assert.equal(
      playIcons,
      constants.playButtonCount,
      'ChannelCount is not equal to PlayIcons'
    );
    I.reportLog('TV Guide Play buttons visible for all channels');
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
    if (channelNum > 15) {
      await I.scrollIntoView(tvGuideLocators.playButton + '[15]');
    }
    await I.waitForElement(tvGuideLocators.playButton + `[${channelNum}]`, 20);
    await I.scrollIntoView(tvGuideLocators.playButton + `[${channelNum}]`);
    await I.elementClick(tvGuideLocators.playButton + `[${channelNum}]`);
    I.reportLog(`Clicked on channel number ${channelNum}`);
    await I.wait(testExecutionWaits.WAIT_FOR_1_SEC);
  },

  /**
   * To verify if the video started playing
   */
  async verifyVideoStarted() {
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    let paused = await I.executeScript(function (el) {
      return $(el).get(0).paused;
    }, tvGuideLocators.bitmovinPlayer);
    assert.equal(paused, false, 'Player did not start');
    I.reportLog(`Video player started`); //transform scale is 1 so it's visible - For future
  },

  /**
   * Verifies the current program info card
   */
  async verifyCurrentProgramInfoCard() {
    let channelNum = await this.getRandomChannel();
    await I.reportLog('channelNum is', channelNum);
    let title = await cosmos.getCurrentProgramName(channelNum);
    await I.forceClick(
      tvGuideLocators.currentChannelInfoButton.replace('channelNum', channelNum)
    );
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.reportLog('Clicked on channel no ' + channelNum);
    await this.verifyCurrentProgramInfoCardMetaData();
    let infoCardTitle = await I.grabTextFrom(tvGuideLocators.infoCardShowTitle);
    assert.ok(
      infoCardTitle.includes(title) || infoCardTitle.includes(subtitle),
      'Title on the infocard should match with the title on the channel tile'
    );
    await this.closeInfoScreen();
  },

  /**
   * Verifies the future program info card
   */
  async verifyFutureProgramInfoCard() {
    let channelNum = await this.getRandomChannel();
    await I.reportLog('channelNum is', channelNum);
    let title = await cosmos.getFutureProgramName(channelNum);
    await I.forceClick(
      tvGuideLocators.futureChannelInfoButton.replace('channelNum', channelNum)
    );
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.reportLog('Clicked on channel no ' + channelNum);
    await this.verifyFutureProgramInfoCardMetaData();
    let infoCardTitle = await I.grabTextFrom(tvGuideLocators.infoCardShowTitle);
    if (infoCardTitle.includes(title)) {
      return true;
    }
    await this.closeInfoScreen();
  },

  /**
   * To click on current program info card
   */
  async clickOnCurrentInfoCard() {
    let channelNum = await this.getRandomChannel();
    // await this.scrollToChannel(channelNum);

    await I.forceClick(
      tvGuideLocators.currentChannelInfoButton.replace('channelNum', channelNum)
    );
    I.reportLog('Clicked on channel no ' + channelNum);
    await I.waitForElement(
      tvGuideLocators.infoCardWatchNow,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardWatchNow),
      'Info Card Watch Now is not visible'
    );
    I.reportLog('Opened current info card');
    // return [title, subtitle];
  },

  /**
   * To click on current program info card and return title, channelNumber
   */
  async clickOnCurrentInfoCardReturnDetails() {
    let channelNum = await this.getRandomChannel();
    await this.scrollToChannel(channelNum);
    let title = await I.grabTextFrom(
      tvGuideLocators.currentShowTitle + `[${channelNum}]`
    );
    await I.click(tvGuideLocators.currentShowTitle + `[${channelNum}]`);
    I.reportLog('Clicked on channel no ' + channelNum);
    await I.waitForElement(
      tvGuideLocators.infoCardWatchNow,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardWatchNow),
      'Info Card Watch Now is not visible'
    );
    I.reportLog('Opened current info card');
    return [title, channelNum];
  },

  /**
   * To click on current program info card with channel Num
   */
  async clickOnCurrentInfoCardWith(channelNum) {
    await this.scrollToChannel(channelNum);
    let title = await I.grabTextFrom(
      tvGuideLocators.currentShowTitle + `[${channelNum}]`
    );
    await I.click(tvGuideLocators.currentShowTitle + `[${channelNum}]`);
    I.reportLog('Clicked on channel no ' + channelNum);
    await I.waitForElement(tvGuideLocators.infoCardWatchNow, 10);
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardWatchNow),
      'Info Card Watch Now is not visible'
    );
    I.reportLog('Opened current info card');
    return title;
  },

  /**
   * To click on future program info card
   * TODO: Add assertion
   */
  async clickOnFutureInfoCard() {
    let channelNum = await this.getRandomChannel();
    await this.scrollToChannel(channelNum);
    // let title = await I.grabTextFrom(
    //   tvGuideLocators.futureShowTitle + `[${channelNum}]`
    // );
    await I.click(tvGuideLocators.futureShowTitle + `[${channelNum}]`);
    I.reportLog('Clicked on channel no ' + channelNum);
    I.reportLog('Opened future info card');
    // return title;
  },

  /**
   * Scroll to a specific channel
   */
  async scrollToChannel(channelNum) {
    await I.scrollIntoView(
      tvGuideLocators.currentShowTitle + `[${channelNum}]`
    );
  },

  /**
   * To click on the watch now button on info card
   */
  async clickOnWatchNowButton() {
    await I.waitForVisible(
      tvGuideLocators.infoCardWatchNow,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
    await I.click(tvGuideLocators.infoCardWatchNow);
    I.reportLog('Clicked on Watch now button');
  },

  /**
   * To click on the close button on info card
   */
  async closeInfoScreen() {
    await I.forceClick(tvGuideLocators.closeInfoCard);
    await I.wait(5);
    let isInfoCardVisibe = await I.isElementVisible(
      tvGuideLocators.infoCardWatchNow
    );
    assert.strictEqual(isInfoCardVisibe, false, 'Info card is visible');
    I.reportLog('Closed the info card');
  },

  /**
   * To get any random channel
   * @returns {number} - channel no
   */
  async getRandomChannel() {
    return getRandomNumberInRange(
      1,
      await I.grabNumberOfVisibleElements(tvGuideLocators.playButton)
    );
  },

  /**
   * To get the current show title
   * @returns {string}  show title
   */
  async getCurrentShowTitle() {
    let channelNum = await this.getRandomChannel();
    return await I.grabTextFrom(
      tvGuideLocators.currentShowTitle + `[${channelNum}]`
    );
  },

  /**
   * To get the total no of channels
   * @returns {number} - total no of channels
   */
  async getTotalChannels() {
    let totalChannels = await I.grabNumberOfVisibleElements(
      tvGuideLocators.channelLanes
    );
    return totalChannels;
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

  /**
   * To play the show with rating
   * @param {integer} rating - rating of the show
   * @returns {boolean} - true if played else false
   */
  async playShowWithRating(rating) {
    let currentProgramCount = await I.grabNumberOfVisibleElements(
      tvGuideLocators.playButton
    );
    for (let channelNum = 1; channelNum <= currentProgramCount; channelNum++) {
      await I.reportLog('CH NO: ' + channelNum);
      await I.scrollIntoView(
        tvGuideLocators.currentShowTitle + `[${channelNum}]`
      );
      await I.click(tvGuideLocators.currentShowTitle + `[${channelNum}]`);
      await I.wait(1);
      let currentRating;
      if (await I.isElementVisible(tvGuideLocators.infoCardTimeRating)) {
        currentRating = await (
          await I.grabTextFrom(tvGuideLocators.infoCardTimeRating)
        ).split('•')[1];
      } else {
        await I.forceClick(tvGuideLocators.closeInfoCard);
        I.reportLog('CLOSED CONTENT UNAVAILABLE MODAL');
        continue;
      }
      if (currentRating == undefined) {
        currentRating = constants.unrated;
      }
      currentRating = currentRating.trim();
      if (currentRating == rating) {
        await I.click(tvGuideLocators.infoCardWatchNow);
        return [true, channelNum];
      }
      await I.forceClick(tvGuideLocators.closeInfoCard);
      await I.wait(1);
    }
    I.reportLog('NO SHOW FOUND, SKIPPING ' + rating + ' RATING TESTS');
    return [false, 0];
  },

  /**
   * wait for guide page to load
   */
  async waitForGuidePageToLoadInClassicFormat() {
    await I.waitForVisible(
      tvGuideLocators.channelLanes,
      testExecutionWaits.WAIT_FOR_GUIDE_LOAD
    );
  },

  /**
   * clicks the play icon of first channel
   */
  async clickOnPlayIconOfFirstChannel() {
    let playIconOfFirstChannel = `${tvGuideLocators.playButton}[1]`;
    await I.click(playIconOfFirstChannel);
  },

  /**
   * This method checks if the Tv guide screen is in the classic format
   * @returns {boolean} true if seen else false
   */
  async isClassicGuideFormatSeen() {
    await I.wait(3);
    return await I.isElementVisible(tvGuideLocators.channelLanes);
  },

  /**
   * verify the time schedule bar in classic guide page
   * @returns {boolean} true if visible else false
   */
  async isTimeScheduleBarSeen() {
    let scheduleBarSeen = false;
    scheduleBarSeen = await I.isElementVisible(tvGuideLocators.timeScheduleBar);
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
   * navigates back to previous screen
   */
  async goBack() {
    await I.executeScript('window.history.back();');
  },

  /**
   * Verify meta data of current program infocard
   */
  async verifyCurrentProgramInfoCardMetaData() {
    await I.waitForVisible(
      tvGuideLocators.infoCardProgImage,
      testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardProgImage),
      'InfoCard Programme Image is not visible'
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardShowTitle),
      'Info Card Show Title is not visible'
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardTimeAndRating),
      'Program time and rating  is not visible'
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardDescription),
      'Program description is not visible'
    );
  },

  /**
   * Verify meta data of future program infocard
   */
  async verifyFutureProgramInfoCardMetaData() {
    await I.waitForVisible(
      tvGuideLocators.infoCardProgImage,
      testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardProgImage),
      'InfoCard Programme Image is not visible'
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardShowTitle),
      'Info Card Show Title is not visible'
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardTimeAndRating),
      'Program time and rating  is not visible'
    );
    assert.ok(
      await I.isElementVisible(tvGuideLocators.infoCardDescription),
      'Program description is not visible'
    );
  },
};
