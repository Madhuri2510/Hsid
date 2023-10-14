const {getGitConfig} = require('../../config/gitConfig');

let deviceName;
console.log(`Profile: ${getGitConfig('profile')}`);
if (getGitConfig('profile') !== undefined) {
  deviceName = getGitConfig('profile').split(':')[0];
}
let deepLinkBaseCommand = 'adb shell am start -a android.intent.action.VIEW -d';
if (deviceName !== undefined) {
  deepLinkBaseCommand = `adb -s ${deviceName} shell am start -a android.intent.action.VIEW -d`;
}
module.exports = {
  home: `${deepLinkBaseCommand} "https://watch.sling.com/1/category/guide" com.sling`,
  //'adb shell am start -a android.intent.action.VIEW -d "https://watch.sling.com/1/category/home" com.sling',
  guide: `${deepLinkBaseCommand} "https://watch.sling.com/1/category/guide" com.sling`,
  dvr: `${deepLinkBaseCommand} "https://watch.sling.com/1/category/dvr" com.sling`,
  onDemand: `${deepLinkBaseCommand} "https://watch.sling.com/1/category/ondemand" com.sling`,
  search: `${deepLinkBaseCommand} "https://watch.sling.com/1/category/search" com.sling`,
  settings: `${deepLinkBaseCommand} "https://watch.sling.com/1/category/settings" com.sling`,
  settingsAccount: `${deepLinkBaseCommand} "https://watch.sling.com/1/category/settings/account" com.sling`,
  profile: 'com.sling',
  baseCommand: deepLinkBaseCommand,
  franchiseIDs: {
    houseHuntersAssetID: 'c7cc05491db648b5ae2acdfe58f53827',
    drPimplePopper: '9089285c5c5b4d92b6579c6693167d90',
    shahsOfSunset: '15bb89ee359f4c4d8a5737434fe51aab',
  },
  moviesIDs: {
    HorribleBosses2: 'face11502bf449f0bb9f7a78b7ace73e',
    iAmNumberFour: 'dc1fd8fcfa94410da884857b4078ca15',
  },
};
