const axios = require('axios');
const BASE_URL = 'http://localhost:9000/v1/session';
const logger = require('../utils/LogUtils.js').getLogger('RokuClient');

class RokuClient {
  constructor(ip, timeout, delay) {
    this.ip = ip;
    this.timeout = timeout;
    this.delay = delay;
    this.sessionId = '';
  }

  async createSession(ip, timeout, delay) {
    return await this.doRequest(
      '',
      'post',
      {ip: ip, timeout: timeout, pressDelay: delay},
      {},
      false
    );
  }

  async launch(channel_code, contentID, contentType) {
    return await this.doRequest('/launch', 'post', {
      channelId: channel_code,
      contentId: contentID,
      contentType: contentType,
    });
  }

  async sendKeypress(key) {
    return await this.doRequest('/press', 'post', {Button: key});
  }

  async deleteSession() {
    return await this.doRequest('', 'delete');
  }

  async getDeviceInfo() {
    return await this.doRequest('', 'get');
  }

  async getApps() {
    return await this.doRequest('/apps', 'get');
  }

  async getCurrentApp() {
    return await this.doRequest('/current_app', 'get');
  }

  async sendSequence(sequence) {
    return await this.doRequest('/press', 'post', {button_sequence: sequence});
  }

  async sendInputData(channelId, contentID, mediaType) {
    return await this.doRequest('/input', 'post', {
      channelId: channelId,
      contentId: contentID,
      contentType: mediaType,
    });
  }

  async getPlayerInfo() {
    return await this.doRequest('/player', 'get');
  }

  async getScreenSource() {
    return await this.doRequest('/source', 'get');
  }

  async getActiveElement() {
    return await this.doRequest('/element/active', 'post');
  }

  async setTimeouts(timeoutType, delay) {
    return await this.doRequest('/timeouts', 'post', {
      type: timeoutType,
      ms: delay,
    });
  }

  async sendInstallChannel(channelCode) {
    return await this.doRequest('/install', 'post', {channelId: channelCode});
  }

  async getUiElements(data) {
    return await this.doRequest('/elements', 'post', data);
  }

  async getUiElement(data) {
    return await this.doRequest('/element', 'post', data);
  }

  async sideLoadChannel(form) {
    logger.debug('RokuClient::sideLoadChannel');
    return await this.doRequest('/load', 'post', form, form.getHeaders());
  }

  async addSessionId(url) {
    if (this.sessionId == '') {
      let result = await this.createSession(this.ip, this.timeout, this.delay);
      if (result.status == 200) {
        this.sessionId = result.data.sessionId;
      }
    }
    url = `/${this.sessionId}${url}`;
    return url;
  }

  /**
   *
   * @param {string} url Request URL
   * @param {string} method Rest method (get, post, put, delete)
   * @param {dict} body Body parameter
   * @param {dict} headers Header parameter
   * @param {boolean} addSessionId Session ID
   * @returns {object/error} API response
   */
  async doRequest(url, method, body = {}, headers = {}, addSessionId = true) {
    try {
      if (addSessionId == true) {
        url = await this.addSessionId(url);
      }
      const result = await axios({
        method: method,
        url: `${BASE_URL}${url}`,
        data: body,
        headers: {
          ...headers,
        },
      });
      return result;
    } catch (errorResponse) {
      const response = errorResponse.response;
      //logger.warn("[doRequest] got error : " + response.data.value.message);
      if (response == undefined) {
        throw new Error('Could not get any response');
      }
      const status = response.status;
      let errorMessage;
      if (status == 400) {
        errorMessage = response.data;
      } else {
        errorMessage = response.data.value.message;
      }
      throw new Error(errorMessage);
    }
  }
}

module.exports.RokuClient = RokuClient;
