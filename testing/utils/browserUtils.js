const {threadId} = require('worker_threads');

module.exports = {
  scrollOptions: {
    center: {
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    },
  },
  /**
   * Get the webdriver.io driver capabilities for specified browser
   * TODO - Based on browser like chrome, safari, ms edge add default capabilities if require
   * @param {string} browser - browser name
   * @param {string} serverUrl - Selenium server url
   * @returns the capabilities object for webdriver.io based on browser
   */
  getCapabilities(browser, serverUrl) {
    let urlObj = new URL(serverUrl);
    let queryParams = {};
    urlObj.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    return {
      hostname: urlObj.hostname,
      port: urlObj.port ? parseInt(urlObj.port) : undefined,
      path: urlObj.pathname,
      protocol: urlObj.protocol.replace(':', ''),
      queryParams,
    };
  },
  /**
   * Returns device configuration object based on threadId
   * Default device configuration returned for master/single thread mode.
   * Returns device configuration from environment variable in case of workers
   * @returns device configuration object
   */
  getCodeceptOptions(defaultBrowserConfig) {
    if (threadId > 0) {
      let argObj = JSON.parse(process.env.profile);
      let config = {...defaultBrowserConfig};
      config.browser = argObj.devices[threadId - 1];
      Object.assign(
        config,
        this.getCapabilities(config.browser, argObj.server)
      );
      return config;
    } else {
      return defaultBrowserConfig;
    }
  },
};
