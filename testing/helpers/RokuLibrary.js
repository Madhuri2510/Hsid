/* eslint-disable no-undef */
const helper = codecept_helper;
const {execSync} = require('child_process');
const rokuIP = require('../utils/ConfigUtils').getConfigValues('rokuIP');
const sportsPageLocators = require('../pages/Roku/SportsPage/SportsPageLocators.json');
const watchPageLocators = require('../pages/Roku/WatchPage/WatchPageLocators.json');
const classicGuideLocators = require('../pages/Roku/TVGuidePage/TVGuidePageLocators.json');
const ecp = require('./RokuClient');
const FormData = require('form-data');
const fs = require('fs');
const constants = require('../config/constants.js');
// const CMP = require('../pages/OnStreamBackend/cmp.js');
const dayjs = require('dayjs');
const {atob} = require('buffer');
const logger = require('../utils/LogUtils.js').getLogger('RokuLibrary');

const DELTA_LEFT_FOCUSED = 10;
const HIGH_LIGHT_COLOR = [
  '#29F013FF',
  '#2e4e1dff',
  '#13f013ff',
  '#f0b913ff',
  '#f01331ff',
];
const ROW_CLASS = 'GuideRowClassic';
const ROW_MODERN = 'GuideRowModern';
const ROW_GUIDE = 'TVGuideRow';
const ROW_HEADER_CLASS = 'GuideRowHeaderClassic';
const PLAY_ICON_URI = 'pkg:/images/common/badge/live-badge-dark-$$RES$$.png';
const PLAY_ICON_TV_GUIDE = 'pkg://images/guide/guide-on-now-icon-$$RES$$.png';
const FAV_ICON_TV_GUIDE_UNSELECTED =
  'pkg:/images/guide/ic-favorite-unselected-$$RES$$.png';
const FAV_ICON_TV_GUIDE_SELECTED =
  'pkg:/images/guide/ic-favorite-selected-$$RES$$.png';
const MINI_GUIDE_BUTTON =
  'pkg://images/video/videoplayer/mini-guide-$$RES$$.png';
const CHANGE_FONT_SIZE = 'pkg:/images/settings/font-icon.png';
const TIME_FORMAT = 'pkg:/images/settings/time-icon.png';
const TEMP_FORMAT = 'pkg:/images/settings/temperature-icon.png';
const TRUE_VALUE = 'true';
const DELAY_TO_PRESS_BUTTON = 2;

const checkAttribute = (node, locator) => {
  LogUtils;
  if (Array.isArray(node.Attrs) === false) {
    return false;
  }
  const index = node.Attrs.findIndex(
    (attrObj) =>
      attrObj.Name.Local.toLowerCase() === locator.attribute.toLowerCase() &&
      attrObj.Value.toLowerCase() === locator.value.toLowerCase()
  );
  return index >= 0;
};

const checkTag = (node, locator) => {
  return node.XMLName.Local.toLowerCase() === locator.value.toLowerCase();
};

const checkText = (node, locator) => {
  if (Array.isArray(node.Attrs) === false) {
    return false;
  }
  const index = node.Attrs.findIndex(
    (attrObj) =>
      attrObj.Name.Local.toLowerCase() === 'text' &&
      attrObj.Value.toLowerCase() === locator.value.toLowerCase()
  );
  return index >= 0;
};

const methodsMap = {
  attr: checkAttribute,
  tag: checkTag,
  text: checkText,
};

const getMsFromString = (value) => {
  const result = value.split(' ');
  return result[0];
};

const validateLocator = (locator) => {
  if (locator.hasOwnProperty('using') === false) {
    throw new Error('"using" field is required');
  }
  if (locator.hasOwnProperty('value') === false) {
    throw new Error('"value" field is required');
  }
  if (
    locator.using === 'attr' &&
    locator.hasOwnProperty('attribute') === false
  ) {
    throw new Error('"attribute" field is required');
  }
};

const isElementMatchLocators = (node, locators) => {
  return locators.every((locator) => {
    validateLocator(locator);
    checkMethod = methodsMap[locator.using];
    if (checkMethod === null) {
      return false;
    }
    return checkMethod(node, locator);
  });
};

class RokuLibrary {
  constructor(ip, timeout = 20000, delay = 2000) {
    logger.debug('Init RokuLibrary');
    this.client = new ecp.RokuClient(ip, timeout, delay);
    this.markTimer();
  }

  async close() {
    await this.client.deleteSession();
  }

  async launchTheChannel(channelCode, contentId = '', contentType = '') {
    await this.client.launch(channelCode, contentId, contentType);
    return true;
  }

  async getApps() {
    const result = await this.client.getApps();
    return result.data.value;
  }

  sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async delay(seconds) {
    await this.sleep(seconds * 1000);
  }

  async sendKey(key, delay = 2) {
    await this.sleep(delay * 1000);
    await this.client.sendKeypress(key);
    return true;
  }

  async waitForElementDisappear(data, timeout = 5) {
    let start = new Date();
    let isContinue = true;
    while (isContinue) {
      let elements = await this.getElements(data);
      logger.debug(
        `waitForElementDisappear elements [${data.elementData[0].value}] : ${elements.length}`
      );
      if (elements.length == 0) {
        isContinue = false;
      } else {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug(`waitForElementDisappear spentTime : ${spentTime}`);
        if (spentTime > timeout) {
          isContinue = false;
          logger.warn(
            `Cannot wait element ${data.elementData[0].value} in ${timeout} seconds to disappear`
          );
        } else {
          await this.delay(1);
        }
      }
    }
  }

  async waitForElementVisible(data, timeout = 5) {
    let start = new Date();
    let isContinue = true;
    let foundElement = false;
    while (isContinue) {
      let elements = await this.getElements(data);
      logger.debug(
        `waitForElementVisible elements [${data.elementData[0].value}] : ${elements.length}`
      );
      if (elements.length > 0) {
        isContinue = false;
        foundElement = true;
      } else {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug(`waitForElementVisible spentTime : ${spentTime}`);
        if (spentTime > timeout) {
          isContinue = false;
          logger.warn(
            `Cannot wait element ${data.elementData[0].value} in ${timeout} seconds`
          );
        } else {
          await this.delay(1);
        }
      }
    }
    return foundElement;
  }

