/* eslint-disable no-undef */
const helper = codecept_helper;
const assert = require('assert');
const signInLocators = require('../pages/OnStreamSignInPage/OnStreamSignInPageLocators.json');
const homeDir = require('os').homedir();
const filePath = homeDir + '/RN_Builds/TenFoot-tvOS.app';
var i;

class AppiumHelper extends helper {
  constructor(config) {
    super(config);
  }
  async reloadApp() {
    const {Appium} = this.helpers;
    await Appium.browser.removeApp('com.dishdigital.sling-dev');
    await Appium.browser.installApp(filePath);
    await Appium.browser.launchApp();
  }
  async relaunchApp() {
    const {Appium} = this.helpers;
    await Appium.browser.launchApp();
  }
  // Returns Appium ID with prefixing "~" for given locator
  async getPlatformID(id) {
    return '~' + id;
  }

  // Returns Appium Focused ID with prefixing "~"
  // and adding "-focused" at the end of given locator
  async getPlatformIDFocused(id) {
    let focusedLocator = '~' + id + '-focused';
    return focusedLocator;
  }

  // Returns 'true' if the given locator(ID) is focused , returns 'false' if not
  async isElementFocused(locator) {
    try {
      let focusedLocator = await this.getPlatformIDFocused(locator);
      const helper = this.helpers['Appium'];
      const eleVisible = await helper.grabNumberOfVisibleElements(
        focusedLocator
      );
      if (eleVisible > 0) {
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  // Returns 'true' if the given locator(ID) is visible, returns 'false' if not.
  /*async isElementVisible(locator, needPlatformId = true) {
    try {
      var locatorId = '';
      if (needPlatformId) {
        locatorId = await this.getPlatformID(locator);
      } else {
        locatorId = locator;
      }
      const helper = this.helpers['Appium'];
      const eleVisible = await helper.grabNumberOfVisibleElements(locatorId);
      if (eleVisible > 0) {
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  }*/

  // Returns the X and Y coordinates for the given LocatorID.
  // Do not pass the LocatorID as platform Specific.
  async getElementLocation(locator) {
    const helper = this.helpers['Appium'];
    let locatorId = await this.getPlatformID(locator);
    let coordinates = await helper.grabAttributeFrom(locatorId, 'rect');
    var loc = JSON.parse(coordinates[0]);
    return [loc.y, loc.x];
  }

  // Returns the LocatorID's Label.
  // Do not pass the LocatorID as platform Specific.
  async getElementLabel(locator) {
    const helper = this.helpers['Appium'];
    let label = await helper.grabTextFrom(locator);
    return label;
  }

  // Returns the Locator text
  async getElementText(locator) {
    const helper = this.helpers['Appium'];
    //let locatorId = await this.getPlatformID(locator);
    let text = await helper.grabAttributeFrom(locator, 'text');
    return text;
  }

  // Returns TVOS, so that we can differentiate the platforms to handle platform specific steps.
  async getPlatform() {
    return 'Android';
  }

  // Assert the given label at the given index.
  // Usefull when multiple matches found and wanted at specific Index, Index starts from '0'.
  // Default index is '0'.
  async seeTextExistsAtIndex(locator, index = 0) {
    index += 1;
    const helper = this.helpers['Appium'];
    let textXpath = `//XCUIElementTypeStaticText[@label="${locator}"][${index}]`;
    await helper.seeElement(textXpath);
  }

  async seeElement(locator) {
    console.log(`waiting for element ${locator}`);
    const helper = this.helpers['Appium'];
    helper.seeElement(locator);
  }

  see(text) {
    const helper = this.helpers['Appium'];
    helper.see(text, null);
  }

  dontSee(text, context = null) {
    const helper = this.helpers['Appium'];
    helper.dontSee(text, context);
  }

  async wait(time = 1) {
    const helper = this.helpers['Appium'];
    await helper.wait(time);
  }

  async waitForElement(locator, sec = 5) {
    const helper = this.helpers['Appium'];
    await helper.waitForElement(locator, sec);
  }

  async fillTextField(text, fieldLocator, appleTextEntryTitle) {
    console.log(
      `Filling in field ${fieldLocator} with ${text} on Apple platform`
    );
    const {AppiumDpadHelper, AppiumHelper} = this.helpers;
    await AppiumDpadHelper.ok();

    let [atEnterNew, atTextfieldEntry] = await this.waitForAnyElement(
      [
        signInLocators.identifiers.apple.previouslyUsedEmailsLabel,
        appleTextEntryTitle,
      ],
      30
    );

    if (atEnterNew) {
      await AppiumHelper.wait(2); // Wait for animations to finish, cannot wait for identifiers here.
      await AppiumDpadHelper.dpadDown(10);
      await AppiumHelper.wait(1); // Wait for animations to finish, cannot wait for identifiers here.
      await AppiumDpadHelper.ok();
      await this.waitForElement(
        await this.getPlatformID(appleTextEntryTitle),
        10
      );

      await this.fillFieldAppleInternal(text, fieldLocator);
    } else if (atTextfieldEntry) {
      await this.fillFieldAppleInternal(text, fieldLocator);
    } else {
      // assert.fail('Unable to find any text entry page elements for Apple');
      await AppiumHelper.see('');
    }
  }

  async fillFieldApple(text, fieldLocator, appleTextEntryTitle) {
    console.log(
      `Filling in field ${fieldLocator} with ${text} on Apple platform`
    );
    const helper = this.helpers['Appium'];
    await helper.ok();

    let [atEnterNew, atTextfieldEntry] = await this.waitForAnyElement(
      [
        signInLocators.identifiers.apple.previouslyUsedEmailsLabel,
        appleTextEntryTitle,
      ],
      30
    );

    if (atEnterNew) {
      await helper.wait(2); // Wait for animations to finish, cannot wait for identifiers here.
      await helper.dpadDown(10);
      await helper.wait(1); // Wait for animations to finish, cannot wait for identifiers here.
      await helper.ok();
      await helper.waitForElement(
        await this.getPlatformID(appleTextEntryTitle),
        10
      );

      await this.fillFieldAppleInternal(text, fieldLocator);
    } else if (atTextfieldEntry) {
      await this.fillFieldAppleInternal(text, fieldLocator);
    } else {
      // assert.fail('Unable to find any text entry page elements for Apple');
      await helper.see('');
    }
  }

  async fillFieldAppleInternal(text, fieldLocator) {
    const {AppiumDpadHelper, AppiumHelper} = this.helpers;
    const helper = this.helpers['Appium'];
    await helper.fillField(fieldLocator, text);
    await AppiumDpadHelper.dpadDown(10);
    await AppiumHelper.wait(1); // Wait for animations to finish, cannot wait for identifiers here.
    await AppiumDpadHelper.ok();
    await AppiumHelper.wait(1); // Wait for animations to finish, cannot wait for identifiers here.
  }

  async waitForAnyElement(locators, sec = 5, assertOnFail = true) {
    const {AppiumHelper} = this.helpers;
    var iteration = 0;
    var locatorFound = false;
    var loc;
    while (iteration < sec) {
      var i;
      for (i = 0; i < locators.length; i++) {
        if (await AppiumHelper.isElementVisible(locators[i])) {
          loc = locators[i];
          locatorFound = true;
          break;
        }
      }
      if (locatorFound) {
        break;
      }
      await AppiumHelper.wait(1); // wait 1sec as checking the locators every 1 sec unitl given time out
      iteration += 1;
    }
    if (!locatorFound) {
      if (assertOnFail) {
        assert.fail(`Unable to find any element using locators: ${locators}`);
      } else {
        return locatorFound;
      }
    }
    return locators.map((n) => n == loc);
  }

  async isFocused(locator) {
    const helper = this.helpers['Appium'];
    let isFocused = await helper.grabAttributeFrom(locator, 'focused');
    return isFocused[0] === 'true';
  }

  // Returns 'true' if the given locator(ID) is visible, returns 'false' if not.
  async isElementVisible(locator) {
    try {
      const helper = this.helpers['Appium'];
      const eleVisible = await helper.grabNumberOfVisibleElements(locator);
      if (eleVisible > 0) {
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  async isVisible(locator) {
    const helper = this.helpers['Appium'];
    let isVisible = await helper.grabAttributeFrom(locator, 'displayed');
    return isVisible[0];
  }

  async scrollIntoView(locator, options) {
    const helper = this.helpers['Appium'];
    await helper.scrollTo(locator, options);
  }

  async forceClick(locator) {
    const helper = this.helpers['Appium'];
    await helper.click(locator);
  }

  async getPageUrl() {
    const helper = this.helpers['Appium'];
    let url = helper.grabCurrentUrl();
    return url;
  }

  /**
   * Return browse orientation parameter.
   * @returns {string} PORTRAIT or LANDSCAPE
   */
  getOrientation() {
    return process.argv[7].replace(/'/g, '');
  }

  /**
   * Scroll to the specific visible element.
   * @param {string} locator
   */
  async scrollToElement(locator) {
    const helper = this.helpers['Appium'];
    await helper.defineTimeout({script: 5000});
    await helper.executeScript(function (locator) {
      document
        .evaluate(
          locator,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        )
        .singleNodeValue.scrollIntoViewIfNeeded();
    }, locator);
  }

  /**
   * Checks for elment in viewport
   * @param {string} locator
   * @returns 'true' if element is present in viewport
   */
  async isElementInViewPort(locator) {
    const helper = this.helpers['Appium'];
    let tileContDim = await helper.grabElementBoundingRect(locator);
    let rootContDim = await helper.grabElementBoundingRect("//div[@id='root']");
    let rcX = rootContDim.x,
      rcY = rootContDim.y,
      rcW = rootContDim.width,
      rcH = rootContDim.height;
    let tcX = tileContDim.x,
      tcY = tileContDim.y,
      tcW = tileContDim.width,
      tcH = tileContDim.height;
    let sumRcXW = Math.abs(rcX) + Math.abs(rcW),
      sumRcYH = Math.abs(rcY) + Math.abs(rcH);
    let sumTcXW = Math.abs(tcX) + Math.abs(tcW),
      sumTcYH = Math.abs(tcY) + Math.abs(tcH);
    if (
      Math.floor(tcX) >= Math.floor(rcX) &&
      Math.floor(tcY) >= Math.floor(rcY) &&
      Math.floor(sumTcXW) <= Math.floor(sumRcXW) &&
      Math.floor(sumTcYH) <= Math.floor(sumRcYH)
    )
      return true;
    else return false;
  }

  /**
   * sets the visibility of element
   * @param {string} locator
   * @param {boolean} visibility
   */
  async setElementVisibility(locator, visibility = true) {
    const helper = this.helpers['Appium'];
    await helper.defineTimeout({script: 5000});
    await helper.executeScript(
      function ({locator, visibility}) {
        document.evaluate(
          locator,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue.style.opacity = visibility ? '1' : '0';
      },
      {locator, visibility}
    );
  }

  /**
   * scroll to the element
   * @param {string} locator
   */
  async scrollIntoViewToElement(locator) {
    const helper = this.helpers['Appium'];
    await helper.defineTimeout({script: 5000});
    await helper.executeScript(function (locator) {
      document
        .evaluate(
          locator,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        )
        .singleNodeValue.scrollIntoView();
    }, locator);
  }
}
module.exports = AppiumHelper;
