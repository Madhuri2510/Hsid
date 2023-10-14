const client = require('./AxiosClient');
const OAuthHelper = require('./OAuthHelper');
const UmsUtil = require('./UmsUtil');
const api = require('../../../config/api');
const JWT_TOKEN_ENDPOINT = '/cmw/v1/client/jwt';
const TABS_ENDPOINT = '/tabs';
const {TABS} = require('../../mainmenu/constants');
const assert = require('assert');
const gitConfig = require('../../../config/gitConfig');

const RIBBONS = {
  CHANNELS: 'Channels',
  EXPLORE_CATEGORIES: 'Browse Categories',
};

const BROWSEBYCHANNELS_ENDPOINT = '/pres/home/channels';

const SEARCH_ENDPOINT = {
  RIBBON: 'search',
  HISTORY: '/searches/v1/history',
  TOP_RESULTS: '/top_results',
};

const IVIEW_FRANCHISE_ENDPOINT = '/detail/series/';
const DVR_SERIES_DETAIL = '/detail/dvr_series/';
const SUBCATEGORIES_ENDPOINT = {
  AVAILABLE_NOW: '/ribbons/available_now',
  LIVE_SCHEDULE: '/ribbons/live_schedule',
  RELATED_CONTENT: '/ribbons/related_content',
  EXTRAS: '/ribbons/extras',
};

const IVIEW_ENDPOINTS = {
  WATCHLIST: '/watchlists/v5/watches',
  GET_WATCHLIST: '/watchlists/v4/watches',
};

const CONTINUE_WATCHING_ENDPOINTS = {
  DELETE_ALL: '/progress_point/v1/bulk_delete',
  ADD_RESUME: '/resumes/v4/resumes',
  GET_ALL_RESUME: '/resumes/v4/resumes.json',
  ADD_PROGRESS: '/progress_point/v1',
};

const SETTINGS_ENDPOINTS = {
  DELETE_PARENTAL_CONTROL: '/parents/v1/parental_controls',
  GET_PARENTAL_CONTROL: '/parents/v3/parental_controls',
};
const CHANNELS_DETAIL_ENDPOINT = '/detail/channel';

const IN_VIDEO_ENDPOINTS = {
  GET_PROGRESS_POINTS: '/progress_point/v1',
  GET_PLAYER_DETAILS: '/player/offering/',
  RECENT_CHANNELS: '/pg/v1/my_tv/recent_channels',
  ALL_CHANNELS: '/pres/player_screen/player_all_channels',
};

const DVR_ENDPOINT = {
  RECORDING_DELETE: '/v5/rec-delete',
  RECORDING_LOCK: '/rec/v1/rec-save',
  OFFERING: '/detail/offering',
  SCHEDULE_SIGNLE_REC: '/rec/v4/rec-create',
  SCHEDULE_SERIES_REC: '/rec/v4/rule-create',
};
class CmwUtil {
  constructor(umsUtil = new UmsUtil()) {
    this.umsUtil = umsUtil;
    //TO-DO: call geo location api
    this.timezone = '-0700';
    this.dma = '770';
    this.jwt;
    this.interaction_id;
    if (gitConfig.isComcastPlatform()) {
      this.timeZoneId = 'America/New_York';
    } else {
      this.timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  }

  async getJwtToken() {
    const token_res = await this.umsUtil.getAuthData();
    const request = {
      url: `${api.cmw.host}${JWT_TOKEN_ENDPOINT}`,
      method: 'POST',
      body: {
        device_guid: api.device_guid,
        platform: api.platform,
        product: api.product,
      },
    };
    const token = {
      key: token_res.oauth_token,
      secret: token_res.oauth_token_secret,
    };
    let response = await client.post(request.url, request.body, {
      headers: OAuthHelper.getAuthHeaderForRequest(request, token),
    });
    this.jwt = response.data.jwt;
    return this.jwt;
  }

  async _getHeaders(mock = false, finderid = null) {
    if (!this.jwt) {
      await this.getJwtToken();
    }
    let headers = {
      'sling-interaction-id': this.getGUID(),
      Authorization: `Bearer ${this.jwt}`,
      timezone: this.timezone,
      dma: this.dma,
      'Client-Config': api.clientConfig,
      'enable-mocks': mock,
      'Time-Zone-ID': this.timeZoneId,
    };
    if (finderid != null) {
      headers['finder-id'] = finderid;
    }
    return headers;
  }
  async getTabsData() {
    let headers = await this._getHeaders();
    const response = await client.get(`${api.cmw.host}${TABS_ENDPOINT}`, {
      headers: headers,
    });
    this.tabs = response.data;
    return this.tabs;
  }

  async getTabDataById(id) {
    let headers = await this._getHeaders();
    const response = await client.get(await this._getTabUrl(id), {
      headers: headers,
    });
    return response.data;
  }

  async _getTabUrl(id) {
    if (!this.tabs) {
      await this.getTabsData();
    }
    for (const tab of this.tabs.tabs) {
      if (tab.id === id) {
        return tab.actions[tab.primary_action].url;
      }
    }
  }

  getGUID() {
    if (this.interaction_id) {
      return this.interaction_id;
    }
    let d = new Date().getTime();
    this.interaction_id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      (c) => {
        // eslint-disable-next-line no-bitwise
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        // eslint-disable-next-line no-bitwise
        return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
      }
    );
    return this.interaction_id;
  }

