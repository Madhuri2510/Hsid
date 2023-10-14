/* eslint-disable no-undef */
const helper = codecept_helper;
const rokuLibrary = require('./RokuLibrary');
const constants = require('../config/constants');
require('../utils/rokuDriverUtils').launchRokuDriver();
const controlsLocator = {
  elementData: [{using: 'attr', attribute: 'rcid', value: '0'}],
};
const logger = require('../utils/LogUtils.js').getLogger('RokuHelper');

let library = null;
let loadedStream = null;

class RokuHelper extends helper {
  constructor(config) {
    super(config);
  }

  async launchRokuApp(timeout = 200000, delay = 2000) {
    let ip = this.config.rokuIP;
    let user = this.config.user;
    let pass = this.config.pass;
    let appPath = this.config.app;
    if (loadedStream == null) {
      if (library == null) {
        logger.debug(`Connect to ${ip}`);
        library = new rokuLibrary.RokuLibrary(ip, timeout, delay);
        let con = await library.getCurrentChannelInfo();
        logger.debug(con);
      }
      logger.debug(`Install and launch app : ${appPath}`);
      loadedStream = await library.sideLoad(appPath, user, pass);
    } else {
      logger.debug(`Already connected, only launch channel : dev`);
      await library.launchTheChannel('dev');
    }
  }

  async getElementText(elementData) {
    let element = await library.getElement(elementData);
    let ret = await library.getText(element);
    return ret;
  }

  async pressKey(key) {
    await library.sendKey(key);
  }

  async pressKeys(keys) {
    await library.sendKeys(keys);
  }

  async sendKeys(keys) {
    await library.sendWord(keys);
  }

  async isVisible(
    elementData,
    timeout = constants.timeWait.defaultVisibleElement
  ) {
    return await library.waitForElementVisible(elementData, timeout);
  }

  async isElementFocused(elementText, delay = 2, node = 0) {
    let ret = false;
    let focusedElement = await library.getFocusedElement(delay);
    let text =
      node !== 0
        ? await library.getText(focusedElement.Nodes[node])
        : await library.getText(focusedElement);
    if (text == elementText) {
      ret = true;
    }
    return ret;
  }

  async isFocusOnElement(element, delay = 0) {
    let ret = false;
    let focusedElement = await library.getFocusedElement(delay);
    if (await library.isSameControl(element, focusedElement)) {
      ret = true;
    }
    return ret;
  }

  async isFocusOnElementByAttr(elementData, delay = 0) {
    let ret = false;
    let elements = await library.getElements(elementData);
    for (let index = 0; index <= elements.length; index++) {
      if (library.getAttribute(elements[index], 'focused') == 'true') {
        ret = true;
        break;
      }
    }
    return ret;
  }

  async isTvGuideGenreFilterFocussed(filterName, delay = 0) {
    return await library.isTvGuideGenreFilterFocussed(filterName, delay);
  }

  async getElements(elementData) {
    return await library.getElements(elementData);
  }

  async getFocusedElement(delay = 2) {
    return await library.getFocusedElement();
  }

  async dumpControls() {
    let elements = await library.getElements(controlsLocator);
    await this.logControls(elements);
  }

  async logControls(elements) {
    for (const element of elements) {
      let text = await library.getText(element);
      let name = await library.getName(element);
      let tag = await library.getTag(element);
      logger.debug(`text : ${text} - name : ${name} - tag : ${tag}`);
    }
  }

  async wait(seconds) {
    await library.delay(seconds);
  }

  async delay(seconds) {
    await library.delay(seconds);
  }

  async waitForElementVisible(
    locator,
    timeout = constants.timeWait.defaultVisibleElement
  ) {
    await library.waitForElementVisible(locator, timeout);
  }

  async isElementVisible(
    locator,
    timeout = constants.timeWait.defaultVisibleElement
  ) {
    return await library.waitForElementVisible(locator, timeout);
  }
  
  async waitForElementDisappear(
    locator,
    timeout = constants.timeWait.defaultVisibleElement
  ) {
    await library.waitForElementDisappear(locator, timeout);
  }

