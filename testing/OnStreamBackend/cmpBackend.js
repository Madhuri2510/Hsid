const {PROPERTY_ID, cmpUserEmail, cmpUserPwd} = require('../config/cmpConfig');
const {platformName, property} = inject();
let platform = platformName.platform;
const client = require('./AxiosClient');
const {build, I} = inject();
const buildType = () => {
  return build.buildType === 'release' ? './api' : './apiQaEnv';
};
const path = buildType();
const api = require(path);
const CMP_ENDPOINT = require('./endpoints').CMP_BACKEND;
let {
  bearerToken,
  userName,
  getAccessToken,
  getUserName,
} = require('./cognito/cmpCognito');
let constants = require('../config/constants');
const PARAMETERS = {
  propertyId: 'propertyId',
  type: 'type',
};
const pageType = {
  homePage: 'homePage',
  propertyInfoPage: 'propertyInfoPage',
  hotelInfoPage: 'hotelInfoPage',
  watchPage: 'watchPage',
  myStayPage: 'myStayPage',
  mediaCastingPage: 'mediaCastingPage',
  settingsPage: 'settingsPage',
  appsPage: 'appsPage',
};
const pageKeys = {
  pageType: 'pageType',
  pageElement: 'pageElement',
  isPageEnabled: 'isPageEnabled',
};
const defaultSettingKeys = {
  mainMenuOptions: 'mainMenuOptions',
  legal: 'legal',
  faq: 'faq',
  appSettingsOptions: 'appSettingsOptions',
  castingInfo: 'castingInfo',
};
const assert = require('assert');

/**
 *
 * @returns bearer token used for cmp backend API auth
 */
const getBearerToken = async function _getBearerToken() {
  if (bearerToken == undefined) {
    bearerToken = await getAccessToken(cmpUserEmail, cmpUserPwd);
  }
  return bearerToken;
};

/**
 *
 * @returns username of cmp user
 */
const getCMPUserName = async function _getUserName() {
  if (userName == undefined) {
    userName = await getUserName(cmpUserEmail, cmpUserPwd);
  }
  return userName;
};

/**
 *
 * @returns pages of respective property
 */
const getPages = async function getPages() {
  const bearerToken = await getBearerToken();
  const response = await client.get(
    `${api.cmpBackend.host}${CMP_ENDPOINT.TEMPLATE}${CMP_ENDPOINT.ELEMENTS_WIDGET_TYPES}?${PARAMETERS.propertyId}=${PROPERTY_ID}&${PARAMETERS.type}=PAGE`,
    {
      headers: {Authorization: `bearer ${bearerToken}`},
    }
  );
  assert(response.data.code == 200, 'get pages API failed');
  const responseBody = response.data.response_body;
  return responseBody;
};

/**
 * TODO: Handle multiple property types
 * NOT A PRIORITY METHOD
 * @returns pages that are not in use
 */
const getUnPublishedPages = async function getUnPublishedPages() {
  let pages = [];
  pages = await getPages();
  let unPublishedPages = [];
  let homePageEle = await getPageEleConfigForPlatform(pageType.homePage);
  let propertyPageEle = await getPageEleConfigForPlatform(
    pageType.propertyInfoPage
  );
  unPublishedPages = pages.filter(
    (page) =>
      page.id != homePageEle.pageEleValue &&
      page.id != propertyPageEle.pageEleValue
  );
  return unPublishedPages;
};

/**
 *
 * @returns fields and values of a property such as app settings, pages, faq etc
 */
const getFieldsAndValues = async function getFieldsAndValues() {
  const bearerToken = await getBearerToken();
  const response = await client.get(
    `${api.cmpBackend.host}${CMP_ENDPOINT.CMP_PROPERTY}${CMP_ENDPOINT.PROPERTY}${PROPERTY_ID}${CMP_ENDPOINT.FIELDS_AND_VALUES}`,
    {
      headers: {Authorization: `bearer ${bearerToken}`},
    }
  );
  assert(response.data.code == 200, 'getFields and Values API failed');
  const responseBody = response.data.response_body;
  return responseBody;
};

/**
 * POST call to update the fields and values of a property such as app settings, pages, faq etc
 * @param {array object} config
 */
