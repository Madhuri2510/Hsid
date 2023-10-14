/* eslint-disable no-undef */
const Helper = codeceptjs.Helper;
const io = require('socket.io-client');
const stringIncludes = require('codeceptjs/lib/assert/include').includes;
const AssertionError = require('assert').AssertionError;
const PlatformUtilsFactory = require('./platform_utils/PlatformUtilsFactory');
const {clearString} = require('codeceptjs/lib/utils');
const activeElementConfig = require('./platform_utils/config-files/active-element-config')
  .config;
const gitConfig = require('../config/gitConfig');

let socket;

let requestId = 0;

let globalTimeout = 120 * 1000;

if (gitConfig.isComcastPlatform()) {
  globalTimeout = 180 * 1000;
}

const defaultWaitTimeout = 30;

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

const timeoutPromise = function (
  fn,
  op = 'Request',
  details = '',
  ms = globalTimeout
) {
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      let timeoutError = new TimeoutError(`${op} time out in ${ms}ms`);
      timeoutError.stack = timeoutError.stack + JSON.stringify(details);
      reject(timeoutError);
    }, ms);
  });
  let promise = new Promise(fn);
  return Promise.race([promise, timeout]);
};

/**
 *
 * This helpers connects with Sandstorm Server for JS Platform Automation
 *
 * ### Configuration
 * CodeceptJS should be configured to use Sandstorm.
 * In `codecept.conf.js` enable Sandstorm helper:
 *
 * ```js
 * helpers: {
 *    Sandstorm: {
 *      require: './helpers/Sandstorm.js',
 *    }
 * }
 *
 * ```
 *
 *
 * ### Options:
 *
 * * `uuid` - device uuid
 * * `server` - socket server address
 * * `deviceIP` - Device IP to install app
 *
 */
class Sandstorm extends Helper {
  constructor(config) {
    super(config);
    this.firstTime = true;
    /* Default configuration*/
    this.options = {
      output: './output',
    };

    console.log(`Sandstorm Helper with config ${JSON.stringify(config)}`);
    this._createConfig(config);
    if (this.options.uuid) {
      this.platform = null;
    } else {
      throw 'Device uuid is not provided';
    }
    this.requests = {};
  }

  /**
   * Override default config
   * @param {Object} config
   */
  _createConfig(config) {
    Object.assign(this.options, config);
  }

  /**
   * Build request object from given parameters by incrementing requestIds
   * @param {string} action can be `click`, `fetch` etc
   * @param {string} type can be `css` or `id`
   * @param {string} selector - element selector like `#message`
   * @param {*} payload - other parameters like `fluentWait`
   * @returns request object which needs to be emit to socket server
   */
  _buildRequestObject(action, type, selector, payload = {}) {
    const requestObject = {
      payload: payload,
      action: action,
      selector: selector,
      id: requestId++,
      type: type,
      uuid: this.options.uuid,
    };
    return requestObject;
  }

  /**
   * Initiate connection with Socket server
   * If connection is successful then it will register callbacks, else will throw error
   */
  _initiateSocketCon() {
    return timeoutPromise(
      (resolve, reject) => {
        socket = io(this.options.server);
        socket.on('connect', () => {
          console.log(`socket id is ${socket.io.engine.id}`);
          if (socket.io.engine.id) {
            this._registerCallBacks();
            resolve(true);
          } else {
            reject(new Error('Error in connection....'));
          }
        });
      },
      'SocketInitiation',
      this.options,
      10000
    );
  }

