/* eslint-disable no-undef */
const WebDriverHelper = require('codeceptjs/lib/helper/WebDriver');
const {result} = require('lodash');

/**
 * Helper which provides Support for Browser Automation and adds more function on top of `WebDriverHelper`
 */
class BrowserHelper extends WebDriverHelper {
  /**
   * Creates a new instance of Browser
   * @param {object} config - Helper Configuration
   */
  constructor(config) {
    super(config);
    this._registerFilter();
    console.log(`BrowserHelper :: Options :: ${JSON.stringify(this.options)}`);
  }

  /**
   * Provides support to find element using data-testid
   */
  _registerFilter() {
    codeceptjs.locator.addFilter((providedLocator, locatorObj) => {
      if (typeof providedLocator === 'string') {
        if (/^[a-z0-9]/i.test(providedLocator)) {
          locatorObj.value = `[data-testid="${providedLocator}"]`;
          locatorObj.type = 'css';
        } else if (providedLocator.charAt(0) === '#') {
          locatorObj.value = `[data-testid="${providedLocator.substr(1)}"]`;
          locatorObj.type = 'css';
        }
      }
    });
  }

  /**
   * Check if element is visible
   * @param {string|object} locator
   * @returns {boolean} true if element is visible
   */
  async isElementVisible(locator) {
    const res = await this._locate(locator, true);
    if (!res || res.length === 0) {
      return false;
    }
    return await res[0].isDisplayed();
  }

  /**
   * Finds and return list of elements
   * @param {string|object} locator
   * @returns {Array.<Object>} List of an element
   */
  async getElements(locator) {
    return await this._locate(locator, true);
  }

  /**
   * Before each test
   */
  async _before() {
    super._before();
    // To-Do, we will stop reloading after each test soon after the app is stable. By stable we mean that we are able to navigate to a screen that we consider as our test starting point.
    this.amOnPage(this.options.baseUrl);
  }

  /**
   * Generate elementId by prefixing `#`
   * @param {*} id
   * @returns Data Test ID with prefixing "#" for given locator
   */
  getPlatformID(id) {
    return `#${id}`;
  }

  /**
   * Generate and return focused element id
   * @param {string} id - element data-testid
   * @returns Returns Focused ID with prefixing "#" and adding "-focused" at the end of given locator
   */
  getPlatformIDFocused(id) {
    return `#${id}-focused`;
  }

  /**
   * Return current platform
   * @returns `BROWSER`
   */
  async getPlatform() {
    return 'BROWSER';
  }

  /**
   * Navigate back in browser url
   */
  async goBack() {
    await this.browser.back();
  }

  /**
   * Return text of the given locator
   * @returns `text`
   */
  async getElementLabel(locator) {
    return await this.grabTextFrom(locator);
  }

  /**
   * Refresh and navidate back to home
   */
  async relaunchApp() {
    this.amOnPage(this.options.baseUrl);
  }

  /**
   * Get the Url of the current Page
   */
  async getPageUrl() {
    let url = await this.browser.getUrl();
    return url;
  }

  /**
   * Clear the text from a text box
   */
  async clearTextBox() {
    return this.pressKey('Backspace');
  }

  /**
   * grab text from element
   */
  async getTextContent(locator) {
    await this.defineTimeout({script: 5000});
    return await this.executeScript(
      function ({locator}) {
        return document.evaluate(
          locator,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue.textContent;
      },
      {locator}
    );
  }

  /**
   * grab attributes from DOM
   */
  async getElementAttributeValue(locator, attributes = attributes) {
    await this.defineTimeout({script: 5000});
    return await this.executeScript(
      function ({locator, attributes}) {
        return document.evaluate(
          locator,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue.attributes;
      },
      {locator, attributes}
    );
  }

  /**
   * click on element
   */
  async elementClick(locator) {
    await this.defineTimeout({script: 5000});
    return await this.executeScript(
      function ({locator}) {
        return document
          .evaluate(
            locator,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          )
          .singleNodeValue.click();
      },
      {locator}
    );
  }

  /**
   * waits simultaneously for appearance of any amongst multiple elements
   * @param {arr1, arr2}.Accepts two Arrays of locator and wait time as input to check for visibility
   * @returns 'true' if any one is visible, else 'false'
   */
  async waitForVisibleMultiple(arr1, arr2) {
    let result = await Promise.allSettled([
      this.waitForVisible(arr1[0], arr1[1]),
      this.waitForVisible(arr2[0], arr2[1]),
    ]);
    for (var i = 0; i < result.length; i++) {
      if (result[i].status === 'fulfilled') {
        return result[i].value;
      }
    }
    return false;
  }

  async getValueFrom(locator) {
    await this.defineTimeout({script: 5000});
    return await this.executeScript(
      function ({locator}) {
        return document.evaluate(
          locator,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue.value;
      },
      {locator}
    );
  }

  /**
   * Checks for elment in viewport
   * @param {string} locator
   * @returns 'true' if element is present in viewport; false if not
   */
  async isElementInViewPort(locator) {
    await this.defineTimeout({script: 5000});
    return await this.executeScript(
      function ({locator}) {
        let bounding = document
          .evaluate(
            locator,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          )
          .singleNodeValue.getBoundingClientRect();
        if (
          bounding.top >= 0 &&
          bounding.left >= 0 &&
          bounding.right <=
            (window.innerWidth || document.documentElement.clientWidth) &&
          bounding.bottom <=
            (window.innerHeight || document.documentElement.clientHeight)
        ) {
          return true;
        } else {
          return false;
        }
      },
      {locator}
    );
  }
}
module.exports = BrowserHelper;
