let baseCodeceptConfig = require('./base.generic.conf');

exports.config = {
  ...baseCodeceptConfig.config,
  tests: './testcases/*_test.js',
  output: './mochawesome-report',
  helpers: {
    RokuHelper: {
      require: './helpers/Roku.js',
      rokuIP: '192.168.43.124',
      user: 'rokudev',
      pass: '1111',
      app: './app/roku/roku-app-dev-3.0.24267.zip',
      testingType: 'smoke',
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
    platformName: './config/platform/roku.js',
    navBar: './pages/Roku/NavigationPage/RokuNavbarPage.js',
    hotelInfoPage: './pages/Roku/HotelInfoPage/RokuHotelInfoPage.js',
    myStayPage: './pages/Roku/MyStayPage/RokuMyStayPage.js',
    homePage: './pages/Roku/HomePage/RokuHomePage.js',
    watchPage: './pages/Roku/WatchPage/RokuWatchPage.js',
    homePage: './pages/Roku/HomePage/RokuHomePage.js',
    settingsPage: './pages/Roku/SettingsPage/RokuSettingsPage.js',
    tvGuidePage: './pages/Roku/TVGuidePage/RokuTVGuidePage.js',
    genreFilterPage: './pages/Roku/GenresPage/RokuGenreFilterPage.js',
    playerPage: './pages/Roku/PlayerPage/RokuPlayerPage.js',
    searchPage: './pages/Roku/SearchPage/RokuSearchPage.js',
    sportsPage: './pages/Roku/SportsPage/RokuSportsPage.js',
    suiteName: './config/suiteName.json',
  },
  bootstrap: null,
  // mocha: {},
  timeout: 100000,
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