  countDiffTimeInSeconds(start, end) {
    return (end.getTime() - start.getTime()) / 1000;
  }

  async getElement(data, delay = 2) {
    let ret = null;

    await this.waitForElementVisible(data);

    const result = await this.getElements(data);

    if (result.length > 1) {
      let attr = data.elementData[0].using;

      for (let idx = 0; idx < result.length; idx++) {
        let value = await this.getAttribute(result[idx], attr);

        if (value == data.elementData[0].value) {
          ret = result[idx];

          break;
        }
      }
    } else {
      ret = result[0];
    }

    return ret;
  }

  async getElements(data, delay = 2) {
    let ret = [];
    try {
      const result = await this.client.getUiElements(data);
      ret = result.data.value;
    } catch (error) {}
    return ret;
  }

  async getFocusedElement(delay = 0) {
    await this.sleep(delay * 1000);
    const result = await this.client.getActiveElement();
    let activeElement = result.data.value;
    if (await this.isNavigationMenu(activeElement)) {
      activeElement = await this.getFocusedTabItem(activeElement);
    } else if (await this.isProgramElement(activeElement)) {
      activeElement = await this.getFocusedProgramItem(activeElement);
    } else if (await this.isFavoriteIconElement(activeElement)) {
      let activeElementArr = await this.getFocusedFavoriteIcon(activeElement);
      activeElement = activeElementArr[0];
    } else {
      if (activeElement.Nodes != null) {
        activeElement = activeElement.Nodes[0];
      }
    }

    return activeElement;
  }
  
  async getFocusedProgramItem(focusedParent) {
    let ret = focusedParent;
    let totalChild = focusedParent.Nodes.length;
    for (let index = 0; index < totalChild; index++) {
      ret = focusedParent.Nodes[index];
      if (await this.isHighLight(ret)) {
        break;
      }
    }
    return ret;
  }

  async getFocusedFavoriteIcon(focusedParent) {
    let ret = focusedParent;
    let isFavIcon = false;
    if (focusedParent.Nodes !== null) {
      let totalChild = focusedParent.Nodes.length;
      for (let index = 0; index < totalChild; index++) {
        let uri = await this.getAttribute(focusedParent.Nodes[index], 'uri');
        ret = focusedParent.Nodes[index];
        if (uri === FAV_ICON_TV_GUIDE) {
          isFavIcon = true;
          break;
        }
      }
    } else {
      let uri = await this.getAttribute(ret, 'uri');
      if (uri === FAV_ICON_TV_GUIDE) {
        isFavIcon = true;
      }
    }
    return [ret, isFavIcon];
  }

  async getFocusedTabItem(focusedParent) {
    let ret = focusedParent.Nodes[1];
    // let underLineControl = focusedParent.Nodes[0];
    // let parentOfTabs = focusedParent.Nodes[1];
    // let totalChild = parentOfTabs.Nodes.length;
    // let totalChild = focusedParent.Nodes[0].Nodes.length;
    // for (let index = 0; index < totalChild; index++) {
    //   ret = focusedParent.Nodes[0].Nodes[index].Nodes[1];
    //   if (
    //     (await this.getAttribute(ret, 'visible')) !== 'false' &&
    //     (await this.isHighLight(ret))
    //   ) {
    //     break;
    //   }
    // }
    return ret;
  }

  async isSamePosition(firstElement, secondElement) {
    let ret = false;
    let deltaLeft = Math.abs(
      (await this.getLeft(firstElement)) - (await this.getLeft(secondElement))
    );
    let deltaWidth = Math.abs(
      (await this.getWidth(firstElement)) - (await this.getWidth(secondElement))
    );
    if (deltaLeft < DELTA_LEFT_FOCUSED && deltaWidth == 0) {
      ret = true;
    }
    return ret;
  }

  /**
   * check color of current controls.
   * @returns boolean:'true' if current color is same HIGH_LIGHT_COLOR , returns 'false' if not
   */
  async isHighLight(element) {
    let ret = false;
    let color = await this.getAttribute(element, 'color');
    ret = HIGH_LIGHT_COLOR.some(
      (highlight) => highlight.toUpperCase() === color.toUpperCase()
    );
    return ret;
  }

  /**
   * check current position of control.
   * @returns boolean: 'true' if previous controls and current controls is same position , returns 'false' if not
   */
  async isSameControl(firstElement, secondElement) {
    let strFirst = JSON.stringify(firstElement);
    let second = JSON.stringify(secondElement);
    return strFirst == second;
  }

  async getBounds(element) {
    let bounds = await this.getAttribute(element, 'bounds');
    // bound is {left, top, width, height}
    // return [left, top, width, height]
    return bounds.replace('{', '').replace('}', '').split(',');
  }

  async getLeft(element) {
    let bounds = await this.getBounds(element);
    return bounds[0];
  }

  async getWidth(element) {
    let bounds = await this.getBounds(element);
    return bounds[2];
  }

  async isNavigationMenu(element) {
    let ret = false;
    let tag = await this.getTag(element);
    if (tag == 'NavigationHeaderControlLeft') {
      ret = true;
    }
    return ret;
  }

  async isProgramElement(element) {
    let ret = false;
    let tag = await this.getTag(element);
    if (tag === ROW_CLASS || tag === ROW_MODERN || tag === ROW_GUIDE) {
      ret = true;
    }
    return ret;
  }

  async isFavoriteIconElement(element) {
    let ret = false;
    let tag = await this.getTag(element);
    if (tag === ROW_HEADER_CLASS) {
      ret = true;
    }
    return ret;
  }

  /**
   * check current program has play icon (program on tv guide).
   * @returns boolean: 'true' if current program has play icon , 'false' if not
   */
  async isProgramAbleToPlay(index) {
    let isParentalControlPopUpVisible = false;
    let programElement = await this.getProgram(index);
    // return await this.doesContainsPlayIcon(programElement);
    // await this.dpadNavByEcp(constants.remoteKey.ok);
    return isParentalControlPopUpVisible;
  }

