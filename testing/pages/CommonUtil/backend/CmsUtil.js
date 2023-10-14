const client = require('./AxiosClient');
const api = require('../../../config/api');
const assert = require('assert');
const {getGitConfig} = require('../../../config/gitConfig');
const CHANNEL_LIST_ENDPOINT = '/cms/api/channels';
const ASSET_INFO_ENDPOINT = '/cms/publish3/asset/info/';
const FRANCHISES_INFO_ENDPOINT = '/cms/api/franchises/';
const SEASON_INFO_ENDPOINT = '/cms/api/seasons/';
const PROGRAM_INFO_ENDPOINT = '/cms/api/programs/';
const SUBSCRIPTION_PACK = '/cms/api/subscriptionpack/';
const CHANNEL_SCHEDULE_ENDPOINT = '/cms/publish3/channel/schedule/24/';
const CHANNEL_PLAYING_ASSET = 'cms/publish3/channel/current_asset';
const environment = getGitConfig('DISH_EXECUTION_ENV').toLowerCase();
const currentDateYYMMDDHHMM = () => {
  return new Date().toISOString().slice(2, 16).replace(/[^\d]/g, '');
};

class CmsUtil {
  channelsData = undefined;
  async getChannelsData() {
    if (this.channelsData) {
      return this.channelsData;
    }
    const response = await client.get(
      `${api.cms.host}${CHANNEL_LIST_ENDPOINT}`
    );
    this.channelsData = response.data;
    return this.channelsData;
  }

  /**
   * Get channel details by GUID or Name
   * @param {string} channelGUIDOrName channel GUID or channel Name
   * @returns {object} return channel details if GUID or Name found else throw error
   */
  async getChannelDetail(channelGUIDOrName) {
    const data = await this.getChannelsData();
    for (let i = 0; i < data.channels.length; i++) {
      if (
        data.channels[i].guid === channelGUIDOrName ||
        data.channels[i].channel_name === channelGUIDOrName
      ) {
        return data.channels[i];
      }
    }
    assert.fail(`Channel with guid or title ${channelGUIDOrName} not found`);
  }

  async getAssetInfo(asset_id) {
    const response = await client.get(
      `${api.cms.host}${ASSET_INFO_ENDPOINT}${asset_id}.json`
    );
    return response.data;
  }

  async getFranchisesInfo(franchise_id) {
    const response = await client.get(
      `${api.cms.host}${FRANCHISES_INFO_ENDPOINT}${franchise_id}`
    );
    return response.data;
  }

  async getSeasonInfo(season_id) {
    const response = await client.get(
      `${api.cms.host}${SEASON_INFO_ENDPOINT}${season_id} `
    );
    return response.data;
  }

  async getProgramInfo(program_id) {
    const response = await client.get(
      `${api.cms.host}${PROGRAM_INFO_ENDPOINT}${program_id} `
    );
    return response.data;
  }

  async getChannelDetailsByGUID(Channel_GUID) {
    let channelDetails = [];
    for (let i = 0; i < Channel_GUID.length; i++) {
      channelDetails[i] = await this.getChannelDetail(Channel_GUID[i]);
    }
    return channelDetails;
  }

  async getSubscribtionDetails(subcriptionPackGUID) {
    const response = await client.get(
      `${api.cms.host}${SUBSCRIPTION_PACK}${subcriptionPackGUID} `
    );
    return response.data;
  }

  async getActiveChannelGuids(subcriptionPackGUID) {
    let active_channel_guids = [];
    for (let i = 0; i < subcriptionPackGUID.length; i++) {
      const data = await this.getSubscribtionDetails(subcriptionPackGUID[i]);
      for (let j = 0; j < data.active_channel_guids.length; j++) {
        active_channel_guids.push(data.active_channel_guids[j]);
      }
    }
    return active_channel_guids;
  }

  async getChannelLogoCMS(channel_GUID) {
    let channelLogoImgCMS = [];
    let channelDetails = await this.getChannelDetailsByGUID(channel_GUID);
    for (let i = 0; i < channelDetails.length; i++) {
      channelLogoImgCMS[i] = channelDetails[i].image.url;
    }
    return channelLogoImgCMS;
  }

  async getChannelSchedule(
    channelGUID,
    dateYYMMDD = currentDateYYMMDDHHMM(),
    domainId = environment === 'beta' ? 3 : 1
  ) {
    if (!this.channelsData) {
      await this.getChannelsData();
    }
    const response = await client.get(
      `${api.cms.host}${CHANNEL_SCHEDULE_ENDPOINT}${dateYYMMDD}/${domainId}/${channelGUID}.json`
    );
    if (response.data) {
      return response.data.schedule;
    } else {
      throw `Channel Schedule not found in CMS for channel GUID - ${channelGUID}`;
    }
  }

  async getChannelsScheduleForListGUIDs(
    channelGUIDList,
    dateYYMMDD = currentDateYYMMDDHHMM(),
    domainId = environment === 'beta' ? 3 : 1
  ) {
    let allChannelsSchedule = [];
    for (let channelGUID of channelGUIDList) {
      const channelSchedule = await this.getChannelSchedule(
        channelGUID,
        dateYYMMDD,
        domainId
      );
      if (channelSchedule) {
        allChannelsSchedule.push(channelSchedule);
      }
    }
    return allChannelsSchedule;
  }

  /**
   * checks channel genre
   * @param channelDetail
   * @param type can be movies, kids, sports, news
   */
  isChannelType(channelDetail, type) {
    return (
      channelDetail.genre &&
      channelDetail.genre.some(
        (genre) => genre.toLowerCase() === type.toLowerCase()
      )
    );
  }

  async getChannelCurrentSchedule(
    channelGUID,
    dateYYMMDD = currentDateYYMMDDHHMM(),
    domainId = environment === 'beta' ? 3 : 1
  ) {
    const allSchedules = await this.getChannelSchedule(
      channelGUID,
      dateYYMMDD,
      domainId
    );
    if (allSchedules.scheduleList.length > 0) {
      return allSchedules.scheduleList[0];
    } else {
      throw `Current Schedule not found for channel with guid ${channelGUID}`;
    }
  }

  async getChannelAssetDetailsByGUID(channelGUID) {
    const response = await client.get(
      `${api.cms.host}/${CHANNEL_PLAYING_ASSET}/${channelGUID}.json`
    );
    if (response.data) {
      return response.data;
    }
    throw `Channel playing asset not found in CMS for channel GUID - ${channelGUID}`;
  }

  async getChannelPlayingAsset(channelGUID) {
    const data = await this.getChannelAssetDetailsByGUID(channelGUID);
    return data.entitlements;
  }

  async getMpdDataForTile(cmwTile) {
    const qvtUrl = cmwTile.actions.PLAY_CONTENT.playback_info.url;
    let qvtResponse = await client.get(qvtUrl);
    const mpdUrl = qvtResponse.data.playback_info.dash_manifest_url;
    let response = await client.get(mpdUrl);
    return response.data;
  }

  /**
   * Get current schedule by channel name
   * @param {string} channelName - Ex FX, EPIX, TBS
   * @returns {object} return current schedule details available for channel else false
   */
  async getLiveProgramDetails(channelName) {
    const channelDetails = await this.getChannelDetail(channelName);
    const allSchedules = await this.getChannelSchedule(channelDetails.guid);
    if (allSchedules.scheduleList.length > 0) {
      return allSchedules.scheduleList[0];
    } else {
      return null;
    }
  }
}
module.exports = new CmsUtil();
