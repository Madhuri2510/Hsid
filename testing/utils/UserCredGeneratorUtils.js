const config = require('../utils/ConfigUtils');
const {platformName} = inject();
const constants = require('../config/constants');
module.exports = {
  /**
   * Returns a value for the corresponding config file key
   * @param {string} parameter - config file key e.g.- url, version etc.
   * @returns {string} config file value for the corresponding key
   */
  getUserByType(userType = constants.url.davita) {
    let platform = platformName.platform;
    let path = `../resources/${platform}`;
    if (
      platform === constants.platform.browser ||
      platform === constants.platform.android
    ) {
      let env = config.getConfigValues('env');
      path = `${path}/${env}`;
    }
    path = `${path}/user.json`;
    let account = this.getAccount(path, userType);
    return account;
  },

  getAccount(path, userType) {
    let user = null;
    let data = JSON.parse(JSON.stringify(require(path)));
    for (index = 0; index <= data.length; index++) {
      if (userType == data[index]['type']) {
        user = data[index];
        break;
      }
    }
    return user;
  },
};
