/* eslint-disable no-undef */
const helper = codecept_helper;
const {config} = require('../config/androidKeycode-config');
var i;

class FireTvDpadHelper extends helper {
  constructor(config) {
    super(config);
    console.log('Intializing FireTvDpadHelper');
  }

  async dpadRight(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.RIGHT_BUTTON);
      await helper.wait(1);
    }
  }

  async dpadLeft(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.LEFT_BUTTON);
      await helper.wait(1);
    }
  }

  async dpadUp(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.UP_BUTTON);
      await helper.wait(1);
    }
  }

  async dpadDown(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.DOWN_BUTTON);
      await helper.wait(1);
    }
  }

  async dpadOK(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.OK_BUTTON);
      await helper.wait(1);
    }
  }

  async dpadBack(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.BACK_BUTTON);
      await helper.wait(1);
    }
  }
  async dpadChannelUp(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.CHANNEL_UP);
      await helper.wait(1);
    }
  }

  async dpadChannelDown(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.CHANNEL_DOWN);
      await helper.wait(1);
    }
  }

  async dpadTVGuide(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.GUIDE_BUTTON);
      await helper.wait(1);
    }
  }

  async dpadPlayPause(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      const helper = this.helpers['Appium'];
      await helper.sendDeviceKeyEvent(config.PLAY_PAUSE);
      await helper.wait(1);
    }
  }
}
module.exports = FireTvDpadHelper;
