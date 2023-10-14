require('dotenv').config();
let baseCodeceptConfig = require('./base.generic.conf');

// This is temporary fix for the app file path issue, need to create separate properties file
// to pass the desired capabilities to Appium config file
const homeDir = require('os').homedir();
const filePath = homeDir + '/RN_Builds/TenFoot-tvOS.app'; // for future reference
const orientation = process.argv[7].replace(/'/g, '');

exports.config = {
  ...baseCodeceptConfig.config,
  tests: './testcases/*_test.js',
  output: './mochawesome-report',
  helpers: {
    Appium: {
      env: 'davita',
      platform: 'Android',
      device: 'emulator',
      url: 'https://test.watchdishtv.com/#/home/',
      desiredCapabilities: {
        platformName: 'android',
        deviceName: 'emulator-5554', //'192.168.1.5:5555',//'5f3a90c8',43ee26ff,emulator-5554
        orientation: orientation,
        platformVersion: '11',
        automationName: 'UIAutomator2',
        noReset: true,
        browserName: 'Chrome',
        chromedriverExecutable: homeDir + '/chromeDriver/chromedriver.exe',
        chromeOptions: {w3c: false},
      },
    },
    FireTvDpadHelper: {
      require: './helpers/FireTvDpadHelper.js',
    },
    AppiumHelper: {
      require: './helpers/AppiumMobileBrowser.js',
    },
    Mochawesome: {
      require: './helpers/Mochawesome.js',
      uniqueScreenshotNames: true,
      /**
       * Jira options
       * TODO: Should be disabled
       */
      skipOnOpenIssues: false,
      reportBug: false,
      /**
       * QAF report options
       */
      qafReportingEnabled: false,
    },
    REST: {
      endpoint: 'https://p-sportsbook.movetv.com/sportsbook',
      defaultHeaders: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJtYW50aXMiLCJpYXQiOjE2MzIzMDY1MTIsImlzcyI6IkNNVyIsInBsYXQiOiJhbmRyb2lkIiwicHJvZCI6InNsaW5nIiwic3ViIjoiZTdjOTMzYmUtNzFmYS0xMWU5LTk4MzItMGEzZGVmY2Y5M2NlIn0.MSY9DD0Qjzi4nVTeyGtCX_nNU1iPWxjYhNNONOiDv5A',
      },
    },
  },
  include: {
    ...baseCodeceptConfig.config.include,
    constants: './config/constants.js',
    build: './config/buildType/release.js',
    platformName: './config/platform/android.js',
    watchPage: './pages/Mobile/WatchPage/MobileWatchPage.js',
    settingsPage: './pages/Mobile/SettingsPage/MobileSettingsPage.js',
    tvGuidePage: './pages/Mobile/TVGuidePage/MobileTVGuidePage.js',
    playerPage: './pages/Mobile/PlayerPage/MobilePlayerPage.js',
    searchPage: './pages/Mobile/SearchPage/MobileSearchPage.js',
    onDemandPage: './pages/Mobile/OnDemandPage/MobileOnDemandPage.js',
    sportsPage: './pages/Mobile/SportsPage/MobileSportsPage.js',
    env: './config/env.json',
    userType: './config/user.js',
    suiteName: './config/suiteName.json',
  },
  bootstrap: null,
  mocha: {},
  name: 'Onstream',
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
  },
};
