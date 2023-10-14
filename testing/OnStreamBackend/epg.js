const client = require('./AxiosClient');
const api = require('./api');

class EPG {
  static cachedGuideData = null;
  async getGuideData() {
    if (this.cachedGuideData != null) {
      return this.cachedGuideData;
    }
    const guideData = await client.get(`${api.epg.epgdata}`);
    this.cachedGuideData = guideData.data;
    return guideData.data;
  }
  /* Fetches total channels avaialable*/
  async getTotalChannels() {
    const guideData = await this.getGuideData();
    const services = guideData.services;
    let channelCount = 0;
    services.forEach((service) => {
      if (service.events.length > 0) {
        channelCount++;
      }
    });
    return channelCount;
  }

  /* Fetches total number of programs in a given channel */
  async getTotalPrograms(channelNum) {
    const guideData = await this.getGuideData();
    let channelData = guideData.services[channelNum - 1];
    let totalPrograms = channelData.numberOfEvents;
    return totalPrograms;
  }

  /* Fetched echostarIDs of all channels  */
  async getLiveProgramIdsAllChannels() {
    const guideData = await this.getGuideData();
    let channelCount = guideData.numberOfServices;
    let currentProgIds = [];
    for (let i = 1; i <= channelCount; i++) {
      currentProgIds.push(await this.getCurrentProgramEchostarId(i));
    }
    return currentProgIds;
  }

  /* Fetches echostarID of current program in given channel  */
  async getCurrentProgramEchostarId(channelNum = 1) {
    let echostarId, programTitle;
    const guideData = await this.getGuideData();
    let channelData = guideData.services[channelNum - 1];
    let programs = channelData.events;
    //channelData.events.forEach((event) => {
    for (let i = 1; i < programs.length; i++) {
      let startTime = new Date(programs[i].startTime);
      let endTime =
        parseInt(startTime.getTime().toPrecision()) + programs[i].duration;
      let currentPreciseTime = await this.getPreciseCurrentTime();
      if (endTime > currentPreciseTime) {
        echostarId = programs[i - 1].echostarId;
        programTitle = programs[i - 1].eventName;
        break;
      }
    }
    return {echostarId, programTitle};
  }

  /* Fetch future echostarID of given channel  */
  async getFutureProgramEchostarId(channelNum = 1) {
    let echostarId;
    const guideData = await this.getGuideData();
    let channelData = guideData.services[channelNum - 1];
    let programs = channelData.events;
    //channelData.events.forEach((event) => {
    for (let i = 1; i < programs.length; i++) {
      let startTime = new Date(programs[i].startTime);
      let endTime =
        parseInt(startTime.getTime().toPrecision()) + programs[i].duration;
      let currentPreciseTime = await this.getPreciseCurrentTime();
      if (endTime > currentPreciseTime) {
        echostarId = programs[i].echostarId;
        break;
      }
    }
    return echostarId;
  }

  /* Get current precise time in Integer format */
  async getPreciseCurrentTime() {
    let now = new Date();
    let curentTime = new Date(now.toUTCString());
    let preciseTime = curentTime.getTime().toPrecision();
    return parseInt(preciseTime);
  }

  async getAllChannelIds() {
    let channelIds = [];
    const guideData = await this.getGuideData();
    const services = guideData.services;
    services.forEach((service) => {
      channelIds.push(service.serviceKey);
    });
    return channelIds;
  }
}
module.exports = EPG;
