class ReportUtils {
  /**
   * get zepherid for the test. It will first look in opts,
   * if not provided in opts it will try to extract from test name.
   *
   * @param {*} t test object
   */
  static getZepherID(t) {
    if ('ZephyrId' in t.opts) {
      return t.opts.ZephyrId;
    }
    //is it provided in name?
    if (t.title.toLocaleLowerCase().indexOf('zephyrid') > -1) {
      try {
        console.log(
          'ZephyrId id provided in name. Recommanded is to provide ZephyrId in test opts.'
        );
        let testCaseId = t.title.split('-')[0].split(':')[1].trim();
        t.opts.ZephyrId = testCaseId;
      } catch (error) {
        console.log(
          'testcase id provided in wrong format. Expected name staring with ZephyrId:9999999 - '
        );
      }
    }
    return t.opts.ZephyrId;
  }

  /**
   * Set platform and test specif environment details and return
   * @param {object} suite Test suite object
   * @param {object} config Test config object
   * @returns Platform and test execution environment details
   */
  static async setExecutionENV(suite, config) {
    /** tenftjs configuration includes uuid */
    if (config && config.uuid) {
      return ReportUtils.setTenFootJSExecutionENV(suite, config);
    } else {
      return ReportUtils.setDetoxExecutionENV(suite);
    }
  }

  /**
   * Set tenftjs platform and test specif environment details and return
   * @param {object} suite Test suite object
   * @param {object} config Test config object
   * @returns Tenftjs Platform and test execution environment details
   */
  static async setTenFootJSExecutionENV(suite, config) {
    suite.ENV = suite.ENV || {
      platform: 'TenFootJS',
      deviceType: config.uuid.split(':', 1)[0].toLowerCase(),
      deviceId: config.uuid,
      appVersion: config.appVersion,
    };
    return suite.ENV;
  }

  /**
   * Set Detox platform and test specif environment details and return
   * @param {object} suite Test suite object
   * @returns Detox Platform and test execution environment details
   */
  static async setDetoxExecutionENV(suite) {
    const device = require('detox').device;
    suite.ENV = suite.ENV || {
      deviceId: device.id,
      packageName: device._bundleId,
      host: require('os').hostname(),
      buildId: process.env.CI_PIPELINE_ID || process.env.BUILD_NUMBER,
    };
    const [platform] = device._deviceConfig.type.split('.');
    suite.ENV.platform = platform;
    if (device.id && platform === 'android') {
      suite.ENV.deviceId = device.id;
      suite.ENV.android_version = await ReportUtils.getDevicePlatformVersion(
        device
      );
      suite.ENV.appVersion = await ReportUtils.getAppVersion(device);
      (suite.ENV.model = await ReportUtils.getDeviceModle(device)),
        (suite.ENV.modleGroup = await ReportUtils.getDeviceModleGroup(device)),
        (suite.ENV.os = await ReportUtils.getDeviceOS(device));
    }
    return suite.ENV;
  }

  /**
   * Set platform and test specif environment details and return
   * @param {object} test Test object
   * @param {object} config Test config object
   * @returns Platform and test execution environment details
   */
  static async getExecutionENV(test, config) {
    if (test.parent.ENV && 0 < Object.keys(test.parent.ENV).length) {
      return test.parent.ENV;
    }
    return await ReportUtils.setExecutionENV(test.parent, config);
  }
  /**
   *
   * @param {*} t test to add log
   * @param {*} ctx message to log in report
   */
  static addToContext(t, ctx) {
    if (!t.context) {
      t.context = [ctx];
    } else if (Array.isArray(t.context)) {
      // Test has context and context is an array -> push new context
      t.context.push(ctx);
    } else {
      // Test has context and it is not an array -> make it an array, then push new context
      t.context = [t.context];
      t.context.push(ctx);
    }
  }

  static log(ctx) {
    const test = ReportUtils.getTest();
    ReportUtils.addToContext(test, ctx);
  }

  static getTest() {
    const {getCurrentTest} = require('./Mochawesome');
    const {test} = getCurrentTest();
    return test;
  }

  static get START_TIME() {
    if (!process.env.startTime) {
      ReportUtils.START_TIME = 0;
    }
    return Number(process.env.startTime);
  }
  static set START_TIME(stTime_ms) {
    stTime_ms = process.uptime() * 1000;
    process.env.startTime = Date.now() - stTime_ms;
  }

  static getsize(obj) {
    return obj.length || Object.keys(obj).length;
  }

  static async getAppVersion(device) {
    //adb shell dumpsys package my.package | grep versionName
    const stdout = await ReportUtils._shell(
      device,
      `dumpsys package ${device._bundleId} | grep versionName`
    );
    return stdout
      .split('\n')
      .map((s) => s.trim().split('='))
      .reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value,
        }),
        {}
      ).versionName;
  }

  /**
   * get android version
   */
  static async getDevicePlatformVersion(device) {
    return await ReportUtils._shell(device, 'getprop ro.build.version.release');
  }

  /**
   * get os name and version, for example : Fire OS 6.2.7.7 (NS6277/3033)
   */
  static async getDeviceOS(device) {
    return await ReportUtils._shell(device, 'getprop ro.build.version.name');
  }

  /**
   * get Device Modle, for example: AFTMM
   */
  static async getDeviceModle(device) {
    //[ro.product.model]: [AFTMM]
    return await ReportUtils._shell(device, 'getprop ro.product.model');
  }

  /**
   * get Device Modle Group, for example: FIRETVSTICK2018
   */
  static async getDeviceModleGroup(device) {
    //[ro.nrdp.modelgroup]: [FIRETVSTICK2018]
    return await ReportUtils._shell(device, 'getprop ro.nrdp.modelgroup');
  }

  static async _shell(device, cmd) {
    let {id, deviceDriver} = device;
    return await deviceDriver.adb.shell(id || deviceDriver.name, cmd);
  }
}

module.exports = ReportUtils;
