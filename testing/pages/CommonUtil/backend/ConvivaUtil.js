const client = require('./AxiosClient');
const https = require('https');
const api = require('../../../config/api');
const assert = require('assert');
const {I} = inject();

const GET_ACCOUNTS = 'insights/2.5/accounts.json';
const GET_FILTER_METRICS = 'insights/2.5/metrics.json';
const GET_FILTERS = 'insights/2.5/filters.json';
const UPDATE_FILTER = 'bulk_filters/';
const request = {
  auth: {
    username: api.conviva.username,
    password: api.conviva.password,
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
};
const device = require('detox').device;

class ConvivaUtil {
  constructor() {
    this.currentTime = new Date();
    const currentOffset = this.currentTime.getTimezoneOffset();
    const endTime = new Date(
      this.currentTime.getTime() + (currentOffset - 360) * 60000
    );
    const startTime = new Date(endTime - 4 * 60 * 60 * 1000);
    this.endDateTime = (
      endTime.getFullYear() +
      '-' +
      (endTime.getMonth() + 1) +
      '-' +
      endTime.getDate() +
      ':' +
      (endTime.getHours() + 1)
    ).toString();
    this.startDateTime = (
      startTime.getFullYear() +
      '-' +
      (startTime.getMonth() + 1) +
      '-' +
      startTime.getDate() +
      ':' +
      (startTime.getHours() + 1)
    ).toString();
    this.deviceId = api.deviceGUIDMapping[device.id]
      ? api.deviceGUIDMapping[device.id]
      : device.id;
    this.updateFilterResponse;
  }

  async getAccounts() {
    let response = await client.get(`${api.conviva.host}${GET_ACCOUNTS}`, {
      auth: request.auth,
      httpsAgent: request.httpsAgent,
    });
    this.accounts = response.data;
    return this.accounts;
  }

  // Update filter with test case execution device id
  async updateFilter(filterId) {
    const requestUpdate = {
      url: `${api.conviva.host}${UPDATE_FILTER}`,
      method: 'PUT',
      body: {
        id: filterId,
        rules: {
          op: 'and',
          rules: [
            {
              op: 'or',
              rules: [
                {
                  field: 'Tag',
                  op: 'equals',
                  value: this.deviceId,
                  key: 'deviceId',
                },
              ],
            },
            {
              op: 'or',
              rules: [
                {
                  field: 'Device Manufacturer',
                  op: 'equals',
                  value: 'Amazon',
                },
              ],
            },
          ],
        },
      },
    };
    let response = client.put(requestUpdate.url, requestUpdate.body, {
      params: {
        account: api.conviva.account,
      },
      auth: request.auth,
      httpsAgent: request.httpsAgent,
    });
    this.updateFilterResponse = response.status;
    return this.updateFilterResponse;
  }

  async getQualitySummary(filter) {
    await this.updateFilter(filter);
    let response = await client.get(
      `${api.conviva.host}${GET_FILTER_METRICS}`,
      {
        params: {
          metrics: 'quality_summary',
          filter_ids: filter,
          start_time: this.startDateTime,
          end_time: this.endDateTime,
        },
        auth: request.auth,
        httpsAgent: request.httpsAgent,
      }
    );
    this.qualitySummary = response.data;
    return this.qualitySummary;
  }

  // Validate QoE using the video start time metrics
  async validateVideoStartTime(qualitySummary, filterId) {
    let videoStartTime;
    let valuePosition;
    let totalAttempts;
    for (let i in qualitySummary.quality_summary.xvalues) {
      if (qualitySummary.quality_summary.xvalues[i] === 'Video Join Time') {
        valuePosition = i;
        break;
      }
    }
    if (!valuePosition) {
      assert.fail(
        'Video start time metrics was not collected in quality summary'
      );
    }
    videoStartTime =
      qualitySummary.quality_summary.filters[filterId][valuePosition];
    totalAttempts = qualitySummary.quality_summary.filters[filterId][0];

    I.reportLog(
      `Average Video start time is: ${videoStartTime} secs for total video playback attempts of ${totalAttempts}`
    );
    assert.ok(
      totalAttempts !== 0,
      'No Video Quality metrics were recorded with total attempts being zero'
    );
    assert.ok(
      videoStartTime <= 8,
      'Video took longer to start than the expected SLA, Expeced : < 8 sec, actual start time : ' +
        videoStartTime +
        ' sec.'
    );
  }

  // Validate QoE using video start failures metrics
  async validateVideoStartFailures(qualitySummary, filterId) {
    let videoStartFailures;
    let totalAttempts;
    let valuePosition;
    for (let i in qualitySummary.quality_summary.xvalues) {
      if (
        qualitySummary.quality_summary.xvalues[i] === 'Video Start Failures'
      ) {
        valuePosition = i;
        break;
      }
    }
    if (!valuePosition) {
      assert.fail(
        'Video start failures metrics was not collected in quality summary'
      );
    }
    videoStartFailures =
      qualitySummary.quality_summary.filters[filterId][valuePosition];
    totalAttempts = qualitySummary.quality_summary.filters[filterId][0];

    I.reportLog(
      `Number of Video start failures were: ${videoStartFailures} for total video playback attempts of ${totalAttempts}`
    );
    const failuresPercent = Math.round(
      (videoStartFailures / totalAttempts) * 100
    );
    assert.ok(
      !Number.isNaN(failuresPercent),
      'No Video Quality metrics were recorded with total attempts being zero'
    );
    assert.ok(
      failuresPercent < 1,
      'Too many video start failures which is greater than acceptable SLA, expected failure percent : < 1, actual percent : ' +
        failuresPercent
    );
  }

  // Validate QoE using rebuffering ratio metrics
  async validateVideoRebufferingRatio(qualitySummary, filterId) {
    let videoRebufferingRatio;
    let valuePosition;
    let totalAttempts;
    for (let i in qualitySummary.quality_summary.xvalues) {
      if (qualitySummary.quality_summary.xvalues[i] === 'Rebuffering Ratio') {
        valuePosition = i;
        break;
      }
    }
    if (!valuePosition) {
      assert.fail(
        'Rebuffering ratio metrics was not collected in quality summary'
      );
    }
    videoRebufferingRatio =
      qualitySummary.quality_summary.filters[filterId][valuePosition];
    totalAttempts = qualitySummary.quality_summary.filters[filterId][0];

    I.reportLog(
      `Average Video rebuffering ratio is: ${videoRebufferingRatio} % for total video playback attempts of ${totalAttempts}`
    );
    assert.ok(
      totalAttempts !== 0,
      'No Video Quality metrics were recorded with total attempts being zero'
    );
    assert.ok(
      videoRebufferingRatio < 1,
      'Rebuffering ratio is greater than acceptable SLA, expected : < 1,  actual video Rebuffering Ratio : ' +
        videoRebufferingRatio
    );
  }

  //Validate QoE using video exits before video starts metrics
  async validateVideoExitsBeforeVideoStarts(qualitySummary, filterId) {
    let exitsBeforeVideoStarts;
    let totalAttempts;
    let valuePosition;
    for (let i in qualitySummary.quality_summary.xvalues) {
      if (
        qualitySummary.quality_summary.xvalues[i] ===
        'Exits Before Video Starts'
      ) {
        valuePosition = i;
        break;
      }
    }
    if (!valuePosition) {
      assert.fail(
        'Exits before video start metrics was not collected in quality summary'
      );
    }
    exitsBeforeVideoStarts =
      qualitySummary.quality_summary.filters[filterId][valuePosition];
    totalAttempts = qualitySummary.quality_summary.filters[filterId][0];
    I.reportLog(
      `Number of Exits before video starts is: ${exitsBeforeVideoStarts} for total video playback attempts of ${totalAttempts}`
    );
    const exitsPercent = Math.round(
      (exitsBeforeVideoStarts / totalAttempts) * 100
    );
    assert.ok(
      !Number.isNaN(exitsPercent),
      'No Video Quality metrics were recorded with total attempts being zero'
    );
    assert.ok(
      exitsPercent < 1,
      'Too many exits before video start which is greater than acceptable SLA, expected exit percentage : <1, actual : ' +
        exitsPercent
    );
  }

  // Validate QoE using video playback failures metrics
  async validateVideoPlaybackFailures(qualitySummary, filterId) {
    let videoPlaybackFailures;
    let totalAttempts;
    let valuePosition;
    for (let i in qualitySummary.quality_summary.xvalues) {
      if (
        qualitySummary.quality_summary.xvalues[i] === 'Video Playback Failures'
      ) {
        valuePosition = i;
        break;
      }
    }

    if (!valuePosition) {
      assert.fail(
        'Video playback failures metrics was not collected in quality summary'
      );
    }
    videoPlaybackFailures =
      qualitySummary.quality_summary.filters[filterId][valuePosition];
    totalAttempts = qualitySummary.quality_summary.filters[filterId][0];

    I.reportLog(
      `Number of Video playback failures is: ${videoPlaybackFailures} for total video playback attempts of ${totalAttempts}`
    );
    const failurePercent = Math.round(
      (videoPlaybackFailures / totalAttempts) * 100
    );
    assert.ok(
      !Number.isNaN(failurePercent),
      'No Video Quality metrics were recorded with total attempts being zero'
    );
    assert.ok(
      failurePercent < 1,
      'Too many video playback failures which is greater than acceptable SLA, expected failure percent : < 1, actual percent : ' +
        failurePercent
    );
  }
}
module.exports = ConvivaUtil;
