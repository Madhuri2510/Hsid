module.exports = {
  /**
   * Check testing type is regression or not
   * @returns {boolean} isRegression
   */
  isRegressionType() {
    const helper = require('codeceptjs').config.get().helpers;
    //TODO : other platforms need to be double check helper
    let config =
      helper.RokuHelper != undefined ? helper.RokuHelper : helper.AppiumHelper;
    let ret = false;
    if (config.testingType == 'regression') {
      ret = true;
    }
    return ret;
  },

  /**
   * Returns a value for the corresponding config file key
   * @param {string} parameter - config file key e.g.- url, version etc.
   * @returns {string} config file value for the corresponding key
   */
  getConfigValues(parameter) {
    const config = require('codeceptjs').config.get();
    return config.helpers[Object.keys(config.helpers)[0]][parameter];
  },
};