  async getRibbon(ribbonName) {
    const homePageData = await this.getTabDataById('home');
    let foundRibbon = homePageData.ribbons.find(
      (rbn) => rbn.title === ribbonName || rbn.format === ribbonName
    );
    if (foundRibbon) {
      return foundRibbon;
    }
    throw `Ribbon with name - ${ribbonName} not found.`;
  }

  async getAllTiles(ribbonName) {
    const ribbonData = await this.getRibbon(ribbonName);
    return ribbonData.tiles ? ribbonData.tiles : [];
  }

  async getHomeAllChannelsGUID() {
    const tiles = await this.getAllTiles(RIBBONS.CHANNELS);
    let channel_ids = [];
    tiles.forEach((tile) => {
      if (tile.actions.DETAIL_VIEW && tile.actions.DETAIL_VIEW.url) {
        const tileurl = tile.actions.DETAIL_VIEW.url;
        channel_ids.push(tileurl.split('/').reverse()[0]);
      }
    });
    return channel_ids;
  }

  async getHomeAllChannelsLogoUrl() {
    let channelLogoUrls = [];
    const tiles = await this.getAllTiles(RIBBONS.CHANNELS);
    tiles.forEach((tile) => {
      if (tile.image.url) {
        channelLogoUrls.push(tile.image.url);
      }
    });
    return channelLogoUrls;
  }

  async getAllCategoryNames() {
    const allCategoryTiles = await this.getAllTiles(RIBBONS.EXPLORE_CATEGORIES);
    let categoryNames = allCategoryTiles
      .filter((tile) => tile.overlay_title)
      .map((tile) => tile.overlay_title);
    return categoryNames;
  }

  async getCategory(categoryName) {
    const categoryTiles = await this.getAllTiles(RIBBONS.EXPLORE_CATEGORIES);
    const foundCategory = categoryTiles.find(
      (tile) => tile.overlay_title === categoryName
    );
    if (foundCategory) {
      return foundCategory;
    }
    throw `No Category found with title - ${categoryName}`;
  }

  async getCategoryTiles(categoryName) {
    const foundCategory = await this.getCategory(categoryName);
    if (foundCategory.actions.EXPAND.url) {
      const categoryURL = foundCategory.actions.EXPAND.url;
      let headers = await this._getHeaders();
      const response = await client.get(categoryURL, {headers: headers});
      return response.data.tiles ? response.data.tiles : [];
    }
    throw `No Category Tile url found for category name - ${categoryName}`;
  }

  async getTabDataForSearch() {
    return await this.getTabDataById(SEARCH_ENDPOINT.RIBBON);
  }

  async getRecentSearches() {
    let searchTabData = await this.getTabDataForSearch();
    return searchTabData.searches.searches;
  }

  async addToSearchHistory(searchHistory) {
    let headers = await this._getHeaders();
    const request = {
      url: `${api.cmw.host}${SEARCH_ENDPOINT.HISTORY}`,
      body: {
        enable_recent_search_check: true,
        search: searchHistory,
      },
    };
    await client.post(request.url, request.body, {
      headers: headers,
    });
  }

  async deteleSearchHistory() {
    if (!this.jwt) {
      await this.getJwtToken();
    }
    let headers = await this._getHeaders();
    await client.delete(`${api.cmw.host}${SEARCH_ENDPOINT.HISTORY}`, {
      headers: headers,
    });
  }

  async addSearchValueToSearchHistory(searchTerms) {
    for (let searchTerm of searchTerms) {
      await this.addToSearchHistory(searchTerm);
    }
  }

  async getTabDataForGuide() {
    let guideData = await this.getTabDataById(TABS.GUIDE);
    return guideData;
  }

