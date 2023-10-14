const OAuthHelper = require('./OAuthHelper');
const clientConfig = require('../../../clientConfig');
const client = require('./AxiosClient');
const api = require('../../../config/api');
const testData = require('../../../config/testdata.js');

const AUTH_ENDPOINT = '/v3/xauth/access_token.json';
const GET_USER_ENDPOINT = '/v2/user.json';

class UmsUtil {
  constructor(
    username = clientConfig.userCredentials.username,
    password = clientConfig.userCredentials.password
  ) {
    this.username = username;
    this.password = password;
    this.authData;
  }

  async getAuthData() {
    if (this.authData) {
      return this.authData;
    }
    const request = {
      url: `${api.ums.host}${AUTH_ENDPOINT}`,
      method: 'PUT',
      body: {
        email: this.username,
        password: this.password,
        device_guid: api.device_guid,
      },
    };
    let response = await client.put(request.url, request.body, {
      headers: OAuthHelper.getAuthHeaderForRequest(request),
    });
    this.authData = response.data;
    return this.authData;
  }

  async getUserDetail() {
    let authData = await this.getAuthData();
    const request = {
      url: `${api.ums.host}${GET_USER_ENDPOINT}`,
      method: 'GET',
    };
    const token = {
      key: authData.oauth_token,
      secret: authData.oauth_token_secret,
    };
    let response = await client.get(request.url, {
      headers: OAuthHelper.getAuthHeaderForRequest(request, token),
    });
    this.user = response.data;
    return this.user;
  }

  async getUserSubscriptionPacks() {
    if (!this.user) {
      await this.getUserDetail();
    }
    if (this.user.subscriptionpacks) {
      return this.user.subscriptionpacks;
    }
    return [];
  }

  async getSubscriptionPacksGUID() {
    if (!this.user) {
      await this.getUserDetail();
    }
    let subPackGUID = [];
    let subPacks = await this.user.subscriptionpacks;
    for (let i = 0; i < subPacks.length; i++) {
      subPackGUID[i] = subPacks[i].guid;
    }
    return subPackGUID;
  }

  async getSubscriptionPacksExceptFree() {
    let allSubscriptionPacks = await this.getUserSubscriptionPacks();
    let subscriptionPacksExceptFree = [];

    allSubscriptionPacks.forEach((pack) => {
      if (
        testData.freeSubscriptionPacks.filter(
          (freepack) => freepack == pack.name
        ).length == 0
      ) {
        subscriptionPacksExceptFree.push(pack);
      }
    });
    return subscriptionPacksExceptFree;
  }
}

module.exports = UmsUtil;