const updateFields = async function updateFields(config) {
  const bearerToken = await getBearerToken();
  let body = {
    fields: config,
    modified_by: await getCMPUserName(),
    modified_at: await getPreciseTime(),
  };
  const response = await client.post(
    `${api.cmpBackend.host}${CMP_ENDPOINT.CMP_PROPERTY}${CMP_ENDPOINT.PROPERTY}${PROPERTY_ID}${CMP_ENDPOINT.FIELDS}`,
    body,
    {
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    }
  );
  assert(
    response.data.code == 200,
    'POST API failed - failed to make changes to fields'
  );
  I.reportLog('update Fields POST API successful : ', response.data);
};

/**
 *
 * @returns precise time
 */
const getPreciseTime = async function getPreciseCurrentTime() {
  let now = new Date();
  let curentTime = new Date(now.toUTCString());
  let preciseTime = curentTime.getTime().toPrecision();
  return parseInt(preciseTime);
};

/**
 *
 * @returns pages specific to platform
 */
const getPagesForPlatform = async function getPagesForPlatform() {
  const fieldsAndValues = await getFieldsAndValues();
  let pages = [];
  switch (platform) {
    case constants.platform.browser:
      pages = fieldsAndValues.property.platforms.Browser[0].children;
      break;

    case constants.platform.firetv:
      pages = fieldsAndValues.property.platforms.FireTV[0].children;
      break;

    case constants.platform.roku:
      pages = fieldsAndValues.property.platforms.Roku[0].children;
      break;

    case constants.platform.lg:
      pages = fieldsAndValues.property.platforms.LG[0].children;
      break;

    default:
      I.reportLog(`Invalid platorm : ${platform}`);
  }
  I.reportLog(`Pages for ${platform}: ${pages}`);
  return pages;
};

/**
 * @param {string} pageName -> one of the values from pageType
 * @returns Page type config for respective pages & platform
 */
const getPageTypeConfigForPlatform = async function getPageTypeConfigForPlatform(
  pageName
) {
  let pagesData = await getPagesForPlatform();
  let pageData;
  pageData = pagesData.filter((page) => page.key === pageName);
  let pageTypeConfig = [];
  pageTypeConfig = pageData[0].children.filter(
    (property) => property.key === pageKeys.pageType
  );
  let pageTypeId = pageTypeConfig[0].id;
  let pageTypeValue = pageTypeConfig[0].value;
  pageTypeConfig = {
    pageTypeId: pageTypeId,
    pageTypeValue: pageTypeValue,
  };
  return pageTypeConfig;
};

/**
 * @param {string} pageName -> one of the values from pageType
 * @returns Page element config for respective platform
 */
const getPageEleConfigForPlatform = async function getPageEleConfigForPlatform(
  pageName
) {
  let pagesData = await getPagesForPlatform();
  let pageData;
  pageData = pagesData.filter((page) => page.key === pageName);
  let pageElementConfig = [];
  pageElementConfig = pageData[0].children.filter(
    (property) => property.key === pageKeys.pageElement
  );
  let pageEleId = pageElementConfig[0].id;
  let pageEleValue = pageElementConfig[0].value;
  pageElementConfig = {
    pageEleId: pageEleId,
    pageEleValue: pageEleValue,
  };
  return pageElementConfig;
};

/**
 * @param {string} pageName -> one of the values from pageType
 * @returns is Page Enabled config for respective platform
 */
const getPageEnabledConfigForPlatform = async function getPageEnabledConfigForPlatform(
  pageName
) {
  let pagesData = await getPagesForPlatform();
  let pageData;
  pageData = pagesData.filter((page) => page.key === pageName);
  let isPageEnabledConfig = [];
  isPageEnabledConfig = pageData[0].children.filter(
    (property) => property.key === pageKeys.isPageEnabled
  );
  let isPageEnabledId = isPageEnabledConfig[0].id;
  let isPageEnabledValue = isPageEnabledConfig[0].value;
  isPageEnabledConfig = {
    isPageEnabledId: isPageEnabledId,
    isPageEnabledValue: isPageEnabledValue,
  };
  return isPageEnabledConfig;
};

/**
 * TODO: Add capability to handle multiple properties using propertyType from config
 * @returns an array with all page config for respective platform
 */
