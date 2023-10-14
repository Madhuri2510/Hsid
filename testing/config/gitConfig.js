const defaultValues = {
  DISH_EXECUTION_ENV: 'prod',
  PLATFORM: 'android',
  PRODUCT: 'sling',
  DISH_VALIDATE_VIDEO: false,
  JIRA_REPORT_BUG: false,
  DISH_SKIP_ON_OPEN_ISSUES: true,
  TEST_COVERAGE: 'Regression',
};

function getGitConfig(key) {
  if (key in process.env) {
    return process.env[key];
  } else {
    return defaultValues[key];
  }
}

function isVideoQuality() {
  return getGitConfig('DISH_VALIDATE_VIDEO').toString() === 'true';
}

function isJiraReportBugEnabled() {
  return getGitConfig('JIRA_REPORT_BUG').toString() === 'true';
}

function isDishSkipOpenIssue() {
  return getGitConfig('DISH_SKIP_ON_OPEN_ISSUES').toString() === 'true';
}

function isComcastPlatform() {
  return getGitConfig('PLATFORM').toString().toLowerCase() === 'comcast2';
}

function isJS10ftPlatform() {
  return (
    getGitConfig('PLATFORM').toString().toLowerCase() === 'comcast2' ||
    getGitConfig('PLATFORM').toString().toLowerCase() === 'xbox1'
  );
}

module.exports = {
  getGitConfig,
  isVideoQuality,
  isJiraReportBugEnabled,
  isDishSkipOpenIssue,
  isComcastPlatform,
  isJS10ftPlatform,
};