  async getGuideChannelSubTab(channelId) {
    let headers = await this._getHeaders();
    let ribbonsData = [];
    const response = await client.get(
      `${api.cmw.host}${CHANNELS_DETAIL_ENDPOINT}/${channelId}/ribbons`,
      {headers: headers}
    );
    ribbonsData = response.data.ribbons;
    return ribbonsData;
  }

  async getGuideChannelTabTiles(channelId, ribbonName) {
    let headers = await this._getHeaders();
    let tilesData = [];
    const response = await client.get(
      `${api.cmw.host}${CHANNELS_DETAIL_ENDPOINT}/${channelId}/ribbons/${ribbonName}`,
      {headers: headers}
    );
    tilesData = response.data.tiles;
    return tilesData;
  }

  async getGuideAllChannelsGUID(cmwFilterData = undefined) {
    let cmwGuideData;
    if (cmwFilterData === undefined) {
      cmwGuideData = await this.getTabDataForGuide();
    } else {
      cmwGuideData = cmwFilterData;
    }
    let channelsGUID = [];
    if (cmwGuideData.channels) {
      cmwGuideData.channels.forEach((channel) => channelsGUID.push(channel.id));
    }
    return channelsGUID;
  }

  async getGuideChannelDetails(channelGUID) {
    let headers = await this._getHeaders();
    const response = await client.get(
      (await this._getTabUrl(TABS.GUIDE)) + '/' + channelGUID,
      {headers: headers}
    );
    return response.data;
  }

  async getGuideFilterChannelDetails(channelGUID, filterName) {
    let headers = await this._getHeaders();
    const response = await client.get(
      (await this._getTabUrl(TABS.GUIDE)) +
        '/' +
        channelGUID +
        '?filter=' +
        filterName,
      {headers: headers}
    );
    return response.data;
  }

  async getGuideChannelsDetailsForGUID(listChannelsGUID) {
    let listChannelDetails = [];
    for (let channelGUID of listChannelsGUID) {
      const channelDetials = await this.getGuideChannelDetails(channelGUID);
      if (channelDetials) {
        listChannelDetails.push(channelDetials);
      }
    }
    return listChannelDetails;
  }

  async getGuideAllChannelsDetails() {
    let allChannelDetails = [];
    const allGuideChannelsGUID = await this.getGuideAllChannelsGUID();
    for (let channelGUID of allGuideChannelsGUID) {
      const channelDetials = await this.getGuideChannelDetails(channelGUID);
      if (channelDetials) {
        allChannelDetails.push(channelDetials);
      }
    }
    return allChannelDetails;
  }

  async getGuideChannelSchedule(channelGUID, filterName = undefined) {
    var channelDetails = '';
    if (filterName != undefined) {
      channelDetails = await this.getGuideFilterChannelDetails(
        channelGUID,
        filterName
      );
    } else {
      channelDetails = await this.getGuideChannelDetails(channelGUID);
    }
    if (channelDetails.schedules[channelGUID].schedule) {
      return channelDetails.schedules[channelGUID].schedule;
    }
    throw `No Schedule found for Channel with GUID - ${channelGUID}`;
  }

  async getGuideChannelsScheduleForGUIDs(
    listChannelGUID,
    filterName = undefined
  ) {
    let channelsSchedule = [];
    for (let channelGUID of listChannelGUID) {
      const channelSchedule = await this.getGuideChannelSchedule(
        channelGUID,
        filterName
      );
      channelsSchedule.push(channelSchedule);
    }
    return channelsSchedule;
  }

  //filterId: all channels, my channels, kids, movies, sports, news
  //isOTA: true for getting OTA channels list
  async getGuideFilter(filterId, page_size = 'small', isOTA = false) {
    let headers;
    if (isOTA) {
      headers = await this._getHeaders(false, api.airtv_finder_id);
    } else {
      headers = await this._getHeaders();
    }
    const request = {
      //TODO: Need to update below url once pres ENDPOINT start working
      url: `${api.cmw.host}/pres/grid_guide?page_size=${page_size}&filter=${filterId}&sort=category`,
    };
    const response = await client.get(request.url, {
      headers: headers,
    });
    return response.data;
  }
  async getiViewCMWMetadata(franchiseID) {
    let headers = await this._getHeaders();
    //TODO Need to update below url once pres ENDPOINT start working
    const response = await client.get(
      `${api.cmw.host}${IVIEW_FRANCHISE_ENDPOINT}${franchiseID}`,
      {headers: headers}
    );
    return response.data;
  }

