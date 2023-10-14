require('dotenv').config();
const utils = require('./utils/browserUtils');
const baseCodeceptConfig = require('./base.generic.conf');

const defaultBrowserConfig = {
  url: 'https://test.watchdishtv.com',
  browser: 'chrome',
  show: true,
  host: '127.0.0.1',
  port: 4444,
  restart: false,
  keepBrowserState: true,
  keepCookies: true,
};

exports.config = {
  ...baseCodeceptConfig.config,
  tests: './testcases/*_test.js',
  output: './output',
  helpers: {
    WebDriver: {
      env: 'davita',
      require: './helpers/Browser.js',
      /** Don't change this configuration */
      ...utils.getCodeceptOptions(
        defaultBrowserConfig
      ) /** Don't change or remove this function call */,
      /*desiredCapabilities: {
        chromeOptions: {
          args: ["--headless", "--disable-gpu", "--no-sandbox"]
        }
      }*/
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
  },
  include: {
    ...baseCodeceptConfig.config.include,
    property: './config/propertyType/hospitality.js',
    constants: './config/constants.js',
    build: './config/buildType/debug.js',
    platformName: './config/platform/browser.js',
    property: './config/propertyType/hospitality.js',
    hotelInfoPage: './pages/Browser/HotelInfoPage/BrowserHotelInfoPage.js',
    watchPage: './pages/Browser/WatchPage/BrowserWatchPage.js',
    homePage: './pages/Browser/HomePage/BrowserHomePage.js',
    settingsPage: './pages/Browser/SettingsPage/BrowserSettingsPage.js',
    tvGuidePage: './pages/Browser/TVGuidePage/BrowserTVGuidePage.js',
    playerPage: './pages/Browser/PlayerPage/BrowserPlayerPage.js',
    searchPage: './pages/Browser/SearchPage/BrowserSearchPage.js',
    onDemandPage: './pages/Browser/OnDemandPage/BrowserOnDemandPage.js',
    sportsPage: './pages/Browser/SportsPage/BrowserSportsPage.js',
    navBar: './pages/Browser/NavigationPage/NavbarPage.js',
    genreFilterPage: './pages/Browser/GenresPage/BrowserTVGenreFilterPage.js',
    env: './config/env.json',
    userType: './config/user.js',
    suiteName: './config/suiteName.json',
  },
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
    // tryTo: {
    //   enabled: true,
    // },
    screenshotOnFail: {
      enabled: true,
    },
    // wdio: {
    //   enabled: true,
    //   services: ['selenium-standalone'],
    // },
  },
  rerun: {
    // All failed/Skipped scenarios will be rerun until 1st success for the specified 'maxReruns' value
    minSuccess: 1,
    maxReruns: 1,
  },

  multiple: {
    parallel: {
      chunks: (files) => {
        return [
          [files[0], files[2]], // chunk 1
          [files[5], files[7]], //chunk 2
          [files[8], files[11], files[13]], // chunk 3
          [files[14], files[15], files[16]], //chunk 4
        ];
      },
    },
  },
};
