const execSync = require('child_process').execSync;
const deepLinkURL = require('./DeepLinkURLs');
const channelPageLocators = require('./../iview/ChannelPageLocators.json');
const SettingsLocators = require('./../settings/SettingsScreenLocators.json');
const onDemandLocators = require('./../ondemand/OnDemandScreenLocators.json');
const serachLocators = require('./../search/SearchScreenLocators.json');
const guideLocators = require('./../guide/GuideScreenLocators.json');
const homeLocators = require('./../home/HomeScreenLocators.json');
const iViewLocators = require('./../iview/iViewLocators.json');
const {I, util} = inject();

module.exports = {
  // Executes the Deep Link command
  async deepLinkCommand(cmd) {
    execSync(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({stdout, stderr});
      }
    });
  },

  async openGuidePage() {
    await this.deepLinkCommand(deepLinkURL.guide);
    await I.waitForElement(
      await I.getPlatformID(guideLocators.guideFilterAll),
      15
    );
  },

  async openHomePage() {
    await this.deepLinkCommand(deepLinkURL.home);
    await I.seeElement(
      await I.getPlatformIDFocused(`${homeLocators.spotLightItem}0`)
    );
  },

  async openSearchPage() {
    await this.deepLinkCommand(deepLinkURL.search);
    await I.waitForElement(
      await I.getPlatformID(serachLocators.searchResultFirstTile),
      15
    );
  },

  async openOnDemandPage() {
    await this.deepLinkCommand(deepLinkURL.onDemand);
    await I.waitForElement(await I.getPlatformID(onDemandLocators.all), 15);
  },

  async openSettings() {
    await this.deepLinkCommand(deepLinkURL.settings);
    await I.waitForElement(await I.getPlatformID(SettingsLocators.options), 15);
  },

  async openSettingsAccountPage() {
    await this.deepLinkCommand(deepLinkURL.settingsAccount);
    await I.waitForElement(
      await I.getPlatformIDFocused(SettingsLocators.accountsUsername),
      15
    );
  },

  //Opens the channel page, need to provide channelName:'FXHD'
  async openChannelPage(channelName) {
    let url = `"https://watch.sling.com/1/network/${channelName}"`;
    let channelDeepLink =
      deepLinkURL.baseCommand + ' ' + `${url}` + ' ' + deepLinkURL.profile;
    console.log('Channel Deep Link is ', channelDeepLink);
    await this.deepLinkCommand(channelDeepLink);
    await I.waitForElement(
      await I.getPlatformID(channelPageLocators.channelLogo),
      15
    );
  },

  async openFranchiseAsset(assetID) {
    let url = `"https://watch.sling.com/1/franchise/${assetID}"`;
    let franchiseAssetDeepLink =
      deepLinkURL.baseCommand + ' ' + `${url}` + ' ' + deepLinkURL.profile;
    await this.deepLinkCommand(franchiseAssetDeepLink);
    let tags = [iViewLocators.iView, iViewLocators.iView + '-focused'];
    await util.waitForAnyElement(tags, 10);
  },

  async openMovieAsset(assetID) {
    let url = `"https://watch.sling.com/1/asset/${assetID}"`;
    let fmovieAssetDeepLink =
      deepLinkURL.baseCommand + ' ' + `${url}` + ' ' + deepLinkURL.profile;
    await this.deepLinkCommand(fmovieAssetDeepLink);
    //await I.waitForElement(await I.getPlatformID(iViewLocators.iView), 10);
    let tags = [iViewLocators.iView, iViewLocators.iView + '-focused'];
    await util.waitForAnyElement(tags, 10);
  },
};
