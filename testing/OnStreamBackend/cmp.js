const {I, platformName, property} = inject();
const platform = platformName.platform;
const client = require('./AxiosClient');
let api = require('./api');
const assert = require('assert');
const CMP_ENDPOINT = require('./endpoints').CMP;
const constants = require('../config/constants.js');
const MAIN_MENU_OPTIONS_MAP = new Map([
  ['showHome', 'Home'],
  ['showOnDemand', 'On Demand'],
  ['showRecordings', 'Recordings'],
  ['showSearch', 'Search'],
  ['showSettings', 'Settings'],
  ['showTvGuide', 'TV Guide'],
  ['showCast', 'Cast'],
]);
const logger = require('../utils/LogUtils').getLogger('CMP');
const {build} = inject();
const EPG = require('../OnStreamBackend/epg');
let epg = new EPG();
const Cosmos = require('../OnStreamBackend/cosmos');
const {
  closeInfoScreen,
} = require('../pages/Browser/TVGuidePage/BrowserTVGuidePage');
let cosmos = new Cosmos();

class CMP {
  static cachedSmartboxId = null;
  static cachedPropertyId = null;
  static cachedPropertyConfig = null;
  static cachedPageTemplate = null;
  static cachedPropertyPageTemplate = null;

  constructor() {
    if (build.buildType === 'debug') {
      api = require('./apiQaEnv');
    }
  }
  /* Fetches smartbox ID*/
  async getSmartBoxId() {
    // if (this.cachedSmartboxId != null || this.cachedSmartboxId != undefined) {
    //   return this.cachedSmartboxId;
    // }
    // const smartBoxId = await client.get(`${api.smartbox.id}`);
    // logger.info('SmartBox ID: ' + smartBoxId.data.SMARTBOXIdentifier);
    // this.cachedSmartboxId = smartBoxId.data.SMARTBOXIdentifier;
    // return smartBoxId.data.SMARTBOXIdentifier;
    if (property.propertyType === constants.propertyType.hospitality) {
      return constants.devTools.smartboxID.hospitality;
    } else {
      return constants.devTools.smartboxID.mdu;
    }
  }

  /* Fetch Property ID linked to Smartbox ID */
  async getPropertyId() {
    if (this.cachedPropertyId != null) {
      return this.cachedPropertyId;
    }
    let SMARTBOXID = await this.getSmartBoxId();
    const response = await client.get(
      `${api.cmp.host}${CMP_ENDPOINT.SMARTBOX_ID}${SMARTBOXID}`
    );
    assert.ok(response.data.code === 200, 'API request was not successful');
    const responseBody = response.data.response_body;
    const propertyId = responseBody.id;
    this.cachedPropertyId = propertyId;
    logger.info('Property ID: ' + propertyId);
    return propertyId;
  }

  /* Get Property Config data using Property ID and platform*/
  async getPropertyConfig() {
    if (this.cachedPropertyConfig != null) {
      return this.cachedPropertyConfig;
    }
    const PROPERTY_ID = await this.getPropertyId();
    let PLATFORM = platform;
    const response = await client.get(
      `${api.cmp.host}/v2${CMP_ENDPOINT.PROPERTY}${PROPERTY_ID}${CMP_ENDPOINT.CONFIG}${PLATFORM}`
    );
    this.cachedPropertyConfig = response.data;
    assert.ok(response.data.code === 200, 'API request was not successful');
    return response.data;
  }

  /* Get specific Page element ID from Property Config data */
  async getPageElementId(page) {
    const responseData = await this.getPropertyConfig();
    const pageName = page;
    const PageElementId = responseData.response_body[pageName].pageElement;
    logger.info(`${pageName} ID : ` + PageElementId);
    return PageElementId;
  }

  /* Get specific page template using specific Page Element ID*/
  async getPageTemplate(page) {
    if (this.cachedPageTemplate != null) {
      return this.cachedPageTemplate;
    }
    const PAGE_ELEMENT_ID = await this.getPageElementId(page);
    const response = await client.get(
      `${api.cmp.host}${CMP_ENDPOINT.HOME_PAGE_TEMPLATE}${PAGE_ELEMENT_ID}`
    );
    this.cachedPageTemplate = response.data.response_body;
    assert.ok(response.data.code === 200, 'API request was not successful');
    return response.data.response_body;
  }

