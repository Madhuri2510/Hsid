const assert = require('assert');
const {assertText} = require('../../CommonUtil/Util');
const {I, constants} = inject();
const hotelInfoPageLocators = require('./HotelInfoPageLocators.json');
const watchPageLocators = require('../WatchPage/WatchPageLocators.json');
const SportsPage = require('../SportsPage/BrowserSportsPage.js');
const navbarLocator = require('../NavigationPage/NavbarLocators.json');
const CMP = require('../../../OnStreamBackend/cmp');
const cmpTextHierarchies = ['headline', 'subHeading', 'bodyText'];
let cmp = new CMP();
const Sports = require('../../../OnStreamBackend/sports');
let sports = new Sports();
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,
  /**
   * verify the hotelInfo icon visible
   */

  async isOnStreamPropertyLogoSeen() {
    await I.click(hotelInfoPageLocators.hamburgerMenuIcon);
    return await I.isElementVisible(
      hotelInfoPageLocators.hotelInfoIcon,
      testExecutionWaits.WAIT_FOR_TAB_LOAD
    );
  },

  /**
   * verify the hotelinfo icon is highlighted
   */
  async verifyHotelInfoPageHighlighted(rgbaValue) {
    assertText(
      await I.grabCssPropertyFrom(
        navbarLocator.hotelInfoIcon,
        constants.guide.colorLabel
      ),
      rgbaValue
    );
    assertText(
      await I.grabCssPropertyFrom(
        navbarLocator.hotelInfoIcon,
        constants.guide.fontWeight
      ),
      constants.guide.normal
    );
    I.reportLog('HotelInfo title is Normal and Highlighted');
  },

  /**
   * verify the property logo
   */
  async isHotelLogoVisible() {
    assert.ok(
      await I.isElementVisible(
        hotelInfoPageLocators.onStreamHotelLogo,
        testExecutionWaits.WAIT_FOR_TAB_LOAD
      ),
      'OnStream Hotel Logo is not visible'
    );
  },

  /**
   * verify the total Swimlanes in Hotel Info Page
   * @param {string} swimlaneTitles
   */
  async verifyhotelInfoPageSwimlanes(swimlaneTitles) {
    await I.wait(10);
    let swimlaneText = await I.getElementLabel(
      hotelInfoPageLocators.swimlaneTitlesAll
    );
    for (
      let swimlaneIndex = 0;
      swimlaneIndex < swimlaneText.length;
      swimlaneIndex++
    ) {
      assert.strictEqual(
        swimlaneText[swimlaneIndex],
        swimlaneTitles[swimlaneIndex],
        'swimlane Text is not matching'
      );
    }
  },

  /**
   * verify more info section
   */

  async verifyHotelInfoPageLearnMoreSection(MoreinfoText) {
    await I.click(hotelInfoPageLocators.moreInfo);
    let textRetrieved = await I.grabTextFrom(
      hotelInfoPageLocators.more_info_texts
    );
    for (let startIndex = 0; startIndex < textRetrieved.length; startIndex++) {
      let TextKey = cmpTextHierarchies[startIndex];
      assert.strictEqual(
        textRetrieved[startIndex],
        MoreinfoText[TextKey],
        'OnStream Home Page Learn More text is not matching'
      );
    }
    await this.clickonCloseIcon();
    return true;
  },

  /* click close info card section */

  async clickonCloseIcon() {
    await I.elementClick(watchPageLocators.closeIconOnInfoCard);
  },

  /**
   * Validate static Ad WidgetTile on Hotel info Page
   * @returns  {boolean} - returns true if advertise tag available on info card.
   */

  async validateStaticAdSmallWidgetTile() {
    let widgetInfo, isAdvertiseTagVisible;
    widgetInfo = await this.getWidgetInfo(
      constants.widgets.smallWidget,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInHotelInfoPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },

  /**
   * checks weather advertise tag is available or not.
   * @returns {boolean} - returns true if advertise tag available on info card.
   */
  async isAdvertiseTagAvailable() {
    return await I.isElementVisible(watchPageLocators.advertiseTagOnInfoCard);
  },

  /**
   * Verify Carousel Count in Hotel Info Page
   * @param {integer} expectedTotalCarousels
   */
  async verifyHotelInfoPageCarouselCount(expectedTotalCarousels) {
    await I.wait(10);
    let CarouselItems = I.getElementLabel(hotelInfoPageLocators.totalCarousels);
    let totalCarousel = [];
    for (
      let CarouselItemsIndex = 0;
      CarouselItemsIndex < CarouselItems.length;
      CarouselItemsIndex++
    ) {
      totalCarousel[CarouselItemsIndex] = await I.grabNumberOfVisibleElements(
        hotelInfoPageLocators.totalCarousels + `[${CarouselItemsIndex}+1]/li`
      );
      assert.strictEqual(
        totalCarousel[CarouselItemsIndex],
        expectedTotalCarousels[CarouselItemsIndex],
        `Failed, the total number of Carousels on HotelInfoPage is ${totalCarousel}`
      );
    }
  },

  /**
   * Validate the Weather Widget Title
   * @returns {boolen}
   */
  async validateWeatherWidgetTile() {
    let widgetInfo,
      isVisible = true;
    widgetInfo = await this.getWidgetInfo(
      constants.widgets.smallWidget,
      constants.widgetType.weather
    );
    await this.navigateToSpecificTileInHotelInfoPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    if (await this.isWeatherInfoCardDataVisible()) {
      return isVisible;
    } else {
      isVisible = false;
      return isVisible;
    }
  },

  /**
   * Get Widget Info from Cmp backend
   * @param {string} widgetStyle
   * @param {string} widgetType
   * @returns {object}
   */
  async getWidgetInfo(widgetStyle, widgetType) {
    let widgetInfo;
    widgetInfo = await cmp.getIndexOfSwimlaneAndWidgetForSpecificWidget(
      widgetStyle,
      widgetType,
      constants.pages.hotelInfoPage
    );
    if (widgetInfo.swimlaneName === -1 || widgetInfo.indexOfWidget === -1) {
      assert.fail(`widget swimlane with ${widgetType} should be available`);
    } else {
      return widgetInfo;
    }
  },

  /**
   * Checks city label is visble on weather info card
   * @returns {boolean} - returns true if city labe is visible
   */
  async isWeatherInfoCardDataVisible() {
    let isVisible = true;
    // City
    if (!(await I.isElementVisible(watchPageLocators.cityLabel))) {
      isVisible = false;
      I.reportLog('City Label should be visible in weather info card');
    }
    return isVisible;
  },

  async closeInfoCardInHomeScreen() {
    await I.click(watchPageLocators.closeIconOnInfoCard);
  },

  /**
   * navigates to specific tile and opens it.
   * @param {integer} swimlaneIndex
   * @param {integer} tileIndex
   */
  async navigateToSpecificTileInHotelInfoPage(swimlaneIndex, tileIndex) {
    let tile = watchPageLocators.swimlaneIndexWithWidgetIndex
      .replace(constants.swimlaneIndex, swimlaneIndex + 1)
      .replace(constants.tileIndex, tileIndex);
    await I.waitForElement(tile, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.scrollIntoView(tile);
    await I.wait(testExecutionWaits.WAIT_FOR_3_SEC);
    await I.click(tile);
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
  },

  /**
   * validates sports swimlane after clicking on sport tile
   */
  async validateSportsSmallWidgetTile() {
    let widgetInfo;
    widgetInfo = await this.getWidgetInfo(
      constants.widgets.smallWidget,
      constants.widgetType.sports
    );
    await this.navigateToSpecificTileInHotelInfoPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    let swimlaneNames = await sports.getActiveLeagues();
    await SportsPage.verifySportsPageSwimLanes(swimlaneNames);
    return true;
  },

  /**
   * validates notification card on small widgets swimlane
   */
  async validateNotificationInSmallWidgetTile() {
    let widgetInfo, notificationInfo;
    widgetInfo = await this.getWidgetInfo(
      constants.widgets.smallWidget,
      constants.widgetType.notification
    );
    await this.navigateToSpecificTileInHotelInfoPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    notificationInfo = await cmp.getNotificationWIdgetData(
      constants.widgets.smallWidget,
      constants.pages.hotelInfoPage
    );
    if (
      notificationInfo.headline === null ||
      notificationInfo.bodyText === null
    ) {
      assert.fail(
        'Notification data for Small widget swimlane should be available'
      );
    }
    await this.validateNotificationInfoCard(notificationInfo);
    return true;
  },

  /**
   * Validates content of notification info card
   * @param {object} content
   */
  async validateNotificationInfoCard(content) {
    let headline = await I.grabTextFrom(
      watchPageLocators.headlineOfNotificationTile
    );
    let bodyText = await I.grabTextFrom(
      watchPageLocators.bodyTextOfNotificationTile
    );
    assert.ok(
      headline === content.headline,
      'Headline of notification tile should match with cmp data'
    );
    let bodyTextFromCmp = content.bodyText
      .replace(/\s\s+/g, ' ')
      .trim(); /* remove unnecessary white space which is comming from cmp backend and trim white spaces from begining and end of the string */
    assert.equal(
      bodyText,
      bodyTextFromCmp,
      'Body Text of notification tile should match with cmp data'
    );
  },

  /**
   * Validates content of more info card with cmp data.
   */
  async validateMoreInfoWidgetTile() {
    let widgetInfo, moreInfoData;
    widgetInfo = await this.getWidgetInfo(
      constants.widgets.largeWidget,
      constants.widgetType.moreInfo
    );
    await this.navigateToSpecificTileInHotelInfoPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    moreInfoData = await cmp.getMoreInfoWIdgetData(
      constants.widgets.largeWidget,
      constants.pages.hotelInfoPage
    );
    await this.validateMoreInfoCard(moreInfoData);
    return true;
  },

  /**
   * Validates data of moreInfo info card.
   * @param {object} content
   */
  async validateMoreInfoCard(content) {
    let title = await I.grabTextFrom(
      hotelInfoPageLocators.titleOfMoreInfoCard + '[1]'
    );
    let subHeading = await I.grabTextFrom(
      hotelInfoPageLocators.subHeadingwithTextOfMoreInfoCard + `[1]`
    );
    let bodyText = await I.grabTextFrom(
      hotelInfoPageLocators.subHeadingwithTextOfMoreInfoCard + `[2]`
    );
    assert.ok(
      title === content.title,
      'Title of More Info tile should match with cmp data'
    );

    assert.ok(
      subHeading === content.subHeading,
      'Sub Heading of More Info  tile should match with cmp data'
    );
    assert.ok(
      bodyText === content.bodyText,
      'Body Text of More Info  tile should match with cmp data'
    );
    assert.ok(
      await I.isElementVisible(watchPageLocators.moreInfoImage),
      'More Info Image should be visible on More Info Card'
    );
  },

  /**
   * Validates advertise tag is visible in a infocard.
   * @returns {boolean} - returns true if advertise tag is visible else false
   */
  async validateStaticAdLargeWidgetTile() {
    let widgetInfo, isAdvertiseTagVisible;
    widgetInfo = await this.getWidgetInfo(
      constants.widgets.largeWidget,
      constants.widgetType.staticAd
    );
    await this.navigateToSpecificTileInHotelInfoPage(
      widgetInfo.indexOfSwimlaneName,
      widgetInfo.indexOfWidget
    );
    isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },
  /**
   * Validates content of moreInfo info card in hero carousel swimlane
   */
  async validateMoreInfoWidgetInHeroCarousel() {
    let widgetInfo, content;
    widgetInfo = await this.getWidgetInfo(
      constants.widgets.carousel,
      constants.widgetType.moreInfo
    );
    content = await cmp.getMoreInfoWIdgetData(
      constants.widgets.carousel,
      constants.pages.hotelInfoPage
    );
    let tile = watchPageLocators.swimlaneIndexWithWidgetIndex
      .replace(constants.swimlaneIndex, widgetInfo.indexOfSwimlaneName + 1)
      .replace(constants.tileIndex, widgetInfo.indexOfWidget);
    await I.waitForElement(tile, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.scrollIntoView(tile);
    let moreInfoButton = watchPageLocators.moreInformationButtonInSpecificTile.replace(
      constants.tileNo,
      tile
    );
    await I.waitForVisible(
      moreInfoButton,
      testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR
    );
    await I.click(moreInfoButton);
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    await this.validateMoreInfoCard(content);
    return true;
  },

  /**
   * Validates if advertise tag is available on info card of hero carousel swimlane
   * @returns {boolean} - returns true if advertise tag is available on info card
   */
  async validateStaticAdWidgetInHeroCarousel() {
    widgetInfo = await this.getWidgetInfo(
      constants.widgets.carousel,
      constants.widgetType.staticAd
    );
    let tile = watchPageLocators.swimlaneIndexWithWidgetIndex
      .replace(constants.swimlaneIndex, widgetInfo.indexOfSwimlaneName + 1)
      .replace(constants.tileIndex, widgetInfo.indexOfWidget);
    await I.waitForElement(tile, testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    await I.scrollIntoView(tile);
    let moreInfoButton = watchPageLocators.moreInformationButtonInSpecificTile.replace(
      constants.tileNo,
      tile
    );
    await I.waitForVisible(
      moreInfoButton,
      testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR
    );
    await I.click(moreInfoButton);
    await I.wait(testExecutionWaits.WAIT_FOR_LABEL_TO_APPEAR);
    let isAdvertiseTagVisible = await this.isAdvertiseTagAvailable();
    return isAdvertiseTagVisible;
  },

  /**
   * Navigate to Sports page
   */
  async navigateToSportsTile() {
    if (
      await cmp.isWidgetAvailable(
        constants.widgetType.sports,
        constants.pages.watchPage
      )
    ) {
      let swimlane = await cmp.getWidgetPosition(
        constants.widgetType.sports,
        constants.pages.watchPage
      );
      let swimlanePosition = swimlane.swimlaneIndex + 1;
      let sportsTileIndex = swimlane.widgetIndex + 1;
      let sportsTilePosition = homePageLocators.swimlaneWithSwimlaneAndWidgetIndex
        .replace(constants.swimlaneIndex, swimlanePosition)
        .replace(constants.tileIndex, sportsTileIndex);
      await I.waitForElement(
        sportsTilePosition,
        testExecutionWaits.WAIT_FOR_ELEMENT_LOAD
      );
      await I.scrollIntoView(sportsTilePosition);
      await I.click(sportsTilePosition);
      await I.wait(3);
    } else {
      assert.fail('Widget sports is not found');
    }
  },
};
