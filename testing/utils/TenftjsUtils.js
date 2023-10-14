const {threadId} = require('worker_threads');
const http = require('http');
const util = require('util');
const tenFtJsPlatform = require('../config/platform/tenftjs');

module.exports = {
  /**
   * Parse device UUID and return platform type
   * @param {string} id device UUID
   * @returns {string} platform type
   */
  getPlatformTypeFromId(id) {
    let platformType = id.split(':', 1)[0].toLowerCase();
    if (platformType === 'browser') {
      platformType = tenFtJsPlatform.types.HOSTED10FT;
    }
    return platformType;
  },

  /**
   * Returns device configuration object based on threadId
   * Default device configuration returned for master/single thread mode.
   * Returns device configuration from environment variable in case of workers
   * @param {object} defaultTenFtJsDeviceConfig default tenftjs device
   * @returns device configuration object
   */
  getTenFtJsDevice(defaultTenFtJsDeviceConfig) {
    if (threadId > 0) {
      let argObj = JSON.parse(process.env.profile);
      return {
        ...argObj.devices[threadId - 1],
        server: argObj.server,
        type: this.getPlatformTypeFromId(argObj.devices[threadId - 1].uuid),
      };
    } else {
      return {
        ...defaultTenFtJsDeviceConfig,
        type: this.getPlatformTypeFromId(defaultTenFtJsDeviceConfig.uuid),
      };
    }
  },

  /**
   * Overrides console logs. Prefix message with threadId
   */
  setLogging() {
    let logFunc = (...args) => {
      if (args.length > 0 && typeof args[0] === 'string') {
        /**
         * Add thread id prefix if first argument is string
         * and not starting with '[' (no prefix added by master)
         */
        if (!args[0].startsWith('[')) {
          args[0] = `[${threadId}]${args[0]}`;
        }
      } else {
        /**
         * Add thread id if first argument is not
         * string and not empty
         */
        if (args[0] || args.length > 1) {
          args.unshift(`[${threadId}]`);
        }
      }
      /**
       * Format and write to stdout
       */
      process.stdout.write(`${util.format(...args)}\n`);
    };

    /**
     * Override all console calls
     */
    console.info = logFunc;
    console.trace = logFunc;
    console.log = logFunc;
    console.error = logFunc;
    console.debug = logFunc;
    /*TODO: When it needed.
    It require change in logFunc
    console.assert = logFunc; */
    console.warn = logFunc;
  },

  /**
   * Initialise stack by getting registered devices from
   * websocket server and filtering based on status and
   * details provided
   * @param {string} webSocketServer URL of the websocket server
   * @param {list} uuidList List of device UUIDs of devices under test
   * @param {string} appVersion Application version for validation
   * @param {boolean} isZephyr Zephyr update flag for validation
   * @param {string} buildUser Build user type for validation
   * @returns Promise. Resolve with filtered device list, reject on failure
   */
  async initialiseStack(
    webSocketServer,
    uuidList,
    appVersion,
    isZephyr,
    buildUser
  ) {
    return new Promise((resolve, reject) => {
      let webSocketServerUrl = `${webSocketServer.replace(
        /\/$/,
        ''
      )}/uuid-query`;
      http
        .get(webSocketServerUrl, (res) => {
          let body = '';
          if (res.statusCode !== 200) {
            console.log(
              `TenftjsUtils : initialiseStack : https status code is ${res.statusCode}`
            );
            reject();
          } else {
            res.on('data', (chunk) => {
              body += chunk;
            });
            res.on('end', () => {
              console.log(
                `TenftjsUtils : initialiseStack : https response from server is: ${body}`
              );
              let obj = JSON.parse(body);
              let devices = [];
              for (let i = 0; i < uuidList.length; i++) {
                /** Split if device IP is part of ID */
                let id = uuidList[i].split('#')[0];
                /** Validate the device */
                if (
                  id in obj &&
                  obj[id].status ===
                    0 /** status is 0 when device is free to use */ &&
                  this.isAppVersionCorrect(
                    appVersion,
                    obj[id].appVersion,
                    isZephyr,
                    buildUser
                  )
                ) {
                  devices.push({
                    uuid: id,
                    deviceIP: obj[id].clientIP,
                    appVersion: obj[id].appVersion,
                    server: webSocketServerUrl,
                    isZephyr: isZephyr,
                    buildUser: buildUser,
                  });
                }
              }
              console.log(
                `TenftjsUtils : initialiseStack: devices available ${JSON.stringify(
                  devices
                )}`
              );
              resolve(devices);
            });
          }
        })
        .on('error', (err) => {
          console.log(
            `TenftjsUtils : initialiseStack: error is ${JSON.stringify(err)}`
          );
          reject();
        });
    });
  },
  /**
   * Validate device based on app version and other filters provided
   * @param {string} appVersion Application version for validation
   * @param {string} appVersionFromDriver App version from device driver
   * @param {boolean} isZephyr Zephyr update flag for validation
   * @param {string} buildUser Build user type for validation
   * @returns true if device matched the filter condition, else false
   */
  isAppVersionCorrect(appVersion, appVersionFromDriver, isZephyr, buildUser) {
    let isCorrect = false;
    if (isZephyr === true || appVersion !== 'Not Available') {
      if (appVersionFromDriver && appVersion === appVersionFromDriver) {
        isCorrect = true;
      }
    } else if (appVersion === 'Not Available' || buildUser === 'Local') {
      isCorrect = true;
    }
    if (!isCorrect) {
      console.log(
        `TenftjsUtils : isAppVersionCorrect: Failed - appVersion = ${appVersion}, appVersionFromDriver = ${appVersionFromDriver}, isZephyr = ${isZephyr}, buildUser = ${buildUser}`
      );
    }
    return isCorrect;
  },
};
