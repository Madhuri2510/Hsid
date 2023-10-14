/* eslint-disable no-undef */
let currentUser;
const userType = require('../config/user');
const clientConfig = require('../clientConfig');
const signInLocators = require('../pages/SignIn/locators.js');
const homePageLocators = require('../pages/home/HomeScreenLocators.json');
var env = require('../config/env');
const {clearString} = require('codeceptjs/lib/utils');

class LoginHelper extends Helper {
  constructor(config) {
    super(config);

    // set defaults
    this.options = {
      env: 'dev_browser_prod',
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

  async login(user, reqLogin) {
    if (!reqLogin || user !== currentUser) {
      const {WebDriver} = this.helpers;
      //if current user is not undefined
      if (currentUser) {
        console.log('Relaunching browser...');
        await WebDriver._stopBrowser();
        await WebDriver._startBrowser();
        await WebDriver.amOnPage(WebDriver.options.baseUrl);
      }
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
            console.log(
              `Login in with - Username: ${username}  Password:${password}`
            );
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
    const {WebDriver} = this.helpers;
    await WebDriver.waitForElement(signInLocators.identifiers.emailField, 45);
    await WebDriver.fillField(signInLocators.identifiers.emailField, username);
    await WebDriver.click(signInLocators.identifiers.passwordField);
    await WebDriver.fillField(
      signInLocators.identifiers.passwordField,
      password
    );
    await WebDriver.click(signInLocators.identifiers.signInButton);
    // Verify user lands on home screen, first spotlight tile.
    await WebDriver.waitForElement(`${homePageLocators.spotLightItem}0`, 30);
  }

  //TODO: Need to implement if required
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
    if (!this.options.disableScreenshots) {
      let fileName = clearString(test.title);
      const uuid = test.uuid || test.ctx.test.uuid;
      //image with long file name will not be accessed/found by browser
      fileName = `${fileName.substring(0, 10)}_${uuid}`;
      if (test._retries < 1 || test._retries === test.retryNum) {
        fileName = `${fileName}.failed`;
      }
    }
  }
}

module.exports = LoginHelper;
