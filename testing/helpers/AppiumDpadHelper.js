/* eslint-disable no-undef */
const Helper = codeceptjs.Helper;
var i;

class AppiumDapdHelper extends Helper {
  constructor(config) {
    super(config);
    console.log('Intializing AppiumDapdHelper');
  }
  async dpadUp(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Up');
    }
  }
  async dpadDown(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Down');
    }
  }
  async dpadLeft(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Left');
    }
  }
  async dpadRight(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Right');
    }
  }
  async pressBack(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Menu');
    }
  }

  async ok(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Select');
    }
  }

  async pressEnter(iterations = 1) {
    await this.ok(iterations);
  }

  async _keyEvent(direction) {
    const {Appium} = this.helpers;
    await Appium.browser.execute('mobile: pressButton', {name: direction});
  }

  async playPause(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('playpause');
    }
  }
  /**
   *
   * By pressing right edge of the Apple TV remote, It will forward video by 30 sec
   */
  async fastForward(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Right');
    }
  }
  /**
   *
   * By pressing left edge of the Apple TV remote, It will rewind video by 10 sec
   */
  async rewind(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Left');
    }
  }

  async pressHomeButton(iterations = 1) {
    for (i = 0; i < iterations; i++) {
      await this._keyEvent('Home');
    }
  }
}

module.exports = AppiumDapdHelper;
