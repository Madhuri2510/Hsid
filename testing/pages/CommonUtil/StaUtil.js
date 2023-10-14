/* eslint-disable no-undef */
const api = require('../../config/api');
const client = require('./backend/AxiosClient');
const assert = require('assert');
const {I} = inject();
const STA_GET_TOKEN_ENDPOINT = '/gettoken';
const STA_DEVICE_STATUS_ENDPOINT = '/stagetdevicestatus';
const STA_RUN_TESTCASE_ENDPOINT = '/staruntestcase';
const STA_STOP_TESTCASE_ENDPOINT = '/stastoptestcase';
const STA_GET_STATUS_ENDPOINT = '/gettestrunningstatus';
const STA_SET_NETWORK_BANDWIDTH = '/stasetbandwidth';
const STA_RESET_NETWORK_BANDWIDTH = '/staremovebandwidth';
const playerLocators = require('../player/VideoPlayerLocators.json');
const {isVideoQuality} = require('../../config/gitConfig');
const gitConfig = require('../../config/gitConfig');
const platform = gitConfig.getGitConfig('PLATFORM');
const device = require('detox').device;
const constants = require('../mainmenu/constants');
class STAUtil {
  constructor() {
    this.host = api.sta.host;
    this.username = api.sta.username;
    this.password = api.sta.password;
    this.featureName = api.sta.featureName;
    this.fileName = api.sta.fileName;
    if (platform === 'android') {
      this.deviceName = api.sta.mapping[device.id]
        ? api.sta.mapping[device.id]
        : device.id;
      this.deviceIp = api.sta.deviceIp[device.id]
        ? api.sta.deviceIp[device.id]
        : device.id;
    }
  }

  async _generateToken() {
    const response = await client.post(
      `${this.host}${STA_GET_TOKEN_ENDPOINT}`,
      {
        user: this.username,
        pass: this.password,
      }
    );
    this.token = JSON.parse(response.data).token;
    return this.token;
  }

  async getToken() {
    if (!this.token) {
      await this._generateToken();
    }
    return this.token;
  }

  async _checkDeviceAvailability() {
    const params = new URLSearchParams({
      device: this.deviceName,
      token: await this.getToken(),
    }).toString();
    let url = `${this.host}${STA_DEVICE_STATUS_ENDPOINT}?${params}`;
    const response = await client.get(url);
    return response.data;
  }

  async startRecording() {
    I.reportLog(`Validating device availability ${this.deviceName}`);
    const status = (await this._checkDeviceAvailability(this.deviceName))
      .status;
    assert.strictEqual(
      status,
      'ready',
      'The Device ' + this.deviceName + ' status is' + status
    );
    const params = new URLSearchParams({
      device: this.deviceName,
      feature: this.featureName,
      filename: this.fileName,
      username: this.username,
      token: await this.getToken(),
    }).toString();
    let url = `${this.host}${STA_RUN_TESTCASE_ENDPOINT}?${params}`;
    const response = await client.get(url);
    I.reportLog('STA Recording Started');
    this.timeStamp = response.data.timestamp;
    return response.data;
  }

  async stopRecording() {
    const params = new URLSearchParams({
      device: this.deviceName,
      feature: this.featureName,
      filename: this.fileName,
      username: this.username,
      token: await this.getToken(),
    }).toString();
    let url = `${this.host}${STA_STOP_TESTCASE_ENDPOINT}?${params}`;
    const response = await client.get(url);
    const testcaserunningstatus = response.data.status;
    assert.strictEqual(
      testcaserunningstatus,
      'stopped',
      'Expected Running status:stopped Actual Running status:' +
        testcaserunningstatus
    );
    I.reportLog('STA Recording Stopped');
    return response.data;
  }

  async setNetworkBandWidth(bandWidth) {
    const params = new URLSearchParams({
      deviceip: this.deviceIp,
      bandwidth: `${bandWidth}kbit`,
      token: await this.getToken(),
    }).toString();

    const response = await client.get(
      `${this.host}${STA_SET_NETWORK_BANDWIDTH}?${params}`
    );
    I.reportLog(`STA Network Bandwidth set to ${bandWidth} succesfully`);
    return response.data;
  }

  async resetNetworkBandWidth() {
    const params = new URLSearchParams({
      deviceip: this.deviceIp,
      token: await this.getToken(),
    }).toString();
    const response = await client.get(
      `${this.host}${STA_RESET_NETWORK_BANDWIDTH}?${params}`
    );
    I.reportLog(`STA Network Bandwidth Reset is successful`);
    return response.data;
  }

  async getExecutionReport() {
    const params = new URLSearchParams({
      device: this.deviceName,
      timestamp: this.timeStamp,
      username: this.username,
      token: await this.getToken(),
    }).toString();
    let url = `${this.host}${STA_GET_STATUS_ENDPOINT}?${params}`;
    const response = await client.get(url);
    I.reportLog({
      title: JSON.stringify(response.data.results.videourl),
      value: response.data,
    });
    return response.data;
  }

  async validateExecutionReport() {
    const response = await this.getExecutionReport();
    const stallCount = response.results.longevityresult;
    assert.strictEqual(
      stallCount.length <= 1 && Object.keys(stallCount[0]).length === 0,
      true,
      'Expected 0 Stalls: Actual:' + stallCount.length
    );
  }

  /**
   * Wait for duration to play video and meanwhile it keeps Detox alive
   * @param duration in minutes
   */
  async wait(duration = api.sta.duration) {
    let count = 0;
    while (count < duration) {
      count += 1;
      await I.wait(60);
      try {
        //To keep detox alive, otherwise detox will quit
        await I.dontSee('I am still running....');
      } catch (error) {
        //ignore
      }
    }
  }

  /**
   * This function takes cares of starting, waiting, stopping and validating video quality.
   * In case TC is running with 'DISH_VALIDATE_VIDEO' as false, then it will validate only video play.
   * @param duration in minutes
   */
  async validateVideoQuality(duration = api.sta.duration) {
    if (isVideoQuality()) {
      try {
        await this.startRecording();
        await this.wait(duration);
        await this.stopRecording();
        await this.validateExecutionReport();
      } catch (error) {
        await this.stopRecording();
        throw error;
      }
    } else {
      await this.validateVideoPlay();
    }
  }

  /** This method will validate only video play  User should be on Player screen before hand*/
  async validateVideoPlay() {
    await I.wait(30);
    await I.dpadUp();
    //await I.wait(1);
    let found =
      (await I.isElementVisible(playerLocators.playerScreen)) ||
      (await I.isElementVisible(playerLocators.playerScrubber));
    if (found) {
      await I.reportLog('Player is visible');
    } else {
      assert.fail('Player is Not visible');
    }
  }
}
module.exports = STAUtil;