  async getiViewSubCatagoryCMWMetadata(
    franchiseID,
    subcategory = 'Available Now'
  ) {
    let headers = await this._getHeaders();
    //TODO Need to update below url once pres ENDPOINT start working
    if (subcategory === 'Live Schedule') {
      const response = await client.get(
        `${api.cmw.host}${IVIEW_FRANCHISE_ENDPOINT}${franchiseID}${SUBCATEGORIES_ENDPOINT.LIVE_SCHEDULE}`,
        {headers: headers}
      );
      return response.data;
    } else if (subcategory === 'Related Content') {
      const response = await client.get(
        `${api.cmw.host}${IVIEW_FRANCHISE_ENDPOINT}${franchiseID}${SUBCATEGORIES_ENDPOINT.RELATED_CONTENT}`,
        {headers: headers}
      );
      return response.data;
    } else if (subcategory === 'Extras') {
      const response = await client.get(
        `${api.cmw.host}${IVIEW_FRANCHISE_ENDPOINT}${franchiseID}${SUBCATEGORIES_ENDPOINT.EXTRAS}`,
        {headers: headers}
      );
      return response.data;
    } else if (subcategory === 'Available Now') {
      const response = await client.get(
        `${api.cmw.host}${IVIEW_FRANCHISE_ENDPOINT}${franchiseID}${SUBCATEGORIES_ENDPOINT.AVAILABLE_NOW}`,
        {headers: headers}
      );
      return response.data;
    }
  }

  async getGuideChannelCurrentSchedule(channelGUID, filterName = undefined) {
    let allSchedules = [];
    if (filterName != undefined) {
      allSchedules = await this.getGuideChannelSchedule(
        channelGUID,
        filterName
      );
    } else {
      allSchedules = await this.getGuideChannelSchedule(channelGUID);
    }
    if (allSchedules.length > 0) {
      return allSchedules[0];
    }
    throw `No schedule found for channel with guid - ${channelGUID}`;
  }

  async getGuideGrid(GridUrl) {
    let headers = await this._getHeaders();
    const response = await client.get(GridUrl, {headers: headers});
    if (response.data) {
      return response.data;
    } else {
      return {};
    }
  }

  async getGuideFirstChannelGUIDHavingLongDurationOfCurrentSchedule(
    cmwGuideData
  ) {
    let foundChannelGUID = null;
    let nextGridUrl = null;
    let cmwGrid = cmwGuideData.grid;
    do {
      for (let guid of Object.keys(cmwGrid.schedules)) {
        let scheduleTotalDuration = 0;
        if (
          cmwGrid.schedules[guid].schedule[0] &&
          cmwGrid.schedules[guid].schedule[0].focus_row_duration_attributes
        ) {
          scheduleTotalDuration = this.getDurationLeftFromAttribute(
            cmwGrid.schedules[guid].schedule[0].focus_row_duration_attributes,
            'COUNTDOWN'
          );
        }
        if (
          scheduleTotalDuration === 0 &&
          cmwGrid.schedules[guid].schedule[0] &&
          cmwGrid.schedules[guid].schedule[0].focus_row_attributes
        ) {
          scheduleTotalDuration = this.getDurationLeftFromAttribute(
            cmwGrid.schedules[guid].schedule[0].focus_row_attributes,
            'DURATION'
          );
        }
        if (scheduleTotalDuration > 5400) {
          foundChannelGUID = guid;
          break;
        }
      }
      if (foundChannelGUID == null) {
        if (cmwGrid.next) {
          nextGridUrl = cmwGrid.next;
          cmwGrid = await this.getGuideGrid(nextGridUrl);
          if (!cmwGrid.schedules) {
            nextGridUrl = null;
          }
        } else {
          nextGridUrl = null;
        }
      }
    } while (foundChannelGUID == null && nextGridUrl != null);
    if (foundChannelGUID != null) {
      return foundChannelGUID;
    } else {
      throw 'No channel has current schedule of more than 1.5 hrs';
    }
  }

  getDurationLeftFromAttribute(attribute, filterBy) {
    let duration = attribute.filter((attr) => attr.type === filterBy);
    if (duration && duration[0]) {
      return duration[0].dur_value;
    }
    return false;
  }

  async getGuideChannelNumber(channelGUID, cmwFilterData = undefined) {
    const allChannelsGUID = await this.getGuideAllChannelsGUID(cmwFilterData);
    let channelNumber = 0;
    for (let i = 0; i < allChannelsGUID.length; i++) {
      if (allChannelsGUID[i] === channelGUID) {
        channelNumber = i + 1;
        break;
      }
    }
    return channelNumber;
  }