  async pressOkButton(iterations = 1) {
    for (let i = 1; i <= iterations; i++) {
      await this.pressKey(constants.remoteKey.ok);
    }
  }

  async pressUpButton(iterations = 1) {
    for (let i = 1; i <= iterations; i++) {
      await this.pressKey(constants.remoteKey.up);
    }
  }

  async pressDownButton(iterations = 1) {
    for (let i = 1; i <= iterations; i++) {
      await this.pressKey(constants.remoteKey.down);
    }
  }

  async pressRightButton(iterations = 1) {
    for (let i = 1; i <= iterations; i++) {
      await this.pressKey(constants.remoteKey.right);
    }
  }

  async pressLeftButton(iterations = 1) {
    for (let i = 1; i <= iterations; i++) {
      await this.pressKey(constants.remoteKey.left);
    }
  }

  async pressBackButton(iterations = 1) {
    for (let i = 1; i <= iterations; i++) {
      await this.pressKey(constants.remoteKey.back);
    }
  }

  async selectProgramAbleToPlay(needToBack = false) {
    return await library.selectProgramAbleToPlay(
      constants.timeWait.defaultVisibleElement,
      needToBack
    );
  }

  async backToFirstProgram(timeout = constants.timeWait.getTotalProgram) {
    return await library.backToFirstProgram(
      (timeout = constants.timeWait.getTotalProgram)
    );
  }

  async getTotalChannel(
    tvGuideFormat = constants.tvGuideFormat.classic,
    timeout = constants.timeWait.getTotalChannel
  ) {
    return await library.getTotalChannel(tvGuideFormat, timeout);
  }

  async selectContainerAbleToPlay(
    totalItem,
    timeout = constants.timeWait.getTotalChannel
  ) {
    return await library.selectContainerAbleToPlay(totalItem, timeout);
  }

  async getTotalSwimlanesTiles(timeout = constants.timeWait.getTotalChannel) {
    return await library.getTotalSwimlanesTiles(timeout);
  }

  async getTotalSportSwimlanesTiles(
    league = null,
    timeout = constants.timeWait.getTotalChannel
  ) {
    return await library.getTotalSportSwimlanesTiles(league, timeout);
  }

  async selectLiveIconProgram() {
    logger.debug('selectLiveIconProgram');
    return await library.isLiveIconProgram();
  }

  async selectContainerHasSchedule(
    totalItem,
    timeout = constants.timeWait.getTotalChannel
  ) {
    return await library.selectContainerHasSchedule(totalItem, timeout);
  }

  async checkContainerFuture() {
    return await library.checkContainerFuture();
  }

  async isTimeFormat(date, format) {
    return await library.isValidDate(date, format);
  }

  async getTime() {
    return await library.getTime();
  }

  async selectFutureProgram(timeout = constants.timeWait.getTotalChannel) {
    return await library.selectFutureProgram(
      (timeout = constants.timeWait.getTotalProgram)
    );
  }

  async isEveryProgramFocused(timeout = constants.timeWait.getTotalChannel) {
    return await library.isEveryProgramFocused(
      (timeout = constants.timeWait.getTotalProgram)
    );
  }

  async getTimeClassicGuide(elementData) {
    await library.waitForElementVisible(
      elementData,
      constants.timeWait.defaultVisibleElement
    );
    let elements = await library.getElements(elementData);
    let timeElement = elements[0];
    let ret = await library.getText(timeElement);
    return ret;
  }

  async isContainerHasTimeFormat(type) {
    return await library.isContainerHasTimeFormat(type);
  }

  async verifyTimeFormat(val, type) {
    return await library.verifyTimeFormat(val, type);
  }
  async pressButton(key, times) {
    for (let i = 1; i <= times; i++) {
      await this.pressKey(key);
    }
  }

  async isFocused(elementText) {
    let ret = false;
    let activeElement = await library.getFocusedElement();
    let focusedElement = activeElement.Nodes[1];
    let text = await library.getText(focusedElement);
    if (text == elementText) {
      ret = true;
    }
    return ret;
  }

