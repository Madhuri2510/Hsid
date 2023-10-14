'use strict';
const PlatformUtils = require('./PlatformUtils');
const configurations = require('./config-files/keycode-config').config;

/**
 * Samsung platform specific utility class
 */
class SamsungUtils extends PlatformUtils {
  constructor(config) {
    super(config);
    this.config = config;
  }

  /**
   * Provides device configuration
   * @returns Device configuration
   */
  getDeviceConfig() {
    return configurations[this.config.type];
  }

  /**
   *  Initialise device platform. Return empty object to
   *  make interface compatible with other devices
   * @returns requestPayload
   */
  async devicePlatformInit() {
    //TODO: If any operation required
    return {};
  }

  /**
   * Teardown app in device. Return empty object to
   *  make interface compatible with other devices
   * @returns requestPayload
   */
  async startAppTearDown() {
    //TODO: If any operation required
    return {};
  }

  /**
   * Capture screenshot from device
   * @param {string} name File name
   * @returns Promise resolve with screenshot file path
   */
  async saveScreenshot(name) {
    //TODO: If any operation required
  }
}

module.exports = SamsungUtils;