  async getGuideFilterChannelNumber(channelGUID, cmwFilterData) {
    const allChannelsGUID = await this.getGuideAllChannelsGUID(cmwFilterData);
    let channelNumber = 0;
    for (let i = 0; i < allChannelsGUID.length; i++) {
      if (allChannelsGUID[i] === channelGUID) {
        channelNumber = i + 1;
        break;
      }
    }
    return channelNumber;
  }

  async getGuideChannelNumbers(channelGUIDs, cmwFilterData = undefined) {
    let GuideChannelNumbers = [];
    for (let channelGUID of channelGUIDs) {
      GuideChannelNumbers.push(
        await this.getGuideChannelNumber(channelGUID, cmwFilterData)
      );
    }
    return GuideChannelNumbers;
  }
  async getGuideFilterChannelNumbers(channelGUIDs, cmwFilterData) {
    let GuideChannelNumbers = [];
    for (let channelGUID of channelGUIDs) {
      GuideChannelNumbers.push(
        await this.getGuideFilterChannelNumber(channelGUID, cmwFilterData)
      );
    }
    return GuideChannelNumbers;
  }

  getSearchKeyword(tileTitle) {
    // Remove Season and episode number
    let searchValue = tileTitle.replace(/S[\d]*[\sE[\d]*:\s]*/, '');
    //Remove special characters and numbers
    searchValue = searchValue.replace(/[^a-zA-Z ]/g, '');
    let data = searchValue.split(' ');
    let searchKeyword = '';
    let count = 0;
    for (let i = 0; i < data.length && count <= 2; i++) {
      if (data[i]) {
        searchKeyword = searchKeyword + data[i] + ' ';
      }
      count++;
    }
    return searchKeyword;
  }

  async getTopSearchResultBySearchTerm(searchKeyword) {
    let headers = await this._getHeaders();
    const params = new URLSearchParams({
      search_term: searchKeyword,
    }).toString();
    const response = await client.get(
      (await this._getTabUrl(TABS.SEARCH)) + '?' + params,
      {headers: headers}
    );
    const topResultsRibbon = response.data.ribbons.find(
      (ribbon) => ribbon.title === 'TOP RESULTS'
    );
    return topResultsRibbon;
  }

  async getOnDemandTabsData(tabId) {
    let onDemandData = await this.getTabDataById(TABS.ON_DEMAND);
    let onDemandTabInfo = onDemandData.tabs.find((tab) => tab.id === tabId);
    if (onDemandTabInfo) {
      let url = onDemandTabInfo.actions[onDemandTabInfo.primary_action].url;
      if (url) {
        let headers = await this._getHeaders();
        const response = await client.get(url, {headers: headers});
        return response.data;
      } else {
        throw `Unable to fetch url for ${tabId}`;
      }
    } else {
      throw `No tabs found with tabId ${tabId}`;
    }
  }
  async getOnDemandTiles(tabId, ribbonId, onDemandTabsData = undefined) {
    if (!onDemandTabsData) {
      onDemandTabsData = await this.getOnDemandTabsData(tabId);
    }
    const ribbonData = onDemandTabsData.ribbons.find(
      (ribbon) =>
        ribbon.title === ribbonId ||
        ribbon.href.indexOf(encodeURI(ribbonId)) > -1
    );
    if (ribbonData) {
      return ribbonData.tiles ? ribbonData.tiles : [];
    } else {
      let headers = await this._getHeaders();
      const ribbon = onDemandTabsData.ribbons.find(
        (ribbon) => ribbon.title == ribbonId
      );
      if (ribbon == undefined) {
        throw `Unable to find ribbon ${ribbonId} in CMW response`;
      }
      const response = await client.get(ribbon.href, {headers: headers});
      if (response) {
        return response.tiles ? response.tiles : [];
      } else {
        throw `Unable to find ribbon ${ribbonId} in CMW response`;
      }
    }
  }

  async getIviewDetail(cmwTiles) {
    const url = cmwTiles[0].actions.DETAIL_VIEW.url;
    if (url) {
      let headers = await this._getHeaders();
      const response = await client.get(url, {
        headers: headers,
      });
      return response.data;
    } else {
      throw 'Unable to find iview detail url in CMW response';
    }
  }

