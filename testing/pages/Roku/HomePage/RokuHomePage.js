const assert = require('assert');
const {execSync} = require('child_process');
const rokuIP = require('../../../utils/ConfigUtils').getConfigValues('rokuIP');
const {I, constants} = inject();
const homePageLocators = require('./HomePageLocators.json');
const navbarLocators = require('../NavigationPage/NavbarLocators.json');
const settingsPageLocators = require('../SettingsPage/SettingsPageLocators.json');
const sportsPageLocators = require('../SportsPage/SportsPageLocators.json');
const sportsPage = require('../SportsPage/RokuSportsPage');
const expVal = require('../../../config/expectedValuesRoku.js');
const CMP = require('../../../OnStreamBackend/cmp');
const roku = require('../../../config/platform/roku');
let cmp = new CMP();
const {isRegressionType} = require('../../../utils/ConfigUtils');
const logger = require('../../../utils/LogUtils').getLogger(
  'BaseRokuOnStreamHomePage'
);
const platformName = require('../../../config/platform/roku.js');
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();
const navBar = require('../NavigationPage/RokuNavbarPage.js');
let property = require('../../../config/propertyType/hospitality.js');

let navMenuMap = new Map([
  ['Home', 'pkg:/images/NewNavIcon/home.png'],
  ['TV Guide', 'pkg:/images/NewNavIcon/tvGuide.png'],
  ['Search', 'pkg:/images/NewNavIcon/search.png'],
  ['Settings', 'pkg:/images/NewNavIcon/settings.png'],
]);

module.exports = {
  constants,
  async launchRokuApplication() {
    await I.launchRokuApp();
  },

  async waitForOnStreamHomePageLaunch() {
    await this.launchRokuApplication();
    await I.waitForElementVisible(
      homePageLocators.loadingControls,
      constants.timeWait.loading
    );
    await I.waitForElementDisappear(
      homePageLocators.loadingControls,
      constants.timeWait.loadingMessage
    );

    let isMduVisible = await I.isVisible(homePageLocators.homeViewMDU);
    // To check if the default property is Hospitality or MDU home page.
    let isVisible = isMduVisible
      ? isMduVisible
      : await I.isVisible(homePageLocators.homeViewHospitality);
    assert.ok(isVisible, 'OnStreamHomePage is not Launch');
  },

  async setSmartBoxId() {
    await this.waitForOnStreamHomePageLaunch();
    execSync(
      `curl -d '' http://${rokuIP}:8060/launch/dev?hardcoded_sbxid=` +
      constants.devTools.smartboxID.hospitality
    );
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
  },

  /**
   * Resets application to home page
   */
  async resetToHome() {
    await navBar.navigateToHomePage();
    let isVisible = await I.isVisible(homePageLocators.homeViewHospitality);
    assert.ok(isVisible, 'Watch Tile is not displayed');
  },


  /**
   * Verify the tiles on home page
   */
  async verifyHomePageTiles(navigationTiles) {
    //TODO : since Roku does not implement for On Demand, Search, Recordings
    //       so temporary remove them from expected tabs
    let updateTiles = ['Apps','Netflix','Cast'];
    let homePageTileElements = [];
    let isTileFound = true;
    //Update the updateNavigationTiles[] with valid tiles
    let updatedNavigationTiles = navigationTiles.filter(
      (x) => updateTiles.indexOf(x) === -1
    );
    //Get the tileElements from HomeRail in homePage 
    homePageTileElements = await this.getHomePageTiles(homePageLocators.homePageTiles);
    //At all times 5 tiles should be present in homerail . 
    //So adding TV Guide,Settings are added to match the length to 5.
    let index = updatedNavigationTiles.length;
    if(updatedNavigationTiles.length == constants.maxNoOfHomeTiles-1)
    {
        //If the HomeTiles count is less < 5 , Roku adds TV Guide/Settings ( missing tile is added ) 
        updatedNavigationTiles[index] = constants.tileName.tvGuide;
    }
    else if (updatedNavigationTiles.length == constants.maxNoOfHomeTiles-2)
    {
        //If the HomeTiles count is less < 4 , Roku adds TV Guide,Settings tiles
        updatedNavigationTiles[index] = constants.tileName.tvGuide;
        updatedNavigationTiles[index+1] = constants.tileName.settings;
    }
    //Verify the homepagetiles by validating with tiledata from cmp
    for (i = 0; i < updatedNavigationTiles.length; i++) {
      if( updatedNavigationTiles[i] != homePageTileElements[i])
      {
        isTileFound = false;
        break;
      }
    }
    return isTileFound;
  },

  /**
   *  Get tileElements from homePage
   */
  async getHomePageTiles(elementData) {
    let element = await I.getElements(elementData);
        const homePageTileElements = [];
        for (let i=0 ; i < element.length ;i++)
        {
            homePageTileElements[i]=await I.getText(element[i]);
        }
        return homePageTileElements;
  },

  async verifyHomePageDoesNotExitOnPressingBack() {
    await I.dpadNavByEcp(constants.remoteKey.back);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    return await I.isVisible(homePageLocators.watchTile);
  },

  /**
   * verify the property logo
   */
  async isOnStreamPropertyLogoSeen() {
    return await I.isElementVisible(
      homePageLocators.propertyLogo,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * verify time and date is displayed on home page
   */
  async isTimeAndDateDisplayed() {
    return (
      (await I.isElementVisible(
        homePageLocators.time,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.date,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      ))
    );
  },

  /**
   * verify the welcome banner on home page
   */
  async isWelcomeBannerDisplayed() {
    return (
      (await I.isElementVisible(
        homePageLocators.welcomeMessageTitle,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.welcomeMessageDescription,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      )) &&
      (await I.isElementVisible(
        homePageLocators.welcomeMessageSubtitle,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      ))
    );
  },
  /**
   * verify the home page carousel
   */
  async isHomePageCarouselDisplayed() {
    return await I.isElementVisible(
      homePageLocators.homePageCarousel,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * verify the background image of home page
   */
  async isBackgroundImageDisplayed() {
    return await I.isElementVisible(
      homePageLocators.backgroundImage,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * To verify that widget rail is displayed to user in Home page
   */
  async isHomePageWidgetRailDisplayed() {
    return await I.isElementVisible(
      homePageLocators.homePageWidgetRail,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * To get the number of tiles visible on home page
   */
  async numberOfTilesVisibleOnHomePage() {
    let totalTiles = (await I.getElements(homePageLocators.homePageTiles)).length;
    return totalTiles ;
  },
};