const getPageConfig = async function getPageConfig() {
  let config = [];
  switch (property.propertyType) {
    case constants.propertyType.mdu:
      config = getMDUPageConfig();
      break;

    case constants.propertyType.hospitality:
      config = getHospitalityPageConfig();
      break;
    default:
      I.reportLog('Add valid property type in config file');
  }
  return config;
};

const getConsolidatedPageConfig = async function getConsolidatedPageConfig(
  pageName
) {
  let config = [];
  if (
    pageName === pageType.mediaCastingPage ||
    pageName === pageType.settingsPage
  ) {
    let pageEnabledConfig = await getPageEnabledConfigForPlatform(pageName);
    config = [
      {
        id: '',
        property_field_id: pageEnabledConfig.isPageEnabledId,
        values: pageEnabledConfig.isPageEnabledValue,
      },
    ];
  } else {
    let pageTypeConfig = await getPageTypeConfigForPlatform(pageName);
    let pageEleConfig = await getPageEleConfigForPlatform(pageName);
    let pageEnabledConfig = await getPageEnabledConfigForPlatform(pageName);
    config = [
      {
        id: '',
        property_field_id: pageTypeConfig.pageTypeId,
        values: pageTypeConfig.pageTypeValue,
      },
      {
        id: '',
        property_field_id: pageEleConfig.pageEleId,
        values: pageEleConfig.pageEleValue,
      },
      {
        id: '',
        property_field_id: pageEnabledConfig.isPageEnabledId,
        values: pageEnabledConfig.isPageEnabledValue,
      },
    ];
  }
  return config;
};
/**
 * @returns page config for hospitality property
 */
const getHospitalityPageConfig = async function getHospitalityPageConfig() {
  let config = [];
  let homePageConfig = await getConsolidatedPageConfig(pageType.homePage);
  config = config.concat(homePageConfig);
  let hotelInfoPageConfig = await getConsolidatedPageConfig(
    pageType.hotelInfoPage
  );
  config = config.concat(hotelInfoPageConfig);
  let watchPageConfig = await getConsolidatedPageConfig(pageType.watchPage);
  config = config.concat(watchPageConfig);
  let myStayPageConfig = await getConsolidatedPageConfig(pageType.myStayPage);
  config.concat(myStayPageConfig);
  let settingsPageConfig = await getConsolidatedPageConfig(
    pageType.settingsPage
  );
  config = config.concat(settingsPageConfig);
  let castingPageConfig = await getConsolidatedPageConfig(
    pageType.mediaCastingPage
  );
  config = config.concat(castingPageConfig);
  if (
    platform === constants.platform.android ||
    platform === constants.platform.firetv ||
    platform === constants.platform.lg
  ) {
    let appsPageConfig = await getConsolidatedPageConfig(pageType.appsPage);
    config = config.concat(appsPageConfig);
  }
  return config;
};

/**
 * MDU specific
 * @returns page config of MDU property
 */
const getMDUPageConfig = async function getMDUPageConfig() {
  let homePageTypeConfig = await getPageTypeConfigForPlatform(
    pageType.homePage
  );
  let homePageEleConfig = await getPageEleConfigForPlatform(pageType.homePage);
  let propertyInfoPageTypeConfig = await getPageTypeConfigForPlatform(
    pageType.propertyInfoPage
  );
  let propertyInfoPageEleConfig = await getPageEleConfigForPlatform(
    pageType.propertyInfoPage
  );
  let isPropertyInfoPageEnabledConfig = await getPageEnabledConfigForPlatform(
    pageType.propertyInfoPage
  );
  let config = [
    {
      id: '',
      property_field_id: homePageTypeConfig.pageTypeId,
      values: homePageTypeConfig.pageTypeValue,
    },
    {
      id: '',
      property_field_id: homePageEleConfig.pageEleId,
      values: homePageEleConfig.pageEleValue,
    },
    {
      id: '',
      property_field_id: propertyInfoPageTypeConfig.pageTypeId,
      values: propertyInfoPageTypeConfig.pageTypeValue,
    },
    {
      id: '',
      property_field_id: propertyInfoPageEleConfig.pageEleId,
      values: propertyInfoPageEleConfig.pageEleValue,
    },
    {
      id: '',
      property_field_id: isPropertyInfoPageEnabledConfig.isPageEnabledId,
      values: isPropertyInfoPageEnabledConfig.isPageEnabledValue,
    },
  ];
  return config;
};