  /**
   * get Nodes(activeElement) has element need to be checked.
   */
  async getProgram(index) {
    let ret = null;
    const result = await this.client.getActiveElement();
    let focusedParent = result.data.value;
    if (await this.isProgramElement(focusedParent)) {
      ret = await this.getFocusedProgramItem(focusedParent);
    } else {
      let totalChild = focusedParent.Nodes.length;
      if (totalChild >= index) {
        ret = focusedParent.Nodes[index - 1];
      }
    }
    return ret;
  }

  /**
   * check active elements has contains play icon element.
   * @returns boolean: 'true' if active elements has contains play icon element , 'false' if not
   */
  async doesContainsPlayIcon(programElement) {
    logger.debug('[doesContainsPlayIcon]');
    let ret = false;
    if (programElement.Nodes != null) {
      let totalChild = programElement.Nodes.length;
      for (let index = 0; index < totalChild; index++) {
        let element = programElement.Nodes[index];
        if (await this.isPlayIconElement(element)) {
          logger.debug('[doesContainsPlayIcon] : found play icon');
          ret = true;
          break;
        }
      }
    }
    return ret;
  }

  async isPlayIconElement(element) {
    let uri = await this.getAttribute(element, 'uri');
    return uri === PLAY_ICON_TV_GUIDE;
  }

  /**
   * select program on tv guide has play icon.
   * @returns boolean: "true" if the current program have play icon, "false" if not
   */
  async selectProgramAbleToPlay(timeout = 10, needToBack) {
    logger.debug('[selectProgramAbleToPlay]');
    let ret = false;
    let start = new Date();
    let isContinue = true;
    let index = 0;
    let totalRightPress = 0;
    while (isContinue) {
      isContinue = !(await this.isProgramAbleToPlay(index));
      if (isContinue) {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug(`[selectProgramAbleToPlay spentTime] : ${spentTime}`);
        if (spentTime > timeout) {
          isContinue = false;
          logger.debug(
            `Cannot select program able to play in ${timeout} seconds`
          );
        } else {
          await this.dpadNavByEcp(constants.remoteKey.right);
          totalRightPress++;
          index++;
        }
      } else {
        ret = true;
      }
    }

    //Go back to first program
    if (needToBack) {
      for (let i = 0; i < totalRightPress; i++) {
        await this.dpadNavByEcp(constants.remoteKey.left);
      }
    }

    return ret;
  }

  getIndexTitleElement(tvGuideFormat) {
    let ret = 0;
    if (tvGuideFormat == constants.tvGuideFormat.modern) {
      ret = 1;
    }
    return ret;
  }

  async getProgramText(tvGuideFormat, parentElement) {
    let ret = '';
    let idxTextElement = this.getIndexTitleElement(tvGuideFormat);
    ret =
      (await this.getText(parentElement.Nodes[idxTextElement])) +
      ' ' +
      (await this.getText(parentElement.Nodes[idxTextElement + 1]));
    if (tvGuideFormat == constants.tvGuideFormat.modern) {
      ret =
        ret +
        ' ' +
        (await this.getText(parentElement.Nodes[idxTextElement + 2]));
    }
    return ret;
  }

  /**
   * get total channel on tv guide.
   * @returns number : total channel
   */
  async getTotalChannel(tvGuideFormat, timeout = 60) {
    let previousProgram = null;
    let currentProgram = null;
    let isContinue = true;
    logger.debug(`getTotalChannel ${tvGuideFormat}`);
    let start = new Date();
    let total = 0;
    let elementArr = [];

    while (isContinue) {
      let guideRowElement = await this.getElement(
        classicGuideLocators.tvGuideGrid
      );
      while (this.getAttribute(guideRowElement, 'focused') !== 'true') {
        await this.dpadNavByEcp(constants.remoteKey.down);
        guideRowElement = await this.getElement(
          classicGuideLocators.tvGuideGrid
        );
      }
      await this.delay(0);
      currentProgram = await this.getFocusedElement();
      if (await this.isSameControl(previousProgram, currentProgram)) {
        isContinue = false;
      } else {
        previousProgram = currentProgram;
        elementArr.push(JSON.stringify(currentProgram.Nodes[0].Attrs));
        total++;
        await this.dpadNavByEcp(constants.remoteKey.down);
      }

      if (isContinue) {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug(`getTotalChannel spentTime : ${spentTime}`);
        isContinue = spentTime <= timeout;
      }
    }
    // elementArr = [...new Set(elementArr)];
    logger.debug(`getTotalChannel : ${elementArr.length}`);
    return elementArr.length;
  }

  async sendKeys(sequence, delay = 2) {
    await this.sleep(delay * 1000);
    await this.client.sendSequence(sequence);
    return true;
  }

  async verifyIsScreenLoaded(data, retries = 10, delay = 1) {
    while (retries > 0) {
      try {
        await this.client.getUiElement(data);
        return true;
      } catch {
        retries -= 1;
        if (retries == 0) {
          return false;
        }
        await this.sleep(delay * 1000);
      }
    }
  }

  async getCurrentChannelInfo(self) {
    const response = await this.client.getCurrentApp();
    return response.data.value;
  }

  async getDeviceInfo() {
    const response = await this.client.getDeviceInfo();
    return response.data.value;
  }

  async getPlayerInfo() {
    const response = await this.client.getPlayerInfo();
    let value = response.data.value;
    value.Position = parseInt(getMsFromString(value.Position));
    value.Duration = parseInt(getMsFromString(value.Duration));
    return value;
  }

  async setTimeout(timeout) {
    await this.client.setTimeouts('implicit', timeout);
    return true;
  }

  async sideLoad(path, user, pass) {
    let loadedStream = null;
    const form = new FormData();
    const stream = fs.createReadStream(path);
    form.append('channel', stream, {
      contentType: 'application/zip',
    });
    form.append('username', user);
    form.append('password', pass);
    loadedStream = await this.client.sideLoadChannel(form);
    return loadedStream;
  }

