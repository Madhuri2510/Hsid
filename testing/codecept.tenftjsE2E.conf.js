/**
 * import base.generic.conf, which contains generic (platform independent)
 * Configurations like page objects, CodeceptJS options etc.
 */
const {
  getGitConfig,
  isJiraReportBugEnabled,
  isDishSkipOpenIssue,
} = require('./config/gitConfig');
const environment = getGitConfig('DISH_EXECUTION_ENV').toLowerCase();
const utils = require('./utils/TenftjsUtils');
const {threadId} = require('worker_threads');
const testCoverage = getGitConfig('TEST_COVERAGE');
const SkipOnIssues = isDishSkipOpenIssue();
const reportBugEnabled = isJiraReportBugEnabled();

/**
 * Default device configurations.
 * Update parameters for single device test
 * using command 'yarn codecept-run-tenftjs'
 */
const defaultTenFtJsDeviceConfig = {
  uuid: 'XBOX:11209191-a334-9025-a138-0751329811d1',
  deviceIP: '192.168.2.62',
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
  //...baseCodeceptConfig.config,
  tests: './testcases/e2e/**/*_test.js',
  output: './output',
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
      skipOnOpenIssues: SkipOnIssues,
      reportBug: reportBugEnabled,
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
    LoginHelper: {
      require: './helpers/JSLoginHelper.js',
      env: 'dev_jsclient_' + environment,
    },
  },
  include: {
    I: './steps_file.js',
    signInScreen: './pages/SignIn/SignInScreen.js',
    createAccountScreen:
      './pages/CreateAccount/AndroidBaseCreateAccountScreen.js',
    f2pPages: './pages/FreeToPayPageFlows/f2pPages.js',
    landingPage: './pages/LandingPage/landingPage.js',
    homeScreenPage: './pages/home/E2EHomeScreen.js',
    searchPage: './pages/search/E2ESearchPage.js',
    iviewPage: './pages/iview/E2EiViewScreen.js',
    channelPage: './pages/iview/E2EChannelPage.js',
    dvrManagePage: './pages/dvr/BaseDVRManagePage.js',
    dvrPage: './pages/dvr/E2EDVRPage.js',
    guidePage: './pages/guide/E2EGuidePage.js',
    playerPage: './pages/player/BaseVideoPlayer.js',
    onDemandPage: './pages/ondemand/E2EOnDemandPage.js',
    settingsPage: './pages/settings/E2ESettingsPage.js',
    mainMenu: './pages/mainmenu/JSMainMenuPage.js',
    env: './config/env.json',
    userType: './config/user.js',
    util: './pages/CommonUtil/Util.js',
    api: './config/api.js',
    platformName: './config/platform/tenftjs.js',
    athenaUtil: './pages/CommonUtil/backend/AthenaUtil.js',
    ribbon: './pages/ribbon/JSRibbon.js',
  },
  mocha: {
    reporterOptions: {
      reportDir: 'output',
      enableCode: false,
      reportTitle: 'TenFootJS E2E - ' + testCoverage,
      reportPageTitle: 'TenFootJS Automation',
      reportFilename:
        threadId && threadId > 0 ? `mochawesome_${threadId}` : 'mochawesome',
    },
  },
  teardown: './codeceptSupport/teardown.js',
};
