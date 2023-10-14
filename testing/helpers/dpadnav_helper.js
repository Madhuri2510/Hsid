const Helper = require('@codeceptjs/helper');
const detox = require('detox');
var i;
class DpadNav extends Helper {
  // before/after hooks
  /**
   * @protected
   */
  _before() {
    // remove if not used
    this.device = detox.device;
  }

  /**
   * @protected
   */
  _after() {
    // remove if not used
  }

  // add custom methods here
  // If you need to access other helpers
  // use: this.helpers['helperName']
  async dpadLeft(iterations = 1) {
    let keycode = keyconfig.config.LEFT_BUTTON;
    for (i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
    }
  }

  async dpadRight(iterations = 1) {
    let keycode = keyconfig.config.RIGHT_BUTTON;
    for (i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
    }
  }

  async dpadUp(iterations = 1) {
    let keycode = keyconfig.config.UP_BUTTON;
    for (i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
    }
  }

  async ok(iterations = 1) {
    let keycode = keyconfig.config.OK_BUTTON;
    for (i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
    }
  }

  async dpadDown(iterations = 1) {
    let keycode = keyconfig.config.DOWN_BUTTON;
    for (i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
    }
  }

  async pressEnter() {
    let keycode = keyconfig.config.KEYPAD_ENTER;
    await this.pressKey(keycode);
  }

  async pressBack(iterations = 1) {
    let keycode = keyconfig.config.BACK_BUTTON;
    for (i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
    }
  }

  async pressMenuButton() {
    const keycode = keyconfig.config.MENU_BUTTON;
    await this.pressKey(keycode);
  }

  async pressHomeButton() {
    const keycode = keyconfig.config.HOME_BUTTON;
    await this.pressKey(keycode);
  }

  async pressKey(keycode) {
    await this.device.getUiDevice().pressKeyCode(keycode);
  }

  async fastForward(iterations = 1) {
    console.log(iterations);
    let KeyEventResult;
    let keycode = keyconfig.config.FAST_FORWARD;
    for (i = 0; i < iterations; i++) {
      KeyEventResult = await this.device.getUiDevice().pressKeyCode(keycode);
      if (i !== iterations - 1) {
        continue;
      } else if (KeyEventResult !== undefined && i == iterations - 1) {
        return KeyEventResult;
      }
    }
  }

  async rewind(iterations = 1) {
    let KeyEventResult;
    let keycode = keyconfig.config.REWIND;
    for (i = 0; i < iterations; i++) {
      KeyEventResult = await this.device.getUiDevice().pressKeyCode(keycode);
      if (i !== iterations - 1) {
        continue;
      } else if (KeyEventResult !== undefined && i == iterations - 1) {
        return KeyEventResult;
      }
    }
  }

  async playPause(iterations = 1) {
    let keycode = keyconfig.config.PLAY_PAUSE;
    for (i = 0; i < iterations; i++) {
      await this.pressKey(keycode);
    }
  }

  async performDpadActions(iterations, keycode) {
    for (i = 0; i < iterations; i++) {
      await this.device.getUiDevice().pressKeyCode(keycode);
    }
  }
}

module.exports = DpadNav;
