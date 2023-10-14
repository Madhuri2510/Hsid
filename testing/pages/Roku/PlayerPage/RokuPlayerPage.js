const assert = require('assert');
const {I, constants} = inject();
const playerPageLocators = require('./PlayerPageLocators.json');
const navbarPage = require('../../Roku/NavigationPage/RokuNavbarPage');
const logger = require('../../../utils/LogUtils').getLogger('RokuPlayerPage');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,
  async closeVideoPlayer() {
    await I.waitForElementDisappear(playerPageLocators.captionsBtn);
    await I.pressBackButton(2);
    let isVisible = await I.isVisible(playerPageLocators.classicGuide);
    assert.ok(isVisible, 'TV guide page is not back');
  },

  async verifyVideoPlayerPage() {
    let videoView = await I.isVisible(playerPageLocators.videoView);
    assert.ok(videoView, 'Player page is not visible');
    await I.waitForElementDisappear(
      playerPageLocators.videoLoadingPanel,
      constants.timeWait.loadingVideo
    );
    await I.waitForElementDisappear(playerPageLocators.timerRunning);
    await I.pressOkButton();
    let isVisible = await I.isVisible(playerPageLocators.miniGuide);
    assert.ok(isVisible, 'Video does not play');
  },

  async verifyVideoStarted() {
    let videoView = await I.isVisible(playerPageLocators.videoView);
    assert.ok(videoView, 'Player page is not visible');
    await I.waitForElementDisappear(
      playerPageLocators.videoLoadingPanel,
      constants.timeWait.loadingVideo
    );
    await I.waitForElementDisappear(playerPageLocators.timerRunning);
    await I.pressOkButton();
    let previousTime = await I.getElementText(playerPageLocators.timerRunning);
    await I.delay(constants.timeWait.checkingPlay);
    await I.pressOkButton();
    let currentTime = await I.getElementText(playerPageLocators.timerRunning);
    assert.ok(previousTime != currentTime, 'timer is not running');
    await I.waitForElementDisappear(playerPageLocators.timerRunning);
    await I.pressOkButton();
    let seekBarVisible = await I.isVisible(playerPageLocators.seekBar);
    assert.ok(seekBarVisible, 'seek bar is not visible');
  },

  async verifyPlayerTimerRunning() {
    await I.waitForElementDisappear(playerPageLocators.seekBar);
    await I.pressOkButton();
    let isVisible = await I.isVisible(playerPageLocators.positionTimer);
    assert.ok(isVisible, 'Player Timer does not runing');
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    return isVisible;
  },

  async verifyPlayerPageOptions() {
    let videoView = await I.isVisible(playerPageLocators.videoView);
    assert.ok(videoView, 'Player page is not visible');
    await I.waitForElementDisappear(
      playerPageLocators.videoLoadingPanel,
      constants.timeWait.loadingVideo
    );
    await I.pressOkButton();
    let captionBtn = await I.isVisible(playerPageLocators.captionsBtn);
    assert.ok(captionBtn, 'Captions button is not visible');
    let titleName = await I.isVisible(playerPageLocators.titleName);
    assert.ok(titleName, 'Title Name is not visible');
    await I.waitForElementDisappear(playerPageLocators.seekBar);
    await I.pressOkButton();
    let channelLogo = await I.isVisible(playerPageLocators.channelLogo);
    assert.ok(channelLogo, 'Channel Logo is not visible');
    let miniGuide = await I.isVisible(playerPageLocators.miniGuide);
    assert.ok(miniGuide, 'Mini Guide is not visible');
  },

  async isPlayerPlaying() {
    logger.debug('[isPlayerPlaying]');
    await I.waitForElementDisappear(playerPageLocators.captionsBtn);
    await I.pressOkButton();
    let previousTime = await I.getElementText(playerPageLocators.timerRunning);
    await I.delay(constants.timeWait.checkingPlay);
    await I.pressOkButton();
    let currentTime = await I.getElementText(playerPageLocators.timerRunning);
    assert.ok(previousTime != currentTime, 'Player is not running');
  },

  async closePlayerBtn() {
    await I.waitForElementDisappear(playerPageLocators.captionsBtn);
    await I.dpadNavByEcp(constants.remoteKey.back);
    await navbarPage.navigateTo(constants.navigationMenu.home);
    let isVisible = await I.isVisible(playerPageLocators.homeView);
    assert.ok(isVisible, 'Close player is not successful');
  },

  async verifyAbleToWatch() {
    await I.pressOkButton();
    await I.waitForElementVisible(
      playerPageLocators.videoLoadingPanel,
      constants.timeWait.loading
    );
    await this.verifyVideoPlayerPage();
  },

  /**
   * check live icon and channel logos is visible on video.
   * @returns boolean
   */
  async isLiveAndChannelLogoVisible() {
    let videoView = await I.isVisible(playerPageLocators.videoView);
    assert.ok(videoView, 'Player page is not visible');
    await I.waitForElementDisappear(
      playerPageLocators.videoLoadingPanel,
      constants.timeWait.loadingVideo
    );
    await I.pressOkButton();
    let isVisible = false;
    let liveTag = await I.isVisible(playerPageLocators.liveTag);
    let channelLogo = await I.isVisible(playerPageLocators.channelLogo);
    isVisible = liveTag && channelLogo;
    return isVisible;
  },
};
