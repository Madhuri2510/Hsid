/* eslint-disable no-undef */
let currentUser;
const userType = require('../config/user');
const clientConfig = require('../clientConfig');
const signInLocators = require('../pages/SignIn/locators.js');
const landingScreenLocators = require('../pages/LandingPage/locators');
var env = require('../config/env');
const {clearString} = require('codeceptjs/lib/utils');

class LoginHelperViaAppium extends Helper {
  constructor(config) {
    super(config);

    //this.helpers['Appium']
    // set defaults
    this.options = {
      env: 'dev_tvos_prod',
      defultuser: 'global',
    };
    this._createConfig(config);
  }

  _createConfig(config) {
    Object.assign(this.options, config);
  }

  /**
   * launch or relaunch app and login with reuqied user for suite.
   * @param  suite
   */
  async _afterSuite(suite) {
    //setting reuse=true in detox configuration causes issue if application is not installed first time
    //for next suite doesn't require to reinstall application
    // this.helpers.Detox.options.reuse = true;
    currentUser = '';
  }

  async _before(test) {
    if (test._currentRetry && test._currentRetry > 0) {
      return;
    }
    const user = this.getOpt(test, 'user', this.options.defultuser);
    const reqLogin = this.getOpt(test, 'reqLogin', true);
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
  async navigateToEnvironment(environmentName) {
    const {AppiumDpadHelper, AppiumHelper} = this.helpers;
    for (let i = 0; i < 8; i++) {
      if (await AppiumHelper.isElementFocused(environmentName)) {
        await AppiumDpadHelper.ok();
        break;
      } else {
        await AppiumDpadHelper.dpadDown();
      }
    }
  }
  async selectEnv(env) {
    const {AppiumHelper} = this.helpers;
    let envFound = false;
    if (
      await AppiumHelper.isElementVisible(
        landingScreenLocators.identifiers.selectEnvironment
      )
    ) {
      if (
        await AppiumHelper.isElementFocused(
          landingScreenLocators.identifiers.prod
        )
      ) {
        envFound = true;
        if (env.includes('prod')) {
          await this.navigateToEnvironment(
            landingScreenLocators.identifiers.prod
          );
        } else {
          const env2 = env.replace('dev_android_', '');
          await this.navigateToEnvironment(env2);
        }
      }
      if (!envFound) {
        console.log('Production Environment not focused');
      }
    } else {
      console.log('Select Environment screen not display');
    }
  }
  async login(user, reqLogin, reinstall = true) {
    if (!reqLogin || user !== currentUser) {
      console.log('Relaunching app...');
      const {AppiumHelper} = this.helpers;
      await AppiumHelper.reloadApp();
      await this.selectEnv(this.options.env);
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
            //await this.needToLogin(username, password);
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

  async needToLogin(username, password) {
    const {AppiumHelper} = this.helpers;
    const isVisible = await AppiumHelper.isElementVisible(
      signInLocators.homeScreen.homeTabIdentifierSelected,
      120
    );

    if (isVisible) {
      await this._login(username, password);
    }
  }

  async _login(username, password) {
    const {AppiumDpadHelper, AppiumHelper} = this.helpers;
    // await AppiumHelper.waitForElementForVisibility(
    //   await AppiumHelper.getPlatformID(
    //     landingScreenLocators.identifiers.exploreChannelsButton
    //   ),
    //   30
    // );
    for (let i = 0; i < 3; i++) {
      if (
        !(await AppiumHelper.isElementFocused(
          landingScreenLocators.identifiers.signInButton
        ))
      ) {
        await AppiumDpadHelper.dpadDown();
        await AppiumHelper.wait(5);
      }
    }

    await AppiumHelper.waitForElement(
      await AppiumHelper.getPlatformIDFocused(
        landingScreenLocators.identifiers.signInButton
      ),
      30
    );

    await AppiumDpadHelper.ok();
    await AppiumHelper.waitForElement(
      await AppiumHelper.getPlatformID(signInLocators.labels.emailPlaceholder),
      30
    );

    // Set input fields value
    await AppiumHelper.wait(5);
    await AppiumHelper.fillTextField(
      username,
      await AppiumHelper.getPlatformID(signInLocators.labels.emailPlaceholder),
      signInLocators.identifiers.apple.emailEntryTitle
    );
    await AppiumDpadHelper.dpadDown();

    await AppiumHelper.fillTextField(
      password,
      await AppiumHelper.getPlatformID(
        signInLocators.labels.passwordPlaceholder
      ),
      signInLocators.identifiers.apple.passwordEntryTitle
    );

    await AppiumDpadHelper.dpadDown();
    await AppiumHelper.wait(3);
    //moving to signin
    await AppiumHelper.seeElement(
      await AppiumHelper.getPlatformIDFocused(
        signInLocators.identifiers.signInButton
      )
    );
    // Click on the Sign in Button
    await AppiumDpadHelper.ok();
    console.log('Loading the landing page');
    await AppiumHelper.waitForElement(
      await AppiumHelper.getPlatformID(
        signInLocators.homeScreen.homeTabIdentifierSelected
      ),
      30
    );
  }

  async loginSlingFree() {
    const {AppiumDpadHelper, AppiumHelper} = this.helpers;
    await AppiumHelper.waitForElement(
      await AppiumHelper.getPlatformID(
        landingScreenLocators.identifiers.exploreChannelsButton
      ),
      30
    );
    await AppiumDpadHelper.dpadDown(2);
    await AppiumHelper.waitForElement(
      await AppiumHelper.getPlatformIDFocused(
        landingScreenLocators.identifiers.signInButton
      ),
      30
    );
    await AppiumDpadHelper.dpadUp(2);
    await AppiumDpadHelper.pressEnter();
    // Verify user lands on home screen after sign in
    await AppiumHelper.waitForElement(
      await AppiumHelper.getPlatformID(
        signInLocators.homeScreen.homeTabIdentifierSelected
      ),
      45
    );
  }

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
    if (!this.options.disableScreenshots) {
      let fileName = clearString(test.title);
      const uuid = test.uuid || test.ctx.test.uuid;
      //image with long file name will not be accessed/found by browser
      fileName = `${fileName.substring(0, 10)}_${uuid}`;
      if (test._retries < 1 || test._retries === test.retryNum) {
        fileName = `${fileName}.failed`;
        // try {
        //     let drivers = this.helpers['Appium'];
        //     await drivers.takeScreenshot(fileName)
        // } catch (error) {
        //     //do nothing
        //     console.log(error);
        // }
        await this.cleanUp(test);
      }
    }
  }

  async _passed(test) {
    await this.cleanUp(test);
  }

  async cleanUp(test) {
    const user = this.getOpt(test, 'user', this.options.defultuser);
    const signout = this.getOpt(test, 'signout', false);
    if (user === 'cold' || signout) {
      console.log('Relaunching app...');
      const {AppiumHelper} = this.helpers;
      await AppiumHelper.reloadApp();
      // this.device = this.helpers['Appium'].device;
      // await device.launchApp({ delete: true });
      currentUser = '';
    }
  }
}

module.exports = LoginHelperViaAppium;