  /**
   * Register `onAutomationResponse`,
   *          `onSetupAck`,
   *          `onConfigureResponse` and
   *          `onAppTearDownResponse`
   * callback to socket
   */
  _registerCallBacks() {
    socket.on('onAutomationResponse', (data) => {
      console.log(
        `_registerCallBacks() : onAutomationResponse : ${JSON.stringify(data)}`
      );
      if (data.reqId !== undefined && data.reqId in this.requests) {
        this.requests[data.reqId](data);
        delete this.requests[data.reqId];
      }
    });
    socket.on('onSetupAck', (data) => {
      console.log(
        `_registerCallBacks() : onSetupAck : ${JSON.stringify(data)}`
      );
      if ('onSetupAck' in this.requests) {
        this.requests.onSetupAck(data);
        delete this.requests.onSetupAck;
      }
    });
    socket.on('onConfigureResponse', (data) => {
      console.log(
        `_registerCallBacks() : onConfigureResponse : ${JSON.stringify(data)}`
      );
      if ('onConfigureResponse' in this.requests) {
        this.requests.onConfigureResponse(data);
        delete this.requests.onConfigureResponse;
      }
    });
    socket.on('onAppTearDownResponse', (data) => {
      console.log(
        `_registerCallBacks() : onAppTearDownResponse : ${JSON.stringify(data)}`
      );
      if ('onAppTearDownResponse' in this.requests) {
        this.requests.onAppTearDownResponse(data);
        delete this.requests.onAppTearDownResponse;
      }
    });
  }

  /**
   * Register socket parameters with socket server
   */
  async _setupConnectionToDevice() {
    /* Get platform specific utility object */
    this.platform = PlatformUtilsFactory.getPlatformUtils(this.options);

    let connectionPayload = {
      socketId: socket.io.engine.id,
      targetDeviceType: this.options.type,
      deviceIP: this.options.deviceIP,
      type: 'automationClient',
      uuid: this.options.uuid,
      /* Get platform specific initialization done and
      get parameters to connectionPayload */
      ...(await this.platform.devicePlatformInit()),
    };

    return timeoutPromise(
      (resolve, reject) => {
        this.requests.onSetupAck = (data) => {
          if (data.status === 'Passed') {
            resolve(data);
          } else {
            let error = new Error(data.status);
            error.stack = error.stack + JSON.stringify(data);
            reject(error);
          }
        };
        socket.emit('onSetupInit', connectionPayload);
        console.log(
          `Request emitted: onSetupInit: ${JSON.stringify(connectionPayload)}`
        );
      },
      'SetupInit',
      connectionPayload
    );
  }

  /**
   * Register device configuration parameter with socket server like `keyCodeMap`, `activeElementSelector` etc
   */
  _doDeviceConfig() {
    const onConfigurePayload = {
      payload: {
        keyCodeMap: {
          ...this.platform.getDeviceConfig() /* Get platform specific device config*/,
        },
        ...activeElementConfig,
      },
      action: 'configure',
      uuid: this.options.uuid,
    };
    return timeoutPromise(
      (resolve, reject) => {
        this.requests.onConfigureResponse = (data) => {
          if (data.status === 'passed') {
            resolve(data);
          } else {
            let error = new Error(data.status);
            error.stack = error.stack + JSON.stringify(data);
            reject(error);
          }
        };
        socket.emit('onConfigureRequest', onConfigurePayload);
        console.log(
          `Request emitted: onConfigureRequest: ${JSON.stringify(
            onConfigurePayload
          )}`
        );
      },
      'ConfigurationRequest',
      onConfigurePayload
    );
  }

  /**
   * This method initialize connection with socket, then set configuration parameters
   */
  async _configureDevice() {
    await this._initiateSocketCon();
    await this._setupConnectionToDevice();
    await this._doDeviceConfig();
  }

  async _beforeSuite() {
    /** Initialize device, sandstorm server connection only for first suite
     * For other suites, it will be done in _afterSuite
     */
    if (this.firstTime) {
      this.firstTime = false;
      await this._configureDevice();
    }
  }

