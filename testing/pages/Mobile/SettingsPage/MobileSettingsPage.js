const assert = require('assert');
const {I, constants} = inject();
const settingsPageLocators = require('./SettingsPageLocators.json');
const homePageLocators = require('../WatchPage/WatchPageLocators.json');
const baseOnStreamSettingsPage = require('../../Browser/SettingsPage/BrowserSettingsPage');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

const isLandscape =
  process.argv[7].replace(/'/g, '') === constants.orientation.landscape;

const moduleCommonFunction = {
  /**
   *  Verify Legal & About data
   * @returns true id Legal & About data available else false
   */
  async checkElementsOnLegalAbout() {
    let isVisible = true;
    if (!(await this.isLegalTitleSeen())) {
      isVisible = false;
      await I.reportLog(
        'settingsPage : checkElementsOnLegalAbout : Legal title should be seen'
      );
    }
    if (!(await this.isTermsOfServiceOptionSeen())) {
      isVisible = false;
      await I.reportLog(
        'settingsPage : checkElementsOnLegalAbout : terms of service option should be seen'
      );
    }
    if (!(await this.isPrivacyPolicyOptionSeen())) {
      isVisible = false;
      await I.reportLog(
        'settingsPage : checkElementsOnLegalAbout : privacy policy option should be seen'
      );
    }
    if (!(await this.isAboutTitleSeen())) {
      isVisible = false;
      await I.reportLog(
        'settingsPage : checkElementsOnLegalAbout : about title should be seen'
      );
    }
    if (!(await this.isAppVersionOptionSeen())) {
      isVisible = false;
      await I.reportLog(
        'settingsPage : checkElementsOnLegalAbout : app version option should be seen'
      );
    }
    return isVisible;
  },

  /**
   * Verify Legal title
   * @returns {boolean} true if visible else false
   */
  async isLegalTitleSeen() {
    return await I.isElementVisible(settingsPageLocators.legalTitle);
  },

  /**
   * Verify Terms Of Service option
   * @returns {boolean} true if visible else false
   */
  async isTermsOfServiceOptionSeen() {
    return await I.isElementVisible(settingsPageLocators.termsOfServiceTitle);
  },

  /**
   * Verify Privacy Policy option
   * @returns {boolean} true if visible else false
   */
  async isPrivacyPolicyOptionSeen() {
    return await I.isElementVisible(settingsPageLocators.privacyPolicyTitle);
  },

  /**
   * Verify About title
   * @returns {boolean} true if visible else false
   */
  async isAboutTitleSeen() {
    return await I.isElementVisible(settingsPageLocators.about);
  },

  /**
   * Verify App Version option
   * @returns {boolean} true if visible else false
   */
  async isAppVersionOptionSeen() {
    return await I.isElementVisible(settingsPageLocators.appVersion);
  },
};

module.exports = isLandscape
  ? {...baseOnStreamSettingsPage, ...moduleCommonFunction}
  : Object.assign(baseOnStreamSettingsPage, {
      /**
       * verifies setting options
       */
      async verifySettingsPageOptions() {
        assert.ok(
          await this.isSettingsHeadingSeen(),
          'Settings title should be visible in setting screen'
        );
        assert.ok(
          await this.isAppSettingsOptionSeen(),
          'App Settings option should be visible in setting screen'
        );
        assert.ok(
          await this.isFaqOptionSeen(),
          'FAQ option should be visible in setting screen'
        );
        assert.ok(
          await this.isLegalAndAboutOptionSeen(),
          'Legal and About option should be visible in setting screen'
        );
      },

      /**
       * checks whether settings title is visible or not under setting tab
       * @returns {boolean} - returns true if setting title is seen under setting tab
       */
      async isSettingsHeadingSeen() {
        return await I.isElementVisible(
          settingsPageLocators.settingsSideMenuHeading
        );
      },

      /**
       * checks whether App Settings option is visible or not
       * @returns {boolean} - returns true if App Settings option is visible under setting tab
       */
      async isAppSettingsOptionSeen() {
        return await I.isElementVisible(settingsPageLocators.appSettings);
      },

      /**
       * checks whether FAQ option is visible or not
       * @returns {boolean} - returns true if FAQ option is visible
       */
      async isFaqOptionSeen() {
        return await I.isElementVisible(settingsPageLocators.faqs);
      },

      /**
       * checks whether Legal & About option is visible or not
       * @returns {boolean} - returns true if Legal & About option is visible
       */
      async isLegalAndAboutOptionSeen() {
        return await I.isElementVisible(settingsPageLocators.legalAndAboutText);
      },

      /**
       * clicks on App Settings option
       */
      async clickOnAppSettings() {
        await I.click(settingsPageLocators.appSettings);
        await I.reportLog('Clicked on App settings');
      },

      /**
       * checks whether TV Guide Options sub heading is visible or not under App Settings option
       * @returns {boolean} - returns true if TV Guide Options sub heading is visible
       */
      async isTvGuideOptionsHeadingSeen() {
        return await I.isElementVisible(
          settingsPageLocators.tvGuideOptionsHeading
        );
      },

      /**
       * checks whether Format Options sub heading is visible or not under App Settings option
       * @returns {boolean} - returns true if Format Options sub heading is visible
       */
      async isFormatOptionsHeadingSeen() {
        return await I.isElementVisible(
          settingsPageLocators.formatOptionsHeading
        );
      },

      /**
       * checks TV Guide and Format options sub heading is visible under App Settings option
       * @returns {boolean} - returns true if TV Guide & Format options sub heading visible
       */
      async isSubHeadingsUnderAppSettingsOptionVisible() {
        return (
          (await this.isTvGuideOptionsHeadingSeen()) &&
          (await this.isFormatOptionsHeadingSeen())
        );
      },

      /**
       * clicks on setting option
       * @param {string} settingName - setting options eg: tvguide, time, temperature etc.
       */
      async clickOnSetting(settingName) {
        switch (settingName) {
          case constants.settings.tvGuide:
            await I.click(settingsPageLocators.tvGuideFormat);
            assert.ok(
              await I.isElementVisible(
                settingsPageLocators.tvGuideFormatTitleMobile
              ),
              'TV guide format title is not visible'
            );
            break;
          case constants.settings.time:
            await I.wait(3);
            await I.click(settingsPageLocators.timeFormat);
            assert.ok(
              await I.isElementVisible(settingsPageLocators.timeFormatTitle),
              'Time format title is not visible'
            );
            break;
          case constants.settings.temperature:
            await I.click(settingsPageLocators.temperatureFormat);
            assert.ok(
              await I.isElementVisible(
                settingsPageLocators.temperatureFormatTitle
              ),
              'Temperature format title is not visible'
            );
            break;
          default:
            I.reportLog('Enter valid format - tvguide, time or temperature');
            break;
        }
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
       * checks whether 12 HOUR FORMAT option is seen in TIME FORMAT option or not.
       * @returns {boolean} - returns true if 12 hour format option is seen in time format option
       */
      async is12HourFormatOptionSeen() {
        let hour12FormatOptionSeen = false;
        if (await I.isElementVisible(settingsPageLocators.hourFormat12)) {
          let optionFormatText = await I.grabTextFrom(
            settingsPageLocators.hourFormat12
          );
          if (optionFormatText === constants.timeFormat.hour12) {
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
          if (optionFormatText === constants.timeFormat.hour24) {
            hour24FormatOptionSeen = true;
          }
        }
        return hour24FormatOptionSeen;
      },

      /**
       * verifies option available in TIME FORMAT option
       * @returns {boolean} - returns true of 12 hour & 24 hour format options are seen in time format option
       */
      async verifyOptionsAvailableInTimeFormatOption() {
        return (
          (await this.is12HourFormatOptionSeen()) &&
          (await this.is24HourFormatOptionSeen())
        );
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
       * checks whether setting tab is highlighted on Navbar or not
       * @returns {boolean} - returns true if setting tab is highlighted
       */
      async isSettingTabHighlightedOnNavbar() {
        let settingTabHighlighted = false;
        let settingTabVisible = await I.isElementVisible(
          homePageLocators.settings
        );
        if (settingTabVisible) {
          let colorPropertyOfSettingTab = await I.grabCssPropertyFrom(
            homePageLocators.settings,
            'color'
          );
          if (
            colorPropertyOfSettingTab.toString() === constants.highlightedText
          ) {
            settingTabHighlighted = true;
          }
        } else {
          await I.reportLog(
            'BaseOnStreamMobileSettingsPage: isSettingTitleHighlightedOnNavbar : Setting tab should be visible'
          );
        }
        return settingTabHighlighted;
      },

      /**
       * Verify device information option
       * @returns {boolean} true if visible else false
       */
      async isDeviceInformationSeen() {
        return await I.isElementVisible(settingsPageLocators.deviceInformation);
      },

      /**
       * Verify contact option
       * @returns {boolean} true if visible else false
       */
      async isContactSeen() {
        return await I.isElementVisible(settingsPageLocators.contact);
      },

      /**
       * wait for settings tab to load
       */

      async waitForSettingTabToLoad() {
        await I.waitForVisible(
          settingsPageLocators.settingsSideMenuHeading,
          testExecutionWaits.WAIT_FOR_TAB_LOAD
        );
      },

      /**
       * Switch to modern guide format in portrait mode
       */
      async switchToModernGuide() {
        await I.waitForVisible(
          settingsPageLocators.appSettings,
          testExecutionWaits.WAIT_FOR_TAB_LOAD
        );
        if (await this.isAppSettingsOptionSeen()) {
          await this.clickOnAppSettings();
          await this.clickOnSetting(constants.settings.tvGuide);
          if (await this.isModernFormatOptionSeen()) {
            await I.click(settingsPageLocators.modernFormat);
          } else {
            assert.fail('Modern format option should be visible');
          }
        } else {
          assert.fail('App settings option should be visible');
        }
      },

      /**
       * Switch to classic guide format in portrait mode
       */
      async switchToClassicGuide() {
        let orientation = await I.getOrientation();
        if (orientation === constants.orientation.portrait) {
          await this.waitForSettingTabToLoad();
          if (await this.isAppSettingsOptionSeen()) {
            await this.clickOnAppSettings();
            await this.clickOnSetting(constants.settings.tvGuide);
            if (await this.isClassicFormatOptionSeen()) {
              await I.click(settingsPageLocators.classicFormat);
            } else {
              assert.fail('Classic format option should be visible');
            }
          } else {
            assert.fail('App settings option should be visible');
          }
        }
      },

      /**
       * gets current setting format
       * @param {string} settingName eg: tvguide, temperature etc.
       * @returns {string} - returns current setting format.
       */
      async getCurrentSettingFormat(settingName) {
        let currentSettingLabel;
        switch (settingName.toLowerCase()) {
          case constants.settings.tvGuide:
            currentSettingLabel = await this.getCurrentSettingFormatOfTVGuide();
            break;
          case constants.settings.time:
            currentSettingLabel = await this.getCurrentSettingFormatOfTime();
            break;
          case constants.settings.temperature:
            currentSettingLabel = await this.getCurrentSettingFormatOfTemperature();
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
       * gets current format of tvGuide.
       * @returns {string} - returns current setting format of tvGuide.
       */
      async getCurrentSettingFormatOfTVGuide() {
        await this.clickOnSetting(constants.settings.tvGuide);
        let currentFormat = await I.grabTextFrom(
          settingsPageLocators.formatLabelInPortraitMode
        );
        return currentFormat;
      },

      /**
       * gets current format of time.
       * @returns {string} - returns current setting format of time.
       */
      async getCurrentSettingFormatOfTime() {
        await this.clickOnSetting(constants.settings.time);
        let currentFormat = await I.grabTextFrom(
          settingsPageLocators.formatLabelInPortraitMode
        );
        return currentFormat;
      },

      /**
       * gets current format of temperature.
       * @returns {string} - returns current setting format of temperature
       */
      async getCurrentSettingFormatOfTemperature() {
        await this.clickOnSetting(constants.settings.temperature);
        let currentFormat = await I.grabTextFrom(
          settingsPageLocators.formatLabelInPortraitMode
        );
        return currentFormat.slice(-3, -1);
      },

      /**
       * clicks on back arrow icon
       */
      async goBack() {
        await I.click(settingsPageLocators.backArrowIcon);
        await I.waitForVisible(
          settingsPageLocators.appSettings,
          testExecutionWaits.WAIT_FOR_TAB_LOAD
        );
      },
      ...moduleCommonFunction,
    });