/**
 * @param {string} pageName -> one of the values from pageType
 * @returns boolean value indicating whether property page is enabled
 */
const isPageEnabled = async function isPageEnabled(pageName) {
  let isPageEnabledConfig, isPageEnabledValue;
  isPageEnabledConfig = await getPageEnabledConfigForPlatform(pageName);
  isPageEnabledValue = isPageEnabledConfig.isPageEnabledValue;
  I.reportLog(`visibility of property page:  ${isPageEnabledValue}`);
  return isPageEnabledValue;
};

/**
 * @param {string} pageName -> one of the values from pageType
 * Method to enable property page for respective platform
 */
const enablePage = async function enablePage(pageName) {
  let config = await getPageConfig();
  let isPageEnabledConfig = await getPageEnabledConfigForPlatform(pageName);
  let isPageEnabled = config.find(
    (option) => option.property_field_id === isPageEnabledConfig.isPageEnabledId
  );
  if (isPageEnabled) {
    isPageEnabled.values = true;
  }
  await updateFields(config);
};

/**
 * @param {string} pageName -> one of the values from pageType
 * Method to disable property page for respective platform
 */
const disablePage = async function disablePage(pageName) {
  let config = await getPageConfig();
  let isPageEnabledConfig = await getPageEnabledConfigForPlatform(pageName);
  let isPageEnabled = config.find(
    (option) => option.property_field_id === isPageEnabledConfig.isPageEnabledId
  );
  if (isPageEnabled) {
    isPageEnabled.values = false;
  }
  await updateFields(config);
};

/**
 * TODO: Resolve other dependent methods and test with Hospitality property
 * NOT A PRIORITY METHOD
 * Method to switch home page configuration with a different configuration for respective platform
 */
const changeHomePageConfig = async function changeHomePageConfig() {
  let config = await getPageConfig();
  let unPublishedPages = [];
  unPublishedPages = await getUnPublishedPages();
  let homePageEle = await getPageEleConfigForPlatform(pageType.homePage);
  if (unPublishedPages.length > 0) {
    let homePageConf = config.find(
      (conf) => conf.values === homePageEle.homePageEleValue
    );
    if (homePageConf) {
      homePageConf.values = unPublishedPages[0].id;
    }
  }
  await updateFields(config);
};

/**
 * TODO: Resolve other dependent methods and test with Hospitality property
 * NOT A PRIORITY
 * Switch property page from current one to new one
 */
const changePropertyPageConfig = async function changePropertyPageConfig() {
  let config = await getPageConfig();
  let unPublishedPages = [];
  unPublishedPages = await getUnPublishedPages();
  let propertyPageEle = await getPageEleConfigForPlatform(
    pageType.propertyInfoPage
  );
  if (unPublishedPages.length > 0) {
    let propertyPageConf = config.find(
      (conf) => conf.values === propertyPageEle.propInfoPageEleValue
    );
    if (propertyPageConf) {
      propertyPageConf.values = unPublishedPages[0].id;
    }
  }
  await updateFields(config);
};

/**
 * MDU specific
 * @returns All menu options and their configurations
 */
const getMenuOptions = async function getMenuOptions() {
  let fieldsAndValues = await getFieldsAndValues();
  let defaultSettings = fieldsAndValues.property.default;
  let menuOptions;
  let menuOptionSetting = defaultSettings.find(
    (setting) => setting.key === defaultSettingKeys.mainMenuOptions
  );
  if (menuOptionSetting) {
    menuOptions = menuOptionSetting.children;
    return menuOptions;
  }
  I.reportLog('main menu options not available');
  throw 'main menu options not available';
};

/**
 *
 * @returns All leagl fields and their configuration
 */
const getLegalFields = async function getLegalFields() {
  let fieldsAndValues = await getFieldsAndValues();
  let defaultSettings = fieldsAndValues.property.default;
  let legalFields;
  let legalFieldSetting = defaultSettings.find(
    (setting) => setting.key === defaultSettingKeys.legal
  );
  legalFields = legalFieldSetting.children;
  return legalFields;
};

/**
 *
 * @returns FAQ field and its configuration
 */
const getFAQField = async function getFAQField() {
  let fieldsAndValues = await getFieldsAndValues();
  let defaultSettings = fieldsAndValues.property.default;
  let faqFieldSetting = defaultSettings.find(
    (setting) => setting.key === defaultSettingKeys.faq
  );
  return faqFieldSetting;
};

