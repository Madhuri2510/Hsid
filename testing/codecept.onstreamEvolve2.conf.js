let baseCodeceptConfig = require('./base.generic.conf');

// This is temporary fix for the app file path issue, need to create separate properties file
// to pass the desired capabilities to Appium config file
const homeDir = require('os').homedir();
const filePath = homeDir + '/RN_Builds/TenFoot-tvOS.app'; // for future reference

exports.config = {
  ...baseCodeceptConfig.config,
  tests: './testcases/*_test.js',
  output: './mochawesome-report',
  helpers: {
    Appium: {
      platform: 'Android',
      // restart: false,
      desiredCapabilities: {
        // deviceName: 'Android_TV_1080p_API_29',
        //deviceName: 'GEB1TX10115604RP',
        platformVersion: '12',
        //platformVersion: '10',
        automationName: 'UIAutomator2',
        noReset: false,
        // fullReset: false,
        appPackage: 'tv.accedo.xdk.dishtv.debug',
        appActivity: 'tv.accedo.dishonstream2.ui.main.MainActivity',
        newCommandTimeout: '36000',
        // chromedriverExecutable:
        //   '/Volumes/MyData/Tools/ChromeDrivers/chromedriver',
      },
    },
    FireTvDpadHelper: {
      require: './helpers/FireTvDpadHelper.js',
    },
    AppiumHelper: {
      require: './helpers/Appium.js',
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
    property: './config/propertyType/hospitality.js',
    build: './config/buildType/debug.js',
    platformName: './config/platform/evolve2.js',
    navBar: './pages/Android/NavigationPage/AndroidNavBarPage.js',
    watchPage: './pages/Android/WatchPage/AndroidWatchPage.js',
    homePage: './pages/Android/HomePage/AndroidHomePage.js',
    appsPage: './pages/Android/AppsPage/AndroidAppsPage.js',
    hotelInfoPage: './pages/Android/HotelInfoPage/AndroidHotelInfoPage.js',
    myStayPage: './pages/Android/MyStayPage/AndroidMyStayPage.js',
    settingsPage: './pages/Android/SettingsPage/AndroidSettingsPage.js',
    tvGuidePage: './pages/Android/TVGuidePage/AndroidGuidePage.js',
    playerPage: './pages/Android/PlayerPage/AndroidPlayerPage.js',
    searchPage: './pages/Android/SearchPage/AndroidSearchPage.js',
    onDemandPage: './pages/Android/OnDemandPage/AndroidOnDemandPage.js',
    sportsPage: './pages/Android/SportsPage/AndroidSportsPage.js',
    pip: './pages/Android/PIP/AndroidPIP.js',
    genreFilterPage: './pages/Android/GenresPage/AndroidGenreFilterPage.js',
    suiteName: './config/suiteName.json',
  },
  bootstrap: null,
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
