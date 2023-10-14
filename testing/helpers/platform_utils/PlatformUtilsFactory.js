'use strict';
const tenFtJsPlatform = require('../../config/platform/tenftjs');

/**
 * Factory class provides method to
 * create utility class based on platform
 */
class PlatformUtilsFactory {
  static getPlatformUtils(config) {
    let Platform = null;

    switch (config.type) {
      case tenFtJsPlatform.types.XBOX:
        Platform = require('./XboxUtils');
        break;
      case tenFtJsPlatform.types.COMCAST:
        Platform = require('./ComcastUtils');
        break;
      case tenFtJsPlatform.types.SAMSUNG:
        Platform = require('./SamsungUtils');
        break;
      case tenFtJsPlatform.types.LG:
        Platform = require('./LGUtils');
        break;
      case tenFtJsPlatform.types.HOSTED10FT:
        Platform = require('./HostedTenFtUtils');
        break;
    }
    if (Platform) {
      return new Platform(config);
    } else {
      return null;
    }
  }
}

module.exports = PlatformUtilsFactory;