/**
 * MDU specific
 * @returns App settings fields and its configurations
 */
const getAppSettingsOptions = async function getAppSettingsOptions() {
  let fieldsAndValues = await getFieldsAndValues();
  let defaultSettings = fieldsAndValues.property.default;
  let appSettingsOptions;
  let appSettings = defaultSettings.find(
    (setting) => setting.key === defaultSettingKeys.appSettingsOptions
  );
  appSettingsOptions = appSettings.children;
  return appSettingsOptions;
};

/**
 *
 * @returns casting details fields and its configuration
 */
const getCastingDetails = async function getCastingDetails() {
  let fieldsAndValues = await getFieldsAndValues();
  let defaultSettings = fieldsAndValues.property.default;
  let castSettings;
  let castSettingsFields = defaultSettings.find(
    (setting) => setting.key === defaultSettingKeys.castingInfo
  );
  castSettings = castSettingsFields.children;
  return castSettings;
};

/**
 * MDU specific
 * @param {string} menuKey -> one of the values from constants.menuKeys
 * @returns boolean if menu option is enabled
 */
const isMenuOptionEnabled = async function isMenuOptionEnabled(menuKey) {
  const menuOptions = await getMenuOptions();
  let option = menuOptions.find((option) => option.key === menuKey);
  if (option) {
    return option.value;
  }
  I.reportLog(`${menukey} not available or invalid`);
  throw 'menukey not available or invalid';
};

/**
 * MDU specific
 * @param {string} appSettingKey -> one of the values from constants.appSettingKeys
 * @returns boolean if app setting is enabled
 */
const isAppSettingOptionEnabled = async function isAppSettingOptionEnabled(
  appSettingKey
) {
  const appSettingsOptions = await getAppSettingsOptions();
  let option = appSettingsOptions.find(
    (option) => option.key === appSettingKey
  );
  if (option) {
    return option.value;
  }
  I.reportLog(`${appSettingKey} not available or invalid`);
  throw 'appSettingKey not available or invalid';
};

/**
 * MDU specific
 * enables menu option
 * @param {string} menuKey -> one of the values from constants.menuKeys
 */
const enableMenuOption = async function enableMenuOption(menuKey) {
  let defaultConfig = await getPropertyDefaultConfig();
  if (await isMenuOptionEnabled(menuKey)) {
    I.reportLog(`Menu Item already enabled : ${menuKey}`);
  } else {
    let menuItemKey = await getIdForMenuOption(menuKey);
    if (menuItemKey === -1) throw 'invalid menu key';
    let menu = defaultConfig.find(
      (config) => config.property_field_id === menuItemKey
    );
    if (menu) {
      menu.values = true;
      I.reportLog(`Enabled : ${menuKey}`);
    }
    await updateFields(defaultConfig);
  }
};

/**
 * MDU specific
 * disables menu option
 * @param {string} menuKey -> one of the values from constants.menuKeys
 */
const disableMenuOption = async function disableMenuOption(menuKey) {
  let defaultConfig = await getPropertyDefaultConfig();
  if (await isMenuOptionEnabled(menuKey)) {
    let menuItemKey = await getIdForMenuOption(menuKey);
    if (menuItemKey === -1) throw 'invalid menu key';
    let menu = defaultConfig.find(
      (config) => config.property_field_id === menuItemKey
    );
    if (menu) {
      menu.values = false;
      I.reportLog(`Disabled :, ${menuKey}`);
    }
    await updateFields(defaultConfig);
  } else {
    I.reportLog(`Menu Item already disabled : ${menuKey}`);
  }
};

/**
 * MDU specific
 * enables app setting
 * @param {string} appSettingKey -> one of the values from constants.appSettingKeys
 */
const enableAppSettingOption = async function enableAppSettingOption(
  appSettingKey
) {
  let defaultConfig = await getPropertyDefaultConfig();
  if (await isAppSettingOptionEnabled(appSettingKey)) {
    I.reportLog(`App Setting already enabled : ${appSettingKey}`);
  } else {
    let appSettingId = await getIdForAppSettingsOption(appSettingKey);
    if (appSettingId === -1) throw 'invalid app setting key';
    let appSetting = defaultConfig.find(
      (config) => config.property_field_id === appSettingId
    );
    if (appSetting) {
      appSetting.values = true;
      I.reportLog(`Enabled : ${appSettingKey}`);
    }
    await updateFields(defaultConfig);
  }
};

