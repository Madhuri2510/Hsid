const assert = require('assert');
const {I} = inject();
const playerPageLocators = require('./PlayerPageLocators.json');
const baseOnStreamPlayerPage = require('../../Browser/PlayerPage/BrowserPlayerPage');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = Object.assign(baseOnStreamPlayerPage, {
  /**
   * verifies video is playing
   */
  async verifyPlayerTimerRunning() {
    await I.wait(testExecutionWaits.WAIT_FOR_VIDEO_TO_PLAY);
    let isVideoPlayerPlaying = await this.isPlayerTimerRunning();
    assert.ok(isVideoPlayerPlaying, 'Selected asset should be played');
    await I.setElementVisibility(
      playerPageLocators.playerControlsContainer,
      true
    );
  },

  /**
   * verifies player timing functionality
   * @returns {boolean} - returns true if video is playing
   */
  async isPlayerTimerRunning() {
    await I.setElementVisibility(
      playerPageLocators.playerControlsContainer,
      true
    );
    await I.scrollToElement(playerPageLocators.playerTimerCounter);
    let firstValuePlayerTimeCounter = await I.grabAttributeFrom(
      playerPageLocators.playerTimerCounter,
      'textContent'
    );
    await I.setElementVisibility(
      playerPageLocators.playerControlsContainer,
      false
    );
    let firstTimeMinuteValue = 0,
      minuteHand = 0,
      isVideoPlaying = false;
    if (firstValuePlayerTimeCounter[0].split(':').length > 2) {
      //this condition to check whether the timer is having hour hand also or not
      firstTimeMinuteValue = firstValuePlayerTimeCounter[0].split(':')[1];
      minuteHand = 1;
    } else if ((firstValuePlayerTimeCounter.length = 2)) {
      firstTimeMinuteValue = firstValuePlayerTimeCounter[0].split(':')[0];
    }
    for (let index = 0; index < 6; index++) {
      await I.wait(12);
      await I.setElementVisibility(
        playerPageLocators.playerControlsContainer,
        true
      );
      let playerTimeCounter = await I.grabAttributeFrom(
        playerPageLocators.playerTimerCounter,
        'textContent'
      );
      await I.setElementVisibility(
        playerPageLocators.playerControlsContainer,
        false
      );
      if (
        playerTimeCounter[0].split(':')[minuteHand] - firstTimeMinuteValue >=
        1
      ) {
        //to check 1 min player playing from time of start
        isVideoPlaying = true;
        break;
      }
    }
    return isVideoPlaying;
  },

  /**
   * clicks on close icon in player screen
   */
  async closePlayerBtn() {
    await I.setElementVisibility(
      playerPageLocators.playerControlsContainer,
      true
    );
    await I.defineTimeout({script: 5000});
    await I.executeScript(function (locator) {
      document.getElementById(locator).click();
    }, 'PLAYER_CLOSE_BTN');
  },

  async isPlayerPlaying() {
    await I.wait(5);
    await I.defineTimeout({script: 5000});
    let paused = await I.executeScript(function (el) {
      return document.querySelector(el).paused;
    }, playerPageLocators.bitmovinPlayer);
    assert.equal(paused, false, 'Player did not start');
    I.reportLog(`Video player started`);
  },

  async verifyVideoStarted() {
    await I.wait(5);
    await I.defineTimeout({script: 5000});
    let paused = await I.executeScript(function (el) {
      return document.querySelector(el).paused;
    }, playerPageLocators.bitmovinPlayer);
    assert.equal(paused, false, 'Player did not start');
    I.reportLog(`Video player started`); //transform scale is 1 so it's visible - For future
    await this.closePlayerBtn();
  },

  /**
   * verify Live tag & Channel Log in video player
   * @returns true if Live tag & Channel Log visible else false
   */
  async isLiveAndChannelLogoVisible() {
    let isVisible = false;
    // verify Live badge
    if (await this.isLiveTagSeen()) {
      isVisible = true;
    } else {
      I.reportLog('Live badge should be visible');
    }
    // verify Channel Logo
    if (await this.isChannelLogoSeen()) {
      isVisible = true;
    } else {
      I.reportLog('Channel Logo should be visible');
    }
  },

  /**
   * verify Live badge in video player
   * @returns true if Live badge visible else false
   */
  async isLiveTagSeen() {
    return await I.isElementVisible(playerPageLocators.liveTag);
  },

  /**
   * verify channel logo in video player
   * @returns true if channel logo visible else false
   */
  async isChannelLogoSeen() {
    return await I.isElementVisible(playerPageLocators.channelLogo);
  },
});