  /**
   * Teardown after suite
   */
  async _afterSuite(suite) {
    await this._tearDownApp();
    /** Relaunch app to make it available for next suite and after the test
     * to avoid device to get into standby mode
     */
    await this._configureDevice();
  }
  /**
   * Tear down application and Sandstorm web socket server connection
   */
  async _tearDownApp() {
    let tearDownPayload = {
      targetDeviceType: this.options.type,
      deviceIP: this.options.deviceIP,
      uuid: this.options.uuid,
      /* Get platform specific teardown done and get parameters if any */
      ...(await this.platform.startAppTearDown()),
    };

    return timeoutPromise(
      (resolve, reject) => {
        this.requests.onAppTearDownResponse = (data) => {
          if (data.status === 'success') {
            resolve(data);
          } else {
            let error = new Error(data.status);
            error.stack = error.stack + JSON.stringify(data);
            reject(error);
          }
          socket.close();
        };
        socket.emit('onAppTearDownRequest', tearDownPayload);
        console.log(
          `_afterSuite() : Request emitted: onAppTearDownRequest: ${JSON.stringify(
            tearDownPayload
          )}`
        );
      },
      'AppTearDownRequest',
      tearDownPayload
    );
  }

  _before(test) {
    let title = test.title.replace(/ /g, '');
    title = title.substring(title.lastIndexOf(':') + 1, title.lastIndexOf('-'));
    /**
     * Below log statement shouldn't be modified. This is being utilised
     * by logSplitter.sh from cicd folder. Log splitting will fail if this
     * gets altered or removed.
     */
    console.log(
      `*****************************Log split marker - starting test : ${title}-${test._currentRetry}************************`
    );
  }

  /**
   * Capture screenshot with given fille name
   * @param {string} name File name for screenshot
   */
  async saveScreenshot(name) {
    await this.platform.saveScreenshot(name);
  }

  async _test(test) {}

  async _passed(test) {}

  /**
   * Trigger screenshot capture on test failure
   * @param {Object} test CodeceptJS test object
   */
  async _failed(test) {
    let fileName = clearString(test.title);
    const uuid = test.uuid || test.ctx.test.uuid;
    /* limit the image file name*/
    fileName = `${this.options.output}/${fileName.substring(
      0,
      10
    )}_${uuid}.failed.png`;
    await this.saveScreenshot(fileName);
  }

  async _execute(requestPayload) {
    return timeoutPromise(
      (resolve, reject) => {
        this.requests[requestPayload.id] = function (data) {
          if (data.status === 'passed') {
            resolve(data);
          } else {
            let error = new Error('Request failed');
            error.stack =
              error.stack +
              `\nRequest: ${JSON.stringify(
                requestPayload
              )} \nResponse: ${JSON.stringify(data)}`;
            reject(error);
          }
        };
        socket.emit('onAutomationRequest', requestPayload);
        console.log(
          `Request emitted: onAutomationRequest: ${JSON.stringify(
            requestPayload
          )}`
        );
      },
      'Automation Request',
      requestPayload
    );
  }

  /**
   * Returns the located element
   * @param {*} locator
   * @param {*} parentLocator
   * @param {boolean} multiple - set true to get multiple elements
   */
  async _locate(locator, parentLocator, multiple = false) {
    let parent;
    if (parentLocator) {
      parent = await this._locate(parentLocator);
    }
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject('fetch', type, selector, {
      multiple: multiple,
    });
    if (parent) {
      requestPayload.payload.parent = [];
      requestPayload.payload.parent.push({
        sandstorm_id: parent.attributes.sandstorm_id,
      });
    }
    return (await this._execute(requestPayload)).payload;
  }

  /**
   * Don't use this method, only for compatibility purpose
   * @param {*} locator
   * @returns throws not supported error
   */
  async _locateClickable(locator) {
    return Promise.reject(new Error('_locateClickable not supported'));
  }

  /**
   * Finds and return element, throws error if element with specified locator not found in DOM
   * @param {*} locator
   * @param {*} parentLocator
   * @returns element
   */
  async getElement(locator, parentLocator) {
    return this._locate(locator, parentLocator);
  }

  /**
   * @param {*} locator
   * @param {*} parentLocator
   * @returns array of elements
   */
  async getElements(locator, parentLocator) {
    return (await this._locate(locator, parentLocator, true)).elementsArray;
  }