/**
 * MDU specific
 * disables app setting
 * @param {string} appSettingKey -> one of the values from constants.appSettingKeys
 */
const disableAppSettingOption = async function disableAppSettingOption(
  appSettingKey
) {
  let defaultConfig = await getPropertyDefaultConfig();
  let isAppSettingEnabled = await isAppSettingOptionEnabled(appSettingKey);
  if (isAppSettingEnabled === true) {
    let appSettingId = await getIdForAppSettingsOption(appSettingKey);
    if (appSettingId === -1) throw 'invalid app setting key';
    let appSetting = defaultConfig.find(
      (config) => config.property_field_id === appSettingId
    );
    if (appSetting) {
      appSetting.values = false;
      I.reportLog(`Disabled :${appSettingKey}`);
    }
    await updateFields(defaultConfig);
  } else {
    I.reportLog(`App Setting already disabled  ${appSettingKey}`);
  }
};

/**
 * MDU specific
 * @param {*} menuKey ->  one of the values from constants.menuKeys
 * @returns id of menu key
 */
const getIdForMenuOption = async function getIdForMenuOption(menuKey) {
  let menuOptions = await getMenuOptions();
  let id = -1;
  for (let iter = 0; iter < menuOptions.length; iter++) {
    if (menuOptions[iter].key === menuKey) {
      id = menuOptions[iter].id;
      break;
    }
  }
  return id;
};

/**
 * MDU specific
 * @param {*} appSettingKey ->  one of the values from constants.menuKeys
 * @returns id of app setting key
 */
const getIdForAppSettingsOption = async function getIdForAppSettingsOption(
  appSettingKey
) {
  let appSettingOptions = await getAppSettingsOptions();
  let id = -1;
  for (let iter = 0; iter < appSettingOptions.length; iter++) {
    if (appSettingOptions[iter].key === appSettingKey) {
      id = appSettingOptions[iter].id;
      break;
    }
  }
  return id;
};

/**
 *
 * @param {*} legalKey ->  one of the values from constants.legalKeys
 * @returns id of legal key
 */
const getIdForLegalItem = async function getIdForLegalItem(legalKey) {
  let legalOptions = await getLegalFields();
  let id = -1;
  for (let iter = 0; iter < legalOptions.length; iter++) {
    if (legalOptions[iter].key === legalKey) {
      id = legalOptions[iter].id;
      break;
    }
  }
  return id;
};

/**
 *
 * @returns id of FAQ key
 */
const getIdForFAQField = async function getIdForFAQField() {
  let faqFields = await getFAQField();
  let id = -1;
  for (let iter = 0; iter < faqFields.length; iter++) {
    if (faqFields[iter].key === constants.faqKey) {
      id = faqFields[iter].id;
      break;
    }
  }
  return id;
};

/**
 *
 * @param {*} castKey ->  one of the values from constants.castKeys
 * @returns id of cast key
 */
const getIdForCastField = async function getIdForCastField(castKey) {
  let castFields = await getCastingDetails();
  let id = -1;
  for (let iter = 0; iter < castFields.length; iter++) {
    if (castFields[iter].key === castKey) {
      id = castFields[iter].id;
      break;
    }
  }
  return id;
};

/**
 * MDU specific
 * @returns body of default config
 */
const getPropertyDefaultConfig = async function getPropertyDefaultConfig() {
  let menuOptions = await getMenuOptions();
  let menuOpts = menuOptions.map((option) => ({
    property_field_id: option.id,
    values: option.value,
  }));
  let legalOptions = await getLegalFields();
  let legalOpts = legalOptions.map((option) => ({
    property_field_id: option.id,
    values: option.value,
  }));
  let faqOptions = await getFAQField();
  let faqOpts = [];
  faqOpts[0] = {
    property_field_id: faqOptions.id,
    values: faqOptions.value,
  };
  let appSettingsOptions = await getAppSettingsOptions();
  let appSettingsOpts = appSettingsOptions.map((option) => ({
    property_field_id: option.id,
    values: option.value,
  }));
  let castSettingsOptions = await getCastingDetails();
  let castSettingOpts = castSettingsOptions.map((option) => ({
    property_field_id: option.id,
    values: option.value,
  }));
  let config = menuOpts.concat(
    legalOpts,
    faqOpts,
    appSettingsOpts,
    castSettingOpts
  );
  return config;
};