  async setDelay(delay) {
    await this.client.setTimeouts('pressDelay', delay);
    return true;
  }

  async sendWord(word, delay = 2) {
    await this.sleep(delay * 1000);
    let symbols = [];
    word.split('').forEach((el) => {
      symbols.push(`LIT_${encodeURIComponent(el)}`);
    });
    // await this.sendKeys(symbols, 0);
    await this.typeTextByEcp(word);
    return true;
  }

  async verifyIsPlaybackStarted(retries = 10, delay = 1) {
    while (retries > 0) {
      let response = await this.client.getPlayerInfo();
      if (response.data.value.State == 'play') {
        return true;
      } else {
        retries -= 1;
        if (retries == 0) {
          return false;
        }
        await this.sleep(delay * 1000);
      }
    }
  }

  async verifyIsChannelLoaded(id, retries = 10, delay = 1) {
    while (retries > 0) {
      let response = await this.client.getCurrentApp();
      if (response.data.value.ID == id) {
        return true;
      } else {
        retries -= 1;
        if (retries == 0) {
          return false;
        }
        await this.sleep(delay * 1000);
      }
    }
  }

  async inputDeepLinkingData(channelId, contentId, mediaType) {
    await this.client.sendInputData(channelId, contentId, mediaType);
    return true;
  }

  markTimer() {
    this.startTime = new Date().getTime();
  }

  getTimer() {
    const currentTime = new Date().getTime();
    return currentTime - this.startTime;
  }

  getAttribute(element, attr) {
    let ret = null;
    try {
      const result = element.Attrs.find(
        (attrObj) => attrObj.Name.Local == attr
      );
      if (result != null) {
        ret = result.Value;
      }
    } catch (error) {
      logger.warn(`[getAttribute] Cannot get attribute : ${attr}`);
    }
    return ret;
  }

  getText(element) {
    return this.getAttribute(element, 'text');
  }

  getTag(element) {
    return element.XMLName.Local;
  }

  getName(element) {
    return this.getAttribute(element, 'name');
  }

  verifyIsChannelExist(apps, id) {
    let index = apps.findIndex((channel) => channel.ID == id);
    return index > -1;
  }

  getChildNodes(parentNode, locators = null) {
    const childNodes = parentNode.Nodes;
    let result = [];
    if (childNodes === null) {
      return result;
    }
    if (locators === null) {
      return childNodes;
    }
    result = result.concat(
      childNodes.filter((element) => {
        return isElementMatchLocators(element, locators);
      })
    );
    childNodes.forEach((element) => {
      if (element.Nodes !== null) {
        result = result.concat(this.getChildNodes(element, locators));
      }
    });
    return result;
  }

  async isLiveIconElement(element) {
    let uri = await this.getAttribute(element, 'uri');
    return uri == PLAY_ICON_URI;
  }

  /**
   * select program(on home Page) has live icon.
   * @returns boolean: "true" if the current program have live icon, "false" if not
   */
  async selectContainerAbleToPlay(totalItem, timeout) {
    logger.debug('[selectContainerAbleToPlay]');
    let ret = false;
    let start = new Date();
    let isContinue = true;
    let index = 1;
    let totalRightPress = 0;
    while (isContinue) {
      isContinue = !(await this.isContainerAbleToPlay());
      if (isContinue) {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug('[selectContainerAbleToPlay spentTime] : ' + spentTime);
        if (spentTime > timeout) {
          isContinue = false;
          logger.debug(
            'Cannot select container able to play in ' + timeout + ' seconds'
          );
        } else {
          index++;
          if (index > totalItem) {
            logger.debug(
              '[selectContainerAbleToPlay] Have no item to check anymore'
            );
            isContinue = false;
          } else {
            await this.dpadNavByEcp(constants.remoteKey.right);
            totalRightPress++;
          }
        }
      } else {
        ret = true;
      }
    }

    //Go back to first program
    if (!ret) {
      for (let i = 0; i < totalRightPress; i++) {
        await this.dpadNavByEcp(constants.remoteKey.left);
      }
    }
    return ret;
  }

  /**
   * check active elements has contains live icon element.(home page)
   * @returns boolean: 'true' if active elements has contains play icon element , 'false' if not
   */
  async isContainerAbleToPlay() {
    let containerElement = await this.getContainer();
    return await this.doesContainerContainsPlayIcon(containerElement);
  }

  /**
   * get Nodes[0] to be checked live icon.
   */
  async getContainer() {
    let ret = null;
    let result = await this.client.getActiveElement();
    let focusedParent = result.data.value;
    let totalChild = focusedParent.Nodes.length;
    if (totalChild >= 0) {
      ret = focusedParent.Nodes[0];
    } else {
      logger.debug('[getContainer] cannot find container');
    }
    return ret;
  }

  /**
   * check program element has contain live icon element.
   * @returns boolean: 'true' if program element has contains live icon element, 'false' if not
   */
  async doesContainerContainsPlayIcon(programElement) {
    logger.debug('doesContainerContainsPlayIcon');
    let ret = false;
    if (programElement.Nodes != null) {
      let totalChild = programElement.Nodes.length;
      logger.debug(
        `[doesContainerContainsPlayIcon] totalChild : ${totalChild}`
      );
      // check all Nodes to find live Icon element
      for (let index = 0; index < totalChild; index++) {
        logger.debug(`[doesContainerContainsPlayIcon] check index : ${index}`);
        let element = programElement.Nodes[index];
        if (await this.isPlayIconInContainerElement(element)) {
          logger.debug('[doesContainerContainsPlayIcon] : found live icon');
          ret = true;
          break;
        }
      }
    } else {
      logger.debug('[doesContainerContainsPlayIcon] has not child control');
    }

    return ret;
  }

