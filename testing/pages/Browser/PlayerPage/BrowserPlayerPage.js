const assert = require('assert');
const {I, constants} = inject();
const playerPageLocators = require('./PlayerPageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,
  async verifyPlayerPageOptions() {
    assert.ok(
      I.isElementVisible(playerPageLocators.volume_btn),
      'Volume button is not visible'
    );
    I.reportLog('Volume button is visible');
    assert.ok(
      I.isElementVisible(playerPageLocators.caption_btn),
      'Caption button is not visible'
    );
    I.reportLog('Captions button is visible');
    assert.ok(
      I.isElementVisible(playerPageLocators.toggle_fullscreen_btn),
      'Fullscreen toggle button is not visible'
    );
    I.reportLog('Toggle full screen button is visible');
    assert.ok(
      I.isElementVisible(playerPageLocators.asset_name),
      'Asset name is not visible'
    );
    I.reportLog('Asset name is visible');
    assert.ok(
      I.isElementVisible(playerPageLocators.channel_logo),
      'Channel logo is not visible'
    );
    I.reportLog('Channel logo is visible');
  },

  async isPlayerPlaying() {
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.defineTimeout({script: 5000});
    let paused = await I.executeScript(function (el) {
      return $(el).get(0).paused;
    }, playerPageLocators.bitmovinPlayer);
    assert.equal(paused, false, 'Player did not start');
    I.reportLog('Video player started');
  },

  async closePlayerBtn() {
    await I.moveCursorTo(playerPageLocators.closeVideoBtn);
    await I.forceClick(playerPageLocators.closeVideoBtn);
  },

  async verifyPlayerTimerRunning() {
    await I.wait(60);
    let isVideoPlayerPlaying = await this.isPlayerTimerRunning();
    assert.ok(isVideoPlayerPlaying, 'Video player is not playing');
    await I.moveCursorTo(playerPageLocators.playerCaptionButton, 20, 10);
  },

  async isPlayerTimerRunning() {
    let locator = playerPageLocators.playerTimerCounter;
    await I.waitForElement(playerPageLocators.playerCaptionButton, 60);
    await I.moveCursorTo(playerPageLocators.miniGuideButton);
    await I.moveCursorTo(playerPageLocators.playerCaptionButton, 20, 10);
    let firstValuePlayerTimeCounter = await I.getTextContent(locator);
    let firstTimeMinuteValue = 0,
      minuteHand = 0,
      isVideoPlaying = false;
    let firstValuePlayerTimeCounterArr = firstValuePlayerTimeCounter.split(':');
    if (firstValuePlayerTimeCounterArr.length > 2) {
      //this condition to check whether the timer is having hour hand also or not
      firstTimeMinuteValue = firstValuePlayerTimeCounterArr[1];
      minuteHand = 1;
    } else if ((firstValuePlayerTimeCounterArr.length = 2)) {
      firstTimeMinuteValue = firstValuePlayerTimeCounterArr[0];
    }
    for (let index = 0; index < 6; index++) {
      await I.wait(12);
      await I.moveCursorTo(playerPageLocators.playerCaptionButton, 20, 10);
      await I.defineTimeout({script: 5000});
      let playerTimeCounter = await I.getTextContent(locator);
      let playerTimeCounterArr = playerTimeCounter.split(':');
      if (playerTimeCounterArr[minuteHand] - firstTimeMinuteValue >= 1) {
        //to check 1 min player playing from time of start
        isVideoPlaying = true;
        break;
      }
    }
    return isVideoPlaying;
  },

  async verifyVideoPlayerPage() {
    await I.wait(3);
    assert.ok(
      (await I.getPageUrl()).includes(constants.player),
      'Cannot redirect to the player'
    );
    I.reportLog('Redirected to the player');
  },

  async verifyVideoStarted() {
    await I.waitForElement(
      playerPageLocators.closeVideoBtn,
      testExecutionWaits.WAIT_FOR_VIDEO_TO_PLAY
    );
    let paused = await I.executeScript(function (el) {
      return document.querySelector(el).paused;
    }, playerPageLocators.bitmovinPlayer);
    assert.equal(paused, false, 'Player did not start');
    I.reportLog(`Video player started`); //transform scale is 1 so it's visible - For future
  },
  /**
   * validate timer in player screen for specific time duration
   * @param {integer} duration - specific time in minutes.
   */
  async validateTimerInPlayerForSpecificDuration(duration = 5) {
    let timeCount = 0;
    while (timeCount < duration) {
      await this.verifyPlayerTimerRunning();
      await I.moveCursorTo(playerPageLocators.miniGuideButton);
      timeCount++;
    }
  },

  /**
   * verifies video is playing in all channels
   * @param {integer} TotalChannels
   */
  async verifyVideoPlayingForAllChannels(totalChannels) {
    let currentChannelNumber = 1;
    while (currentChannelNumber <= totalChannels) {
      await this.verifyVideoPlayerPage();
      await this.isPlayerPlaying();
      await I.wait(testExecutionWaits.WAIT_FOR_2_MIN);
      if (currentChannelNumber !== totalChannels) {
        await this.clickOnMiniGuideIcon();
        await this.clickOnDownArrowButtonInMiniGuide(currentChannelNumber);
        await I.click(playerPageLocators.watchNowButtonInMiniGuide);
      }
      currentChannelNumber++;
    }
  },

  /**
   * clicks on mini guide button in player screen
   */
  async clickOnMiniGuideIcon() {
    await I.moveCursorTo(playerPageLocators.miniGuideButton);
    await I.click(playerPageLocators.miniGuideButton);
    await I.waitForVisible(
      playerPageLocators.downArrowInMiniGuide,
      testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
    );
  },

  /**
   * clicks on down arrow button in mini guide.
   * @param {integer} maxCount
   */
  async clickOnDownArrowButtonInMiniGuide(maxCount) {
    let count = 0;
    while (count !== maxCount) {
      await I.click(playerPageLocators.downArrowInMiniGuide);
      await I.waitForVisible(
        playerPageLocators.watchNowButtonInMiniGuide,
        testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
      );
      count++;
    }
  },

  /**
   * enters pin if Enter Pin popup will appear in player screen
   */
  async enterPinIfRequired(pin1, pin2, pin3, pin4) {
    await this.waitForSpinnerToDisappear();
    await I.wait(1);
  },

  /**
   * waits until spinner icon is disappeared
   */
  async waitForSpinnerToDisappear() {
    await I.waitForInvisible(
      playerPageLocators.spinnerIcon,
      testExecutionWaits.WAIT_FOR_SPINNER_TO_DISAPPEAR
    );
  },
};