  async addToWatchlist(type, id) {
    let headers = await this._getHeaders();
    const request = {
      url: `${api.cmw.host}${IVIEW_ENDPOINTS.WATCHLIST}`,
      body: {
        type: type,
        external_id: id,
        platform: api.platform,
        product: api.product,
      },
    };
    await client.post(request.url, request.body, {
      headers: headers,
    });
  }
  async addWatchesToWatchlists(watches) {
    for (let i = 0; i < watches.length; i++) {
      await this.addToWatchlist(watches[i].type, watches[i].id);
    }
  }
  async getWatchlists() {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${IVIEW_ENDPOINTS.GET_WATCHLIST}`,
      {headers: headers}
    );
    return response.data.favorites ? response.data.favorites : [];
  }

  async deleteWatchList(type, id) {
    let headers = await this._getHeaders();
    const request = {
      url: `${api.cmw.host}${IVIEW_ENDPOINTS.WATCHLIST}`,
      body: {
        type: type,
        external_id: id,
        platform: api.platform,
        product: api.product,
      },
    };
    await client.delete(request.url, {
      headers: headers,
      data: request.body,
    });
  }

  async deleteAllWatchList() {
    let favorites = await this.getWatchlists();
    for (let favorite of favorites) {
      await this.deleteWatchList(favorite.cmw_info.type, favorite.guid);
    }
  }

  async getDVRTabsData(tabId) {
    let dvrData = await this.getTabDataById(TABS.DVR);
    let dvrTabInfo = dvrData.tabs.find((tab) => tab.id === tabId);
    if (dvrTabInfo) {
      let url = dvrTabInfo.actions.GET_SCREEN.url;
      let headers = await this._getHeaders();
      const response = await client.get(url, {headers: headers});
      return response.data;
    } else {
      throw `No tabs found with tabId ${tabId}`;
    }
  }

  async deleteParentalControl() {
    const params = new URLSearchParams({
      product: api.product,
      platform: api.platform,
    }).toString();
    let headers = await this._getHeaders(true);
    const response = await client.delete(
      `${api.cmw.host}${SETTINGS_ENDPOINTS.DELETE_PARENTAL_CONTROL}?${params}`,
      {headers: headers}
    );
    return response.data;
  }

  async getGuideChannelsGUID(channelTitle) {
    const cmwGuideData = await this.getGuideFilter('all_channels'); //getTabDataForGuide();
    if (cmwGuideData.channels) {
      const idData = cmwGuideData.channels.find(
        (channel) => channel.title === channelTitle
      );

      if (idData) {
        return idData.id;
      } else {
        throw `Unable to find channel ${channelTitle} in CMW response`;
      }
    }
  }
  // Get guide channel details by filter properties example:
  // filter: sports,all_channel, filterBy: {name:'title','value':'FX'}
  async getGuideChannelsDetailsByFilter(filter, filterBy = {}) {
    const cmwGuideData = await this.getGuideFilter(filter);
    if (cmwGuideData.channels) {
      let channelNumber = 0;
      const idData = cmwGuideData.channels.find((channel) => {
        channelNumber++;
        return channel[filterBy.name] === filterBy.value;
      });
      if (idData) {
        return {
          ...idData,
          channelNumber: channelNumber,
        };
      } else {
        throw `Unable to find channel ${filterBy.name} by ${filterBy.value} in CMW response`;
      }
    }
  }
  async deleteAllContinueWatchingTiles() {
    const request = {
      url: `${api.cmw.host}${CONTINUE_WATCHING_ENDPOINTS.DELETE_ALL}`,
      headers: await this._getHeaders(true),
      body: {delete_all: true},
    };
    await client.post(request.url, request.body, {headers: request.headers});
  }

  async addResumeInContinueWatchingTile(assetId, percentageWatched, programId) {
    let headers = await this._getHeaders();
    const request = {
      url: `${api.cmw.host}${CONTINUE_WATCHING_ENDPOINTS.ADD_PROGRESS}`,
      body: {
        asset_id: assetId,
        percentage_watched: percentageWatched,
        platform: api.platform,
        product: api.product,
        program_id: programId,
      },
    };
    await client.post(request.url, request.body, {
      headers: headers,
    });
  }
  async getAllResumeTiles() {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${CONTINUE_WATCHING_ENDPOINTS.GET_ALL_RESUME}`,
      {headers: headers}
    );
    return response.data;
  }

  async getAllProgressPoints() {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${IN_VIDEO_ENDPOINTS.GET_PROGRESS_POINTS}`,
      {
        headers: headers,
      }
    );
    return response.data;
  }

  async getChannelDetailsByGUID(channelId) {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${CHANNELS_DETAIL_ENDPOINT}/${channelId}`,
      {
        headers: headers,
      }
    );
    return response.data;
  }

  async getChannelRibbonDetails(channelId, ribbonId) {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${CHANNELS_DETAIL_ENDPOINT}/${channelId}/ribbons/${ribbonId}?page=0`,
      {
        headers: headers,
      }
    );
    if (response.data) {
      return response.data;
    }
    throw `No Channel riibon data found for ChannelGUID : ${channelId} and RibbonId : ${ribbonId}`;
  }

  /**
   * Method to get first channel from Guide filter Tab( like All Channels, Movies, Sports)
   * @param filterName Guide Filter Name
   * @returns first found Channel object
   */
  async getFirstChannelFromFilter(filterName) {
    const cmwGuideData = await this.getGuideFilter(filterName);
    if (cmwGuideData.channels && cmwGuideData.channels.length > 0) {
      return cmwGuideData.channels[0];
    } else {
      throw `No Channel found from CMW for Filter ${filterName}`;
    }
  }

  async getDVRAssetDetails(assetGUID) {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${DVR_ENDPOINT.OFFERING}/${assetGUID}`,
      {headers: headers}
    );
    if (response.data) {
      return response.data;
    } else {
      throw `No asset found for url : ${assetURL}`;
    }
  }

  /**
   *
   * @param DVRData DVR Data from CMW (either recording or scheduled)
   * @param assetState recording or recorded
   * @returns Single Type asset
   */
  async getSingleTypeAssetFromDVRTab(DVRData, assetState) {
    if (DVRData.ribbons && DVRData.ribbons[0].tiles) {
      let foundAssets = DVRData.ribbons[0].tiles.filter((tile) =>
        tile.actions.DETAIL_VIEW.url.includes('offering')
      );
      for (let asset of foundAssets) {
        let assetGUID = asset.actions.DETAIL_VIEW.url.split('/').pop();
        let assetDetails = await this.getDVRAssetDetails(assetGUID);
        if (
          assetState === 'recording' &&
          assetDetails.actions_view.actions.hasOwnProperty('CANCEL_RECORDING')
        ) {
          return assetDetails;
        } else if (
          assetState === 'recorded' &&
          assetDetails.actions_view.actions.hasOwnProperty('DELETE_RECORDING')
        ) {
          return assetDetails;
        }
      }
    }
    throw 'No Single type Asset found which is recorded';
  }

  /**
   * Method to lock asset on DVR
   * @param guid GUID of target asset (might be signle asset GUID or GUID of one Episode of Series)
   * @param lock boolean value where, {true - Need to lock} and {false - need to unlock}. Default - true
   */
  async lockDVRRecording(guid, lock = true) {
    let headers = await this._getHeaders();
    const request = {
      url: `${api.cmw.host}${DVR_ENDPOINT.RECORDING_LOCK}`,
      body: {
        data: [
          {
            guid: guid,
            protected: lock,
            type: 'rs',
          },
        ],
        platform: api.platform,
        product: api.product,
      },
    };
    const response = await client.post(request.url, request.body, {
      headers: headers,
    });
    if (response.statusText === 'OK') {
      if (lock) {
        console.log('Locked asset with guid: ' + guid + 'Successfully');
      } else {
        console.log('Unlocked asset with guid: ' + guid + 'Successfully');
      }
    } else {
      throw 'Unable to lock/unlock the asset in DVR';
    }
  }
  async getDvrSeriesDetail(franchiseID) {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${DVR_SERIES_DETAIL}${franchiseID}`,
      {headers: headers}
    );
    if (response.data) {
      return response.data;
    }
    throw `No series detail found for franchiseID : ${franchiseID}`;
  }
  async getGuideFilterBySort(filterId, sort) {
    let headers = await this._getHeaders();
    const request = {
      //TODO: Need to update below url once pres ENDPOINT start working
      url: `${api.cmw.host}/pres/grid_guide?page_size=small&filter=${filterId}&sort=${sort}`,
    };
    const response = await client.get(request.url, {
      headers: headers,
    });
    if (response.data) {
      return response.data;
    }
    throw `No Filter Data found for  : ${filterId}`;
  }

  /**
   * Makes a backend call to CMW and gets all ribbon titles for given screen
   * @param {*} tabId provide tabId of the screen for which you want to make a request to get all ribbon titles
   * @returns returns all ribbon titles which has atleast one asset in each ribbon
   */
  async getAllBackendRibbonTitles(tabId) {
    let ribbonTitles = [];
    let pages = 0;
    let ribbonTitle;
    const cmwTabsData = await this.getOnDemandTabsData(tabId);
    let cmwOnDemandRibbons = cmwTabsData.ribbons;
    if (
      !(cmwOnDemandRibbons === undefined || cmwOnDemandRibbons.length === 0)
    ) {
      for (let i = 1; i < cmwOnDemandRibbons.length; i++) {
        // Check number of tiles assigned to each ribbon
        // if the value of pages is zero that means that ribbon doesn't have any tiles in it
        pages = cmwOnDemandRibbons[i].num_pages;
        if (pages !== 0) {
          ribbonTitle = cmwOnDemandRibbons[i].title.toString().toLowerCase();
          ribbonTitles.push(ribbonTitle);
        }
      }
    }
    return ribbonTitles;
  }

  /**
   * Method to create single asset type recording schedule
   * @param channel_id channel GUID
   * @param program_id program GUID which you want to record
   */
  async createSingleAssetRecordingSchedule(program_id, channel_id) {
    let headers = await this._getHeaders();
    const request = {
      url: `${api.cmw.host}${DVR_ENDPOINT.SCHEDULE_SIGNLE_REC}`,
      body: {
        data: [
          {
            channel: channel_id,
            external_id: program_id,
          },
        ],
        platform: api.platform,
        product: api.product,
      },
    };
    const response = await client.post(request.url, request.body, {
      headers: headers,
    });
    return response.data;
  }

  /**
   * Method to create series asset type recording schedule
   * @param franchise_id GUID of target franchise asset
   * @param mode mode can be [all/new]
   * @param type type is franchise
   */
  async createSeriesAssetRecordingSchedule(
    franchise_id,
    mode,
    type = 'franchise'
  ) {
    let headers = await this._getHeaders();
    const request = {
      url: `${api.cmw.host}${DVR_ENDPOINT.SCHEDULE_SERIES_REC}`,
      body: {
        data: [
          {
            franchise: franchise_id,
            mode: mode,
            type: type,
          },
        ],
        platform: api.platform,
        product: api.product,
      },
    };
    const response = await client.post(request.url, request.body, {
      headers: headers,
    });
    return response.data;
  }

  async getAssetIdFromOnDemand(assetTab) {
    const onDemandTabData = await this.getOnDemandTabsData(assetTab);
    let assetId = '';
    let assetURL = onDemandTabData.ribbons[0].tiles[0].actions.DETAIL_VIEW.url;
    let assetType = assetURL.includes('offering');
    if (assetType) {
      let urlSplit = assetURL.split('/');
      assetId = urlSplit[5];
    }
    return assetId;
  }

  async getAssetPlayerDetails(assetTab) {
    let headers = await this._getHeaders();
    const assetId = await this.getAssetIdFromOnDemand(assetTab);
    const response = await client.get(
      `${api.cmw.host}${IN_VIDEO_ENDPOINTS.GET_PLAYER_DETAILS}${assetId}`,
      {
        headers: headers,
      }
    );

    return {
      payload: response.data.bar_view.actions.SET_PROGRESS_POINT.payload,
      title: response.data.content_view.title,
    };
  }

  async getRecentChannelsTiles() {
    const headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${IN_VIDEO_ENDPOINTS.RECENT_CHANNELS}`,
      {
        headers: headers,
      }
    );
    const recentChannelTiles = response.data.tiles;
    if (recentChannelTiles) return recentChannelTiles;
    else throw `Recent Channels Tiles not found`;
  }

  async getPlayerAllChannelsTiles(channelGuid) {
    const headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${IN_VIDEO_ENDPOINTS.ALL_CHANNELS}?focus_channel_id=${channelGuid}`,
      {
        headers: headers,
      }
    );
    const allChannelTiles = response.data;
    if (allChannelTiles) return allChannelTiles;
    else throw `Player all channels tiles not found`;
  }

  async getPlayerAllChannelsTilesWithPages(page) {
    const headers = await this._getHeaders();
    const response = await client.get(
      `${api.cmw.host}${IN_VIDEO_ENDPOINTS.ALL_CHANNELS}?page=${page}`,
      {
        headers: headers,
      }
    );
    const allChannelTiles = response.data;
    if (allChannelTiles) return allChannelTiles;
    else throw `Player all channels tiles not found`;
  }
  async getBrowseByChannelRibbonData() {
    let headers = await this._getHeaders();
    headers.features = 'enable_home_channels=true';
    const response = await client.get(
      `${api.cmw.host}${BROWSEBYCHANNELS_ENDPOINT}`,
      {
        headers: headers,
      }
    );
    return response.data;
  }
  async getPlayerAllChannelGuids(tiles) {
    let allChannelGuids = [];
    tiles.forEach((tile) => {
      if (
        tile.actions.PLAY_CONTENT != undefined &&
        tile.actions.PLAY_CONTENT.playback_info.channel_guid
      ) {
        allChannelGuids.push(
          tile.actions.PLAY_CONTENT.playback_info.channel_guid
        );
      }
    });
    return allChannelGuids;
  }
}
module.exports = CmwUtil;
