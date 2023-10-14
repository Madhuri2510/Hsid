exports.config = {
  tests: './testcases/*_test.js',
  output: './output',
  include: {
    I: './steps_file.js',
    env: './config/env.json',
    userType: './config/user.js',
    util: './pages/CommonUtil/Util.js',
    platformName: './config/platform/android.js',
  },
  bootstrap: null,
  name: 'testing',
  mocha: {
    reporterOptions: {
      reportDir: 'output',
    },
  },
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
  },
  rerun: {
    // All failed/Skipped scenarios will be rerun until 1st success for the specified 'maxReruns' value
    minSuccess: 1,
    maxReruns: 1,
  },
  teardown: './codeceptSupport/teardown.js',
};
