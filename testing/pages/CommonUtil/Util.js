/* eslint-disable no-undef */
const {I, platformName} = inject();
const guidePage = {};
const assert = require('assert');
const testExecutionWaits = {};//require('../../config/testExecutionWaits');
const {platform} = platformName;
const signInlocators = {};//require('../SignIn/locators');
const CmwUtil = {};//require('./backend/CmwUtil');
const UmsUtil = {};//require('./backend/UmsUtil');
const tenFtJsPlatform = {};//require('../../config/platform/tenftjs');
let umsUtil = null;
let cmwUtil = null;

module.exports = {
  // Its same as I.seeElement() but can validate an array of locators one by one.
  // 'locators' : Locators should be passed as array.
  async seeElements(locators) {
    var i;
    var platformLoc;
    for (i = 0; i < locators.length; i++) {
      platformLoc = await I.getPlatformID(locators[i]);
      if (!(platform === 'android' && locators[i].includes('rentals'))) {
        await I.seeElement(platformLoc);
      }
    }
  },

  /**
  * Waits for any locatorID in an array of locators.
  * Returns: An array of booleans that map to the locators provided to the function based on order. False if not found, True if found.
  * IMPORTANT: This will always resolve to ONE LOCATOR found even when many can be found. Make sure to ONLY USE THIS when you are searching for elements that CANNOT be found at the same time.
    Or when you are trying to determine if any of the given elements exist and dependence on all existing isn't an issue.
  * Deafult wait time is 5 sec, can be changed while calling this function.
  * Fails the test if none of elemnts found in given time.
  */
  async waitForAnyElement(locators, sec = 5, assertOnFail = true) {
    var iteration = 0;
    var locatorFound = false;
    var loc;
    while (iteration < sec) {
      var i;
      for (i = 0; i < locators.length; i++) {
        if (await I.isElementVisible(locators[i])) {
          loc = locators[i];
          locatorFound = true;
          break;
        }
      }
      if (locatorFound) {
        break;
      }
      await I.wait(1); // wait 1sec as checking the locators every 1 sec unitl given time out
      iteration += 1;
    }
    if (!locatorFound) {
      if (assertOnFail) {
        assert.fail(`Unable to find any element using locators: ${locators}`);
      } else {
        return locators.map((n) => false);
      }
    }
    return locators.map((n) => n == loc);
  },

  // Used to validate that parameter is defined and of specified type
  validateParameter({param, type, funcName, paramName}) {
    if (type.toLowerCase() === 'array') {
      if (param === undefined || param === null || !Array.isArray(param)) {
        this.assertionFailure({
          message: `${funcName} requires ${paramName} as a ${type} parameter`,
        });
      }
    } else if (param === undefined || param === null || typeof param !== type) {
      this.assertionFailure({
        message: `${funcName} requires ${paramName} as a ${type} parameter`,
      });
    }
  },

  validateVariable({variable, type, funcName, varName}) {
    if (
      variable === undefined ||
      variable === null ||
      typeof variable !== type
    ) {
      this.assertionFailure({
        message: `${funcName}: ${varName} is invalid. Not of type: ${type}`,
      });
    }
  },

  // Used to fail a testcase with a given message. Outputs stack-trace before message.
  // Object Params:
  // - message: string
  // Returns: Never
  assertionFailure({message}) {
    if (
      message === undefined ||
      message === null ||
      typeof message !== 'string'
    ) {
      console.log(new Error().stack);
      assert(
        false,
        "{message} parameter of type string must be provided to 'assertionFailure'"
      );
    }

    console.log('Assertion Failure - stack trace: ');
    var errorStack = new Error().stack.split('\n');
    errorStack.shift();
    errorStack.shift(); // Shift twice to get rid of error line and current scope.
    var errorStackString = errorStack.join('\n');
    console.log(errorStackString);

    assert.fail(message);
  },

  // Should work for 'On Demand' and 'DVR' tabs navigation.
  // Move focus to the given Sub Tab from any ribbon on the given Sub Tab.
  // Should be called only when you are on 'On Demand' or 'DVR' from any Sub Tab.
  async moveFocusToSubTabs(subTabName) {
    var iteration = 0;
    var stName = subTabName.split('_').pop();
    while (true) {
      iteration += 1;
      let isTabFocused = await I.isElementFocused(subTabName);
      if (!isTabFocused) {
        await I.dpadUp();
      } else {
        break;
      }
      if (iteration > 40) {
        var errorMSG =
          'Unable find ' +
          subTabName +
          ', cannot to move focus to subtab ' +
          stName.toUpperCase();
        assert.equal(true, false, errorMSG);
      }
    }
    await I.reportLog(
      'Moved focus to ' +
        stName.charAt(0).toUpperCase() +
        stName.slice(1) +
        ' subtab'
    );
  },

  // Should work for 'On Demand' and 'DVR' tabs navigation.
  // Navigate to any Sub Tab from given Sub Tab(move focus to target Sub Tab).
  // fromSubTab: Provide the Sub Tab name you are calling from
  // toSubTab: Provide Sub Tab name you want to move.
  // 'fromSunTab','toSubTab' : Should call from 'subTabs' json like: this.subTabs.all, this.subTabs.movies etc..
  // if you want to call from test.js the use onDemandPage.subTabs.all,onDemandPage.subTabs.movies etc..
  async navigateSubTab(fromSubTab, toSubTab) {
    await this.moveFocusToSubTabs(fromSubTab);
    var iteration = 0;
    var tstName = toSubTab.split('_').pop();
    let numberOfSubTabs = 6;
    while (true) {
      iteration += 1;
      let isTabFocused = await I.isElementFocused(toSubTab);
      if (!isTabFocused) {
        if (iteration <= numberOfSubTabs) {
          await I.dpadRight();
        } else {
          await I.dpadLeft();
        }
      } else {
        break;
      }
      // Wait for sub tab to load
      await I.wait(testExecutionWaits.WAIT_FOR_SUB_TAB_LOAD);
      if (iteration > 13) {
        var errorMSG =
          'Unable find ' +
          toSubTab +
          ', cannot to navigate to subtab ' +
          tstName.toUpperCase();
        assert.equal(true, false, errorMSG);
      }
    }
    await I.reportLog(
      'Navigated to ' +
        tstName.charAt(0).toUpperCase() +
        tstName.slice(1) +
        ' subtab'
    );
  },

  //To compare actual and expected string without "\"
  assertText(actual, expected) {
    actual = actual.toString().replace(/\\"/g, '"');
    expected = expected.toString().replace(/\\"/g, '"');
    assert.strictEqual(
      actual,
      expected,
      `Both Text should match: Actual is ${actual} ::: Expected is ${expected}`
    );
  },

  /**
   * returns trimmed string without nonalpha characters in starting ending
   * @param {inputString} string
   */
  getTrimmedString(inputString) {
    return inputString.replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/gi, '');
  },

  async enterTextInField({text, fieldLocator, appleTextEntryTitle}) {
    console.log(`Filling field ${fieldLocator} with text`);
    if (platform === 'apple') {
      await this.fillFieldApple({text, fieldLocator, appleTextEntryTitle});
    } else if (platform === 'android') {
      await I.fillField(fieldLocator, text);
      await I.pressEnter();
    } else if (platform === 'firetv') {
      await I.fillField(fieldLocator, text);
      await I.pressBack();
    } else if (platform === 'tenftjs') {
      await I.fillField(`${fieldLocator}-focused`, text);
      await I.dpadDown();
    }
  },

  async fillFieldApple({text, fieldLocator, appleTextEntryTitle}) {
    console.log(
      `Filling in field ${fieldLocator} with ${text} on Apple platform`
    );
    await I.ok();
    let [
      atEnterNew,
      atEmailfieldEntry,
      atPasswordEntry,
    ] = await this.waitForAnyElement(
      [
        signInlocators.identifiers.apple.previouslyUsedEmailsLabel,
        signInlocators.identifiers.apple.emailEntryTitle,
        signInlocators.identifiers.apple.passwordEntryTitle,
      ],
      30
    );

    if (atEnterNew) {
      await I.wait(2); // Wait for animations to finish, cannot wait for identifiers here.
      await I.dpadDown(10);
      await I.wait(1); // Wait for animations to finish, cannot wait for identifiers here.
      await I.ok();
      await I.waitForElement(appleTextEntryTitle, 10);

      await this.fillFieldAppleInternal({text, appleTextEntryTitle});
    } else if (atEmailfieldEntry || atPasswordEntry) {
      await this.fillFieldAppleInternal({text, appleTextEntryTitle});
    } else {
      // assert.fail('Unable to find any text entry page elements for Apple');
      await I.see('');
    }
    await I.dpadDown();
  },

  async fillFieldAppleInternal({text, appleTextEntryTitle}) {
    await I.fillField(appleTextEntryTitle, text);
    await I.dpadDown(10);
    await I.wait(1); // Wait for animations to finish, cannot wait for identifiers here.
    await I.ok();
    await I.wait(1); // Wait for animations to finish, cannot wait for identifiers here.
  },
  /**
   * Checks if the current platform is 10 Feet or not
   * @returns {boolean} true if the current platform is 10 Feet else false
   */
  async isTenFeetJS() {
    return (
      typeof I.getPlatform === 'function' &&
      Object.values(tenFtJsPlatform.types).indexOf(await I.getPlatform()) > -1
    );
  },

  /**
   * Checks if the current platform type is LG or not
   * @returns {boolean} if the current platform is LG else false
   */
  async isLG() {
    return (
      typeof I.getPlatform === 'function' &&
      (await I.getPlatform()) === tenFtJsPlatform.types.LG
    );
  },

  /**
   * Checks if the current platform type is Samsung or not
   * @returns {boolean} if the current platform is Samsung else false
   */
  async isSamsung() {
    return (
      typeof I.getPlatform === 'function' &&
      (await I.getPlatform()) === tenFtJsPlatform.types.SAMSUNG
    );
  },

  /**
   * Checks if the current platform type is Hosted 10 Feet or not
   * @returns {boolean} if the current platform is Hosted 10 Feet else false
   */
  async isHosted10Feet() {
    return (
      typeof I.getPlatform === 'function' &&
      (await I.getPlatform()) === tenFtJsPlatform.types.HOSTED10FT
    );
  },

  /**
   * Checks if the current platform type is Comcast or not
   * @returns {boolean} if the current platform is Comcast else false
   */
  async isComcast() {
    return (
      typeof I.getPlatform === 'function' &&
      (await I.getPlatform()) === tenFtJsPlatform.types.COMCAST
    );
  },

  /**
   * Checks if the current platform type is Xbox or not
   * @returns {boolean} if the current platform is Comcast else false
   */
  async isXbox() {
    return (
      typeof I.getPlatform === 'function' &&
      (await I.getPlatform()) === tenFtJsPlatform.types.XBOX
    );
  },
  async isFireTV() {
    return (
      typeof I.getPlatform === 'function' &&
      (await I.getPlatform()) === 'ANDROID'
    );
  },
  /**
   * converts current time into minutes
   * @returns current time in minutes
   */
  getCurrentTimeInMinutes() {
    const today = new Date();
    const hrs = today.getHours();
    const mins = today.getMinutes();
    return hrs * 60 + mins;
  },
  /**
   * Gets the channels list based on the filters passed as parametes and store it in JSON format.
   * filterId: all channels, my channels, kids, movies, sports, news
   * isOTA: true for getting OTA channels list
   * @param {string} filterId
   * @param {String} page_size
   * @param {boolean} isOTA
   */
  async updateChannelsList(filterId, page_size = 'small', isOTA = false) {
    umsUtil = new UmsUtil();
    cmwUtil = new CmwUtil();
    const cmwAllChannelsData = await cmwUtil.getGuideFilter(
      filterId,
      page_size,
      isOTA
    );
    await guidePage.getChannelsNamesFromCMW(cmwAllChannelsData);
  },
  /**
  * Waits for any locatorID in an array of locators.
  * Returns: An array of booleans that map to the locators provided to the function based on order. False if not found, True if found.
  * IMPORTANT: This will always resolve to ONE LOCATOR found even when many can be found. Make sure to ONLY USE THIS when you are searching for elements that CANNOT be found at the same time.
    Or when you are trying to determine if any of the given elements exist and dependence on all existing isn't an issue.
  * Deafult wait time is 5 sec, can be changed while calling this function.
  * It returns false if none of the elements are found
  */
  async verifyLocatorsAvaliablity(locators, sec = 5) {
    var iteration = 0;
    while (iteration < sec) {
      var i;
      for (i = 0; i < locators.length; i++) {
        if (await I.isElementVisible(locators[i])) {
          return true;
        } else if (i === locators.length - 1) {
          return false;
        }
      }
    }
  },

  /**
   * This method returns Time in HH:mm AM/PM format
   * @param {string} timeStr - 10AM, 11:30PM
   * @return Time in HH:mm AM/PM format
   */
  getTimeWithAMPM(timeStr) {
    const num = timeStr.match(/\d+/g);
    const letr = timeStr.match(/[a-zA-Z]+/g);
    return num.length > 1
      ? `${num[0]}:${num[1]} ${letr[0]}`
      : `${num[0]}:00 ${letr[0]}`;
  },

  /**
   * This method returns Time string
   * @param {string} timeStr - 10AM, 11:30PM
   * @param {number} noOfDays of days to add in current date - 1,2
   * @return Time string
   */
  getDateTimeForDuration(timeStr, noOfDays = 0) {
    let date = new Date();
    const time = this.getTimeWithAMPM(timeStr);
    date = date.setDate(date.getDate() + noOfDays);
    const returnDate = new Date(date).toLocaleDateString();
    return new Date(returnDate + ' ' + time).getTime();
  },
  /**
   * Converts the given input string time to date object
   * @param {string} time to compare eg. 1-3PM,3PM-3AM,Aug 5,3-4PM etc
   * @returns {Date} returns corresponding date
   */
  convertProgramDurationToDateTime(time) {
    let [startTimeSection, endTimeSection] = time.split('-');
    //get the start program time section without spaces
    let parsedStartTime = this.parseProgramTime(startTimeSection);
    let parsedEndTime = this.parseProgramTime(endTimeSection, parsedStartTime);
    //get the start time out
    let startTime = parsedStartTime.time;
    let endTime = parsedEndTime.time;
    //Sometimes AM and PM is not present in start time section eg 7-9PM to get from the end time (9PM) and append to start time as convert to 24h expect PM or AM to be appended
    if (!startTime.includes('PM') && !startTime.includes('AM')) {
      if (endTime.includes('AM')) {
        startTime += 'AM';
      } else {
        startTime += 'PM';
      }
    }
    //Convert to 24h format
    let startTimeIn24h = this.convertTo24h(startTime);
    let endTimeIn24h = this.convertTo24h(endTime);
    //Create start and end date object by parsing precomputed year and month and 24h time
    let startDate = new Date(
      Date.parse(
        `${parsedStartTime.month} ${parsedStartTime.day},${parsedStartTime.year},${startTimeIn24h}`
      )
    );
    let endDate = new Date(
      Date.parse(
        `${parsedEndTime.month} ${parsedEndTime.day},${parsedEndTime.year},${endTimeIn24h}`
      )
    );
    //Handel case 11PM-1AM where end date is next day
    if (+startDate > +endDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    return {
      startDate: startDate,
      endDate: endDate,
    };
  },
  /**
   * Converts the given string to 24h format
   * @param {string} time in format 3:00PM , 3PM
   * @returns {string} time in format 23:00
   */
  convertTo24h(time) {
    let amOrPM = time.slice(-2);
    time = time.slice(0, -2);
    let [hours, minutes] = time.split(':');
    if (!minutes) {
      minutes = '00';
    }
    if (hours === '12') {
      hours = '00';
    }
    if (amOrPM === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  },
  /**
   * Parse the program time to extract year month day time
   * @param {string} time in format 7 // 7PM // 2Aug,7PM // 2020,2Aug,7PM
   * @param {Object} reference to get the details out from, if cannot be parsed
   * @returns {Object} {year,month day,time}
   */
  parseProgramTime(time, reference) {
    let splittedTime = time
      .trim()
      .split(',')
      .map((val) => val.trim());
    const date = new Date();
    let result = {};
    //if in case month day and year not present
    if (splittedTime.length === 1) {
      result.year = reference?.year ?? date.getFullYear();
      result.month =
        reference?.month ?? date.toLocaleString('default', {month: 'short'});
      result.day = reference?.day ?? date.getDate();
      result.time = splittedTime[0];
      //if just year is not present
    } else if (splittedTime.length === 2) {
      result.year = reference?.year ?? date.getFullYear();
      let [month, day] = splittedTime[0].split(' ');
      result.month = month;
      result.day = day;
      result.time = splittedTime[1];
    } else {
      result.year = splittedTime[0];
      let [month, day] = splittedTime[1].split(' ');
      result.month = month;
      result.day = day;
      result.time = splittedTime[2];
    }
    return result;
  },

  randomNumber(maxCount) {
    return Math.floor(Math.random() * maxCount) + 1;
  },

  /**
   * Waits to hide the locator
   * @param {string} locator locator of element
   * @param {number} sec wait time. Default wait time is 2 sec, can be changed while calling this function.
   * @returns {boolean} true is locator is not visible else false
   */
  async waitToHideElement(locator, sec = 2) {
    var iteration = 0;
    var locatorHidden = false;
    while (iteration < sec) {
      if (!(await I.isElementVisible(locator))) {
        locatorHidden = true;
        break;
      }
      await I.wait(testExecutionWaits.WAIT_FOR_POLLING);
      iteration += testExecutionWaits.WAIT_FOR_POLLING;
    }
    return locatorHidden;
  },

  /* Get hours from milliseconds
   * @param {number} ms time in milliseconds
   * @returns {string} hours
   */
  getHoursFromMilliSeconds(ms) {
    let hh = new Date(ms).getHours() % 12;
    if (hh === 0) {
      hh = 12;
    }
    return `${hh}`;
  },

  /**
   * Get meridian from milliseconds
   * @param {number} ms time in milliseconds
   * @returns {string} meridian AM/PM
   */
  getMeridianFromMilliSeconds(ms) {
    if (new Date(ms).getHours() >= 12) {
      return 'PM';
    } else {
      return 'AM';
    }
  },

  /**
   * Get minutes from milliseconds
   * @param {number} ms time in milliseconds
   * @returns {string} minutes
   */
  getMinutesFromMilliSeconds(ms) {
    const minutes = new Date(ms).getMinutes();
    if (minutes < 10) {
      return `0${minutes}`;
    } else {
      return `${minutes}`;
    }
  },

  /**
   * Waits to show the locator
   * @param {string} locator locator of element
   * @param {number} sec wait time. Default wait time is 2 sec, can be changed while calling this function.
   * @returns {boolean} true is locator is visible else false
   */
  async waitToSeeElement(locator, sec = 2) {
    var iteration = 0;
    var locatorVisible = false;
    while (iteration < sec) {
      if (await I.isElementVisible(locator)) {
        locatorVisible = true;
        break;
      }
      await I.wait(testExecutionWaits.WAIT_FOR_POLLING);
      iteration += testExecutionWaits.WAIT_FOR_POLLING;
    }
    return locatorVisible;
  },

  getRandomNumberInRange(min, max) {
    return Math.trunc(Math.random() * (max - min + 1) + min);
  },
};