  /* Get count of total Swimlanes on Home Page  */
  async getSwimlanesCount(page) {
    let swimlanes = await this.getSwimlanes(page);
    return swimlanes.length;
  }

  /* Get Swimlane names on Home Page  */
  async getSwimlaneNames(page) {
    let swimlanes = await this.getSwimlanes(page);
    let swimlaneNames = [];
    let swimlaneTileCount = 0;
    //This condition is to remove non-compatible swimlanes in Roku
    if (platformName.platform == constants.platform.roku) {
      let rokuSwimlane = [];
      for (let lane = 0; lane < swimlanes.length; lane++) {
        swimlaneTileCount = await this.getApplicablewidgetsforRoku(
          swimlanes[lane]
        );
        if (swimlaneTileCount > 0) {
          rokuSwimlane.push(swimlanes[lane]);
        }
      }
      swimlanes = rokuSwimlane;
    }
    swimlanes.forEach((swimlane) => {
      swimlaneNames.push(swimlane.title);
    });
    logger.info(swimlaneNames);
    return swimlaneNames;
  }

  /* Get Swimlane Tiles Count for any Swimlane on Home Page  */
  async getSwimlaneTilesCount(swimlaneName, page) {
    let totalSwimlanes = await this.getSwimlanesCount(page);
    let swimlaneNames = await this.getSwimlaneNames(page);
    let swimlanes = await this.getSwimlanes(page);
    let swimlaneTileCount = 0;
    for (let lane = 0; lane < totalSwimlanes; lane++) {
      if (swimlaneName === swimlaneNames[lane]) {
        if (platformName.platform == constants.platform.roku) {
          swimlaneTileCount = await this.getApplicablewidgetsforRoku(
            swimlanes[lane]
          );
          return swimlaneTileCount;
        }
        return swimlanes[lane].widgetContents.length;
      }
    }
  }

  /* Get swimlane widgets count (Only compatible widgets for Roku) */
  async getApplicablewidgetsforRoku(swimlanes) {
    let swimlaneTileCount = 0;
    for (
      let widgetIndex = 0;
      widgetIndex < swimlanes.widgetContents.length;
      widgetIndex++
    ) {
      if (swimlanes._meta.typeAlias == constants.widgets.largeWidget) {
        if (
          swimlanes.widgetContents[widgetIndex]._meta.typeAlias !=
          constants.notSupportedWidgetOnRoku.widgetDeepLink
        ) {
          swimlaneTileCount++;
        }
      } else if (swimlanes._meta.typeAlias == constants.widgets.smallWidget) {
        if (
          swimlanes.widgetContents[widgetIndex]._meta.typeAlias !=
            constants.notSupportedWidgetOnRoku.widgetDeepLink &&
          swimlanes.widgetContents[widgetIndex]._meta.typeAlias !=
            constants.notSupportedWidgetOnRoku.widgetMoreInfo &&
          swimlanes.widgetContents[widgetIndex]._meta.typeAlias !=
            constants.notSupportedWidgetOnRoku.widgetLiveChannel
        ) {
          swimlaneTileCount++;
        }
      }
    }
    return swimlaneTileCount;
  }

  /* OnStream 3.0 : Get Swimlane Tile names for Home Page  */
  async getHomePageTileNames() {
    let tileNames = [];
    let swimlanes = await this.getSwimlanes(constants.pages.homePage);
    for (let tile = 0; tile < swimlanes[0].widgetContents.length; tile++) {
      tileNames.push(swimlanes[0].widgetContents[tile].title);
    }
    return tileNames;
  }