/**
 *
 * @returns id of home page for respective platform
 */
const getPageId = async function getPageId(pageName) {
  let pages = [];
  pages = await getPages();
  let page = [];
  let pageId;
  let pageEle = await getPageEleConfigForPlatform(pageName);
  page = pages.filter((page) => page.id === pageEle.pageEleValue);
  pageId = page[0].id;
  console.log('id:', pageId);
  return pageId;
};

/**
 *
 * @param {string} pageName -> one of constants.pages
 * @returns response body of page template / elements API
 */
const getPageTemplate = async function getPageTemplate(pageName) {
  const bearerToken = await getBearerToken();
  let PAGE_ID = await getPageId(pageName);
  const response = await client.get(
    `${api.cmpBackend.host}${CMP_ENDPOINT.TEMPLATE}${CMP_ENDPOINT.ELEMENTS}${PAGE_ID}`,
    {
      headers: {Authorization: `bearer ${bearerToken}`},
    }
  );
  assert(response.data.code == 200, 'get page template API failed');
  const responseBody = response.data.response_body;
  return responseBody;
};

/**
 *
 * @param {string} page -> one of constants.pages
 * @returns number of rails in respective page
 */
const getRailCount = async function getRailCount(page) {
  let pageTemplate = await getPageTemplate(page);
  let contentFields = pageTemplate.content_fields;
  let contentField = contentFields.filter(
    (content) => content.type === 'MULTIWIDGETTYPE'
  );
  let railCount = contentField[0].values.length;
  return railCount;
};

/**
 *
 * @param {string} page -> one of constants.pages
 * @returns id of rails in respective page
 */
const getRailIds = async function getRailIds(page) {
  let pageTemplate = await getPageTemplate(page);
  let contentFields = pageTemplate.content_fields;
  let contentField = contentFields.filter(
    (content) => content.type === 'MULTIWIDGETTYPE'
  );
  let rails = contentField[0].values;
  return rails;
};

/**
 *
 * @param {string} elementId
 * @returns content field id of respective elementId
 */
const getContentFieldId = async function getContentFieldId(elementId) {
  let contentFields = await getContentFields(elementId);
  let contentFieldId = contentFields.id;
  return contentFieldId;
};

/**
 *
 * @param {string} elementId
 * @returns an array with Allowed type ids for this elementID
 */
const getAllowedTypeIds = async function getAllowedTypeIds(elementId) {
  let contentFields = await getContentFields(elementId);
  let allowedTypeIds = contentFields.allowed_type_id;
  return allowedTypeIds;
};

/**
 *
 * @param {string} id
 * @returns
 */
const getWidgetTypeIds = async function getWidgetTypeIds(id) {
  const bearerToken = await getBearerToken();
  let allowedTypeIds = await getAllowedTypeIds(id);
  let contentFieldId = await getContentFieldId(id);
  let associationId = PROPERTY_ID;
  let widgetTypeIds;
  let body = {
    allowed_type_ids: allowedTypeIds,
    association_id: associationId,
    content_field_id: contentFieldId,
  };
  const response = await client.post(
    `${api.cmpBackend.host}${CMP_ENDPOINT.TEMPLATE}${CMP_ENDPOINT.ELEMENTS}${CMP_ENDPOINT.WIDGET_TYPE_IDS}`,
    body,
    {
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    }
  );
  assert(
    response.data.code == 200,
    'POST API failed - failed to get widget type ids'
  );
  widgetTypeIds = response.data.response_body.elements_with_widgetType_id;
  return widgetTypeIds;
};

/**
 *
 * @param {string} id
 * @returns an array of only widget ids for particular widget type id
 */
const getWidgetTypeIdsFiltered = async function getWidgetTypeIdsFiltered(id) {
  let widgetDetails = await getWidgetTypeIds(id);
  let widgetIds = widgetDetails.map((widget) => widget.id);
  return widgetIds;
};

/**
 *
 * @param {string} elementId
 * @returns response body
 */
