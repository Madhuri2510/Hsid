/* eslint-disable no-undef */
let currentUser = '';
const userType = require('../config/user');
const clientConfig = require('../clientConfig');
const signInLocators = require('../pages/SignIn/locators.js');
const landingScreenLocators = require('../pages/LandingPage/locators');
const videoPlayerLocators = require('../pages/player/VideoPlayerLocators.json');
const guidePageLocators = require('../pages/guide/GuideScreenLocators.json');
const iViewPageLocators = require('../pages/iview/iViewLocators.json');
const homePageLocators = require('../pages/home/HomeScreenLocators.json');
const channelPageLocators = require('../pages/iview/ChannelPageLocators.json');
const dvrPageLocators = require('../pages/dvr/DVRScreenLocators.json');
var env = require('../config/env');
const {clearString} = require('codeceptjs/lib/utils');
const Sandstorm = require('./Sandstorm.js');
const assert = require('assert');
const gitConfig = require('../config/gitConfig');

class LoginHelper extends Helper {
  constructor(config) {
    super(config);

    // set defaults
    this.options = {
      env: 'dev_jsclient_prod',
      defultuser: 'global',
    };
    this._createConfig(config);
  }

  _createConfig(config) {
    Object.assign(this.options, config);
  }

  async _beforeSuite(suite) {}
  /**
   * launch or relaunch app and login with reuqied user for suite.
   * @param  suite
   */
  async _afterSuite(suite) {
    console.log('Current user ' + currentUser);
    currentUser = '';
  }

  async _before(test) {
    if (test._currentRetry && test._currentRetry > 0) {
      return;
    }
    const user = this.getOpt(test, 'user', this.options.defultuser);
    const reqLogin = this.getOpt(test, 'reqLogin', true);
    // First time  login -> currentUser will be blank
    if (currentUser !== '' && user !== currentUser) {
      await this.signOut();
    }
    try {
      await this.login(user, reqLogin);
      test.opts.userEmail = clientConfig.userCredentials.username;
    } catch (err) {
      //skip testcase if login issue
      let errMsg = `Error while login with '${user}' user: ${err.message}`;
      test.err = err;
      test.err.message = errMsg;
      test.run = function skip() {
        this.skip();
      };
    }
  }

