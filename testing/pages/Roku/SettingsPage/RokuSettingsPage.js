const assert = require('assert');
const {I, constants} = inject();
const settingsPageLocators = require('./SettingsPageLocators.json');
const logger = require('../../../utils/LogUtils').getLogger('RokuSettingsPage');
const testExecutionWaits = require('../../../config/onStreamTestExecutionWaits');

module.exports = {
  constants,
  async switchToClassicGuide() {
    await this.clickOnAppSettings();
    if (!(await I.isVisible(settingsPageLocators.classicText))) {
      await I.dpadNavByEcp(constants.remoteKey.right);
      await I.pressKeys([constants.remoteKey.ok, constants.remoteKey.down]);
      let focusedElement = await I.isElementFocused(
        constants.tvGuideFormat.classic
      );
      assert.ok(focusedElement, 'classic guide is not focused');
      await I.dpadNavByEcp(constants.remoteKey.ok);
    }
  },

  async clickOnAppSettings() {
    let focussedElementText = await I.getText(await I.getFocusedElement(0));
    if (focussedElementText === constants.navigationMenu.settings) {
      while (
        !(await I.isElementFocused(constants.settingsOptions.appSettings))
      ) {
        await I.dpadNavByEcp(constants.remoteKey.down);
      }
      await I.dpadNavByEcp(constants.remoteKey.ok);
    } else if (focussedElementText === constants.settingsOptions.appSettings) {
      await I.dpadNavByEcp(constants.remoteKey.ok);
    } else if (
      focussedElementText === constants.settingsOptions.faqs ||
      focussedElementText === constants.settingsOptions.legalAndAbout
    ) {
      while (
        !(await I.isElementFocused(constants.settingsOptions.appSettings))
      ) {
        await I.dpadNavByEcp(constants.remoteKey.up);
      }
      await I.dpadNavByEcp(constants.remoteKey.ok);
    } else if (
      focussedElementText ===
        constants.settingsSubHeadings.appSettings.tvGuideFormat ||
      focussedElementText ===
        constants.settingsSubHeadings.appSettings.enableLargeFontSize ||
      focussedElementText ===
        constants.settingsSubHeadings.appSettings.timeFormat ||
      focussedElementText ===
        constants.settingsSubHeadings.appSettings.temperatureFormat ||
      focussedElementText ===
        constants.settingsSubHeadings.legalAndAbout.legalAndAbout ||
      focussedElementText ===
        constants.settingsSubHeadings.legalAndAbout.privacyPolicy ||
      focussedElementText === constants.tvGuideFormat.classic ||
      focussedElementText === constants.tvGuideFormat.modern ||
      focussedElementText === constants.timeFormat.hour12 ||
      focussedElementText === constants.timeFormat.hour24 ||
      focussedElementText === constants.temperatureFormatRoku.fahrenheit ||
      focussedElementText === constants.temperatureFormatRoku.celsius
    ) {
      await I.dpadNavByEcp(constants.remoteKey.left);
      while (
        !(await I.isElementFocused(constants.settingsOptions.appSettings))
      ) {
        await I.dpadNavByEcp(constants.remoteKey.up);
      }
      await I.dpadNavByEcp(constants.remoteKey.ok);
    }
  },

  async switchToModernGuide() {
    if (!(await I.isVisible(settingsPageLocators.modernText))) {
      await this.clickOnAppSettings();
      await I.dpadNavByEcp(constants.remoteKey.right);
      await I.dpadNavByEcp(constants.remoteKey.ok);
      if ((await I.isElementFocused(constants.tvGuideFormat.classic)) == true) {
        await I.dpadNavByEcp(constants.remoteKey.up);
      }
      let focusedElement = await I.isElementFocused(
        constants.tvGuideFormat.modern
      );
      assert.ok(focusedElement, 'modern guide is not focused');
      await I.dpadNavByEcp(constants.remoteKey.ok);
    }
  },

  async verifySettingsPageOptions() {
    await this.clickOnAppSettings();
    let appSettingsOption = await I.isVisible(settingsPageLocators.appSettings);
    assert.ok(
      appSettingsOption,
      'App settings option is not available on Settings page'
    );
    let faqsOption = await I.isVisible(settingsPageLocators.faqs);
    assert.ok(faqsOption, 'FAQs option is not available on Settings page');
    let legalAboutOption = await I.isVisible(
      settingsPageLocators.legalAndAbout
    );
    assert.ok(
      legalAboutOption,
      'Legal & About option is not available on Settings page'
    );
    let timeFormatOption = await I.isVisible(settingsPageLocators.timeFormat);
    assert.ok(
      timeFormatOption,
      'Time format option is not available on Settings page'
    );
    let temperatureFormatOption = await I.isVisible(
      settingsPageLocators.temperatureFormat
    );
    assert.ok(
      temperatureFormatOption,
      'Temperature format option is not available on Settings page'
    );
    return true;
  },

  async getCurrentSettingFormat(settingName) {
    let currentSettingLabel;
    switch (settingName.toLowerCase()) {
      case constants.settings.tvGuide:
        if (await I.isVisible(settingsPageLocators.classicFormat)) {
          currentSettingLabel = constants.tvGuideFormat.classic;
        } else {
          currentSettingLabel = constants.tvGuideFormat.modern;
        }
        break;
      case constants.settings.time:
        if (await I.isVisible(settingsPageLocators.time12hFormat)) {
          currentSettingLabel = constants.timeFormat.hour12;
        } else {
          currentSettingLabel = constants.timeFormat.hour24;
        }
        break;
      case constants.settings.temperature:
        if (
          await I.isVisible(settingsPageLocators.temperatureFahrenheitFormat)
        ) {
          currentSettingLabel = constants.temperatureFormatRoku.fahrenheit;
        } else {
          currentSettingLabel = constants.temperatureFormatRoku.celsius;
        }
        break;
      default:
        assert.ok(
          false,
          'Please enter setting name as tvguide or time or temperature'
        );
    }
    return currentSettingLabel;
  },

  async switchFormatFrom(currentFormat) {
    let setNewFormat;
    switch (currentFormat) {
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
      case constants.temperatureFormatRoku.celsius:
        setNewFormat = constants.temperatureFormatRoku.fahrenheit;
        break;
      case constants.temperatureFormatRoku.fahrenheit:
        setNewFormat = constants.temperatureFormatRoku.celsius;
        break;
      default:
        assert.ok(
          false,
          'Enter valid value of tvGuide, time or temperature format'
        );
    }
    return setNewFormat;
  },

  async selectAppSettingsSubTabs(tabName, expectFormat) {
    let timeFormatIs,
      iteration = 0;
    if (tabName !== undefined || tabName !== null) {
      // Select Tv Guide Format Tab
      if (constants.settings.tvGuide === tabName) {
        if (await I.isVisible(settingsPageLocators.tvGuideTitle)) {
          await I.dpadNavByEcp(constants.remoteKey.right);
          await I.dpadNavByEcp(constants.remoteKey.ok);
        } else {
          assert.fail(`${tabName}, tab not visible to select`);
        }
      }
      // Select Time Format Tab
      if (constants.settings.time === tabName) {
        if (await I.isVisible(settingsPageLocators.timeTitle)) {
          await I.dpadNavByEcp(constants.remoteKey.right);
          while (
            !(await I.isElementFocused(constants.formatOptions.time)) &&
            iteration < 6
          ) {
            await I.dpadNavByEcp(constants.remoteKey.down);
            iteration++;
            // await I.dumpControls();
            if (await I.isElementFocused(constants.formatOptions.time)) {
              await I.dpadNavByEcp(constants.remoteKey.ok);
              if (await this.verifyOptionsAvailableInTimeFormatOption()) {
                if (expectFormat === constants.timeFormat.hour24) {
                  timeFormatIs = settingsPageLocators.time24hFormat;
                } else {
                  timeFormatIs = settingsPageLocators.time12hFormat;
                }
                if (await I.isElementFocused(timeFormatIs)) {
                  await I.dpadNavByEcp(constants.remoteKey.ok);
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
        if (await I.isVisible(settingsPageLocators.temperature)) {
          await I.dpadNavByEcp(constants.remoteKey.right);
          while (
            !(await I.isElementFocused(constants.formatOptions.temperature)) &&
            iteration < 6
          ) {
            await I.dpadNavByEcp(constants.remoteKey.down);
            iteration++;
            if (await I.isElementFocused(constants.formatOptions.temperature)) {
              await I.dpadNavByEcp(constants.remoteKey.ok);
              iteration = 0;
            }
          }
          if (await I.isVisible(settingsPageLocators.temperatureTitle)) {
            I.reportLog('Temperature Format is visible to select');
          } else {
            assert.fail('Temperature Format should be visible to select');
          }
          await I.dpadNavByEcp(constants.remoteKey.ok);
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

  async clickOnSetting(settingName) {
    switch (settingName) {
      case constants.settings.tvGuide:
        await I.dpadNavByEcp(constants.remoteKey.right);
        await I.dpadNavByEcp(constants.remoteKey.ok);
        let tvGuideFormatTitle = await I.isVisible(
          settingsPageLocators.tvGuideTitle
        );
        assert.ok(tvGuideFormatTitle, 'tv Guide Format Title is not visible');
        break;
      case constants.settings.time:
        await I.dpadNavByEcp(constants.remoteKey.right);
        while (
          (await I.getAttribute(
            settingsPageLocators.timeFormatButton,
            'focused'
          )) !== 'true'
        ) {
          await I.dpadNavByEcp(constants.remoteKey.down);
        }
        await I.dpadNavByEcp(constants.remoteKey.ok);
        let timeFormatTitle = await I.isVisible(settingsPageLocators.timeTitle);
        assert.ok(timeFormatTitle, 'time Format Title is not visible');
        break;
      case constants.settings.temperature:
        await I.dpadNavByEcp(constants.remoteKey.right);
        while (
          (await I.getAttribute(
            settingsPageLocators.temperatureFormatButton,
            'focused'
          )) !== 'true'
        ) {
          await I.dpadNavByEcp(constants.remoteKey.down);
        }
        await I.dpadNavByEcp(constants.remoteKey.ok);
        let temperatureFormatTitle = await I.isVisible(
          settingsPageLocators.temperatureTitle
        );
        assert.ok(
          temperatureFormatTitle,
          'temperature Format Title is not visiable'
        );
        break;
      default:
        assert.ok(false, 'Enter valid format - tvguide, time or temperature');
    }
  },

  async setFormatTo(newFormat) {
    let count = 0;
    switch (newFormat) {
      case constants.tvGuideFormat.classic:
        if (!(await I.isVisible(settingsPageLocators.tvGuideTitle))) {
          this.clickOnSetting(constants.settings.tvGuide);
        }
        this.clickOnSetting(constants.settings.tvGuide);
        while (
          (await I.isVisible(settingsPageLocators.classicText)) &&
          !(await I.isElementFocused(constants.tvGuideFormat.classic)) &&
          count !== 5
        ) {
          await I.dpadNavByEcp(constants.remoteKey.down);
          count++;
        }
        break;
      case constants.tvGuideFormat.modern:
        if (!(await I.isVisible(settingsPageLocators.tvGuideTitle))) {
          this.clickOnSetting(constants.settings.tvGuide);
        }
        while (
          (await I.isVisible(settingsPageLocators.modernText)) &&
          !(await I.isElementFocused(constants.tvGuideFormat.modern)) &&
          count !== 5
        ) {
          await I.dpadNavByEcp(constants.remoteKey.up);
          count++;
        }
        break;
      case constants.timeFormat.hour12:
        if (!(await I.isVisible(settingsPageLocators.timeTitle))) {
          this.clickOnSetting(constants.settings.time);
        }
        let timeButtonGroup12 = await I.getElements(
          settingsPageLocators.timeButtonGroup
        );
        while (
          (await I.getElementAttribute(
            timeButtonGroup12[0].Nodes[0],
            'focused'
          )) !== 'true' &&
          count !== 5
        ) {
          await I.dpadNavByEcp(constants.remoteKey.up);
          count++;
          timeButtonGroup12 = await I.getElements(
            settingsPageLocators.timeButtonGroup
          );
        }
        break;
      case constants.timeFormat.hour24:
        if (!(await I.isVisible(settingsPageLocators.timeTitle))) {
          this.clickOnSetting(constants.settings.time);
        }
        let timeButtonGroup24 = await I.getElements(
          settingsPageLocators.timeButtonGroup
        );
        while (
          (await I.getElementAttribute(
            timeButtonGroup24[0].Nodes[1],
            'focused'
          )) !== 'true' &&
          count !== 5
        ) {
          await I.dpadNavByEcp(constants.remoteKey.down);
          count++;
          timeButtonGroup24 = await I.getElements(
            settingsPageLocators.timeButtonGroup
          );
        }
        break;
      case constants.temperatureFormatRoku.celsius:
        if (!(await I.isVisible(settingsPageLocators.temperatureTitle))) {
          this.clickOnSetting(constants.settings.temperature);
        }
        this.clickOnSetting(constants.settings.temperature);
        let tempButtonGroupCel = await I.getElements(
          settingsPageLocators.temperatureButtonGroup
        );
        while (
          (await I.getElementAttribute(
            tempButtonGroupCel[0].Nodes[1],
            'focused'
          )) !== 'true' &&
          count !== 5
        ) {
          await I.dpadNavByEcp(constants.remoteKey.down);
          count++;
          tempButtonGroupCel = await I.getElements(
            settingsPageLocators.temperatureButtonGroup
          );
        }
        break;
      case constants.temperatureFormatRoku.fahrenheit:
        if (!(await I.isVisible(settingsPageLocators.temperatureTitle))) {
          this.clickOnSetting(constants.settings.temperature);
        }
        let tempButtonGroupFar = await I.getElements(
          settingsPageLocators.temperatureButtonGroup
        );
        while (
          (await I.getElementAttribute(
            tempButtonGroupFar[0].Nodes[0],
            'focused'
          )) !== 'true' &&
          count !== 5
        ) {
          await I.dpadNavByEcp(constants.remoteKey.up);
          count++;
          tempButtonGroupFar = await I.getElements(
            settingsPageLocators.temperatureButtonGroup
          );
        }
        break;
      default:
        assert.ok(false, 'Enter valid format - tvguide, time or temperature');
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
    await I.dpadNavByEcp(constants.remoteKey.back);
  },

  async verifySettingFormatChanged(newFormat, currentFormat) {
    switch (currentFormat) {
      case constants.tvGuideFormat.classic:
        await this.goToTVGuideTab();
        let classicFormatChanged = await I.isVisible(
          settingsPageLocators.classicGuide
        );
        assert.ok(
          classicFormatChanged,
          'tv guide Format Changed is not changed'
        );
        assert.ok(newFormat === currentFormat, 'Setting Format is not changed');
        break;
      case constants.tvGuideFormat.modern:
        await this.goToTVGuideTab();
        let modernFormatChanged = await I.isVisible(
          settingsPageLocators.modernGuide
        );
        assert.ok(
          modernFormatChanged,
          'tv guide Format Changed is not changed'
        );
        assert.ok(newFormat === currentFormat, 'Setting Format is not changed');
        break;
      case constants.timeFormat.hour24:
      case constants.timeFormat.hour12:
        assert.ok(newFormat === currentFormat, 'Setting Format is not changed');
        break;
      case constants.temperatureFormatRoku.fahrenheit:
      case constants.temperatureFormatRoku.celsius:
        assert.ok(newFormat === currentFormat, 'Setting Format is not changed');
        break;
    }
  },

  async goToTVGuideTab() {
    await this.getFocusOnNavigationMenu();
    let retry = 0;
    if (await I.isElementFocused(constants.navigationMenu.home)) {
      while (
        (await I.isElementFocused(constants.navigationMenu.tvGuide)) ===
          false &&
        retry < 3
      ) {
        await I.dpadNavByEcp(constants.remoteKey.right);
        retry++;
      }
      await I.dpadNavByEcp(constants.remoteKey.ok);
    } else {
      while (
        (await I.isElementFocused(constants.navigationMenu.tvGuide)) ===
          false &&
        retry < 3
      ) {
        await I.dpadNavByEcp(constants.remoteKey.left);
        retry++;
      }
      await I.dpadNavByEcp(constants.remoteKey.ok);
    }
  },

  async getFocusOnNavigationMenu() {
    logger.debug('[getFocusOnNavigationMenu]');
    let retry = 0;
    while (
      ((await I.isElementFocused(constants.navigationMenu.home)) ||
        (await I.isElementFocused(constants.navigationMenu.tvGuide)) ||
        (await I.isElementFocused(constants.navigationMenu.settings))) ===
        false &&
      retry < 3
    ) {
      await I.dpadNavByEcp(constants.remoteKey.up);
      retry++;
    }
  },

  async clickOnLegalAbout() {
    let isSelect = false;
    if ((await this.isLegalAndAboutVisible()) == true) {
      await I.dpadNavByEcp(constants.remoteKey.ok);
      isSelect = true;
    } else {
      assert.ok(false, 'Legal&About is not visible');
    }
    return isSelect;
  },

  async isLegalAndAboutVisible() {
    let isVisible = false;
    let retry = 0;
    while (
      !(await I.isElementFocused(constants.settingsOptions.legalAndAbout)) &&
      retry < constants.totalSettingOptions
    ) {
      await I.dpadNavByEcp(constants.remoteKey.down);
      retry++;
    }
    isVisible = await I.isElementFocused(
      constants.settingsOptions.legalAndAbout
    );
    return isVisible;
  },

  async checkElementsOnLegalAbout() {
    return await this.isLegalAndAboutContentVisible();
  },

  async isLegalAndAboutContentVisible() {
    logger.debug('[isLegalAndAboutContentVisible]');
    let isVisible = await I.isVisible(
      settingsPageLocators.termsOfServicebutton
    );
    assert.ok(isVisible, 'TermsOfService is not visible');

    isVisible = await I.isVisible(settingsPageLocators.privacyPolicybutton);
    assert.ok(isVisible, 'Privacy Policy is not visible');

    isVisible = await I.isVisible(settingsPageLocators.about);
    assert.ok(isVisible, 'About is not visible');

    isVisible =
      (await I.isVisible(settingsPageLocators.appVersionHeader)) ||
      (await I.isVisible(settingsPageLocators.appVersion));
    assert.ok(isVisible, 'App Version is not visible');

    isVisible =
      (await I.isVisible(settingsPageLocators.deviceInformationHeader)) ||
      (await I.isVisible(settingsPageLocators.deviceInformation));
    assert.ok(isVisible, 'Device Information is not visible');

    isVisible =
      (await I.isVisible(settingsPageLocators.contactHeader)) ||
      (await I.isVisible(settingsPageLocators.contact));
    assert.ok(isVisible, 'Contact is not visible');

    return isVisible;
  },

  async clickOnFAQs() {
    let retry = 0;
    while (
      !(await I.isElementFocused(constants.settingsOptions.faqs)) &&
      retry < constants.totalSettingOptions
    ) {
      await I.dpadNavByEcp(constants.remoteKey.down);
      retry++;
    }
    let faqs = await I.isElementFocused(constants.settingsOptions.faqs);
    assert.ok(faqs, 'faqs is not focused');
    await I.dpadNavByEcp(constants.remoteKey.ok);
    return faqs;
  },

  async checkForFAQs() {
    let askedQuestions = await I.isVisible(settingsPageLocators.faqsLabel);
    assert.ok(
      askedQuestions,
      'Frequently Asked Questions Title is not visible on FAQs  section'
    );
    let faqsSettingsPanel = await I.isVisible(
      settingsPageLocators.faqsSettingsPanel
    );
    assert.ok(
      faqsSettingsPanel,
      'Frequently Asked Questions contents is not visible on FAQs  section'
    );
    let questionContents = await I.isVisible(
      settingsPageLocators.questionContents
    );
    assert.ok(
      questionContents,
      'Questions contents is not visible on FAQs  section'
    );
    let answerContents = await I.isVisible(settingsPageLocators.answerContents);
    assert.ok(
      answerContents,
      'answer contents is not visible on FAQs  section'
    );
    return true;
  },

  async switchClassicFormat() {
    if (!(await I.isVisible(settingsPageLocators.classicText))) {
      await this.clickOnSetting(constants.settings.tvGuide);
      await I.dpadNavByEcp(constants.remoteKey.down);
      let focusedElements = await I.isElementFocused(
        constants.tvGuideFormat.classic
      );
      assert.ok(focusedElements, 'classic guide is not focused');
      await I.dpadNavByEcp(constants.remoteKey.ok);
      await I.dpadNavByEcp(constants.remoteKey.back);
      await I.dpadNavByEcp(constants.remoteKey.left);
    }
  },

  async setTimeFormat(timeFormat) {
    let timeFormatLocator = settingsPageLocators.format;
    timeFormatLocator.elementData[0].value = timeFormat;
    if (!(await I.isVisible(timeFormatLocator))) {
      await this.clickOnSetting(constants.settings.time);
      switch (timeFormat) {
        case constants.timeFormat.hour12:
          while (
            (await I.isElementFocused(constants.timeFormat.hour12)) === false
          ) {
            await I.dpadNavByEcp(constants.remoteKey.up);
          }
          break;
        case constants.timeFormat.hour24:
          while (
            (await I.isElementFocused(constants.timeFormat.hour24)) === false
          ) {
            await I.dpadNavByEcp(constants.remoteKey.down);
          }
          break;
        default:
          assert.ok(false, 'Enter valid format - time');
      }
      await I.pressOkButton();
      await I.dpadNavByEcp(constants.remoteKey.back);
    }
  },

  async verifyTimeFormatOnTVGuide(format) {
    let time = await I.getElementText(settingsPageLocators.timeLabel);
    let timeFormat = await I.isTimeFormat(time, format);
    assert.ok(timeFormat, 'Time label on tv guide displayed wrong format');
    time = await this.timeBarOnClassicGuide();
    timeFormat = await I.isTimeFormat(time, format);
    assert.ok(timeFormat, 'Time bar on tv guide displayed wrong format');
    return timeFormat;
  },

  async timeBarOnClassicGuide() {
    let isTimes = await I.getTimeClassicGuide(settingsPageLocators.time);
    logger.debug(`[timeBarOnTVGuide]: ${isTimes}`);
    return isTimes;
  },

  async verifyTimeFormatOnSportsPage(format) {
    let time = await this.getTimeOnSportPage();
    let timeFormat = await I.isTimeFormat(time, format);
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    assert.ok(timeFormat, 'Time on sports page displayed wrong format');
    return timeFormat;
  },

  async getTimeOnSportPage() {
    //As sports tile focused , navigate back to sports page to get time
    await this.goBack();
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
    let timeOnSportPage = await I.getTime();
    await I.wait(testExecutionWaits.WAIT_FOR_5_SEC);
    logger.debug(`[getTimeOnSportPage]: ${timeOnSportPage}`);
    return timeOnSportPage;
  },

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

  async verifyFormat(type) {
    // const totalContainer = await this.getTotalSwimlaneTilesCount();
    await I.dpadNavByEcp(constants.remoteKey.down, 5);
    let ret = await I.isContainerHasTimeFormat(type);
    assert.ok(ret, 'Time Format is not change');
    // await this.verifyTimeFormatChange(ret, type);
  },

  async verifyTimeFormatChange() {
    let ret = await I.verifyTimeFormat(val, type);
    assert.ok(ret, 'Time Format is not change');
  },

  async getTotalSwimlaneTilesCount() {
    //todo get total swimlane tiles count via CMP
    let getTotalSportSwimlanesTiles = expVal.sportsSwimLanesCount;
    return getTotalSportSwimlanesTiles;
  },

  /** checks whether App Settings option is visible or not
   * @returns {boolean} - returns true if App Settings option is visible under setting tab
   */
  async isAppSettingsOptionSeen() {
    return await I.isVisible(settingsPageLocators.appSettings);
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
    return await I.isVisible(settingsPageLocators.tvGuideFormat);
  },

  /**
   * checks whether time format Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if Format Options sub heading is visible
   */
  async isTimeFormatOptionsHeadingSeen() {
    return await I.isVisible(settingsPageLocators.timeFormat);
  },

  /**
   * checks whether temperature format Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if Format Options sub heading is visible
   */
  async isTemperatureFormatOptionsHeadingSeen() {
    return await I.isVisible(settingsPageLocators.temperatureFormat);
  },

  /**
   * checks whether font size Options sub heading is visible or not under App Settings option
   * @returns {boolean} - returns true if Format Options sub heading is visible
   */
  async isEnableLargeFontSizeOptionsHeadingSeen() {
    return await I.isVisible(settingsPageLocators.enableLargeFontSize);
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
    return await I.isVisible(settingsPageLocators.classicText);
  },

  /**
   * checks whether modern format option is visible in TV Guide format option
   * @returns {boolean} - returns true if modern format option is visible
   */
  async isModernFormatOptionSeen() {
    return await I.isVisible(settingsPageLocators.modernText);
  },

  /**
   * verifies option available in TIME FORMAT option
   * @returns {boolean} - returns true of 12 hour & 24 hour format options are seen in time format option
   */
  async verifyOptionsAvailableInTimeFormatOption() {
    await I.wait(testExecutionWaits.WAIT_FOR_ELEMENT_LOAD);
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
    return await I.isVisible(settingsPageLocators.time12hFormat);
  },

  /**
   * checks whether 24 HOUR FORMAT option is seen in TIME FORMAT option or not.
   * @returns {boolean} - returns true if 24 hour format option is seen in time format option
   */
  async is24HourFormatOptionSeen() {
    return await I.isVisible(settingsPageLocators.time24hFormat);
  },

  /**
   * Selects the modern guide format
   */
  async clickOnModernGuideFormat() {
    while (!(await I.isElementFocused(constants.tvGuideFormat.modern))) {
      await I.dpadNavByEcp(constants.remoteKey.up);
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
  },

  /**
   * Selects the classic guide format
   */
  async clickOnClassicGuideFormat() {
    while (!(await I.isElementFocused(constants.tvGuideFormat.classic))) {
      await I.dpadNavByEcp(constants.remoteKey.down);
    }
    await I.dpadNavByEcp(constants.remoteKey.ok);
  },

  /**
   * checks for highlighting setting tab on navbar
   */
  async isSettingTabHighlightedOnNavbar() {
    let focussedElementText = await I.getText(await I.getFocusedElement(0));
    if (focussedElementText === constants.navigationMenu.settings) {
      await I.reportLog('Settings title is highlighted');
      return true;
    } else {
      await I.reportLog('Settings title is not highlighted');
      return false;
    }
  },

  async selectTermsOfService() {
    let isVisible = false;
    if (await I.isVisible(settingsPageLocators.termsOfServicebutton)) {
      while (
        !(await I.isElementFocused(
          constants.settingsSubHeadings.legalAndAbout.termsOfService
        ))
      ) {
        await I.dpadNavByEcp(constants.remoteKey.right);
      }
      await I.dpadNavByEcp(constants.remoteKey.ok);
      isVisible = true;
    } else {
      await I.reportLog("'TERMS OF SERVICE' is not highlighted");
    }
    return isVisible;
  },

  async verifyData() {
    let isVisible = false;
    if (await I.isVisible(settingsPageLocators.termsOfServiceContent)) {
      let termsOfServiceContentText = await I.getElementText(
        settingsPageLocators.termsOfServiceContent
      );
      if (
        termsOfServiceContentText ===
        constants.settingsSubHeadings.legalAndAbout.termsOfServiceContent
      ) {
        await I.reportLog("'TERMS OF SERVICE' content is visible");
        isVisible = true;
      }
    } else if (await I.isVisible(settingsPageLocators.privacyPolicyContent)) {
      let privacyPolicyContentText = await I.getElementText(
        settingsPageLocators.privacyPolicyContent
      );
      if (
        privacyPolicyContentText ===
        constants.settingsSubHeadings.legalAndAbout.privacyPolicyContent
      ) {
        await I.reportLog("'PRIVACY POLICY' content is visible");
        isVisible = true;
      }
    }
    return isVisible;
  },

  async selectPrivacyPolicy() {
    let isVisible = false;
    if (await I.isVisible(settingsPageLocators.privacyPolicybutton)) {
      while (
        !(await I.isElementFocused(
          constants.settingsSubHeadings.legalAndAbout.privacyPolicy
        ))
      ) {
        await I.dpadNavByEcp(constants.remoteKey.right);
        await I.dpadNavByEcp(constants.remoteKey.down);
      }
      await I.dpadNavByEcp(constants.remoteKey.ok);
      isVisible = true;
    } else {
      await I.reportLog("'PRIVACY POLICY' is not highlighted");
    }
    return isVisible;
  },

  /**
   * navigates back to previous screen
   */
  async goBack() {
    await I.dpadNavByEcp(constants.remoteKey.back);
  },

  /**
   * Verifies font size change
   */
  async verifyChangeFontSize() {
    if (this.isEnableLargeFontSizeOptionsHeadingSeen()) {
      await this.changeToLargeFont();
      await this.changeToSmallFont();
    }
  },

  /**
   * Changes small font to large
   */
  async changeToLargeFont() {
    let iteration = 0;
    await I.dpadNavByEcp(constants.remoteKey.right);
    while (
      !(await I.isElementFocused(
        constants.settingsSubHeadings.appSettings.enableLargeFontSize
      )) &&
      iteration <= 6
    ) {
      await I.dpadNavByEcp(constants.remoteKey.down);
      iteration++;
    }
    let enableLargeFontSizeToggleButtonState = await I.getText(
      (await I.getChildren(settingsPageLocators.zoomFeatureButton))[1]
    );
    await I.reportLog('Inside changeToLargeFont function');
    if (enableLargeFontSizeToggleButtonState === constants.largeFontSize.off) {
      await I.reportLog('Font size is set to Small...Toggling font size');
      await I.dpadNavByEcp(constants.remoteKey.ok);
      enableLargeFontSizeToggleButtonState = await I.getText(
        (await I.getChildren(settingsPageLocators.zoomFeatureButton))[1]
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
    await I.dpadNavByEcp(constants.remoteKey.right);
    let iteration = 0;
    while (
      !(await I.isElementFocused(
        constants.settingsSubHeadings.appSettings.enableLargeFontSize
      )) &&
      iteration <= 6
    ) {
      await I.dpadNavByEcp(constants.remoteKey.down);
      iteration++;
    }
    let enableLargeFontSizeToggleButtonState = await I.getText(
      (await I.getChildren(settingsPageLocators.zoomFeatureButton))[1]
    );
    await I.reportLog('Inside changeToLargeFont function');
    if (enableLargeFontSizeToggleButtonState === constants.largeFontSize.on) {
      await I.reportLog('Font size is set to Large...Toggling font size');
      await I.dpadNavByEcp(constants.remoteKey.ok);
      enableLargeFontSizeToggleButtonState = await I.getText(
        (await I.getChildren(settingsPageLocators.zoomFeatureButton))[1]
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
};
