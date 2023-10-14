const assert = require('assert');
const {I} = inject();
const constants = require('../../../config/constants.js');
const playerPageLocators = require('./PlayerPageLocators.json');
const watchPageLocators = require('../WatchPage/WatchPageLocators.json');
const homePageLocators = require('../HomePage/HomePageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits.js');
const navBar = require('../NavigationPage/AndroidNavbarPage.js');
const navbarLocators = require('../NavigationPage/NavbarLocators.json');

module.exports = {
  constants,
  async verifyPlayerTimerRunning() {
    await I.wait(testExecutionWaits.WAIT_FOR_PLAYER_TO_APPEAR);
    let isVideoPlayerPlaying = await this.isPlayerTimerRunning();
    assert.ok(
      isVideoPlayerPlaying,
      'Video player to play a video is not visible'
    );
    return isVideoPlayerPlaying;
  },

  async isPlayerTimerRunning() {
    let isPlayerPageVisible = await I.isElementVisible(
      playerPageLocators.player_page
    );
    return isPlayerPageVisible;
  },

  async closePlayerBtn() {
    await I.wait(5);
    while (!(await I.isElementVisible(playerPageLocators.home))) {
      await I.dpadBack();
    }
    await navBar.navigateTo(constants.navigationMenu.home);
    assert.ok(
      await I.isElementVisible(homePageLocators.watchTile),
      'Watch button is not visible on home page'
    );
  },

  async verifyVideoPlayerPage() {
    let isOnPlayerPage = false;
    let counter = 0,
      maxCounter = 5;
    await I.dpadUp(2);
    await I.wait(5);
    //await I.waitForElement(playerPageLocators.captions_btn,30);
    while (counter < maxCounter) {
      counter++;
      if (
        (await I.isElementVisible(playerPageLocators.captions_btn)) ||
        (await I.isElementVisible(playerPageLocators.player_page))
      ) {
        isOnPlayerPage = true;
        if (isOnPlayerPage) {
          break;
        }
      }
    }
    console.log('isOnPlayerPage', isOnPlayerPage);
    assert.ok(isOnPlayerPage, 'On player page is not visible');
  },

  async verifyVideoStarted() {
    await I.wait(2);
    let counter = 0,
      maxCounter = 2,
      isSeekBarPresent = false;
    while (counter < maxCounter) {
      counter++;
      await I.dpadUp();
      const seekBar = setTimeout(this.isSeekBarDisplayed, 2000);
      if (seekBar) {
        isSeekBarPresent = true;
        //break;
      }
      console.log('isSeekBarPresent', isSeekBarPresent);
      await I.wait(10);
    }
    console.log('isSeekBarPresent', isSeekBarPresent);
    await I.waitForElement(playerPageLocators.player_page, 15);
    let isPlayerPageVisible = await I.isElementVisible(
      playerPageLocators.player_page
    );
    console.log('isPlayerPageVisible', isPlayerPageVisible);
    assert.ok(
      isSeekBarPresent || isPlayerPageVisible,
      'Seekbar and Player page is not visible'
    );
    return true;
  },

  async isSeekBarDisplayed() {
    await I.isElementVisible(playerPageLocators.seekBar);
  },

  async readCurrentProgramTime() {
    await I.grabTextFrom(playerPageLocators.tvDuration);
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

  /**
   * verify Live tag & Channel Log in video player
   * @returns true if Live tag & Channel Log visible else false
   */
  async isLiveAndChannelLogoVisible() {
    let isVisible = true;
    await I.dpadOK();
    // verify Live badge
    const liveTag = setTimeout(this.isLiveTagSeen, 2000);
    if (!liveTag) {
      isVisible = false;
      I.reportLog('Live badge should be visible');
    }
    console.log('liveTag: ', isVisible);
    // verify Channel Logo
    await I.dpadOK();
    const channelLogo = setTimeout(this.isChannelLogoSeen, 2000);
    if (!channelLogo) {
      isVisible = false;
      I.reportLog('Channel Logo should be visible');
    }
    console.log('channelLogo: ', isVisible);
    return isVisible;
  },

  /**
   * verify Tv program rating
   * @returns true if Tv program rating seen else false
   */
  async isTvProgramRatingSeen() {
    return await I.isElementVisible(playerPageLocators.tvProgramRating);
  },

  /**
   * verify Tv program description
   * @returns true if Tv program description seen else false
   */
  async isTvProgramDescriptionSeen() {
    return await I.isElementVisible(playerPageLocators.tvProgramDescription);
  },

  /**
   * Select First tile in the guide
   */
  async selectFirstTvGuideProgramTile() {
    await I.dpadDown();
    // select first program tile
    await I.dpadOK();
  },
  /**
   * verify TV Program Rating & Description in video player
   * @returns true if TV Program Rating & Description visible else false
   */
  async isTvProgramRatingAndDescriptionVisible() {
    let isVisible = true;
    await I.wait(2);
    await I.dpadUp();
    const tvRating = setTimeout(this.isTvProgramRatingSeen, 2000);
    if (!tvRating) {
      isVisible = false;
      I.reportLog('Live badge should be visible');
    }
    console.log('tvRating: ', isVisible);
    // verify Channel Logo
    const tvDescription = setTimeout(this.isTvProgramDescriptionSeen, 2000);
    if (!tvDescription) {
      isVisible = false;
      I.reportLog('Channel Logo should be visible');
    }
    console.log('tvDescription: ', isVisible);
    return isVisible;
  },

  /**
   * Gets TV Program Rating
   * @returns String of TV Program Rating
   */
  async getTvProgramRating() {
    await I.dpadUp();
    let tvProgramRating = await I.grabTextFrom(
      playerPageLocators.tvProgramRating
    );
    return tvProgramRating;
  },

  /**
   * Gets TV Program Rating
   * @returns String of TV Program Rating
   */
  async getTvRating() {
    const tvRating = setTimeout(await this.getTvProgramRating, 2100);
    console.log('tvRating', tvRating);
    return tvRating;
  },
  /**
   * Selects Home tab From Featured Channels Tab
   */
  async goToHomeTabFromFeaturedChannelsTab() {
    let iteration = 1;
    while (!(await I.isFocused(watchPageLocators.homeIcon)) && iteration < 5) {
      await I.dpadUp();
      iteration++;
    }
  },
  async closeDialogModel() {
    while (!(await I.isElementVisible(navbarLocators.watchMenu))) {
      await I.dpadBack();
    }
    await navBar.navigateTo(constants.navigationMenu.home);
  },
  /**
   * Enters Pin if the Enter Pin Popup is displayed
   */
  async enterPinIfRequired(pin1, pin2, pin3, pin4) {
    await this.waitForSpinnerToDisappear();
    await I.wait(2);
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
};
