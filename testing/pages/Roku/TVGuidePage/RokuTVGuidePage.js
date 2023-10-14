const assert = require('assert');
const {getRandomNumberInRange} = require('../../CommonUtil/Util');
const {I, constants} = inject();
const classicGuideLocators = require('./TVGuidePageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');
const EPG = require('../../../OnStreamBackend/epg');
const {isRegressionType} = require('../../../utils/ConfigUtils');
const expVal = require('../../../config/expectedValuesRoku.js');
const navbarPage = require('../NavigationPage/RokuNavbarPage');
let epg = new EPG();
const logger = require('../../../utils/LogUtils').getLogger('RokuTVGuidePage');
const Cosmos = require('../../../OnStreamBackend/cosmos');
let cosmos = new Cosmos();

module.exports = {
  constants,
  async waitForGuidePageToLoadInClassicFormat() {
    await I.waitForElementVisible(
      classicGuideLocators.classicGuide,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * To verify TV guide title is highlighted
   */
  async verifyTvGuideIsHighlighted() {
    let focusedElement = await I.isFocusOnElementByAttr(
      classicGuideLocators.tvGuideFocus
    );
    assert.ok(focusedElement, 'Guide Page Title is not highlighted');
  },

  /**
   * Random Number To Select Guide Asset from total Guide channels
   * @returns {Number} Random Number
   */
  async getRandomNumberToSelectGuideAsset() {
    let totalChannel, channelNum;
    totalChannel = await this.getTotalChannelByAPI();
    if (totalChannel !== ' ') {
      channelNum = getRandomNumberInRange(1, totalChannel);
      return channelNum;
    } else {
      assert.fail(
        `Unable to get Tv Guide channel count where count is:${totalChannel}`
      );
    }
  },

  /**
   * Verify current program info card
   */
  async verifyCurrentProgramInfoCard() {
    let randomChannelNum;
    randomChannelNum = await this.getRandomNumberToSelectGuideAsset();
    await I.dpadNavByEcp(constants.remoteKey.down, randomChannelNum);
    //focusing first tile in Tv Guide
    await I.dpadNavByEcp(constants.remoteKey.down);
    if (!(await I.isElementFocused(constants.navigationMenu.tvGuide))) {
      // select first tile of Tv Guide to open info card
      await I.dpadNavByEcp(constants.remoteKey.ok);
      // verify Program schedule
      if (!(await I.isVisible(classicGuideLocators.progSchedule))) {
        assert.fail('Program schedule should be visible');
      }
      // verify program description
      if (!(await I.isVisible(classicGuideLocators.progDescription))) {
        assert.fail('program description should be visible');
      }
      // verify program title
      if (!(await I.isVisible(classicGuideLocators.title))) {
        assert.fail('program title should be visible');
      }
      // verify Watch Now
      if (!(await I.isVisible(classicGuideLocators.watchNowButton))) {
        assert.fail('Watch Now button should be visible');
      }
      // verify Watch Now
      if (!(await I.isElementFocused(constants.buttonText.watchNow))) {
        assert.fail('Watch Now button should be focused to play');
      }
    } else {
      assert.fail('Unable to focus Tv Guide first tile');
    }
  },

  /**
   * Verifies the future program info card
   */
  async verifyFutureProgramInfoCard() {
    await I.dpadNavByEcp(constants.remoteKey.down);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    // let futureProgramName = await cosmos.getFutureProgramName(1);
    let currentProgramName = (await cosmos.getCurrentProgramName(1)).trim();
    let currentTimeText = await this.getCurrentTimeText();
    
    while(currentProgramName == await this.getCurrentProgramTitle() && currentTimeText == await this.getCurrentTimeText() ){
      await I.dpadNavByEcp(constants.remoteKey.right);
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    let progSchedule = await I.isVisible(classicGuideLocators.progSchedule);
    let progDescription = await I.isVisible(
      classicGuideLocators.progDescription
    );
    let title = await I.isVisible(classicGuideLocators.title);
    let watchNow = await I.isVisible(classicGuideLocators.watchNowButton);
    assert.ok(progSchedule, 'Program schedule is not visible');
    assert.ok(progDescription, 'program description is not visible');
    assert.ok(title, 'program title is not available');
    assert.ok(!watchNow, 'Watch Now button is visible for future program');

    return true;
  },

  /**
   * To get the current program title
   */
  async getCurrentProgramTitle() {
    let firstChannelProgramList = await I.getElements(classicGuideLocators.tvGuideCurrentProgmList);

    let firstChannelProgramTitle = await I.getText(
      firstChannelProgramList[0].Nodes[0].Nodes[0].Nodes[1].Nodes[0]
    );

    return firstChannelProgramTitle.trim();
  },

   /**
   * To get the current time text
   */
   async getCurrentTimeText() {
    let timeLabelList = await I.getElements(classicGuideLocators.tvGuideTimeList);

    let currentTimeText = await I.getText(
      timeLabelList[0].Nodes[0]
    );

    return currentTimeText;
  },

  /**
   * To click on the current program info card
   */
  async clickOnCurrentInfoCard() {
    let randomChannelNum;
    randomChannelNum = await this.getRandomNumberToSelectGuideAsset();
    await I.dpadNavByEcp(constants.remoteKey.down, randomChannelNum);
    await I.dpadNavByEcp(constants.remoteKey.ok);
    if (!(await I.isVisible(classicGuideLocators.watchNowButton))) {
      assert.fail('Info card should be visible');
    } else {
      I.reportLog('Current Program Info card is visible');
    }
  },

  async getTotalChannelByAPI() {
    logger.debug('[getTotalChannelByAPI]');
    return await epg.getTotalChannels();
  },
  /**
   * To click on the watch now button
   */
  async clickOnWatchNowButton() {
    await I.wait(testExecutionWaits.WAIT_FOR_3_SEC);
    let watchNow = await I.isElementVisible(constants.buttonText.watchNow);
    assert.ok(watchNow, 'Watch Now button is not visible');
    await I.dpadNavByEcp(constants.remoteKey.ok);
  },

  /**
   * To close the info card screen
   */
  async closeInfoScreen() {
    let isClosed = false;
    // To close the info card which was opened
    await I.dpadNavByEcp(constants.remoteKey.back);
    if (await I.isVisible(classicGuideLocators.watchNowButton)) {
      assert.fail('Info card should not be visible');
    } else {
      I.reportLog('Info card is closed');
      isClosed = true;
    }
    return isClosed;
  },

  /**
   * Verifies the play buttons are visible
   */
  async verifyPlayButtonVisible() {
    let totalChannel = await this.getTotalChannelByAPI();
    let totalPlayIcon = 0;
    for (let index = 0; index < totalChannel; index++) {
      await I.dpadNavByEcp(constants.remoteKey.down);
      await I.dpadNavByEcp(constants.remoteKey.down);
      if (await I.selectProgramAbleToPlay(true)) {
        totalPlayIcon++;
      }
    }
    assert.strictEqual(
      totalPlayIcon,
      totalChannel,
      `Failed, the total number of play icon  ${totalPlayIcon}`
    );
  },

  /**
   * To verify the total channels count
   * @param {number} expectedCount - expected count of the total no of channels
   */
  async verifyTotalChannelsCount(expectedCount) {
    let actual = await I.getTotalChannel();
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    assert.strictEqual(actual, expectedCount);
  },

  /**
   * To click play button
   */
  async clickPlayButton(channelNum) {
    if (channelNum == null) {
      await I.dpadNavByEcp(constants.remoteKey.down);
      await I.dpadNavByEcp(constants.remoteKey.ok);
    } else {
      await I.dpadNavByEcp(constants.remoteKey.down, channelNum);
      await I.dpadNavByEcp(constants.remoteKey.ok);
    }
  },

  async verifyFocusOnEveryProgram() {
    let totalChannel = 67; //await this.getTotalChannelByAPI();
    let isRegression = isRegressionType();
    if (isRegression) {
      for (let channelNum = 0; channelNum < totalChannel; channelNum++) {
        logger.debug(`[verifyFocusOnEveryProgram] for channel ${channelNum}`);
        await I.dpadNavByEcp(constants.remoteKey.down);
        let checkFocus = await I.isEveryProgramFocused();
        assert.ok(checkFocus, 'The program is not focused');
      }
    } else {
      await I.dpadNavByEcp(constants.remoteKey.down);
      let checkFocus = await I.isEveryProgramFocused();
      assert.ok(checkFocus, 'The program is not focused');
    }
  },

  async totalProgramByAPI() {
    let totalProgramOfChannel = constants.totalProgram;
    return totalProgramOfChannel;
  },

  /**
   * This method checks if the Tv guide screen is in the classic format
   * @returns {boolean} true if seen else false
   */
  async isClassicGuideFormatSeen() {
    return await I.isVisible(classicGuideLocators.tvGuideGrid);
  },

  async getRatingText() {
    let timeLabel = await I.getLastElementText(
      classicGuideLocators.timeLabelWatchNow
    );
    let ratingText = timeLabel.split('• ')[1];
    logger.debug(`[getRatingText]: ${ratingText}`);
    return ratingText;
  },

  async playShowWithRating(expectedRating) {
    await I.dpadNavByEcp(constants.remoteKey.down);
    let isSelected;
    let totalChannel = await this.getTotalChannelByAPI();
    let channelNum = 0;
    for (channelNum; channelNum < totalChannel; channelNum++) {
      logger.debug(`[playShowWithRating] for channel ${channelNum}`);
      isSelected = await this.selectProgramByRating(expectedRating);
      if (isSelected) {
        await I.dpadNavByEcp(constants.remoteKey.ok);
        break;
      } else {
        await I.dpadNavByEcp(constants.remoteKey.down);
      }
    }
    return isSelected;
  },

  async selectProgramByRating(expectedRating) {
    let isSelected = true;
    await I.selectProgramAbleToPlay();
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.isVisible(classicGuideLocators.watchNowButton);
    let currentRating = await this.getRatingText();
    if (currentRating !== expectedRating) {
      await I.dpadNavByEcp(constants.remoteKey.back);
      await I.backToFirstProgram();
      isSelected = false;
    }
    return isSelected;
  },

  async playProgram(expectedRating) {
    await I.dpadNavByEcp(constants.remoteKey.down);
    let isSelected;
    let totalChannel = await this.getTotalChannelByAPI();
    for (let channelNum = 0; channelNum < totalChannel; channelNum++) {
      logger.debug(`[playProgram] for channel ${channelNum}`);
      isSelected = await this.selectProgramByRating(expectedRating);
      if (isSelected) {
        break;
      } else {
        await I.dpadNavByEcp(constants.remoteKey.down);
      }
    }
    return isSelected;
  },

  /**
   * verify channel logos visible on tv guide page >= 6.
   */
  async verifyChannelLogos() {
    let channelLogosCount = await I.getTotalChannelLogosVisible(
      classicGuideLocators.channelLogos
    );
    logger.debug(
      `[verifyChannelLogos] channelLogosCount is ${channelLogosCount}`
    );
    assert.ok(
      channelLogosCount >= expVal.channelLogosCount,
      `Channel logos count is ${channelLogosCount} lesser than 6`
    ); // Since 6 channels are displayed at once in Roku
    return channelLogosCount;
  },

  /**
   * get title visible on tv Guide to search.
   * @returns string.
   */
  async getCurrentShowTitle() {
    await I.dpadNavByEcp(constants.remoteKey.down);
    await I.dpadNavByEcp(constants.remoteKey.down);
    // await I.selectProgramAbleToPlay();
    await this.clickPlayButton();
    let titleText = await I.getTextInContainer();
    logger.debug(`[getCurrentShowTitle] ${titleText}`);
    return titleText;
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
   * verify the time schedule bar in classic guide page
   * @returns {boolean} true if visible else false
   */
  async isTimeScheduleBarSeen() {
    let scheduleBarSeen = false;
    scheduleBarSeen = await I.isVisible(classicGuideLocators.timeScheduleBar);
    if (!scheduleBarSeen) {
      await I.reportLog('Time Schedule bar should be seen');
    }
    return scheduleBarSeen;
  },

  /**
   * navigates back to previous screen
   */
  async goBack() {
    await I.dpadNavByEcp(constants.remoteKey.back);
  },
};
