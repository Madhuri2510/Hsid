const assert = require('assert');
const {I, constants} = inject();
const settingsPageLocators = require('./SettingsPageLocators.json');
const sportsPageLocators = require('../SportsPage/SportsPageLocators.json');
const watchPageLocators = require('../WatchPage/WatchPageLocators.json');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

const dayjs = require('dayjs');

const cssConstants = {
  colorLabel: 'color',
  whiteColor: 'rgba(255, 255, 255, 1)',
  fontWeight: 'font-weight',
  bold: '700',
  png: '.png',
};

module.exports = {
  constants,
  async verifySettingsPageOptions() {
    assert.ok(
      I.isElementVisible(settingsPageLocators.settings_side_menu_heading),
      'Settings side menu heading is not visible'
    );
    I.reportLog('Settings heading is visible in side menu');
    assert.ok(
      I.isElementVisible(settingsPageLocators.appSettings),
      'App Settings are not visible'
    );
    I.reportLog('App settings option is available on Settings page');
    assert.ok(
      I.isElementVisible(settingsPageLocators.faqs),
      'FAQs are not visible'
    );
    I.reportLog('FAQs option is available on Settings page');
    assert.ok(
      I.isElementVisible(settingsPageLocators.legalAndAboutText),
      'Legal and About is not visible'
    );
    I.reportLog('Legal & About option is available on Settings page');
    // assert.ok(
    //   I.isElementVisible(settingsPageLocators.tv_guide_heading),
    //   'TV guide heading is not visible'
    // );
    // I.reportLog('TV guide section is available on Settings page');
    assert.ok(
      I.isElementVisible(settingsPageLocators.format_options_heading),
      'Format options heading is not visible'
    );
    I.reportLog('Format options section is available on Settings page');
    // assert.ok(
    //   I.isElementVisible(settingsPageLocators.tvGuideFormat),
    //   'TV guide format is not visible'
    // );
    // I.reportLog('TV guide format option is available under TV guide heading');
    assert.ok(
      I.isElementVisible(settingsPageLocators.enable_large_font),
      'Enable large font is not visible'
    );
    I.reportLog('Enable large font option is available under TV guide heading');
    assert.ok(
      I.isElementVisible(settingsPageLocators.enable_large_font_toggle),
      'Enable large font toggle is not visible'
    );
    I.reportLog('Toggle option is available to enable large font size');
    assert.ok(
      I.isElementVisible(settingsPageLocators.enable_large_font_on_off_label),
      'Enable large font on/off label is not visible'
    );
    I.reportLog('Large font ON / OFF indicator is shown');
    assert.ok(
      I.isElementVisible(settingsPageLocators.timeFormat),
      'Time format is not visible'
    );
    I.reportLog('Time format option is available under Format Options');
    assert.ok(
      I.isElementVisible(settingsPageLocators.temperatureFormat),
      'Temperature format is not visible'
    );
    I.reportLog('All Settings options are displayed');
    return true;
  },

  async clickOnAppSettings() {
    await I.waitForElement(settingsPageLocators.appSettings, 10);
    await I.forceClick(settingsPageLocators.appSettings);
    I.reportLog('Clicked on App settings');
  },

  async getCurrentSettingFormat(settingName) {
    let currentSettingLabel;
    switch (settingName.toString().toLowerCase()) {
      case constants.settings.tvGuide:
        currentSettingLabel = await I.grabTextFrom(
          settingsPageLocators.tvGuideFormatLabel
        );
        break;
      case constants.settings.time:
        currentSettingLabel = await I.grabTextFrom(
          settingsPageLocators.time_format_label
        );
        break;
      case constants.settings.temperature:
        await I.waitForElement(
          settingsPageLocators.temperature_format_label,
          10
        );
        currentSettingLabel = await I.grabTextFrom(
          settingsPageLocators.temperature_format_label
        );
        break;
      default:
        I.reportLog(
          'Please enter setting name as tvguide or time or temperature'
        );
        break;
    }
    return currentSettingLabel.toString();
  },

  async switchFormatFrom(currentFormat) {
    let setNewFormat;
    switch (currentFormat.toString()) {
      case constants.tvGuideFormat.classic:
        setNewFormat = constants.tvGuideFormat.modern;
        break;
      case constants.tvGuideFormat.modern:
        setNewFormat = constants.tvGuideFormat.classic;
        break;
      case constants.timeFormat.hour12:
        setNewFormat = constants.timeFormat.hour24;
        break;
      case constants.timeFormat.hour24:
        setNewFormat = constants.timeFormat.hour12;
        break;
      case constants.temperatureFormat.celsius_old:
        setNewFormat = constants.temperatureFormat.fahrenheit_old;
        break;
      case constants.temperatureFormat.fahrenheit_old:
        setNewFormat = constants.temperatureFormat.celsius_old;
        break;
      default:
        I.reportLog('Enter valid value of tvGuide, time or temperature format');
        break;
    }
    return setNewFormat;
  },

  async clickOnSetting(settingName) {
    switch (settingName.toString()) {
      case constants.settings.tvGuide:
        await I.forceClick(settingsPageLocators.tvGuideFormat);
        assert.ok(
          I.isElementVisible(settingsPageLocators.tvGuideFormat),
          'TV guide format is not visible'
        );
        break;
      case constants.settings.time:
        await I.waitForElement(settingsPageLocators.timeFormatTitle);
        await I.click(settingsPageLocators.timeFormatTitle);
        assert.ok(
          I.isElementVisible(settingsPageLocators.timeFormatTitle),
          'Time format is not visible'
        );
        break;
      case constants.settings.temperature:
        await I.forceClick(settingsPageLocators.temperatureFormat);

        assert.ok(
          I.isElementVisible(settingsPageLocators.temperatureFormatTitle),
          'Temperature format is not visible'
        );
        break;
      default:
        I.reportLog('Enter valid format - tvguide, time or temperature');
        break;
    }
  },

  async switchToModernGuide() {
    let tvGuideFormatLabel = await I.grabTextFrom(
      settingsPageLocators.tvGuideFormatLabel
    );
    I.reportLog('TV Guide format is currently set to ' + tvGuideFormatLabel);
    if (tvGuideFormatLabel == constants.tvGuideFormat.classic) {
      await I.forceClick(settingsPageLocators.tvGuideFormat);
      I.reportLog('clicked on TV Guide format');
      assert.ok(
        I.isElementVisible(settingsPageLocators.tvGuideFormat),
        'TV guide format is not visible'
      );
      I.reportLog('Inside TV Guide Format page');
      await I.wait(5);
      await I.forceClick(settingsPageLocators.modernFormat);
      I.reportLog('Switched to Modern TV Guide');
    }
  },

  async setFormatTo(newFormat) {
    switch (newFormat.toString()) {
      case constants.tvGuideFormat.classic:
        await I.forceClick(settingsPageLocators.classicFormat);
        break;
      case constants.tvGuideFormat.modern:
        await I.forceClick(settingsPageLocators.modernFormat);
        break;
      case constants.timeFormat.hour12:
        await I.forceClick(settingsPageLocators.hourFormat12);
        break;
      case constants.timeFormat.hour24:
        await I.forceClick(settingsPageLocators.hourFormat24);
        break;
      case constants.temperatureFormat.celsius:
        await I.forceClick(settingsPageLocators.tempFormatCelsius);
        break;
      case constants.temperatureFormat.fahrenheit:
        await I.forceClick(settingsPageLocators.tempFormatFahrenheit);
        break;
      case constants.temperatureFormat.celsius_old:
        await I.forceClick(settingsPageLocators.tempFormatCelsius);
        break;
      case constants.temperatureFormat.fahrenheit_old:
        await I.forceClick(settingsPageLocators.tempFormatFahrenheit);
        break;
      default:
        I.reportLog('Enter valid value of tvGuide, time or temperature format');
        break;
    }
  },

  async verifySettingFormatChanged(newFormat, currentFormat) {
    assert.ok(
      newFormat === currentFormat.toString(),
      'New format of settings is not same as current format of settings'
    );
    I.reportLog('Format is now set to ' + newFormat + ' as expected');
  },

  async switchToClassicGuide() {
    let tvGuideFormatLabel = await I.grabTextFrom(
      settingsPageLocators.tvGuideFormatLabel
    );
    I.reportLog('TV Guide format is currently set to ' + tvGuideFormatLabel);
    if (tvGuideFormatLabel == constants.tvGuideFormat.modern) {
      await I.forceClick(settingsPageLocators.tvGuideFormat);
      I.reportLog('clicked on TV Guide format');
      assert.ok(
        I.isElementVisible(settingsPageLocators.tvGuideFormat),
        'TV guide format is not visible'
      );
      I.reportLog('Inside TV Guide Format page');
      await I.forceClick(settingsPageLocators.classicFormat);
      I.reportLog('Switched to Classic TV Guide');
    }
  },

  /**
   * Verify and selects Legal and About Settings Page
   * @returns true if Legal and About is visible else false
   */
  async clickOnLegalAbout() {
    let isSelected = false;
    await I.waitForElement(settingsPageLocators.legalAndAbout, 10);
    if (await I.isElementVisible(settingsPageLocators.legalAndAbout)) {
      await I.reportLog(
        'Legal & About option is available on Settings page and user landed on the same'
      );
      await I.forceClick(settingsPageLocators.legalAndAbout);
      await I.reportLog('Clicked on Legal & About');
      isSelected = true;
    } else {
      await I.reportLog(
        'Legal & About option should be available on Settings page'
      );
    }
    return isSelected;
  },

  /**
   *  Verify Legal & About data
   * @returns true id Legal & About data available else false
   */
  async checkElementsOnLegalAbout() {
    await I.wait(5);
    let isVisible = true;
    if (!(await I.isElementVisible(settingsPageLocators.legalTitle))) {
      await I.reportLog('Legal title should be visible');
      isVisible = false;
    }
    if (!(await I.isElementVisible(settingsPageLocators.about))) {
      await I.reportLog(
        'About title should be visible on Legal and About page'
      );
      isVisible = false;
    }
    if (!(await I.isElementVisible(settingsPageLocators.appVersion))) {
      await I.reportLog(
        'App Version should be visible on Legal and About Page under About section'
      );
      isVisible = false;
    }
    if (!(await I.isElementVisible(settingsPageLocators.deviceInformation))) {
      await I.reportLog(
        'Device Information should be visible on Legal and About Page under About section'
      );
      isVisible = false;
    }
    if (!(await I.isElementVisible(settingsPageLocators.contact))) {
      await I.reportLog(
        'Contact should be visible on Legal and About Page under About section'
      );
      isVisible = false;
    }
    if (!(await I.isElementVisible(settingsPageLocators.legalTitle))) {
      await I.reportLog(
        'Legal should be visible on Legal and About Page under About section'
      );
      isVisible = false;
    }
    if (!(await I.isElementVisible(settingsPageLocators.termsOfServiceTitle))) {
      await I.reportLog(
        'Terms of Service should be visible on Legal and About Page under About section'
      );
      isVisible = false;
    }
    if (!(await I.isElementVisible(settingsPageLocators.privacyPolicyTitle))) {
      await I.reportLog(
        'Privacy Policy should be visible on Legal and About Page under About section'
      );
      isVisible = false;
    }
    return isVisible;
  },

  async verifyTimeFormatOnTVGuide(format) {
    await I.wait(10);
    let time = await I.grabTextFrom(settingsPageLocators.displayedTimeInTvGuide);
    let timeFormat = await this.isTimeFormat(time, format);
    return timeFormat;
  },

  async isTimeFormat(date, format) {
    return await this.isValidDate(date, format);
  },

  async isValidDate(date, format) {
    var customParseFormat = require('dayjs/plugin/customParseFormat');
    await dayjs.extend(customParseFormat);
    return dayjs(date, format, true).isValid();
  },

  /*
   * Test case to check the Visibility of FAQs
   */
  async clickOnFAQs() {
    await I.waitForElement(settingsPageLocators.faqs, 10);
    assert.ok(
      await I.isElementVisible(settingsPageLocators.faqs),
      'FAQs are not visible'
    );
    await I.reportLog(
      'FAQs option is available on Settings page and user landed on the same'
    );
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.click(settingsPageLocators.faqs);
    await I.reportLog('Clicked on FAQs');
    await I.waitForElement(settingsPageLocators.faqsTitle, 10)
    return I.isElementVisible(settingsPageLocators.faqsTitle)
  },

  /*
   * Test case to check the Visibility of FAQs contents
   */
  async checkForFAQs() {
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    if(!(await I.isElementVisible(settingsPageLocators.faqsTitle)),
      'Title for FAQs are not visible'
    );
    await I.reportLog('Frequently Asked Questions is visible on FAQs  section');
    if(!(await I.isElementVisible(settingsPageLocators.faqContents)),
      'FAQ contents are not visible'
    );
    await I.reportLog(
      'Frequently Asked Questions contents are visible on FAQs  section'
    );
    return true;
  },

  /**
   * checks for settings format
   */
  async checkFormatSetting(currentFormat, expectFormat, type) {
    if (currentFormat != expectFormat) {
      switch (type) {
        case constants.settings.time:
          await this.clickOnSetting(constants.settings.time);
          break;
        case constants.settings.tvGuide:
          await this.clickOnSetting(constants.settings.tvGuide);
          break;
        case constants.settings.temperature:
          await this.clickOnSetting(constants.settings.temperature);
          break;
        default:
          assert.ok(
            false,
            'Enter valid value of tvGuide, time or temperature format'
          );
      }
      await this.setFormatTo(expectFormat);
    }
    await this.clickOnAppSettings();
  },

  /**
   * verifies the time format
   */
  async verifyFormat(type) {
    await I.reportLog('Value of type = ' + type);
    if (type === settingsPageLocators.hourFormat24) {
      await I.reportLog('Time format is set to 24 hrs');
    }
    if (type === settingsPageLocators.hoursFormat12) {
      await I.reportLog('Time format is set to 12 hrs');
    }
  },

  /**
   * sets time format
   * @param {string} timeFormat
   */
  async setTimeFormat(timeFormat) {
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    await I.click(settingsPageLocators.time_format_label);
    if (timeFormat === constants.timeFormat.hour12) {
      await I.click(settingsPageLocators.hourFormat12);
    } else {
      await I.click(settingsPageLocators.hourFormat24);
    }
  },

  /**
   * verifies time format on sports page
   */
  async verifyTimeFormatOnSportsPage(format) {
    let time = await this.getTimeOnSportPage();
    let timeFormat = await this.isTimeFormat(time, format);
    return timeFormat;
  },

  /**
   * gets time from future programme on sports page
   * @returns time on the sports page
   */
  async getTimeOnSportPage() {
    const timeOnSportPage = await I.grabTextFrom(
      sportsPageLocators.futureProgramTime
    );
    await I.reportLog('Time on SportsPage is ' + timeOnSportPage);
    const timeOnSportPageStr = timeOnSportPage.toString();
    return timeOnSportPageStr;
  },

  /**
   * validates time format
   * @param {*} time as string
   * @param {*} format as string
   * @returns boolean value
   */
  async validateTimeFormat(time, format) {
    let regexExpression;
    if (format === constants.timesFormat.sports24h) {
      regexExpression = new RegExp(
        constants.regularExpressions._24HrsDateTimeExp
      );
    } else {
      await I.reportLog('12 hrs regex');
      regexExpression = new RegExp(
        constants.regularExpressions._12HrsDateTimeExp
      );
    }
    const result = regexExpression.test(time) ? true : false;
    return result;
  },

  /**
   * checks for highlighting setting tab on navbar
   */
  async isSettingTabHighlightedOnNavbar() {
    const colorProp = await I.grabCssPropertyFrom(
      watchPageLocators.settings,
      cssConstants.colorLabel
    );
    const fontProp = await I.grabCssPropertyFrom(
      watchPageLocators.settings,
      cssConstants.fontWeight
    );
    if (
      colorProp.toString() === cssConstants.whiteColor &&
      fontProp.toString() === cssConstants.bold
    ) {
      await I.reportLog('Settings title is White, Bold and Highlighted');
      return true;
    } else {
      await I.reportLog('Settings title is not White, Bold and Highlighted');
      return false;
    }
  },

  /**
   * Verifies font size change
   */
  async verifyChangeFontSize() {
    await I.waitForVisible(settingsPageLocators.toggleFont, 10);
    await this.changeToLargeFont();
    await this.changeToSmallFont();
  },

  /**
   * Changes larger font to small
   */
  async changeToLargeFont() {
    await I.reportLog('Inside changeToLargeFont function');
    await I.reportLog('Font size is set to Small');
    await I.click(settingsPageLocators.toggleFont);
    await I.wait(3);
    const isLargeFont = await I.isElementVisible(
      settingsPageLocators.enableFontToggle
    );
    assert.ok(isLargeFont, 'Font should be changed to Large');
    if (
      isLargeFont &&
      (await I.isElementVisible(settingsPageLocators.largeFontElements))
    ) {
      await I.reportLog(
        'Temperature, TV Guide Format and Time Format has large font size'
      );
    }
    await I.wait(3);
    if (isLargeFont && (await I.isElementVisible(settingsPageLocators.faqs))) {
      await I.click(settingsPageLocators.faqs);
      await I.wait(3);
      if (await I.isElementVisible(settingsPageLocators.largeFAQContent)) {
        await I.reportLog('FAQ contents has large fonts');
      }
      this.clickOnAppSettings();
    }
  },

  /**
   * Changes smaller font to large
   */
  async changeToSmallFont() {
    await I.reportLog('Inside changeToSmallFont function');
    await I.reportLog('Font size is set to Large');
    await I.click(settingsPageLocators.toggleFont);
    await I.wait(3);
    const isSmallFont = await I.isElementVisible(
      settingsPageLocators.disableFontToggle
    );
    assert.ok(isSmallFont, 'Font should be changed to Small');
  },

  /**
   * checks temperature formats
   */
  async checkTempFormats() {
    const tempFormat = settingsPageLocators.temperatureFormat;
    await I.click(tempFormat);
    await I.reportLog('Temp Section = ' + (await I.grabTextFrom(tempFormat)));
    assert.equal(
      constants.temperatureFormat.fahrenheitFormat.toUpperCase(),
      await I.grabTextFrom(settingsPageLocators.fahrenheirWithNotation),
      'Temperature format of Fahrenheit should be in UpperCase'
    );
    assert.equal(
      constants.temperatureFormat.celciusFormat.toUpperCase(),
      await I.grabTextFrom(settingsPageLocators.celciusWithNotation),
      'Temperature format of Celcius should be in UpperCase'
    );
    await this.selectFahrenheit();
    await this.selectCelcius();
  },

  /**
   * selects farenhite temperature format
   */
  async selectFahrenheit() {
    await I.reportLog('Inside function selectFahrenheit');
    await I.click(settingsPageLocators.temperatureFormat);
    await I.wait(3);
    await I.click(settingsPageLocators.fahrenheirWithNotation);
    await this.clickOnAppSettings();
    const tempValue = await I.grabTextFrom(
      settingsPageLocators.tempFormatValue
    );
    assert.equal(
      constants.temperatureFormat.fahrenheit,
      tempValue,
      'Selected temperature format F and displayed format should be same'
    );
  },

  /**
   * selects celcius temperature format
   */
  async selectCelcius() {
    await I.reportLog('Inside function selectCelcius');
    await I.click(settingsPageLocators.temperatureFormat);
    await I.wait(3);
    await I.click(settingsPageLocators.celciusWithNotation);
    await this.clickOnAppSettings();
    const tempValue = await I.grabTextFrom(
      settingsPageLocators.tempFormatValue
    );
    assert.equal(
      constants.temperatureFormat.celsius,
      tempValue,
      'Selected temperature format C and displayed format should be same'
    );
  },

  /**
   * switches tv guide format to Classic
   */
  async switchClassicFormat() {
    await I.click(settingsPageLocators.tvGuideFormat);
    await I.wait(5);
    assert.ok(
      await I.isElementVisible(settingsPageLocators.classicFormat),
      'Classic format should be available'
    );
    await I.click(settingsPageLocators.classicFormat);
    this.clickOnAppSettings();
  },

  /**
   * verifies time format on classic guide
   */
  async verifyTimeFormatOnClassicGuide(timeFormat) {
    this.clickOnAppSettings();
    assert.ok(
      await I.isElementVisible(settingsPageLocators.timeFormatTitle),
      'Time Format shoulbe be available'
    );
    await I.wait(5);
    await I.click(settingsPageLocators.timeFormatTitle);
    if (timeFormat === constants.timeFormat.hour12) {
      await I.click(settingsPageLocators.hourFormat12);
    } else {
      await I.click(settingsPageLocators.hourFormat24);
    }
  },

  /** checks whether App Settings option is visible or not
   * @returns {boolean} - returns true if App Settings option is visible under setting tab
   */
  async isAppSettingsOptionSeen() {
    return await I.isElementVisible(settingsPageLocators.appSettings);
  },

  /**
   * checks TV Guide and Format options sub heading is visible under App Settings option
   * @returns {boolean} - returns true if TV Guide & Format options sub heading visible
   */
  async isSubHeadingsUnderAppSettingsOptionVisible() {
    return (
      // (await this.isTvGuideOptionsHeadingSeen()) &&
      await this.isFormatOptionsHeadingSeen()
    );
  },

  /**
   * checks whether TV Guide Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if TV Guide Options sub heading is visible
   */
  async isTvGuideOptionsHeadingSeen() {
    return await I.isElementVisible(settingsPageLocators.tvGuideOptionsHeading);
  },

  /**
   * checks whether Format Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if Format Options sub heading is visible
   */
  async isFormatOptionsHeadingSeen() {
    return await I.isElementVisible(settingsPageLocators.formatOptionsHeading);
  },

  /**
   * checks whether modern and classic formatting options are visible in TV Guide format option
   * @returns {boolean} - returns true if modern and classic format visible in TV Guide format option
   */
  async verifyOptionsAvailableInTVGuideFormatOption() {
    return (
      (await this.isClassicFormatOptionSeen()) &&
      (await this.isModernFormatOptionSeen())
    );
  },

  /**
   * checks whether classic format option is visible in TV Guide format option
   * @returns {boolean} - returns true if classic format option is visible
   */
  async isClassicFormatOptionSeen() {
    return await I.isElementVisible(settingsPageLocators.classicFormat);
  },

  /**
   * checks whether modern format option is visible in TV Guide format option
   * @returns {boolean} - returns true if modern format option is visible
   */
  async isModernFormatOptionSeen() {
    return await I.isElementVisible(settingsPageLocators.modernFormat);
  },

  /**
   * verifies option available in TIME FORMAT option
   * @returns {boolean} - returns true of 12 hour & 24 hour format options are seen in time format option
   */
  async verifyOptionsAvailableInTimeFormatOption() {
    await I.wait(5);
    return (
      (await this.is12HourFormatOptionSeen()) &&
      (await this.is24HourFormatOptionSeen())
    );
  },

  /**
   * checks whether 12 HOUR FORMAT option is seen in TIME FORMAT option or not.
   * @returns {boolean} - returns true if 12 hour format option is seen in time format option
   */
  async is12HourFormatOptionSeen() {
    let hour12FormatOptionSeen = false;
    if (await I.isElementVisible(settingsPageLocators.hourFormat12)) {
      let optionFormatText = await I.grabTextFrom(
        settingsPageLocators.hourFormat12
      );
      if (optionFormatText.toString() === constants.timeFormat.hour12) {
        hour12FormatOptionSeen = true;
      }
    }
    return hour12FormatOptionSeen;
  },

  /**
   * checks whether 24 HOUR FORMAT option is seen in TIME FORMAT option or not.
   * @returns {boolean} - returns true if 24 hour format option is seen in time format option
   */
  async is24HourFormatOptionSeen() {
    let hour24FormatOptionSeen = false;
    if (await I.isElementVisible(settingsPageLocators.hourFormat24)) {
      let optionFormatText = await I.grabTextFrom(
        settingsPageLocators.hourFormat24
      );
      if (optionFormatText.toString() === constants.timeFormat.hour24) {
        hour24FormatOptionSeen = true;
      }
    }
    return hour24FormatOptionSeen;
  },

  /**
   * Selects the modern guide format
   */
  async clickOnModernGuideFormat() {
    if (await I.isElementVisible(settingsPageLocators.modernFormat)) {
      await I.click(settingsPageLocators.modernFormat);
    } else {
      await I.reportLog('modern format option should be visible');
    }
  },

  /**
   * Selects the classic guide format
   */
  async clickOnClassicGuideFormat() {
    if (await I.isElementVisible(settingsPageLocators.classicFormat)) {
      await I.click(settingsPageLocators.classicFormat);
    } else {
      await I.reportLog('classic format option should be visible');
    }
  },
};