  async login(user, reqLogin, reinstall = true) {
    // const { Sandstorm } = this.helpers;
    // if (await Sandstorm.isElementVisible(`${homePageLocators.spotLightItem}0${homePageLocators.focusedSuffix}`))
    // await this.signOut();
    if (!reqLogin || user !== currentUser) {
      currentUser = user;
      if (reqLogin) {
        try {
          console.log(`Login into application for ${currentUser} user`);
          if (currentUser === 'slingfree') {
            clientConfig.userCredentials.username = '';
            clientConfig.userCredentials.password = '';
            await this.loginSlingFree();
          } else {
            //clone users json object, so sling free doesn't modify existing object
            const users = JSON.parse(JSON.stringify(userType.user));
            const userCred = await clientConfig.setUserCredentials(
              users[user],
              env[this.options.env]
            );
            let username = JSON.stringify(userCred.username).replace(/"/g, '');
            let password = JSON.stringify(userCred.password).replace(/"/g, '');
            await this._login(username, password);
          }
        } catch (error) {
          //If login error then reinstall app in next testcase
          currentUser = 'error';
          console.error(`login error: ${error}`);
          throw error;
        }
      }
    } else {
      console.log(
        `Login not require as new user is ${user} and current user is ${currentUser}`
      );
    }
  }

  async _login(username, password) {
    const {Sandstorm} = this.helpers;
    await Sandstorm.wait(3);
    let isAppLoaded;
    let flagForAppLoad = 0;
    while (flagForAppLoad < 25) {
      isAppLoaded =
        (await Sandstorm.isElementVisible('home-selected')) ||
        (await Sandstorm.isElementVisible('home')) ||
        (await Sandstorm.isElementVisible(
          landingScreenLocators.identifiers.signInButton
        ));
      if (isAppLoaded) {
        console.log(
          '_login Info : Application is loaded after ' +
            flagForAppLoad * 3 +
            ' seconds'
        );
        break;
      } else {
        await Sandstorm.wait(3);
        flagForAppLoad++;
      }
      if (flagForAppLoad === 24) {
        console.log('_login Info : App not loaded within 1 min 15 sec');
      }
    }

    assert.ok(isAppLoaded, 'App not loaded within 1 min 15 sec');

    if (
      (await Sandstorm.isElementVisible('home-selected')) ||
      (await Sandstorm.isElementVisible('home'))
    ) {
      await this.signOut();
    }

    await Sandstorm.waitForElement(
      await Sandstorm.getPlatformID(
        landingScreenLocators.identifiers.signInButton
      ),
      30
    );

    for (let i = 0; i < 3; i++) {
      if (
        !(await Sandstorm.isElementFocused(
          landingScreenLocators.identifiers.signInButton
        ))
      ) {
        await Sandstorm.dpadDown();
      }
    }
    await Sandstorm.waitForElement(
      await Sandstorm.getPlatformIDFocused(
        landingScreenLocators.identifiers.signInButton
      ),
      30
    );
    await Sandstorm.ok();
    await Sandstorm.wait(3);
    //Clicking ok for "Sign in on device" button
    await Sandstorm.ok();
    await Sandstorm.wait(3);
    if (
      !(
        (await Sandstorm.isElementVisible(
          signInLocators.identifiers.emailField
        )) ||
        (await Sandstorm.isElementFocused(
          signInLocators.identifiers.emailField
        ))
      )
    ) {
      await Sandstorm.ok();
    }
    await Sandstorm.waitForElement(
      await Sandstorm.getPlatformIDFocused(
        signInLocators.identifiers.emailField
      ),
      30
    );
    if (!gitConfig.isComcastPlatform()) {
      Sandstorm.ok();
    }
    // Set input fields value
    await Sandstorm.fillField(
      await Sandstorm.getPlatformIDFocused(
        signInLocators.identifiers.emailField
      ),
      username
    );
    Sandstorm.dpadDown();
    if (!gitConfig.isComcastPlatform()) {
      Sandstorm.ok();
    }
    await Sandstorm.fillField(
      await Sandstorm.getPlatformIDFocused(
        signInLocators.identifiers.passwordField
      ),
      password
    );

    // Click on the Sign in Button
    await Sandstorm.navigate(
      Sandstorm.getPlatformID(signInLocators.identifiers.signInButton)
    );
    await Sandstorm.ok();
    await Sandstorm.waitForElement(
      await Sandstorm.getPlatformID(homePageLocators.homeButton),
      45
    );
    if (await Sandstorm.isElementVisible(homePageLocators.homeButton)) {
      console.log('Info : Navigated to Home Page after login');
    } else {
      await Sandstorm.waitForElement(
        await Sandstorm.getPlatformID(homePageLocators.home),
        30
      );
    }
  }
  /** TODO need to implement */
  async loginSlingFree() {}

  getOpt(entity, key, defval) {
    if (key in entity.opts) {
      return entity.opts[key];
    }
    if (entity.parent && key in entity.parent.opts) {
      return entity.parent.opts[key];
    }
    return defval;
  }

  /**
   * Capture the screenshot when testcase get failed.
   * @param  test
   */
  async _failed(test) {
    const {Sandstorm} = this.helpers;
    let fileName = clearString(test.title);
    const uuid = test.uuid || test.ctx.test.uuid;
    /* limit the image file name*/
    fileName = `${this.options.output}/${fileName.substring(
      0,
      10
    )}_${uuid}.failed.png`;
    // await Sandstorm.saveScreenshot(fileName);
    await this.cleanUp(test);
  }

  async _passed(test) {
    await this.cleanUp(test);
  }

  async cleanUp(test) {
    const user = this.getOpt(test, 'user', this.options.defultuser);
    const signout = this.getOpt(test, 'signout', false);
    await this.relaunchApp();
    //if user is not global then logout
    /*if(user !== 'global'){
    await this.signOut();
     currentUser = '';
    }*/
  }

  async relaunchApp() {
    console.log(
      '****************INFO: Relaunching Application**********************'
    );
    const {Sandstorm} = this.helpers;

    //Navigate to main screen of tabs
    if (await Sandstorm.isElementVisible(videoPlayerLocators.playerScreen)) {
      await Sandstorm.pressBack();
      await Sandstorm.pressBack();
      await Sandstorm.wait(2);
    }
    if (
      (await Sandstorm.isElementVisible(
        iViewPageLocators.dpblock.detailsButtonId
      )) ||
      (await Sandstorm.isElementVisible(iViewPageLocators.assetTitle)) ||
      (await Sandstorm.isElementVisible(iViewPageLocators.iView))
    ) {
      await Sandstorm.pressBack();
      await Sandstorm.wait(2);
    }
    //channel screen top
    if (await Sandstorm.isElementVisible(channelPageLocators.programName)) {
      await Sandstorm.pressBack();
      await Sandstorm.wait(2);
    }
    //channel screen tabs focus
    if (
      (await Sandstorm.isElementVisible(
        `${channelPageLocators.channels.detailsGridContainer}0`
      )) ||
      (await Sandstorm.isElementVisible(
        `${channelPageLocators.channels.detailsGridContainer}4`
      ))
    ) {
      await Sandstorm.pressBack();
      await Sandstorm.pressBack();
      await Sandstorm.waitForElement(
        await Sandstorm.getPlatformID(channelPageLocators.programName),
        10
      );
      await Sandstorm.pressBack();
    }

    if (
      (await Sandstorm.isElementVisible(
        dvrPageLocators.recordingsScreen.recordOptionsModal
      )) ||
      (await Sandstorm.isElementVisible(dvrPageLocators.blankScheduledIView))
    ) {
      await Sandstorm.pressBack();
    }
    try {
      if (await Sandstorm.see('Check Back Later')) {
        await Sandstorm.pressBack();
      }
    } catch (err) {
      console.log('Main Menu is visible');
    }

    //if user is on home screen
    if (await Sandstorm.isElementVisible(homePageLocators.home + '-selected')) {
      console.log('Info: HomeTab is selected');
      //Navigate to Guide Tab
      let flagForHomeTabFocused = 0;
      while (flagForHomeTabFocused < 100) {
        let isHomeTabFocused =
          (await Sandstorm.isElementFocused(
            homePageLocators.home + homePageLocators.labelSuffix
          )) ||
          (await Sandstorm.isElementFocused(
            homePageLocators.home +
              homePageLocators.labelSuffix +
              homePageLocators.selectedSuffix
          )) ||
          (await Sandstorm.isElementFocused(guidePageLocators.guideLabel)) ||
          (await Sandstorm.isElementFocused(
            guidePageLocators.guideLabel + '-selected'
          ));
        if (isHomeTabFocused) {
          console.log('Info: Home/Guide tab is focused.');
          break;
        } else {
          await Sandstorm.dpadLeft();
          flagForHomeTabFocused++;
        }
      }
      if (
        (await Sandstorm.isElementFocused(
          homePageLocators.home + homePageLocators.labelSuffix
        )) ||
        (await Sandstorm.isElementFocused(
          homePageLocators.home +
            homePageLocators.labelSuffix +
            homePageLocators.selectedSuffix
        ))
      ) {
        await Sandstorm.dpadDown();
        await Sandstorm.wait(1);
      }
      await Sandstorm.ok();
      let isUserOnGuidePage = false;
      for (let guideCount = 0; guideCount < 3; guideCount++) {
        isUserOnGuidePage =
          (await Sandstorm.isElementFocused(
            guidePageLocators.programTile + '0-0'
          )) ||
          (await Sandstorm.isElementFocused(
            guidePageLocators.programTile + '0-1'
          )) ||
          (await Sandstorm.isElementFocused(
            guidePageLocators.gridFilterPrefix + 'all_channels'
          ));
        if (isUserOnGuidePage) {
          console.log('Info: User is on Guide Screen.');
          break;
        }
        await Sandstorm.wait(2);
      }
      if (!isUserOnGuidePage) {
        console.log('Fail: User is NOT on Guide Screen.');
        throw 'Error: Guide Screen not loaded';
      }
    } else if (await Sandstorm.isElementVisible('grid_guide-selected')) {
      console.log('Info: GuideTab is selected');
      //if user is on guide screen
      //Navigate to first program of current tab
      await Sandstorm.pressBack();
      await Sandstorm.wait(2);
      let isGuideSelectedFocused = await Sandstorm.isElementFocused(
        guidePageLocators.guideLabel + '-selected'
      );
      if (isGuideSelectedFocused) {
        await Sandstorm.ok();
      }

      //navigate to Guide tabs on top
      await Sandstorm.dpadUp();
      await Sandstorm.wait(1);

      //Navigate to All Channels tab
      let flagForAllChannels = 0;
      while (flagForAllChannels < 15) {
        let isAllChannelsFocused = await Sandstorm.isElementFocused(
          guidePageLocators.gridFilterPrefix + 'all_channels'
        );
        if (isAllChannelsFocused) {
          console.log('Info: All Channels tab is focused.');
          break;
        } else {
          await Sandstorm.dpadLeft();
          flagForAllChannels++;
        }
      }

      //Validate All Channels tab is focused
      await Sandstorm.seeElement(
        await Sandstorm.getPlatformIDFocused(
          guidePageLocators.gridFilterPrefix + 'all_channels'
        )
      );

      //Navigate to first program of 'All-Channels' tab

      let isGuideProgramVisible = false;
      for (let visibleCount = 0; visibleCount < 5; visibleCount++) {
        isGuideProgramVisible =
          (await Sandstorm.isElementVisible(
            guidePageLocators.programTile + '0-0'
          )) ||
          (await Sandstorm.isElementVisible(
            guidePageLocators.programTile + '0-1'
          ));
        if (isGuideProgramVisible) {
          console.log('Info: First/Second program is visible');
          break;
        }
        await Sandstorm.wait(2);
      }
      if (!isGuideProgramVisible) {
        assert.fail('Fail: First/Second program is NOT visible');
      }

      await Sandstorm.wait(2);
      await Sandstorm.dpadDown();

      let isGuideProgramFocused = false;
      for (let focusCount = 0; focusCount < 5; focusCount++) {
        isGuideProgramFocused =
          (await Sandstorm.isElementFocused(
            guidePageLocators.programTile + '0-0'
          )) ||
          (await Sandstorm.isElementFocused(
            guidePageLocators.programTile + '0-1'
          ));
        if (isGuideProgramFocused) {
          console.log('Info: First/Second program is Focused');
          break;
        }
        await Sandstorm.wait(2);
      }
      if (!isGuideProgramFocused) {
        assert.fail('Fail: First/Second program is NOT focused');
      }
    }

    console.log('Info: Navigating back to home screen');
    //Navigate to Home Tab
    let flagForNavigationTabFocused = 0;
    let isNavigationTabFocused = false;
    while (flagForNavigationTabFocused < 100) {
      isNavigationTabFocused =
        (await Sandstorm.isElementFocused(guidePageLocators.guideLabel)) ||
        (await Sandstorm.isElementFocused(
          guidePageLocators.guideLabel + '-selected'
        )) ||
        (await Sandstorm.isElementFocused('search-label')) ||
        (await Sandstorm.isElementFocused('search-label-selected')) ||
        (await Sandstorm.isElementFocused('home-label')) ||
        (await Sandstorm.isElementFocused('home-label-selected')) ||
        (await Sandstorm.isElementFocused('settings-label')) ||
        (await Sandstorm.isElementFocused('settings-label-selected')) ||
        (await Sandstorm.isElementFocused('dvr-label')) ||
        (await Sandstorm.isElementFocused('dvr-label-selected')) ||
        (await Sandstorm.isElementFocused('on_demand-label')) ||
        (await Sandstorm.isElementFocused('on_demand-label-selected'));
      if (isNavigationTabFocused) {
        console.log('Info: Navigation tab is focused.');
        break;
      } else {
        await Sandstorm.dpadLeft();
        flagForNavigationTabFocused++;
      }
    }
    if (isNavigationTabFocused) {
      for (let countFocus = 0; countFocus < 20; countFocus++) {
        if (countFocus < 10) {
          await Sandstorm.dpadUp();
        } else {
          await Sandstorm.dpadDown();
        }
        await Sandstorm.wait(1);
        let isHomeTabFocused = await Sandstorm.isElementFocused(
          homePageLocators.home + homePageLocators.labelSuffix
        );
        if (isHomeTabFocused) {
          console.log('Info: Home tab is focused.');
          break;
        }
      }
      await Sandstorm.ok();
      await Sandstorm.wait(2);
      await Sandstorm.waitForElement(
        await Sandstorm.getPlatformID(
          `${homePageLocators.spotLightItem}0${homePageLocators.focusedSuffix}`
        ),
        45
      );
    } else {
      console.log('Fail: Naviagtion Tab is not focused');
    }
  }

  async signOut() {
    const {Sandstorm} = this.helpers;
    // Navigate left to open Main Menu
    let flagForHomeTabFocused = 0;
    while (flagForHomeTabFocused < 100) {
      let isHomeTabFocused =
        (await Sandstorm.isElementFocused(
          homePageLocators.home + homePageLocators.labelSuffix
        )) ||
        (await Sandstorm.isElementFocused(
          homePageLocators.home +
            homePageLocators.labelSuffix +
            homePageLocators.selectedSuffix
        )) ||
        (await Sandstorm.isElementFocused(guidePageLocators.guideLabel)) ||
        (await Sandstorm.isElementFocused(
          guidePageLocators.guideLabel + '-selected'
        ));
      if (isHomeTabFocused) {
        console.log('Info: Home/Guide tab is focused.');
        break;
      } else {
        await Sandstorm.dpadLeft();
        flagForHomeTabFocused++;
      }
    }
    await Sandstorm.wait(1);
    //Navigate to Settings tab
    let flagForReachingSettingsTab = 0;
    while (flagForReachingSettingsTab < 10) {
      let isSettingFocused =
        (await Sandstorm.isElementFocused('settings-label')) ||
        (await Sandstorm.isElementFocused('settings-label-selected'));
      if (isSettingFocused) {
        console.log('Info: Settings tab is focused.');
        break;
      } else {
        await Sandstorm.dpadUp();
        flagForReachingSettingsTab++;
      }
    }
    //Select Settings tab
    await Sandstorm.ok();
    //Select Account
    await Sandstorm.ok();
    //Select user
    await Sandstorm.ok();
    await Sandstorm.dpadLeft();
    await Sandstorm.ok();
    await Sandstorm.wait(3);
  }
}

module.exports = LoginHelper;