const getTemplate = async function getTemplate(elementId) {
  const bearerToken = await getBearerToken();
  const ELEMENT_ID = elementId;
  const response = await client.get(
    `${api.cmpBackend.host}${CMP_ENDPOINT.TEMPLATE}${CMP_ENDPOINT.ELEMENTS}${ELEMENT_ID}`,
    {
      headers: {Authorization: `bearer ${bearerToken}`},
    }
  );
  assert(response.data.code == 200, 'get page template API failed');
  const responseBody = response.data.response_body;
  return responseBody;
};

/**
 *
 * @param {string} elementId
 * @returns content fields of a particular element
 */
const getContentFields = async function getContentFields(elementId) {
  let template = await getTemplate(elementId);
  let contentFields = template.content_fields;
  return contentFields[0];
};

/**
 *
 * @param {string} elementId
 * @returns values field of particular element
 */
const getValues = async function getValues(elementId) {
  let contentFields = await getContentFields(elementId);
  let values = contentFields.values;
  return values;
};

/**
 *
 * @param {integer} index
 * @returns rail values object with railID and widget count
 */
const getRailWidgetCount = async function getRailWidgetCount(index) {
  let rails = await getRailIds(constants.pages.homePage);
  let railId = rails[index - 1];
  let railValues = {};
  let values = await getValues(railId);
  railValues[`${railId}`] = values.length;
  return railValues;
};

/**
 *
 * @param {integer} railId
 * @returns deleted widgetId
 */
const deleteWidgetInRail = async function deleteWidgetInRail(index, page) {
  let rails = await getRailIds(page);
  let railId = rails[index - 1];
  const bearerToken = await getBearerToken();
  let template = await getTemplate(railId);
  let values = [];
  values = template.content_fields[0].values;
  let deletedWidget = values.pop();
  let body = {
    associated_to: template.associated_to,
    association_id: template.association_id,
    content_values: [
      {
        content_field_id: template.content_fields[0].content_field_id,
        element_id: '',
        id: template.content_fields[0].id,
        type: template.content_fields[0].type,
        values: values,
      },
    ],
    id: template.id,
    modified_by: await getCMPUserName(),
    modified_date: await getPreciseTime(),
    name: template.name,
    status: template.status,
    widget_type_id: template.widget_type_id,
    widget_type_name: template.widget_type_name,
  };
  const response = await client.post(
    `${api.cmpBackend.host}${CMP_ENDPOINT.TEMPLATE}${CMP_ENDPOINT.V2}${CMP_ENDPOINT.ELEMENTS}${CMP_ENDPOINT.UPDATE}`,
    body,
    {
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    }
  );
  assert(response.data.code == 200, 'delete widget in rail operation failed');
  return deletedWidget;
};

/**
 *
 * @param {integer} index
 * @returns widget count after adding new widget
 */
const addWidgetInRail = async function addWidgetInRail(index, widgetId, page) {
  let rails = await getRailIds(page);
  let railId = rails[index - 1];
  const bearerToken = await getBearerToken();
  let template = await getTemplate(railId);
  let values = [];
  values = template.content_fields[0].values;
  let currentWidgetCount = values.length;
  I.reportLog(`Widget count before adding new widget:  ${currentWidgetCount}`);
  let newWidgetCount = values.push(widgetId);
  let body = {
    associated_to: template.associated_to,
    association_id: template.association_id,
    content_values: [
      {
        content_field_id: template.content_fields[0].content_field_id,
        element_id: '',
        id: template.content_fields[0].id,
        type: template.content_fields[0].type,
        values: values,
      },
    ],
    id: template.id,
    modified_by: await getCMPUserName(),
    modified_date: await getPreciseTime(),
    name: template.name,
    status: template.status,
    widget_type_id: template.widget_type_id,
    widget_type_name: template.widget_type_name,
  };
  const response = await client.post(
    `${api.cmpBackend.host}${CMP_ENDPOINT.TEMPLATE}${CMP_ENDPOINT.V2}${CMP_ENDPOINT.ELEMENTS}${CMP_ENDPOINT.UPDATE}`,
    body,
    {
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    }
  );
  assert(response.data.code == 200, 'add widget in rail operation failed');
  return newWidgetCount;
};

module.exports = {
  getCastingDetails,
  getFAQField,
  isPageEnabled,
  enablePage,
  disablePage,
  getRailCount,
  getRailWidgetCount,
  deleteWidgetInRail,
  addWidgetInRail,
};
