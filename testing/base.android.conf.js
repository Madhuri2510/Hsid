let configName;
if (process.profile !== undefined) {
  configName = process.profile.split(':')[1];
}

exports.config = {
  helpers: {
    Detox: {
      platform: 'AndroidTV',
      require: './helpers/Detox.js',
      configuration: configName !== undefined ? configName : 'Android_TV_Cicd',
      reloadReactNative: true,
    },
    DpadNav: {
      require: './helpers/dpadnav_helper.js',
    },
    Mochawesome: {
      uniqueScreenshotNames: true,
      require: './helpers/Mochawesome.js',
    },
  },
};