  async getLastElementText(elementData) {
    await library.waitForElementVisible(
      elementData,
      constants.timeWait.defaultVisibleElement
    );
    let elements = await library.getElements(elementData);
    let textElement = elements[elements.length - 1];
    let ret = await library.getText(textElement);
    return ret;
  }
  async checkContainer() {
    return await library.getContainer();
  }
  async isButtonVisible(element) {
    return await this.isVisible(element);
  }

  async isProgramContainsUnlockedIcon() {
    let isUnlockedIconVisible = await library.isProgramContainsUnlockedIcon();
    return isUnlockedIconVisible;
  }

  async isProgramContainsLockedIcon() {
    let isLockedIconVisible = await library.isProgramContainsLockedIcon();
    return isLockedIconVisible;
  }

  async checkSportsTile(elementText) {
    let elements,
      focusedElement,
      focusedTileText,
      isVisible = false;
    elements = await library.getFocusedElement();
    focusedElement = elements.Nodes[2];
    focusedTileText = await library.getText(focusedElement);
    if (focusedTileText === elementText) {
      isVisible = true;
    }
    return isVisible;
  }
  /**
   * get total channel logos visible on tv guide page.
   * @param {*} elementData: GuideRowHeaderClassic
   * if get uri != '', totalChannelLogos++.
   * @returns  total channel logos is visible on tv guide page.
   */
  async getTotalChannelLogosVisible(
    elementData,
    timeout = constants.timeWait.defaultVisibleElement
  ) {
    let totalChannelLogos = 0;
    await library.waitForElementVisible(elementData, timeout);
    let elements = await library.getElements(elementData);
    for (let logosNum = 0; logosNum < elements.length; logosNum++) {
      // let attribute = elements[logosNum].Nodes[0];
      let uri = await library.getAttribute(elements[logosNum], 'uri');
      if (uri != '') {
        totalChannelLogos++;
      }
    }
    return totalChannelLogos;
  }

  async getTextTrendingInContainer() {
    return await library.getTextTrendingInContainer();
  }

  async getTextInContainer() {
    return await library.getTextInContainer();
  }

  async isProgramFocused(totalTile) {
    return await library.isProgramFocused(totalTile);
  }

  async getScreenSource() {
    return await library.getScreenSource();
  }

  /**
   * Send dpad keypresses via deeplink
   */
  async dpadNavByEcp(dpadKey, index = 1, delay = 0) {
    await library.dpadNavByEcp(dpadKey, index, delay);
  }

  /**
   * Type text via deeplink
   */
  async typeTextByEcp(text) {
    await library.typeTextByEcp(text);
  }

  /**
   * Get element atrribute
   */
  async getAttribute(elementData, attr, idx = 0) {
    let value = null;
    const result = await library.getElements(elementData);
    value = await library.getAttribute(result[idx], attr);
    return value;
  }

  /**
   * Get element atrribute with element
   */
  async getElementAttribute(element, attr) {
    return await library.getAttribute(element, attr);
  }

  /**
   * Get element text
   * @param {*} element
   * @returns {text} element text
   */
  async getText(element) {
    return await library.getText(element);
  }

  /**
   * Get child nodes
   * @param {*} elementData
   * @returns {text} child nodes of parent
   */
  async getChildren(elementData, locator = null) {
    let parentNode = await library.getElement(elementData);
    return await library.getChildNodes(parentNode, locator);
  }

  /**
   * check if swimlane element is focussed
   * @param {*} swimlaneName
   * @returns boolean: "true" if focus is on swimlane element, "false" if not
   */
  async isSwimlaneFocused(swimlaneName) {
    return await library.isSwimlaneFocused(swimlaneName);
  }

  async isCurrentHighlightedChannelFavorited() {
    return await library.isCurrentHighlightedChannelFavorited();
  }

  async isCurrentHighlightedChannelRowHeaderFocussed() {
    return await library.isCurrentHighlightedChannelRowHeaderFocussed();
  }

  async isNoFavouritesErrorVisible() {
    return await library.isNoFavouritesErrorVisible();
  }
}
module.exports = RokuHelper;