  /**
   * check current nodes has contains live icon element.
   * @returns boolean: 'true' if current nodes has contains live icon element , 'false' if not
   */
  async isPlayIconInContainerElement(programElement) {
    logger.debug('[isPlayIconInContainerElement]');
    let ret = false;
    if (programElement.Nodes != null) {
      let totalChild = programElement.Nodes.length;
      logger.debug(`[isPlayIconInContainerElement] totalChild : ${totalChild}`);
      for (let index = 0; index < totalChild; index++) {
        logger.debug(`[isPlayIconInContainerElement] check index : ${index}`);
        let element = programElement.Nodes[index];
        if (element.Nodes != null) {
          for (
            let elementIndex = 0;
            elementIndex < element.Nodes.length;
            elementIndex++
          ) {
            let elements = element.Nodes[elementIndex];
            let uri = await this.getAttribute(elements, 'uri');
            if (uri == PLAY_ICON_URI) {
              logger.debug(`[isPlayIconInContainerElement] found`);
              ret = true;
              break;
            }
          }
        }
      }
    } else {
      logger.debug('[isPlayIconInContainerElement] has not child control');
    }
    return ret;
  }

  /**
   * get total swimlanes tiles on home page
   * @returns number: total swimlane tiles.
   */
  async getTotalSwimlanesTiles(timeout) {
    logger.debug('[getTotalSwimlanesTiles]');
    let previousTile = null;
    let currentTile = null;
    let isContinue = true;
    let start = new Date();
    let total = 0;
    while (isContinue) {
      currentTile = await this.getFocusedElement();
      if (await this.isSameControl(previousTile, currentTile)) {
        isContinue = false;
      } else {
        previousTile = currentTile;
        total++;
        await this.dpadNavByEcp(constants.remoteKey.right);
        await this.delay(DELAY_TO_PRESS_BUTTON);
      }
      if (isContinue) {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug('[getTotalSwimlanesTiles] spentTime : ' + spentTime);
        isContinue = spentTime <= timeout;
      }
    }
    logger.debug(`[getTotalSwimlanesTiles] : ${total}`);
    return total;
  }

  /**
   * get total swimlanes tiles on sport page
   * @returns number: total swimlane tiles.
   */
  async getTotalSportSwimlanesTiles(league = null, timeout) {
    logger.debug('[getTotalSportSwimlanesTiles]');
    let currentProgram = null;
    let totalRightPress = 0;
    let sportsRow;
    let sportsRowList;
    let totalTiles;
    sportsRowList = await this.getSportsRowList();
    if (league !== null) {
      sportsRow = sportsRowList.Nodes.filter(
        (node) =>
          this.getAttribute(node.Nodes[0].Nodes[0].Nodes[0], 'text') ==
          league.toUpperCase()
      );
    } else {
      sportsRow = sportsRowList.Nodes.filter(
        (node) => this.getAttribute(node, 'focused') == 'true'
      );
    }
    totalTiles = parseInt(this.getAttribute(sportsRow[0].Nodes[2], 'count'));
    for (let i = 0; i < totalTiles; i++) {
      sportsRowList = await this.getSportsRowList();
      sportsRow = sportsRowList.Nodes.filter(
        (node) => this.getAttribute(node, 'focused') == 'true'
      );
      currentProgram = parseInt(
        this.getAttribute(sportsRow[0].Nodes[2], 'focusItem')
      );
      if (currentProgram == i) {
        totalRightPress++;
      }
      await this.dpadNavByEcp(constants.remoteKey.right);
    }
    for (let i = 0; i < totalRightPress; i++) {
      await this.dpadNavByEcp(constants.remoteKey.left);
    }
    logger.debug(`getTotalSportSwimlanesTiles : ${totalRightPress}`);
    return totalRightPress;
  }

  async getSportsRowList() {
    return await this.getElement(sportsPageLocators.sportsSwimlaneRow);
  }

  /**
   * get active element need to be checked.
   */
  async getFocusedElementOnSportPage(delay = 2, keyPressCount) {
    await this.sleep(delay * 1000);
    const result = await this.client.getActiveElement();
    let activeElement = null;
    let elementTag = await this.getTag(result.data.value);
    if (elementTag === 'SwimlaneWrapperItem') {
      activeElement = result.data.value;
    } else if (elementTag === 'RowListItem') {
      let totalChild = result.data.value.Nodes[2].Nodes.length;
      for (let index = 0; index < totalChild; index++) {
        var element = result.data.value.Nodes[2].Nodes[index];
        if ((await this.getAttribute(element, 'index')) == keyPressCount) {
          break;
        }
      }
      activeElement = element;
    } else if (elementTag === 'SportsCarouselPanel') {
      activeElement = result.data.value;
    }
    return activeElement;
  }

  /**
   * check program has live icon(Sport page).
   * @returns boolean: "true" if program has live icon, "false" if not
   */
  async isLiveIconProgram() {
    let containerElement = await this.getContainer();
    return await this.doesProgramContainsPlayIcon(containerElement);
  }

  /**
   * check active elements has contains live icon element(on sport page).
   * @returns boolean: 'true' if active elements has contains live icon element , 'false' if not
   */
  async doesProgramContainsPlayIcon(programElement) {
    logger.debug('doesProgramContainsPlayIcon');
    let ret = false;
    if (programElement.Nodes != null) {
      let totalChild = programElement.Nodes.length;
      logger.debug(`[doesProgramContainsPlayIcon] totalChild : ${totalChild}`);
      for (let index = 0; index < totalChild; index++) {
        logger.debug(`[doesProgramContainsPlayIcon] check index : ${index}`);
        let element = programElement.Nodes[index];
        if (element.Nodes != null) {
          element = element.Nodes[0];
        }
        if (await this.isPlayIconInElement(element)) {
          logger.debug('[doesProgramContainsPlayIcon] : found play icon');
          ret = true;
          break;
        }
      }
    } else {
      logger.debug('[doesContainerContainsPlayIcon] has not child control');
    }
    return ret;
  }

  /**
   * check current Nodes has contains element of live icon.
   * @returns boolean: 'true' if current Nodes has contains element of live icon, 'false' if not
   */
  async isPlayIconInElement(programElement) {
    let ret = false;
    logger.debug('[isPlayIconInElement]');
    const playIConURIs = [PLAY_ICON_URI, PLAY_ICON_TV_GUIDE];
    let uri = await this.getAttribute(programElement, 'uri');
    if (playIConURIs.includes(uri)) {
      ret = true;
    }
    return ret;
  }

