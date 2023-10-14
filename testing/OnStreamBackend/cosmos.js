const client = require('./AxiosClient');
const api = require('./api');
const EPG = require('../OnStreamBackend/epg');
let epg = new EPG();
const constants = require('../config/constants');
const {platformName} = inject();
class Cosmos {
  static cachedCosmosData = null;
  /**
   * used to get entire cosmos bulk data
   * @returns cosmos data
   */
  async getBulkData() {
    if (this.cachedCosmosData != null) {
      return this.cachedCosmosData;
    }
    const guideData = await epg.getGuideData();
    const cosmosData = await client.post(`${api.cosmos.data}`, guideData);
    this.cachedCosmosData = cosmosData.data;
    return cosmosData.data;
  }

  /**
   *
   * @param channelNum
   * @returns live program data of the channel
   */
  async getCurrentProgramData(channelNum = 1) {
    let cosmosData = await this.getBulkData();
    let programInfo = await epg.getCurrentProgramEchostarId(channelNum);
    let programTitle = programInfo.programTitle;
    let programData = cosmosData[programInfo.echostarId];
    return {programTitle, programData};
  }

  /**
   *
   * @param channelNum
   * @returns immediate future program data of the channel
   */
  async getFutureProgramData(channelNum = 1) {
    let cosmosData = await this.getBulkData();
    let echostarId = await epg.getFutureProgramEchostarId(channelNum);
    let programData = cosmosData[echostarId];
    return programData;
  }

  /**
   *
   * @param channelNum
   * @returns current program name
   */
  async getCurrentProgramName(channelNum = 1) {
    let progName;
    let programData = await this.getCurrentProgramData(channelNum);
    if (programData == undefined) {
      let programData1 = await this.getCurrentProgramData(channelNum + 1);
      progName = programData1.programTitle;
    } else {
      progName = programData.programTitle;
    }
    return progName;
  }

  /**
   *
   * @param channelNum
   * @returns future program name
   */
  async getFutureProgramName(channelNum = 1) {
    let programData = await this.getFutureProgramData(channelNum);
    let progName = programData.seriesTitle;
    return progName;
  }

  /**
   *
   * @returns Ratings of all live programs
   */
  async getCurrentRatingAllLivePrograms() {
    let cosmosData = await this.getBulkData();
    let liveProgsEchostarIds = await epg.getLiveProgramIdsAllChannels();
    let ratings = [];
    liveProgsEchostarIds.forEach((echostarId) => {
      if (typeof echostarId !== 'undefined') {
        ratings.push(cosmosData[echostarId].rating);
      }
    });
    return ratings;
  }

  /**
   *
   * @param rating which needs to be checked
   * @returns if program with this rating is Live
   */
  async isProgramWithRatingLive(rating) {
    let currentProgramRatings = await this.getCurrentRatingAllLivePrograms();
    if (
      platformName.platform === constants.platform.browser &&
      rating === constants.NA
    ) {
      rating = null;
    }
    if (currentProgramRatings.includes(rating)) {
      return true;
    }
    return false;
  }

  /**
   *
   * @returns A map containing all the possible ratings along with channel numbers
   */
  async calculatePositionOfRatingMap() {
    let currentProgramRatings = await this.getCurrentRatingAllLivePrograms();
    let programRatingMap = new Map();
    currentProgramRatings.forEach((rating, index) => {
      if (programRatingMap.has(rating) === false) {
        programRatingMap.set(rating, index + 1);
      }
    });
    return programRatingMap;
  }

  /**
   * gets the subtitle of a specific asset
   * @param {integer} channelNum
   * @returns {string} - Returns subtitle of an asset
   */
  async getFutureProgramSubtitle(channelNum = 1) {
    let programData = await this.getFutureProgramData(channelNum);
    let progName = programData.title;
    return progName;
  }

  /**
   * gets the subtitle of a specific asset
   * @param {integer} channelNum
   * @returns {string} - Returns subtitle of an asset
   */
  async getCurrentProgramSubtitle(channelNum = 1) {
    let programData = await this.getCurrentProgramData(channelNum);
    let progName = programData.title;
    return progName;
  }

  /**
   * gets position of given rating in tv guide.
   * @param {string} rating
   * @returns {integer} - returns an index of given rating
   */
  async getPositionOfRating(rating) {
    let currentProgramRatings = await this.getCurrentRatingAllLivePrograms();
    if (
      platformName.platform === constants.platform.browser &&
      rating === constants.NA
    ) {
      rating = null;
    }
    let ratingPosition = (await currentProgramRatings.indexOf(rating)) + 1;
    return ratingPosition;
  }
}
module.exports = Cosmos;
