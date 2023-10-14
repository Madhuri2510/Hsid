/**
 * import base.generic.conf, which contains generic (platform independent)
 * Configurations like page objects, CodeceptJS options etc.
 */
const baseCodeceptConfig = require('./base.generic.conf');
const utils = require('./utils/TenftjsUtils');
const {threadId} = require('worker_threads');

/**
 * Default device configurations.
 * Update parameters for single device test
 * using command 'yarn codecept-run-tenftjs'
 */
const defaultTenFtJsDeviceConfig = {
  uuid: 'Browser:11-06-2021 14:35:57',
  deviceIP: '192.168.2.4',
  server: 'http://192.168.2.4:4000',
  appVersion: 'Not Available',
  isZephyr: false,
  buildUser: 'Local',
};

/**
 * Override console prints
 * Don't remove/change this function call.
 */
utils.setLogging();

exports.config = {
  /**
   * Spread generic configuration
   */
  ...baseCodeceptConfig.config,

  /**
   * Add ten foot js specific configuration
   */
  helpers: {
    Sandstorm: {
      /** Don't change this configuration */ require: './helpers/Sandstorm.js',
      ...utils.getTenFtJsDevice(
        defaultTenFtJsDeviceConfig
      ) /** Don't change or remove this function call */,
    },
    Mochawesome: {
      require: './helpers/Mochawesome.js',
      uniqueScreenshotNames: true,
      /**
       * Jira options
       * TODO: Should be disabled
       * till the integrations is tested
       */
      skipOnOpenIssues: false,
      reportBug: false,
      credentials: 'Y2hpcmFnLmpheXN3YWxAZGlzaC5jb206RGlzaDEyMyM',
      /**
       * QAF report options
       */
      qafReportingEnabled: false,
      esNode: 'http://10.124.247.11:9200',
      project: {name: 'Sling-RN-TFJS'},
      suiteName: 'Testing Automation',
      ...utils.getTenFtJsDevice(
        defaultTenFtJsDeviceConfig
      ) /** Don't change or remove this function call */,
    },
  },
  include: {
    ...baseCodeceptConfig.config.include,
  },
  mocha: {
    reporterOptions: {
      reportDir: 'output',
      enableCode: false,
      reportTitle: 'TenFootJS Automation',
      reportPageTitle: 'TenFootJS Automation',
      reportFilename:
        threadId && threadId > 0 ? `mochawesome_${threadId}` : 'mochawesome',
    },
  },
};
