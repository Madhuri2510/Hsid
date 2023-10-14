'use strict';

/**
 * Abstract class for platform specific utility implementation
 */
class PlatformUtils {
  constructor(config) {
    if (this.constructor == PlatformUtils) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   * Provides device configuration
   * @returns Device congiuration
   */
  getDeviceConfig() {}

  /**
   *  Intialize device platform. Return
   *  paramter if any wrapped in object
   * @returns requestPayload
   */
  async devicePlatformInit() {}

  /**
   *  Teardown app in device. Retrun empty object to
   *  make interface compatible with other devices
   * @returns requestPayload
   */
  async startAppTearDown() {}

  /**
   * Capture screenshot from device
   * @param {string} name File name
   * @returns Promise resolve with screenshot file path
   */
  async saveScreenshot(name) {}
}

module.exports = PlatformUtils;