  /**
   * select program has schedule on home-sport page
   * @returns boolean
   */
  async selectContainerHasSchedule(totalItem, timeout) {
    logger.debug('[selectContainerHasSchedule]');
    let ret = false;
    let start = new Date();
    let isContinue = true;
    let index = 1;
    let totalRightPress = 0;
    while (isContinue) {
      isContinue = !(await this.isContainerHasSchedule());
      if (isContinue) {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug('[selectContainerHasSchedule spentTime] : ' + spentTime);
        if (spentTime > timeout) {
          isContinue = false;
          logger.debug(
            'Cannot select Container Has Schedule ' + timeout + ' seconds'
          );
        } else {
          index++;
          if (index > totalItem) {
            logger.debug(
              '[selectContainerHasSchedule] Have no item to check anymore'
            );
            isContinue = false;
          } else {
            await this.dpadNavByEcp(constants.remoteKey.right);
            totalRightPress++;
          }
        }
      } else {
        ret = true;
      }
    }

    //Go back to first program
    if (!ret) {
      for (let i = 0; i < totalRightPress; i++) {
        await this.dpadNavByEcp(constants.remoteKey.left);
      }
    }
    return ret;
  }

  /**
   * check current program has contains schedule.
   * @returns boolean: 'true' if current program has contains schedule, 'false' if not
   */
  async isContainerHasSchedule() {
    let containerElement = await this.getContainer();
    return await this.doesContainerContainsSchedule(containerElement);
  }

  async doesContainerContainsSchedule(programElement) {
    logger.debug('doesContainerContainsSchedule');
    let ret = false;
    if (programElement.Nodes != null) {
      let totalChild = programElement.Nodes.length;
      logger.debug(
        `[doesContainerContainsSchedule] totalChild : ${totalChild}`
      );
      for (let index = 0; index < totalChild; index++) {
        let element = programElement.Nodes[index];
        if (await this.isScheduleInContainerElement(element)) {
          logger.debug('[doesContainerContainsSchedule] : found Schedule');
          ret = true;
          break;
        }
      }
    } else {
      logger.debug('[[doesContainerContainsSchedule] has not child control');
    }
    return ret;
  }

  /**
   * check current Nodes has contains scheduleText same as expected.
   * @returns boolean: 'true' if current Nodes has contains scheduleText, 'false' if not
   */
  async isScheduleInContainerElement(programElement) {
    let ret = false;
    logger.debug('[isScheduleInContainerElement]');
    let scheduleText = await this.getText(programElement);
    logger.debug(
      `[isScheduleInContainerElement] scheduleText : ${scheduleText}`
    );
    if (
      this.isValidDate(scheduleText, 'HH:mm MM/DD') ||
      this.isValidDate(scheduleText, 'hh:mm A MM/DD')
    ) {
      ret = true;
    }
    return ret;
  }

  /**
   * check date time format
   * @returns boolean: "true" if date time format is same as format expected, "false" if not
   */
  isValidDate(date, format) {
    var customParseFormat = require('dayjs/plugin/customParseFormat');
    dayjs.extend(customParseFormat);
    return dayjs(date, format, true).isValid();
  }

  /**
   * check future program on sport page.
   * @returns boolean: 'true' if container is future program, 'false' if not
   */
  async checkContainerFuture() {
    logger.debug('checkContainerFuture');
    let ret = await this.isContainerHasSchedule();
    return ret;
  }

  /**
   * get the time displayed on the program.
   * @returns String: time
   */
  async getTime() {
    let containerElement = await this.getContainer();
    return await this.getTimeTextInContainerElement(containerElement);
  }
  
  async getTimeTextInContainerElement(programElement) {
    logger.debug('[getTimeTextInContainerElement]');
    let ret = null;
    if (programElement.Nodes != null) {
      let totalChild = programElement.Nodes.length;
      for (let index = 0; index < totalChild; index++) {
        let element = programElement.Nodes[index];
        let elementText = await this.getText(element);
        if (elementText != null) {
          logger.debug(
            `[getTimeTextInContainerElement] : found time ${elementText}`
          );
          ret = elementText;
          break;
        }
      }
    }
    return ret;
  }

  /**
   * select Future Program on sport page.
   * @returns boolean: "true" if the program is Future Program, "false" if not
   */
  async selectFutureProgram(timeout) {
    let ret = false;
    let currentProgram = null;
    let isContinue = true;
    let start = new Date();
    let index = 0;
    while (isContinue) {
      await this.dpadNavByEcp(constants.remoteKey.right);
      await this.delay(1);
      currentProgram = await this.getFocusedElement();
      if (await this.doesProgramContainsPlayIcon(currentProgram)) {
        index++;
      } else {
        isContinue = false;
        logger.debug(`[selectFutureProgram] found future program`);
        ret = true;
      }
      if (isContinue) {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug(`[selectFutureProgram] spentTime : ${spentTime}`);
        isContinue = spentTime <= timeout;
      }
    }
    if (!ret) {
      logger.debug(`[selectFutureProgram] can not found future program`);
    }
    return ret;
  }

  /**
   * check program has contains time format same as expected.
   * @returns boolean: 'true' if check program has contains time format , 'false' if not
   */
  async isContainerHasTimeFormat(type) {
    let containerElement = await this.getContainer();
    return await this.doesContainerContainsTimeFormat(containerElement, type);
  }