  /* Get main menu options / tabs */
  async getMainMenuOptions() {
    let mainMenuOptions = [];
    const responseData = await this.getPropertyConfig();
    var options = responseData.response_body.mainMenuOptions;
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        var val = options[key];
        if (val) {
          mainMenuOptions.push(key);
        }
      }
    }
    logger.info(mainMenuOptions);
    return mainMenuOptions;
  }

  async getMainMenuOptionsAsDisplayed() {
    let mainMenuOptions = await this.getMainMenuOptions();
    let displayedOptions = [];
    for (let option of mainMenuOptions) {
      if (MAIN_MENU_OPTIONS_MAP.has(option)) {
        displayedOptions.push(MAIN_MENU_OPTIONS_MAP.get(option));
      } else {
        logger.info(
          `[getMainMenuOptionsAsDisplayed] ${option} is not available in defined items, please double check!`
        );
      }
    }
    return displayedOptions;
  }

  /* Get swimlanes from the template and return as an array */
  async getSwimlanes(page) {
    let containers = await this.getContentContainers(page);
    let swimlanes = [];
    containers.forEach((container) => {
      if (container._meta.typeAlias.includes(constants.swimlane)) {
        swimlanes.push(container);
      }
    });
    return swimlanes;
  }

  /*
    Returns hero carousel widgets
   */
  async getCarousels(page, carouselType = constants.carousel) {
    let containers = await this.getContentContainers(page);
    let carousels = [];
    containers.forEach((container) => {
      if (container._meta.typeAlias === carouselType) {
        carousels.push(container.widgetContents);
      }
    });
    return carousels;
  }

  /*
  Fetches all widget types on Home Page
  */
  async fetchAllWidgetTypes(page) {
    let containers = await this.getContentContainers(page);
    let widgetTypes = [];
    containers.forEach((container) => {
      let widgets = container.widgetContents;
      widgets.forEach((widget) => {
        widgetTypes.push(widget._meta.typeAlias);
      });
    });
    return widgetTypes;
  }

  /*
  Verify if a specific widget type is available
  */
  async isWidgetAvailable(widgetType, page) {
    let isWidgetAvailable = false;
    let availableWidgetTypes = await this.fetchAllWidgetTypes(page);
    switch (widgetType) {
      case constants.widgetType.sports:
        if (availableWidgetTypes.includes(constants.widgetType.sports)) {
          isWidgetAvailable = true;
          logger.info('Sports widget is available');
        }
        break;
      case constants.widgetType.weather:
        if (availableWidgetTypes.includes(constants.widgetType.weather)) {
          isWidgetAvailable = true;
          logger.info('Weather widget is available');
        }
        break;
      case constants.widgetType.live:
        if (availableWidgetTypes.includes(constants.widgetType.live)) {
          isWidgetAvailable = true;
          logger.info('Live channel widget is available');
        }
        break;
      case constants.widgetType.moreInfo:
        if (availableWidgetTypes.includes(constants.widgetType.moreInfo)) {
          isWidgetAvailable = true;
          logger.info('More Info widget is available');
        }
        break;
      case constants.widgetType.staticAd:
        if (availableWidgetTypes.includes(constants.widgetType.staticAd)) {
          isWidgetAvailable = true;
          logger.info('Static Ad widget is available');
        }
        break;
      case constants.widgetType.notification:
        if (availableWidgetTypes.includes(constants.widgetType.notification)) {
          isWidgetAvailable = true;
          logger.info('Notification widget is available');
        }
        break;
      default:
        logger.warn('Enter valid widget type');
        break;
    }
    return isWidgetAvailable;
  }

  /* Returns all the containers in home page. ex: swimlanes and herocarousels */
  async getContentContainers(page) {
    let template = await this.getPageTemplate(page);
    let containers = template.contentContainers;
    return containers;
  }

  async getWidgetPosition(widgetType, page) {
    let containers = await this.getContentContainers(page);
    let position = {swimlaneIndex: 0, widgetIndex: -1};
    for (let laneIndex = 0; laneIndex < containers.length; laneIndex++) {
      let widgetContents = containers[laneIndex].widgetContents;
      for (
        let widgetIndex = 0;
        widgetIndex < widgetContents.length && position.widgetIndex === -1;
        widgetIndex++
      ) {
        if (widgetContents[widgetIndex]._meta.typeAlias === widgetType) {
          position.swimlaneIndex = laneIndex;
          position.widgetIndex = widgetIndex;
        }
      }
    }
    return position;
  }

  async getWidgetPositionInContainer(widgetType, page, container) {
    let containers = await this.getContentContainers(page);
    let position = {swimlaneIndex: 0, widgetIndex: -1};
    outer: for (let laneIndex = 0; laneIndex < containers.length; laneIndex++) {
      if (containers[laneIndex].title !== container) {
        continue;
      }
      let widgetContents = containers[laneIndex].widgetContents;
      for (
        let widgetIndex = 0;
        widgetIndex < widgetContents.length && position.widgetIndex === -1;
        widgetIndex++
      ) {
        if (widgetContents[widgetIndex]._meta.typeAlias === widgetType) {
          position.swimlaneIndex = laneIndex;
          position.widgetIndex = widgetIndex;
          break outer;
        }
      }
    }
    return position;
  }

  /* Returns number of hero carousels in CMP */
  async getHeroCarouselCount(page) {
    let heroCarousels = await this.getCarousels(page);
    return heroCarousels.length;
  }

  async getPrimaryColor() {
    const responseData = await this.getPropertyConfig();
    const primaryColor = responseData.response_body.theme.primary;
    logger.info('Primary color : ' + primaryColor);
    return primaryColor;
  }

  async getIndexOfSwimlaneAndWidgetForSpecificWidget(
    widget,
    widgetTypeOfSwimlane,
    page
  ) {
    let indexOfSwimlaneName = -1;
    let indexOfWidget = -1;
    let containers = await this.getContentContainers(page);
    outer:
    for (let i = 0; i < containers.length; i++) {
      if (containers[i]._meta.typeAlias === widget) {
        indexOfSwimlaneName = i;
        let widgets = containers[i].widgetContents;
        //This condition is to remove non-compatible widgets in swimlanes
        if (
          platformName.platform == constants.platform.roku &&
          widget != constants.widgets.carousel
        ) {
          widgets = await this.getRokuWidgets(widgets, widget);
        }
        for (let count = 0; count < widgets.length; count++) {
          if (widgets[count]._meta.typeAlias === widgetTypeOfSwimlane) {
            indexOfWidget = count;
            break outer;
          }
        }
      }
    }
    return {indexOfSwimlaneName, indexOfWidget};
  }

  //Updating the widgetslist with only compatible widgets in Roku
  async getRokuWidgets(allWidgets, widget) {
    let rokuWidgets = [],
      j = 0;
    for (let i = 0; i < allWidgets.length; i++) {
      if (widget == constants.widgets.smallWidget) {
        if (
          allWidgets[i]._meta.typeAlias !=
            constants.notSupportedWidgetOnRoku.widgetDeepLink &&
          allWidgets[i]._meta.typeAlias !=
            constants.notSupportedWidgetOnRoku.widgetMoreInfo
        ) {
          rokuWidgets[j] = allWidgets[i];
          j++;
        }
      } else if (widget == constants.widgets.largeWidget) {
        if (
          allWidgets[i]._meta.typeAlias !=
          constants.notSupportedWidgetOnRoku.widgetDeepLink
        ) {
          rokuWidgets[j] = allWidgets[i];
          j++;
        }
      }
    }
    return rokuWidgets;
  }

  async getIndexOfSwimlaneAndWidgetForLiveChannelWidget(
    widget,
    widgetTypeOfSwimlane,
    page
  ) {
    let indexOfSwimlaneName = -1;
    let indexOfWidget = -1;
    let containers = await this.getContentContainers(page);
    for (let i = 0; i < containers.length; i++) {
      if (containers[i]._meta.typeAlias === widget) {
        let widgets = containers[i].widgetContents;
        for (let count = 0; count < widgets.length; count++) {
          if (widgets[count]._meta.typeAlias === widgetTypeOfSwimlane) {
            indexOfSwimlaneName = i;
            indexOfWidget = count;
          }
        }
      }
    }
    return {indexOfSwimlaneName, indexOfWidget};
  }

  async getNotificationWIdgetData(widgetTypeOfSwimlane, page) {
    let containers = await this.getContentContainers(page);
    let headline,
      bodyText = null;
    outer: for (let i = 0; i < containers.length; i++) {
      if (containers[i]._meta.typeAlias === widgetTypeOfSwimlane) {
        let widgets = containers[i].widgetContents;
        for (let count = 0; count < widgets.length; count++) {
          if (
            widgets[count]._meta.typeAlias === constants.widgetType.notification
          ) {
            headline = widgets[count].headline;
            bodyText = widgets[count].bodyText;
            break outer;
          }
        }
      }
    }
    return {headline, bodyText};
  }

  async getNotificationWIdgetDataForSpecificSwimlane(
    widget,
    swimlaneTitle,
    page
  ) {
    let containers = await this.getContentContainers(page);
    let headline,
      bodyText = null;
    outer: for (let i = 0; i < containers.length; i++) {
      if (
        containers[i]._meta.typeAlias === widget &&
        containers[i].title === swimlaneTitle
      ) {
        let widgets = containers[i].widgetContents;
        for (let count = 0; count < widgets.length; count++) {
          if (
            widgets[count]._meta.typeAlias === constants.widgetType.notification
          ) {
            headline = widgets[count].headline;
            bodyText = widgets[count].bodyText;
            break outer;
          }
        }
        break;
      }
    }
    return {headline, bodyText};
  }

  async getMoreInfoWIdgetData(widgetTypeOfSwimlane, page) {
    let containers = await this.getContentContainers(page);
    let headline,
      bodyText,
      subHeading = null;
    for (let i = 0; i < containers.length; i++) {
      if (containers[i]._meta.typeAlias === widgetTypeOfSwimlane) {
        let widgets = containers[i].widgetContents;
        for (let count = 0; count < widgets.length; count++) {
          if (
            widgets[count]._meta.typeAlias === constants.widgetType.moreInfo
          ) {
            headline = widgets[count].headline;
            subHeading = widgets[count].subHeading;
            bodyText = widgets[count].bodyText;
            return {headline, subHeading, bodyText};
          }
        }
      }
    }
    return {headline, subHeading, bodyText};
  }

  async getVideoWidgetData(widgetTypeOfSwimlane, page) {
    let containers = await this.getContentContainers(page);
    let headline,
      subHeading,
      bodyText = null;
    for (let i = 0; i < containers.length; i++) {
      if (containers[i]._meta.typeAlias === widgetTypeOfSwimlane) {
        let widgets = containers[i].widgetContents;
        for (let count = 0; count < widgets.length; count++) {
          if (widgets[count]._meta.typeAlias === constants.widgetType.video) {
            headline = widgets[count].headline;
            subHeading = widgets[count].subHeading;
            bodyText = widgets[count].bodyText;
            return {headline, subHeading, bodyText};
          }
        }
      }
    }
    return {headline, subHeading, bodyText};
  }

  async getVideoWidgetData(widgetTypeOfSwimlane, page) {
    let containers = await this.getContentContainers(page);
    let headline,
      subHeading = null;
    for (let i = 0; i < containers.length; i++) {
      if (containers[i]._meta.typeAlias === widgetTypeOfSwimlane) {
        let widgets = containers[i].widgetContents;
        for (let count = 0; count < widgets.length; count++) {
          if (widgets[count]._meta.typeAlias === constants.widgetType.video) {
            headline = widgets[count].headline;
            subHeading = widgets[count].subHeading;
            return {headline, subHeading};
          }
        }
      }
    }
    return {headline, subHeading};
  }

  async getLiveChannelWidgetData(widgetTypeOfSwimlane, page) {
    let containers = await this.getContentContainers(page);
    let headline,
      subHeading = null;
    let channelID = null;
    outer: for (let i = 0; i < containers.length; i++) {
      if (containers[i]._meta.typeAlias === widgetTypeOfSwimlane) {
        let widgets = containers[i].widgetContents;
        for (let count = 0; count < widgets.length; count++) {
          if (widgets[count]._meta.typeAlias === constants.widgetType.live) {
            channelID = widgets[count].channelId;
            break outer;
          }
        }
      }
    }
    let allChannelIDs = await epg.getAllChannelIds();
    let programIndex = allChannelIDs.indexOf(channelID);
    let currentLiveChanelProgramDataByChannelNumber =
      await cosmos.getCurrentProgramData(programIndex + 1);
    if (currentLiveChanelProgramDataByChannelNumber !== null) {
      headline = currentLiveChanelProgramDataByChannelNumber.programTitle;
      subHeading =
        currentLiveChanelProgramDataByChannelNumber.programData.description;
    }
    return {headline, subHeading};
  }

  async isPropertyLogoConfigured() {
    let propertyConfig = await this.getPropertyConfig();
    let isPropertyLogoConfigured = false;
    if (
      propertyConfig.response_body.assets.logo !== null &&
      propertyConfig.response_body.assets.logo !== ''
    ) {
      isPropertyLogoConfigured = true;
    }
    return isPropertyLogoConfigured;
  }

  async isWelcomeBannerConfigured() {
    let homePageTemplate = await this.getPageTemplate(constants.pages.homePage);
    let isWelcomeBannerConfigured = false;
    if (
      homePageTemplate.welcomeMessages_1.message !== null &&
      homePageTemplate.welcomeMessages_1.message !== '' &&
      homePageTemplate.welcomeMessages_1.greeting !== null &&
      homePageTemplate.welcomeMessages_1.greeting !== '' &&
      homePageTemplate.welcomeMessages_1.subHeadline !== null &&
      homePageTemplate.welcomeMessages_1.subHeadline !== ''
    ) {
      isWelcomeBannerConfigured = true;
    }
    return isWelcomeBannerConfigured;
  }

  async getTextFromPageElements(page, elementType, ...elementData) {
    let elementTextArr = [];
    let pageTemplate = await this.getPageTemplate(page);
    switch (elementType) {
      case 'welcomeBanner':
        for (const ele of elementData) {
          elementTextArr.push(pageTemplate.welcomeMessages_1[ele]);
        }
        return elementTextArr;
      case 'carouselRibbon':
        // code block
        break;
      default:
        logger.info("Couldn't fetch text for page element!!!");
        return elementTextArr;
    }
  }
  async getWelcomeMessage(page) {
    let template = await this.getPageTemplate(page);
    let welcomeMsg = template.welcomeMessages_1;
    console.log('Welcome: ', welcomeMsg);
    return welcomeMsg;
  }

  async isPageEnabled(page) {
    let propertyConfig = await this.getPropertyConfig();
    let response = propertyConfig.response_body;
    if (response[page].isPageEnabled === true) {
      return true;
    }
    return false;
  }

  async getNavBarOrder() {
    let navBarItems = [];
    if (await this.isPageEnabled(constants.pages.watchPage)) {
      navBarItems.push(constants.navigationMenu.search);
    }
    if (await this.isPageEnabled(constants.pages.homePage)) {
      navBarItems.push(constants.navigationMenu.home);
    }
    if (await this.isPageEnabled(constants.pages.watchPage)) {
      navBarItems.push(constants.navigationMenu.watch);
    }
    if (await this.isPageEnabled(constants.pages.watchPage)) {
      navBarItems.push(constants.navigationMenu.tvGuide);
    }
    if (await this.isPageEnabled(constants.pages.watchPage)) {
      navBarItems.push(constants.navigationMenu.onDemand);
    }
    if (
      !(platform === constants.platform.roku) &&
      !(platform === constants.platform.browser)
    ) {
      if (await this.isPageEnabled(constants.pages.appsPage)) {
        navBarItems.push(constants.navigationMenu.apps);
      }
    }
    if (await this.isPageEnabled(constants.pages.mediaCastingPage)) {
      navBarItems.push(constants.navigationMenu.cast);
    }
    if (!(platform === constants.platform.browser)) {
      if (await this.isPageEnabled(constants.pages.myStayPage)) {
        navBarItems.push(constants.navigationMenu.myStay);
      }
    }
    if (await this.isPageEnabled(constants.pages.settingsPage)) {
      navBarItems.push(constants.navigationMenu.settings);
    }
    if (await this.isPageEnabled(constants.pages.hotelInfoPage)) {
      navBarItems.push(constants.navigationMenu.hotelInfo);
    }
    console.log('Nav Items : ', navBarItems);
    return navBarItems;
  }

  async getIndexOfSwimlaneAndWidgetForSpecificSwimlaneWidget(
    widget,
    widgetTypeOfSwimlane,
    swimlaneTitle,
    page
  ) {
    let indexOfSwimlaneName = -1;
    let indexOfWidget = -1;
    let containers = await this.getContentContainers(page);
    for (let i = 0; i < containers.length; i++) {
      if (
        containers[i]._meta.typeAlias === widget &&
        containers[i].title === swimlaneTitle
      ) {
        let widgets = containers[i].widgetContents;
        for (let count = 0; count < widgets.length; count++) {
          if (widgets[count]._meta.typeAlias === widgetTypeOfSwimlane) {
            indexOfSwimlaneName = i;
            indexOfWidget = count;
          }
        }
      }
    }
    return {indexOfSwimlaneName, indexOfWidget};
  }
}
module.exports = CMP;
