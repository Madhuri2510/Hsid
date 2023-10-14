const assert = require('assert');
const {I, constants} = inject();
const settingsPageLocators = require('./SettingsPageLocators.json');
const watchPageLocators = require('../WatchPage/WatchPageLocators.json');
const dayjs = require('dayjs');

module.exports = {
  constants,
  /**
   * Method to validate all the Seetings options are displayed correctly in Settings page
   * @returns boolean:'true' if all settings options are displayed correctly
   */
  async verifySettingsPageOptions() {
    assert.ok(
      I.isElementVisible(settingsPageLocators.settings_side_menu_heading),
      'Side menu heading is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.app_settings),
      'App settings are not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.faqs),
      'FAQs are not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.legal_and_about),
      'Legal and About is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.tv_guide_heading),
      'TV guide heading is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.format_options_heading),
      'Format options heading is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.tv_guide_format),
      'TV guide format is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.enable_large_font),
      'Enable large font option is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.enable_large_font_toggle),
      'Enable large font toggle button is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.enable_large_font_on_off_label),
      'Enable large font on/off label is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.time_format),
      'Time format is not visible'
    );
    assert.ok(
      I.isElementVisible(settingsPageLocators.temperature_format),
      'Temperature format is not visible'
    );
    I.reportLog('All Settings options are displayed');
    return true;
  },
  /**
   * Method to click on App Settings in Settings Page
   */
  async clickOnAppSettings() {
    await I.dpadDown();
    if (await I.isFocused(settingsPageLocators.faqs)) {
      await I.dpadUp();
    } else if (await I.isFocused(settingsPageLocators.legal_and_about)) {
      await I.dpadUp(2);
    } else {
      let counter = 1;
      while (
        (await I.isFocused(settingsPageLocators.app_settings)) === false &&
        counter < 6
      ) {
        await I.dpadLeft();
        counter++;
      }
    }
    await I.dpadOK();
  },
  /**
   * Method to retreive the current setting format from Time and Temperature
   * @param {string} settingName
   */
  async getCurrentSettingFormat(settingName) {
    let currentSettingLabel;
    switch (settingName.toLowerCase()) {
      case constants.settings.time:
        currentSettingLabel = await I.grabTextFrom(
          settingsPageLocators.time_format_label
        );
        break;
      case constants.settings.temperature:
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
    return currentSettingLabel;
  },
  /**
   * Method to switch the current settings format 12 to 24 hr, celsius to Fahreheit or vice versa
   * @param {string} currentFormat
   */
  async switchFormatFrom(currentFormat) {
    let setNewFormat;
    switch (currentFormat) {
      case constants.timeFormat.hour12:
        setNewFormat = constants.timeFormat.hour24;
        break;
      case constants.timeFormat.hour24:
        setNewFormat = constants.timeFormat.hour12;
        break;
      case constants.temperatureFormatFireTv.celsius:
        setNewFormat = constants.temperatureFormatFireTv.fahrenheit;
        break;
      case constants.temperatureFormatFireTv.fahrenheit:
        setNewFormat = constants.temperatureFormatFireTv.celsius;
        break;
      default:
        I.reportLog('Enter valid value of tvGuide, time or temperature format');
        break;
    }
    return setNewFormat;
  },
  /**
   * Method to click on Time and Temperature Settings
   * @param {string} settingName
   */
  async clickOnSetting(settingName) {
    switch (settingName) {
      case constants.settings.time:
        await I.dpadRight();
        let counter = 0;
        while (
          (await I.isFocused(settingsPageLocators.time_format)) === false &&
          counter < 4
        ) {
          await I.dpadDown();
          counter++;
        }
        await I.dpadOK();
        assert.ok(
          I.isElementVisible(settingsPageLocators.time_format_title),
          'Time format title is not visible'
        );
        break;
      case constants.settings.temperature:
        await I.dpadRight();
        await I.dpadDown(2);
        await I.dpadOK();
        assert.ok(
          I.isElementVisible(settingsPageLocators.temperature_format_title),
          'Temperature format title is not visible'
        );
        break;
      default:
        I.reportLog('Enter valid format - tvguide, time or temperature');
        break;
    }
  },
  /**
   * Method to change the current seetings format to new one dependening the parameter passed.
   * @param {string} newFormat
   */
  async setFormatTo(newFormat) {
    switch (newFormat) {
      case constants.timeFormat.hour12:
        while (
          (await I.isFocused(settingsPageLocators.hour_format_12)) === false
        ) {
          await I.dpadUp();
        }
        break;
      case constants.timeFormat.hour24:
        while (
          (await I.isFocused(settingsPageLocators.hour_format_24)) === false
        ) {
          await I.dpadDown();
        }
        break;
      case constants.temperatureFormatFireTv.celsius:
        while (
          (await I.isFocused(settingsPageLocators.temp_format_celsius)) ===
          false
        ) {
          await I.dpadDown();
        }
        break;
      case constants.temperatureFormatFireTv.fahrenheit:
        while (
          (await I.isFocused(settingsPageLocators.temp_format_fahrenheit)) ===
          false
        ) {
          await I.dpadUp();
        }
        break;
      default:
        I.reportLog('Enter valid value of tvGuide, time or temperature format');
        break;
    }
    await I.dpadOK();
  },

  async clickOnFAQs() {
    assert.ok(
      await I.isElementVisible(settingsPageLocators.faqs),
      'FAQs are not visible'
    );
    I.reportLog(
      'FAQs option is available on Settings page and user landed on the same'
    );
    while (!(await I.isFocused(settingsPageLocators.faqs))) {
      await I.dpadDown();
    }
    let isFAQFocused = await I.isFocused(settingsPageLocators.faqs);
    await I.dpadOK();
    I.reportLog('Clicked on FAQs');
    await I.wait(2);
    return isFAQFocused;
  },

  async checkForFAQs() {
    if (!(await I.isElementVisible(settingsPageLocators.faqsLabel))) {
      I.reportLog('FAQs label should be visible');
    }
    I.reportLog('Frequently Asked Questions Title is visible on FAQs  section');
    await I.dpadDown(6);
    if (!(await I.isElementVisible(settingsPageLocators.faqsContents))) {
      I.reportLog('FAQs contents are not visible');
    }
    I.reportLog(
      'Frequently Asked Questions contents are visible on FAQs  section'
    );
    return true;
  },

  /**
   * Verify Legal & About is visible
   * @returns true if Legal&About tab is visible else false
   */
  async isLegalAndAboutVisible() {
    let isVisible = false;
    while (!(await I.isFocused(settingsPageLocators.legal_and_about))) {
      await I.dpadDown();
    }
    if (await I.isFocused(settingsPageLocators.legal_and_about)) {
      isVisible = true;
    }
    return isVisible;
  },
  /**
   * Verify Legal & About data
   * @returns true id Legal & About data available else false
   */
  async isLegalAndAboutContentVisible() {
    let isVisible = true;
    // Verifying Terms Of Services
    if (
      !(await I.isElementVisible(settingsPageLocators.termsOfServiceContainer))
    ) {
      I.reportLog('TermsOfService should be visible');
      isVisible = false;
    }
    // Verifying Privacy Policy
    if (
      !(await I.isElementVisible(settingsPageLocators.privacyPolicyContainer))
    ) {
      I.reportLog('TermsOfService should be visible');
      isVisible = false;
    }
    // Verifying About
    if (!(await I.isElementVisible(settingsPageLocators.about))) {
      I.reportLog('TermsOfService should be visible');
      isVisible = false;
    }
    // Verifying App Version
    if (
      !(await I.isElementVisible(settingsPageLocators.appVersionHeader)) &&
      !(await I.isElementVisible(settingsPageLocators.appVersion))
    ) {
      I.reportLog('TermsOfService should be visible');
      isVisible = false;
    }
    // Verifying Device Information
    if (
      !(await I.isElementVisible(
        settingsPageLocators.deviceInformationHeader
      )) &&
      !(await I.isElementVisible(settingsPageLocators.deviceInformation))
    ) {
      I.reportLog('TermsOfService should be visible');
      isVisible = false;
    }
    // Verifying Contact
    if (
      !(await I.isElementVisible(settingsPageLocators.contactHeader)) &&
      !(await I.isElementVisible(settingsPageLocators.contact))
    ) {
      I.reportLog('TermsOfService should be visible');
      isVisible = false;
    }
    return isVisible;
  },

  /**
   * verify Legal&About tab is visible
   * @returns true if Legal&About tab is visible else false
   */
  async clickOnLegalAbout() {
    let isSelect = false;
    if (await this.isLegalAndAboutVisible()) {
      await I.dpadOK();
      isSelect = true;
    } else {
      I.reportLog('Legal&About should be visible');
    }
    return isSelect;
  },

  /**
   * verify  Legal & About data
   * @returns true if Legal & About data is visible else false
   */
  async checkElementsOnLegalAbout() {
    let isVisible = false;
    if (this.isLegalAndAboutContentVisible()) {
      isVisible = true;
    } else {
      I.reportLog('Legal&About content should be visible');
    }
    return isVisible;
  },

  /**
   * Verify & selects TermsOfService tab
   * @returns true if TermsOfService tab visible else false
   */
  async selectTermsOfService() {
    let isSelect = false;
    await I.dpadOK();
    await I.dpadRight();
    // Verifying Terms Of Services
    if (await I.isFocused(settingsPageLocators.termsOfServiceContainer)) {
      await I.dpadOK();
      isSelect = true;
      I.reportLog('Terms Of Services should be visible');
    }
    return isSelect;
  },

  /**
   * Verify data (header & paragraph)
   * @returns true if data visible
   */
  async verifyData() {
    let isVisible = true;
    // Verifying header & paragraph
    if (
      !(await I.isElementVisible(settingsPageLocators.header)) &&
      !(await I.isElementVisible(settingsPageLocators.paragraph))
    ) {
      I.reportLog('Terms Of Service Data should be visible');
      isVisible = false;
    }
    return isVisible;
  },

  /**
   * Verify & Select PrivacyPolicy tab
   * @returns true if PrivacyPolicy tab visible else false
   */
  async selectPrivacyPolicy() {
    let isSelect = false;
    await I.dpadOK();
    await I.dpadRight();
    await I.dpadDown();
    // Verifying Terms Of Services
    if (await I.isFocused(settingsPageLocators.privacyPolicyContainer)) {
      await I.dpadOK();
      isSelect = true;
      I.reportLog('Privacy Policy should be visible');
    }
    return isSelect;
  },

  /** checks whether App Settings option is visible or not
   * @returns {boolean} - returns true if App Settings option is visible under setting tab
   */
  async isAppSettingsOptionSeen() {
    return await I.isElementVisible(settingsPageLocators.app_settings);
  },
  /**
   * checks TV Guide and Format options sub heading is visible under App Settings option
   * @returns {boolean} - returns true if TV Guide & Format options sub heading visible
   */
  async isSubHeadingsUnderAppSettingsOptionVisible() {
    return (
      (await this.isEnableLargeFontSizeOptionsHeadingSeen()) &&
      (await this.isTimeFormatOptionsHeadingSeen()) &&
      (await this.isTemperatureFormatOptionsHeadingSeen())
    );
  },
  /**
   * checks whether TV Guide Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if TV Guide Options sub heading is visible
   */
  async isTvGuideFormatOptionsHeadingSeen() {
    return await I.isElementVisible(settingsPageLocators.tv_guide_format);
  },

  /**
   * checks whether font size Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if Format Options sub heading is visible
   */
  async isEnableLargeFontSizeOptionsHeadingSeen() {
    return await I.isElementVisible(settingsPageLocators.enable_large_font);
  },

  /**
   * checks whether time format Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if Format Options sub heading is visible
   */
  async isTimeFormatOptionsHeadingSeen() {
    return await I.isElementVisible(settingsPageLocators.time_format);
  },
  /**
   * checks whether temperature format Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if Format Options sub heading is visible
   */
  async isTemperatureFormatOptionsHeadingSeen() {
    return await I.isElementVisible(settingsPageLocators.temperature_format);
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
    return await I.isVisible(settingsPageLocators.hour_format_12);
  },

  /**
   * checks whether 24 HOUR FORMAT option is seen in TIME FORMAT option or not.
   * @returns {boolean} - returns true if 24 hour format option is seen in time format option
   */
  async is24HourFormatOptionSeen() {
    return await I.isVisible(settingsPageLocators.hour_format_24);
  },
  /**
   * navigates back to previous screen
   */
  async goBack() {
    await I.dpadBack();
  },
  async setTimeFormat(timeFormat) {
    //let timeFormatLocator = settingsPageLocators.format;
    //timeFormatLocator.elementData[0].value = timeFormat;
    if (await I.isElementVisible(settingsPageLocators.time_format)) {
      await this.clickOnSetting(constants.settings.time);
      switch (timeFormat) {
        case constants.timeFormat.hour12:
          while (
            (await I.isFocused(settingsPageLocators.hour_format_12)) === false
          ) {
            await I.dpadUp();
          }
          break;
        case constants.timeFormat.hour24:
          while (!(await I.isFocused(settingsPageLocators.hour_format_24))) {
            await I.dpadDown();
          }
          break;
        default:
          assert.ok(false, 'Enter valid format - time');
      }
      await I.dpadOK();
    }
  },
  /**
   * Method to verify the Time Format On TV Guide
   * @returns boolean: "true" if time form displayed on TV Guide is same as that of parameter passed
   */
  async verifyTimeFormatOnTVGuide(format) {
    await I.wait(10);
    let time = await I.grabAttributeFrom(
      settingsPageLocators.displayed_time,
      'text'
    );
    let timeFormat = await this.isTimeFormat(time[0], format);
    return timeFormat;
  },
  /**
   * check date time format
   * @returns boolean: "true" if date time format is same as format expected, "false" if not
   */
  async isValidDate(date, format) {
    var customParseFormat = require('dayjs/plugin/customParseFormat');
    await dayjs.extend(customParseFormat);
    return dayjs(date, format, true).isValid();
  },
  /**
   * check Time Format
   * @returns boolean: "true" if time format is same as format expected, "false" if not
   */
  async isTimeFormat(date, format) {
    return await this.isValidDate(date, format);
  },
  /**
   * check Time Format on Sports Page
   * @returns boolean: "true" if time format is same as format expected, "false" if not
   */
  async verifyTimeFormatOnSportsPage(format) {
    let time = await this.getTimeOnSportPage();
    let timeFormat = await this.isTimeFormat(time, format);
    return timeFormat;
  },
  /**
   * Get Time on Sports Page
   * @returns text: Time on Sports Page
   */
  async getTimeOnSportPage() {
    let timeOnSportPage;
    let scheduleText = await I.grabTextFrom(settingsPageLocators.scheduleText);
    timeOnSportPage = scheduleText
      .slice(scheduleText.indexOf('@') + 1, scheduleText.indexOf('\n'))
      .trim();
    return timeOnSportPage;
  },

  /**
   * Verifies font size change
   */
  async verifyChangeFontSize() {
    if (this.isEnableLargeFontSizeOptionsHeadingSeen()) {
      await this.changeToLargeFont();
      await this.clickOnAppSettings();
      await this.changeToSmallFont();
    }
  },

  /**
   * Changes small font to large
   */
  async changeToLargeFont() {
    let iteration = 0;
    await I.dpadRight();
    while (
      !(await I.isFocused(settingsPageLocators.enable_large_font)) &&
      iteration <= 6
    ) {
      await I.dpadDown();
      iteration++;
    }
    let enableLargeFontSizeToggleButtonState = await I.grabTextFrom(
      settingsPageLocators.enable_large_font_on_off_label
    );
    await I.reportLog('Inside changeToLargeFont function');
    if (enableLargeFontSizeToggleButtonState === constants.largeFontSize.off) {
      await I.reportLog('Font size is set to Small...Toggling font size');
      await I.dpadOK();
      enableLargeFontSizeToggleButtonState = await I.grabTextFrom(
        settingsPageLocators.enable_large_font_on_off_label
      );
      if (enableLargeFontSizeToggleButtonState === constants.largeFontSize.on) {
        await I.reportLog('Font size is set to Large');
      }
    } else if (
      enableLargeFontSizeToggleButtonState === constants.largeFontSize.on
    ) {
      await I.reportLog('Font size is already set to Large');
    }
  },

  /**
   * Changes large font to small
   */
  async changeToSmallFont() {
    await I.dpadRight();
    let iteration = 0;
    while (
      !(await I.isFocused(settingsPageLocators.enable_large_font)) &&
      iteration <= 6
    ) {
      await I.dpadDown();
      iteration++;
    }
    let enableLargeFontSizeToggleButtonState = await I.grabTextFrom(
      settingsPageLocators.enable_large_font_on_off_label
    );
    await I.reportLog('Inside changeToLargeFont function');
    if (enableLargeFontSizeToggleButtonState === constants.largeFontSize.on) {
      await I.reportLog('Font size is set to Large...Toggling font size');
      await I.dpadOK();
      enableLargeFontSizeToggleButtonState = await I.grabTextFrom(
        settingsPageLocators.enable_large_font_on_off_label
      );
      if (
        enableLargeFontSizeToggleButtonState === constants.largeFontSize.off
      ) {
        await I.reportLog('Font size is set to Small');
      }
    } else if (
      enableLargeFontSizeToggleButtonState === constants.largeFontSize.off
    ) {
      await I.reportLog('Font size is already set to Small');
    }
  },
  /**
   * checks whether font size Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if Format Options sub heading is visible
   */
  async isEnableLargeFontSizeOptionsHeadingSeen() {
    return await I.isElementVisible(settingsPageLocators.enable_large_font);
  },
  /**
   * checks the format settings
   * @returns {boolean} - returns true if Format Options are correct
   */
  async checkFormatSetting(currentFormat, expectFormat, type) {
    if (currentFormat !== expectFormat) {
      if (constants.settings.time === type) {
        await this.selectAppSettingsSubTabs(constants.settings.time);
      }
      if (constants.settings.tvGuide === type) {
        await this.selectAppSettingsSubTabs(
          constants.settings.tvGuide,
          expectFormat
        );
      }
      if (constants.settings.temperature === type) {
        await this.selectAppSettingsSubTabs(constants.settings.temperature);
      }
      await this.setFormatTo(expectFormat);
    }
    await this.clickOnAppSettings();
  },
  /**
   * checks the  Apps Settings Time Format
   * @returns {boolean} - returns true if Format Options are correct
   */
  async selectAppSettingsSubTabs(tabName, expectFormat) {
    let timeFormatIs;
    let iteration = 0;
    if (tabName !== undefined || tabName !== null) {
      // Select Tv Guide Format Tab
      if (constants.settings.tvGuide === tabName) {
        if (await I.isElementVisible(settingsPageLocators.tv_guide_heading)) {
          await I.dpadRight();
          await I.dpadOK();
        } else {
          assert.fail(`${tabName}, tab not visible to select`);
        }
      }
      // Select Time Format Tab
      if (constants.settings.time === tabName) {
        if (await I.isElementVisible(settingsPageLocators.time_format_title)) {
          await I.dpadRight();
          while (
            (await I.isElementVisible(
              settingsPageLocators.time_format_title
            )) &&
            iteration < 6
          ) {
            await I.dpadDown();
            iteration++;
            if (await I.isFocused(settingsPageLocators.time_format_title)) {
              await I.dpadOK();
              if (await this.verifyOptionsAvailableInTimeFormatOption()) {
                if (expectFormat === constants.timeFormat.hour24) {
                  timeFormatIs = settingsPageLocators.hour_format_24;
                } else {
                  timeFormatIs = settingsPageLocators.hour_format_12;
                }
                if (await I.isFocused(timeFormatIs)) {
                  await I.dpadOK();
                  iteration = 0;
                }
              } else {
                assert.fail(
                  'Time format 12 & 24 hours options should be visible to select'
                );
              }
            }
          }
        } else {
          assert.fail(`${tabName}, tab not visible to select`);
        }
      }
      // Select Temperature Format Tab await I.isElementFocused(constants.formatOptions.temperature)
      if (constants.settings.temperature === tabName) {
        if (
          await I.isElementVisible(
            settingsPageLocators.temperature_format_title
          )
        ) {
          await I.dpadRight();
          while (
            !(await I.isFocused(
              settingsPageLocators.temperature_format_title
            )) &&
            iteration < 6
          ) {
            await I.dpadDown();
            iteration++;
            if (
              await I.isFocused(settingsPageLocators.temperature_format_title)
            ) {
              await I.dpadOK();
              iteration = 0;
            }
          }
          if (
            await I.isElementVisible(
              settingsPageLocators.temperature_format_title
            )
          ) {
            I.reportLog('Temperature Format is visible to select');
          } else {
            assert.fail('Temperature Format should be visible to select');
          }
          await I.dpadOK();
        } else {
          assert.fail(`${tabName}, tab not visible to select`);
        }
      }
    } else {
      assert.fail(
        `Enter valid APP Settings tab to select, where tab name should not be empty ${tabName}`
      );
    }
  },
  /**
   * checks the format of Time
   */
  async verifyFormat(type) {
    let time = await I.grabTextFrom(settingsPageLocators.displayed_time);
    let timeFormat = await this.isTimeFormat(time, format);
    assert.ok(timeFormat, 'Time lane on  displayed wrong format');
  },
};