  /**
   * check current controls is focused on tv guide.
   * @returns boolean: "true" if current program is high light, "false" if note
   */
  async isEveryProgramFocused(timeout) {
    let ret = true;
    let previousProgram = null;
    let currentProgram = null;
    let isContinue = true;
    let totalRightPress = 0;
    let start = new Date();
    // Check focus for every program when moving forward
    while (isContinue) {
      if (await this.checkHighLight()) {
        currentProgram = await this.getFocusedElement();
        if (!(await this.isSameControl(previousProgram, currentProgram))) {
          await this.dpadNavByEcp(constants.remoteKey.right);
          await this.delay(1);
          previousProgram = currentProgram;
          totalRightPress++;
        } else {
          isContinue = false;
        }
        if (isContinue) {
          let current = new Date();
          let spentTime = this.countDiffTimeInSeconds(start, current);
          logger.debug(`[isEveryProgramFocused] spentTime : ${spentTime}`);
          isContinue = spentTime <= timeout;
        }
        logger.debug(`[isEveryProgramFocused] ${totalRightPress}`);
      } else {
        logger.debug('[isEveryProgramFocused]: Program is not focused');
        isContinue = false;
        ret = false;
      }
    }
    // Check focus for every program when back forward
    if (ret) {
      isContinue = true;
      let pressLeft = 0;
      while (isContinue && pressLeft <= totalRightPress) {
        await this.dpadNavByEcp(constants.remoteKey.left);
        await this.delay(1);
        if (await this.checkHighLight()) {
          pressLeft++;
        } else {
          isContinue = false;
          ret = false;
        }
      }
    }
    return ret;
  }

  /**
   * find all nodes have high light element.
   * @returns boolean: "true" if find node has high light element, "false" if any nodes have not high light element.
   */
  async checkHighLight() {
    logger.debug('[checkHighLight]: Start');
    let ret = false;
    const result = await this.client.getActiveElement();
    let activeElement = result.data.value;
    let totalChild = activeElement.Nodes.length;
    for (let index = 0; index < totalChild; index++) {
      let focusedChild = activeElement.Nodes[index];
      if (await this.isHighLight(focusedChild)) {
        ret = true;
        break;
      }
    }
    logger.debug(`[checkHighLight]: Check highLight is ${ret} and end`);
    return ret;
  }

  /**
   * check nodes have contains time element.
   * @returns boolean: "true" if nodes have container time element, "false" if note
   */
  async doesContainerContainsTimeFormat(programElement, type) {
    let ret = false;
    if (programElement.Nodes != null) {
      let totalChild = programElement.Nodes.length;
      logger.debug(
        `[doesContainerContainsSchedule] totalChild : ${totalChild}`
      );
      for (let index = 0; index < totalChild; index++) {
        let element = programElement.Nodes[index];
        if (await this.isTimeFormatAppear(element, type)) {
          ret = true;
          break;
        }
      }
    } else {
      logger.debug('[[doesContainerContainsSchedule] has not child control');
    }
    return ret;
  }

  async isTimeFormatAppear(programElement, type) {
    let timeText = await this.getText(programElement);
    return this.verifyTimeFormat(timeText, type);
  }

  verifyTimeFormat(val, type) {
    if (type == constants.timeFormat.hour12) {
      val = val.slice(0, 8);
      logger.debug(`[verifyTimeFormat] val: ${val}`);
      //date time format : "05:00 PM"
      return this.isValidDate(val, 'hh:mm A');
    }
    val = val.slice(0, 8);
    logger.debug(`[verifyTimeFormat] val: ${val}`);
    //date time format : "05:00 - "
    return this.isValidDate(val, 'HH:mm - ');
  }

  /**
   * check nodes have contains unlocked icon element.
   * @returns boolean: "true" if nodes have container unlocked icon element, "false" if note
   */
  async isProgramContainsUnlockedIcon() {
    logger.debug('[isProgramContainsUnlockedIcon]');
    let ret = false;
    let programElement = null;
    let result = await this.client.getActiveElement();
    let focusedParent = result.data.value;
    let totalChild = focusedParent.Nodes.length;
    if (totalChild >= 2) {
      programElement = focusedParent.Nodes[1];
    } else {
      logger.debug('[isProgramContainsUnlockedIcon] cannot find container');
    }
    if (await this.isUnlockedIconElement(programElement)) {
      logger.debug('[isProgramContainsUnlockedIcon] : Found unlocked icon');
      ret = true;
    } else {
      logger.debug('[isProgramContainsUnlockedIcon] Not found unlocked icon');
    }
    return ret;
  }

  /**
   * check element is same as expected.
   * @returns boolean: "true" if element is same as expected, "false" if note
   */
  async isUnlockedIconElement(element) {
    const unlockedIConURI = 'pkg:/images/settings/unlock.png';
    let uri = await this.getAttribute(element, 'uri');
    return uri == unlockedIConURI;
  }

  /**
   * check nodes have contains locked icon element.
   * @returns boolean: "true" if nodes have container locked icon element, "false" if note
   */
  async isProgramContainsLockedIcon() {
    logger.debug('[isProgramContainsLockedIcon]');
    let ret = false;
    let programElement = null;
    let result = await this.client.getActiveElement();
    let focusedParent = result.data.value;
    let totalChild = focusedParent.Nodes.length;
    if (totalChild >= 2) {
      programElement = focusedParent.Nodes[1];
    } else {
      logger.debug('[isProgramContainsLockedIcon] cannot find container');
    }
    if (await this.isLockedIconElement(programElement)) {
      logger.debug('[isProgramContainsLockedIcon] : Found locked icon');
      ret = true;
    } else {
      logger.debug('[isProgramContainsLockedIcon] Not found locked icon');
    }
    return ret;
  }

  /**
   * check element is same as expected.
   * @returns boolean: "true" if element is same as expected, "false" if note
   */
  async isLockedIconElement(element) {
    const lockedIConURI = 'pkg:/images/settings/lock.png';
    let uri = await this.getAttribute(element, 'uri');
    return uri == lockedIConURI;
  }

  /**
   * @returns number: total pressLeftButton
   */
  async backToFirstProgram(timeOut) {
    logger.debug('[backToFirstProgram]');
    let previousTile = null;
    let currentTile = null;
    let isContinue = true;
    let total = 0;
    let start = new Date();
    while (isContinue) {
      currentTile = await this.getFocusedElement();
      if (await this.isSameControl(previousTile, currentTile)) {
        isContinue = false;
      } else {
        previousTile = currentTile;
        total++;
        await this.dpadNavByEcp(constants.remoteKey.left);
        await this.delay(1);
      }
      if (isContinue) {
        let current = new Date();
        let spentTime = this.countDiffTimeInSeconds(start, current);
        logger.debug(`[backToFirstProgram] spentTime : ${spentTime}`);
        isContinue = spentTime <= timeOut;
      }
    }
    return total;
  }