  /**
   * Relaunches an application.
   *
   * ```js
   * I.relaunchApp();
   * ```
   */
  async relaunchApp() {}

  /**
   * Reload an application
   * ```js
   * I.reloadApp();
   * ```
   */
  async reloadApp() {
    //TODO:
  }

  /**
   * Launches an application. If application instance already exists, use [relaunchApp](#relaunchApp).
   *
   * ```js
   * I.launchApp();
   * ```
   */
  async launchApp() {}

  /**
   * Installs a configured application.
   * Application is installed by default.
   *
   * ```js
   * I.installApp();
   * ```
   */
  async installApp() {}

  /**
   * Perform Back Keypress
   *
   * ```js
   * I.goBack();
   * ```
   */
  async goBack() {
    let keycode = 'BACK';
    await this.pressKey(keycode);
  }

  /**
   * Waits for number of seconds
   *
   * ```js
   * I.wait(2); // waits for 2 seconds
   * ```
   *
   * @param {number} sec number of seconds to wait
   */
  async wait(sec) {
    return new Promise((done) => {
      setTimeout(done, sec * 1000);
    });
  }

  /**
   * Clicks on an element.
   * Element can be located by its text or id or accessibility id
   *
   * The second parameter is a context (id | type | accessibility id) to narrow the search.
   *
   * Same as [tap](#tap)
   *
   * ```js
   * I.click('#user'); // locate by id
   * ```
   *
   * @param {*} locator
   * @param {*} [context=null] Not implemented - will be ignored
   */
  async click(locator, context = null) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject('click', type, selector);
    return await this._execute(requestPayload);
  }

  /**
   * Checks text to be visible.
   * Use second parameter to narrow down the search.
   *
   * ```js
   * I.see('Record created');
   * I.see('Record updated', '#message');
   * ```
   *
   * @param {string} text to check visibility
   * @param {*} [context=null] element inside which to search for text
   */
  async see(text, context = null) {
    const textContent = await this.getElementLabel(context || {css: 'body'});
    return stringIncludes('text content').assert(text, textContent);
  }

  /**
   * Checks text not to be visible.
   * Use second parameter to narrow down the search.
   *
   * ```js
   * I.dontSee('Record created');
   * I.dontSee('Record updated', '#message');
   * ```
   * @param {string} text to check invisibility
   * @param {*} [context=null] element in which to search for text
   */
  async dontSee(text, context = null) {
    const textContent = await this.getElementLabel(context || {css: 'body'});
    return stringIncludes('text content').negate(text, textContent);
  }

  /**
   * Checks for visibility of an element.
   * Use second parameter to narrow down the search.
   *
   * ```js
   * I.seeElement('#edit', '#menu'); // element inside #menu
   * ```
   *
   * @param {*} locator of an element
   * @param {*} [context=null] context element
   */
  async seeElement(locator, context = null) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject('visible', type, selector);
    try {
      await this._execute(requestPayload);
    } catch (error) {
      return Promise.reject(
        new AssertionError({
          expected: `Element ${JSON.stringify(locator)} should be visible`,
          actual: `Element ${JSON.stringify(locator)} is not visible`,
          operator: 'but',
        })
      );
    }
  }

  /**
   * Checks that element is not visible.
   * Use second parameter to narrow down the search.
   *
   * ```js
   * I.dontSeeElement('#edit'); // located by data-test-id
   * I.dontSeeElement('#edit', '#menu'); // element inside #menu
   * ```
   * @param {*} locator element to locate
   * @param {*} [context=null] context element
   */
  async dontSeeElement(locator, context = null) {
    let isVisible = await this.isElementVisible(locator);
    if (isVisible) {
      return Promise.reject(
        new AssertionError({
          expected: `Element ${JSON.stringify(locator)} shouldn't be visible`,
          actual: `Element ${JSON.stringify(locator)} is visible`,
          operator: 'but',
        })
      );
    }
  }

  /**
   * Checks for existence of an element. An element can be visible or not.
   * Use second parameter to narrow down the search.
   *
   * ```js
   * I.seeElementExists('#edit'); // located by data-test-id
   * I.seeElementExists('#edit', '#menu'); // element inside #menu
   * ```
   *
   * @param {*} locator of an element
   * @param {*} [context=null]  context element
   */
  async seeElementExists(locator, context = null) {
    try {
      await this._locate(locator, context);
    } catch (error) {
      return Promise.reject(
        new AssertionError({
          expected: `Element ${JSON.stringify(locator)} should be exist`,
          actual: `Element ${JSON.stringify(locator)} doesn't exist`,
          operator: 'but',
        })
      );
    }
  }

  /**
   * Checks that element not exists.
   * Use second parameter to narrow down the search.
   *
   * ```js
   * I.dontSeeElementExist('#edit');
   * I.dontSeeElementExists('#edit', '#menu'); // element inside #menu
   * ```
   *
   * @param {*} locator of an element
   * @param {*} [context=null] context element
   */
  async dontSeeElementExists(locator, context = null) {
    let element;
    try {
      element = await this._locate(locator, context);
    } catch (ignore) {}
    if (element) {
      return Promise.reject(
        new AssertionError({
          expected: `Element ${JSON.stringify(locator)} shouldn't be exist`,
          actual: `Element ${JSON.stringify(locator)} exists`,
          operator: 'but',
        })
      );
    }
  }

  /**
   * Fill the text to current focused element
   * @param {*} locator
   * @param {*} value
   */
  async fillField(locator, value) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject('type', type, selector, {
      textToType: value,
    });
    return await this._execute(requestPayload);
  }

  /**
   * Clears a current focused textfield
   *
   * ```js
   * I.clearField('#name');
   * ```
   *
   * @param {*} field an input element to clear
   */
  async clearField(locator) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject('type', type, selector, {
      textToType: '',
    });
    return await this._execute(requestPayload);
  }

  /**
   * Appends text into the current focused textfield
   *
   * ```js
   * I.appendField('#name','@test.com');
   * ```
   *
   * @param {*} field an input element to clear
   */
  async appendField(locator, value) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject('type', type, selector, {
      textToType: value,
      append: true,
    });
    return await this._execute(requestPayload);
  }

  /**
   * Scrolls UP to the element.
   *
   * ```js
   * I.scrollUp('#container');
   * ```
   *
   * @param {*} locator
   */
  async scrollUp(locator) {
    await this.navigate(locator);
    let keycode = 'UP';
    await this.pressKey(keycode);
  }

  /**
   * Scrolls Down to the element.
   *
   * ```js
   * I.scrollDown('#container');
   * ```
   *
   * @param {*} locator
   */
  async scrollDown(locator) {
    await this.navigate(locator);
    let keycode = 'DOWN';
    await this.pressKey(keycode);
  }

  /**
   * Scrolls Left to the element.
   *
   * ```js
   * I.scrollLeft('#container');
   * ```
   *
   * @param {*} locator
   */
  async scrollLeft(locator) {
    await this.navigate(locator);
    let keycode = 'LEFT';
    await this.pressKey(keycode);
  }

  /**
   * Scrolls Right to the element.
   *
   * ```js
   * I.scrollRight('#container');
   * ```
   *
   * @param {*} locator
   */
  async scrollRight(locator) {
    await this.navigate(locator);
    let keycode = 'RIGHT';
    await this.pressKey(keycode);
  }

  /**
   * Waits for an element to exist on page.
   *
   * ```js
   * I.waitForElement('#message', 1); // wait for 1 second
   * ```
   *
   * @param locator of an element to wait for
   * @param {number} number of seconds to wait, 5 by default
   */
  async waitForElement(locator, waitDur = defaultWaitTimeout) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject('wait', type, selector, {
      fluentWait: waitDur * 1000,
    });
    return await this._execute(requestPayload);
  }

  /**
   * Waits for an element to be visible on page at interval of 3sec
   *
   * ```js
   * I.waitForElementVisible('#message', 1); // wait for 1 second
   * ```
   *
   * @param locator an element to wait for
   * @param {number} number of seconds to wait
   */
  async waitForElementVisible(locator, waitDur = defaultWaitTimeout) {
    return new Promise((resolve, reject) => {
      let interval = setInterval(async () => {
        if (await this.isElementVisible(locator)) {
          clearInterval(interval);
          interval = null;
          clearTimeout(timer);
          timer = null;
          resolve(true);
        }
      }, 3000);
      let timer = setTimeout(() => {
        clearInterval(interval);
        interval = null;
        clearTimeout(timer);
        timer = null;
        reject(
          new TimeoutError(`Element ${JSON.stringify(locator)} is not visible`)
        );
      }, waitDur * 1000);
    });
  }

  /**
   * Waits an element to become not visible.
   *
   * ```js
   * I.waitToHide('#message', 2); // wait for 2 seconds
   * ```
   *
   * @param locator  an element to wait for
   * @param {number} number of seconds to wait
   */
  async waitToHide(locator, waitDur = defaultWaitTimeout) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject(
      'waitTillDisappear',
      type,
      selector,
      {fluentWait: waitDur * 1000}
    );
    return await this._execute(requestPayload);
  }

  /**
   * @param {*} locator
   * @returns `true` if element is visible
   */
  async isElementContentVisible(locator) {
    return this.isElementVisible(locator);
  }

  /**
   * Get element properties
   * @param {*} locator
   * @returns element properties
   */
  async getElementProps(locator) {
    const element = await this._locate(locator);
    return {...element.attributes, text: element.textContent};
  }

  /**
   * Get element properties for an indexed item
   * @param {*} locator
   * @param {*} index
   * @returns element properties
   */
  async getElementPropsIndexed(locator, index = 0) {
    let {selector, type} = this._detectLocator(locator);
    let ele = {};
    ele[type] = selector + `:nth-of-type(${index + 1})`;
    return await this.getElementProps(ele);
  }

  /**
   * Get element location
   * @param {*} locator
   * @returns x,y coordinates of element
   */
  async getElementLocation(locator) {
    let props = await this.getElementProps(locator);
    return [props.y, props.x];
  }

  /**
   * Assert the given text at the given index
   * @param {*} text
   * @param {*} index
   * @param {*} context
   */
  async seeTextExistsAtIndex(text, index = 0, context) {
    const textContent = await this.getElementLabel(context || {css: 'body'});

    const regText = this._escapeSpecialCharacters(text);
    const result = textContent.match(regText);

    if (result !== null && result.length > index) {
      return true;
    } else {
      return Promise.reject(
        new AssertionError({
          expected: `Text ${text} should be exist ${index + 1} times`,
          actual: `Text ${text} doesn't exist ${index + 1} times`,
          operator: 'but',
        })
      );
    }
  }

  /**
   * Assert if element with given ancestor exist or not
   * ```js
   * I.elementWithAncestorExists('#child','#parent');
   * ```
   * @param {*} childLocator
   * @param {*} ancestorLocator
   * @returns
   */
  async elementWithAncestorExists(childLocator, ancestorLocator) {
    try {
      await this._locate(childLocator, ancestorLocator);
      return true;
    } catch (ignore) {
      return Promise.reject(
        new AssertionError({
          expected: `Element ${childLocator} should be exist in ancestor ${ancestorLocator}.`,
          actual: `Element ${childLocator} doesn't exist in ancestor ${ancestorLocator}.`,
          operator: 'but',
        })
      );
    }
  }

  /**
   * @param {*} locator
   * @parentLocator {*} parent element locator
   * @returns `true` if the given locator is visible, returns `false` if not
   */
  async isElementVisible(locator, parentLocator) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject('visible', type, selector);
    if (parentLocator) {
      let parent;
      try {
        parent = await this._locate(parentLocator);
      } catch (error) {
        console.log(
          `Sandstorm : isElementVisible : Element ${parentLocator} not found`
        );
        return false;
      }
      requestPayload.payload.parent = [];
      requestPayload.payload.parent.push({
        sandstorm_id: parent.attributes.sandstorm_id,
      });
    }
    try {
      await this._execute(requestPayload);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate elementId by prefixing `#`
   * @param {*} id
   * @returns Sandstorm ID with prefixing "#" for given locator
   */
  getPlatformID(id) {
    return '#' + id;
  }

  /**
   * Generate and return focused element id
   * @param {*} id
   * @returns Returns Sandstorm Focused ID with prefixing "#" and adding "-focused" at the end of given locator
   */
  getPlatformIDFocused(id) {
    let focusedLocator = '#' + id + '-focused';
    return focusedLocator;
  }

  /**
   * Get element text
   * @param {string/object} locator of an element
   * @param {string/object} parentLocator of an element
   * @returns Text of element
   */
  async getElementLabel(locator, parentLocator) {
    let element = '';
    if (parentLocator) {
      element = await this._locate(locator, parentLocator);
    } else {
      element = await this._locate(locator);
    }
    return element.textContent;
  }

  /**
   * If given element is focused in DOM then return true, else return false
   * ```js
   * I.isElementFocused('message');
   * ```
   * @param {*} locator
   * @returns `true` if element is focused, else return `false`.
   */
  async isElementFocused(locator) {
    if (typeof locator === 'object') {
      let element = await this._locate(locator);
      let attributes = element.attributes;
      return (
        attributes &&
        'data-testid' in attributes &&
        attributes['data-testid'].indexOf('-focused') > -1
      );
    } else {
      let focusedLocator = locator + '-focused';
      return await this.isElementVisible(focusedLocator);
    }
  }

  /**
   * Move focused to target element
   * ```js
   * I.navigate('#home')
   * ```
   * @param {*} locator
   */
  async navigate(locator) {
    let element = await this._locate(locator);
    const requestPayload = this._buildRequestObject(
      'navigate',
      'css',
      `[sandstorm_id="${element.attributes.sandstorm_id}"]`
    );
    return await this._execute(requestPayload);
  }

  /**
   * Performs Left Keypress actions
   * ```js
   * I.dpadLeft();  //performs dpadLeft
   * I.dpadLeft(2); //performs actions 2 times
   * ```
   * @param {*} iterations Number of iterations
   */
  async dpadLeft(iterations = 1) {
    let keycode = 'LEFT';
    for (let i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
      await this.wait(1);
    }
  }

  /**
   * Performs Right Keypress actions
   * ```js
   * I.dpadRight();  //performs dpadRight
   * I.dpadRight(2); //performs actions 2 times
   * ```
   * @param {*} iterations Number of iterations
   */
  async dpadRight(iterations = 1) {
    let keycode = 'RIGHT';
    for (let i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
      await this.wait(1);
    }
  }

  /**
   * Performs Up Keypress actions
   * ```js
   * I.dpadUp();  //performs dpadUp
   * I.dpadUp(2); //performs actions 2 times
   * ```
   * @param {*} iterations Number of iterations
   */
  async dpadUp(iterations = 1) {
    let keycode = 'UP';
    for (let i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
      await this.wait(1);
    }
  }

  /**
   * Performs OK Keypress actions
   * ```js
   * I.ok();  //click Ok button
   * I.ok(2); //performs actions 2 times
   * ```
   * @param {*} iterations Number of iterations
   */
  async ok(iterations = 1) {
    let keycode = 'ENTER_KEYPRESS';
    for (let i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
      await this.wait(1);
    }
  }

  /**
   * Performs Down Keypress actions
   * ```js
   * I.dpadDown();  //performs dpadDown
   * I.dpadDown(2); //performs actions 2 times
   * ```
   * @param {*} iterations Number of iterations
   */
  async dpadDown(iterations = 1) {
    let keycode = 'DOWN';
    for (let i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
      await this.wait(1);
    }
  }

  /**
   * Perform fast forward action
   * @param {number} iterations Number of iterations
   */
  async fastForward(iterations = 1) {
    let keycode = 'FAST_FORWARD';
    for (let i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
      await this.wait(1);
    }
  }

  /**
   * Perform rewind action
   * @param {number} iterations Number of iterations
   */
  async rewind(iterations = 1) {
    let keycode = 'FAST_REWIND';
    for (let i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
      await this.wait(1);
    }
  }

  /**
   * Performs Back Keypress actions
   * ```js
   * I.pressBack();  //performs back
   * I.pressBack(2); //performs back 2 times
   * ```
   * @param {*} iterations Number of iterations
   */
  async pressBack(iterations = 1) {
    let keycode = 'BACK';
    for (let i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
      await this.wait(1);
    }
  }

  /**
   * Perform press menu action
   */
  async pressMenuButton() {
    let keycode = 'MENU_BUTTON';
    await this.pressKey(keycode);
    await this.wait(1);
  }

  /**
   * Preform provided key press event
   * ```js
   * I.pressKey('UP');
   * ```
   * @param {*} direction
   * @returns
   */
  async pressKey(direction) {
    let requestPayload = this._buildRequestObject('click', 'button', direction);
    return await this._execute(requestPayload);
  }

  /**
   * Return current platform
   * @returns `SANDSTORM`
   */
  async getPlatform() {
    return this.options.type;
  }

  /**
   * @param {*} locator of an element
   * @returns selector and type
   */
  _detectLocator(locator) {
    if (typeof locator === 'object') {
      if (locator.id) {
        return {selector: locator.id, type: 'id'};
      }
      if (locator.css) {
        return {selector: locator.css, type: 'css'};
      }
    } else {
      if (locator[0] === '#') {
        return {
          selector: `[data-testid=\"${locator.slice(
            1
          )}\"], [id=\"${locator.slice(1)}\"]`,
          type: 'css',
        };
      }
      return {selector: `[data-testid='${locator}']`, type: 'css'};
    }
  }

  /**
   * @param {*} inputString String to be escaped for Special characters
   * @returns String after escaping all Special Characters
   */
  _escapeSpecialCharacters(inputString) {
    console.log(
      'Input String to do escaping of Special Characters : ' + inputString
    );
    let arr = inputString.split('');
    arr = arr.map(function (d) {
      return d.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\' + d);
    });
    let resultantString = new RegExp(arr.join(''), 'gi');
    console.log(
      'Resultant String after escaping Special Characters : ' + resultantString
    );
    return resultantString;
  }

  /**
   * Get element CSS style property
   * @param {string} locator, locators.channelContainer
   * @param {string} propertyName, style propertyName eg, border, width, height, background-color
   * @returns `Property Object` if the given locator is find
   */
  async getElementComputedStyle(locator, propertyName) {
    let {selector, type} = this._detectLocator(locator);
    const requestPayload = this._buildRequestObject(
      'getElementComputedStyle',
      type,
      selector,
      {propertyName}
    );
    try {
      const response = await this._execute(requestPayload);
      return response.payload.computedStyle;
    } catch (error) {
      return null;
    }
  }
  /**
   * Perform record button press action
   */
  async pressRecordButtonOfRCU() {
    let keycode = 'RECORD';
    await this.pressKey(keycode);
    await this.wait(1);
  }
  /**
   * Get current device time
   * @returns {Object} property if the given locator is found
   */
  async getCurrentDeviceTime() {
    const requestPayload = this._buildRequestObject('getCurrentTime');
    try {
      const response = await this._execute(requestPayload);
      return response.payload.currentTime;
    } catch (error) {
      return null;
    }
  }
}
module.exports = Sandstorm;
