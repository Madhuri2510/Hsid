exports.config = {
  tests: './testcases/android/*_test.js',
  output: './output',
  helpers: {
    Detox: {
      platform: 'AndroidTV',
      require: './helpers/Detox.js',
      configuration: 'androidTV',
      reloadReactNative: true,
    },
    DpadNav: {
      require: './helpers/dpadnav_helper.js',
    },
  },
  include: {
    I: './steps_file.js',
  },
  bootstrap: null,
  name: 'testing',
  plugins: {
    allure: {
      enabled: true,
    },
    customLocator: {
      enabled: true,
    },
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
  },
};