  /**
   * get title trending on search page.
   * @returns String: text.
   */
  async getTextTrendingInContainer() {
    let text;
    let focusedElement;
    let containerElement = await this.getContainer();
    if (!containerElement.Nodes) {
      text = await this.getText(containerElement);
    } else {
      focusedElement = containerElement.Nodes[2];
      text = await this.getText(focusedElement);
    }
    return text;
  }

  /**
   * get first title on tv guide page.
   * @returns String: text.
   */
  async getTextInContainer() {
    let text;
    let focusedElement;
    let containerElement = await this.getContainer();
    if (!containerElement.Nodes) {
      text = await this.getText(containerElement);
    } else {
      focusedElement =
        containerElement.Nodes[1].Nodes[2].Nodes[0].Nodes[0].Nodes[0];
      text = await this.getText(focusedElement);
    }
    return text;
  }

  /**
   * check program is focused
   * @param {*} totalTile: total tile of 1 swimlane.
   * @returns boolean
   */
  async isProgramFocused(totalTile) {
    let ret = true;
    let totalRightPress = 0;
    // Check focus for every program when moving forward
    for (totalRightPress; totalRightPress < totalTile; totalRightPress++) {
      if (await this.checkFocused()) {
        await this.dpadNavByEcp(constants.remoteKey.right);
        await this.delay(1);
        ret = true;
      } else {
        logger.debug('[isProgramFocused]: Program is not focused');
        ret = false;
        break;
      }
    }
    // Check focus for every program when back forward
    if (ret) {
      let pressLeft = 0;
      for (pressLeft; pressLeft < totalTile; pressLeft++) {
        if (await this.checkFocused()) {
          await this.dpadNavByEcp(constants.remoteKey.left);
          await this.delay(1);
          ret = true;
        } else {
          logger.debug('[isProgramFocused]: Program is not focused');
          ret = false;
          break;
        }
      }
    }
    return ret;
  }

  /**
   * to check focused
   * get attribute is 'focused'
   * get value is true
   * @returns boolean
   */
  async checkFocused() {
    logger.debug('[checkFocused]: Start');
    let ret = false;
    const result = await this.client.getActiveElement();
    let activeElement = result.data.value;
    let checkFocus = await this.getAttribute(activeElement, 'focused');
    if (checkFocus == TRUE_VALUE) {
      ret = true;
    }
    logger.debug(`[checkFocused]: Check focused is ${ret} and end`);
    return ret;
  }

  async getScreenSource() {
    let result = await this.client.getScreenSource();
    let data = atob(result.data.value);
    return data;
  }

  /**
   * Send dpad keypresses via deeplink
   */
  async dpadNavByEcp(dpadKey, index = 1, delay = 0) {
    let count = 0;
    while (count < index) {
      execSync(`curl -d '' http://${rokuIP}:8060/keypress/${dpadKey}`);
      count++;
    }
  }

  /**
   * Type text via deeplink
   */
  async typeTextByEcp(text) {
    for (let i = 0; i < text.length; i++) {
      if (text.charAt(i) === "'" || text.charAt(i) === '"') {
        execSync(
          `curl -d '' http://${rokuIP}:8060/keypress/Lit_\\` +
            encodeURIComponent(text.charAt(i))
        );
      } else {
        execSync(
          `curl -d '' http://${rokuIP}:8060/keypress/Lit_` +
            encodeURIComponent(text.charAt(i))
        );
      }
    }
  }

  /**
   * check if swimlane tile is focussed
   * @param {*} swimlaneName
   * @returns boolean: "true" if focus is on swimlane tile, "false" if not
   */
  async isSwimlaneFocused(swimlaneName) {
    let isSwimlaneFocused = false;
    let parentNode = await this.getElement(watchPageLocators.swimlaneParent);
    let childNodes = await this.getChildNodes(parentNode);
    if (Array.isArray(childNodes) !== false) {
      for (let i = 0; i < childNodes.length; i++) {
        let isFocused = this.getAttribute(childNodes[i], 'focused');
        let swimlaneText = this.getText(
          childNodes[i].Nodes[0].Nodes[0].Nodes[0]
        );
        if (isFocused) {
          if (swimlaneText === swimlaneName) {
            isSwimlaneFocused = true;
            break;
          }
        }
      }
    }
    return isSwimlaneFocused;
  }

  /**
   * find all nodes have high light element.
   * @returns boolean: "true" if find node has high light element, "false" if any nodes have not high light element.
   */
  async isFavoritesToggleButtonFocussed() {
    let ret = false;
    const result = await this.client.getActiveElement();
    let activeElement = result.data.value;
    if ((await this.getTag(activeElement)) === 'FavouriteToggleButton') {
      if (await this.getAttribute(activeElement, 'focused')) {
        ret = true;
      }
    }
    return ret;
  }

  /**
   * chaeck if current highlighted channel row header is focussed
   * @returns boolean: "true" if row header is focussed, "false" if not
   */
  async isCurrentHighlightedChannelRowHeaderFocussed() {
    let isRowHeaderFocussed = false;
    const rowHeaderList = await this.getElements(
      classicGuideLocators.tvGuideRowHeader
    );
    for (let index = 0; index <= rowHeaderList.length; index++) {
      if (this.getAttribute(rowHeaderList[index], 'focused') == 'true') {
        isRowHeaderFocussed = true;
        break;
      }
    }
    return isRowHeaderFocussed;
  }

  async isTvGuideGenreFilterFocussed(filterName, delay = 0) {
    let ret = false;
    let elements = await this.getElements(classicGuideLocators.genreFilterTabs);
    for (let index = 0; index < elements.length; index++) {
      let isFocussed = this.getAttribute(elements[index], 'focused');
      let filterTabText = this.getText(elements[index].Nodes[2]);
      if (isFocussed == 'true' && filterTabText == filterName) {
        ret = true;
        break;
      }
    }
    return ret;
  }
}
module.exports.RokuLibrary = RokuLibrary;
