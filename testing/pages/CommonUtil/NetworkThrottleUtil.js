const {create} = require('xmlbuilder2');
const {XMLHttpRequest} = require('xmlhttprequest');
const ADB = require('detox/src/devices/drivers/android/exec/ADB');
const assert = require('assert');
const {I} = inject();
let logcatProcess;
let logcatData;

class NetworkThrottleUtil {
  startLogcat(device) {
    const adb = new ADB();
    // let res = await adb.shell(device.id, 'logcat log');
    // console.log(res,"response");
    logcatProcess = adb.logcat(device.id, {});
    logcatProcess.childProcess.stdout.setEncoding('utf8');
    logcatProcess.childProcess.stdout.on('data', (data) => {
      logcatData += data;
    });
  }

  stopLogcatServer() {
    if (logcatProcess) {
      logcatProcess.childProcess.kill('SIGINT');
    }
  }

  async getLogcatData() {
    await I.ok();
    await I.wait(10);
    return logcatData;
  }

  async getQvtIdForCurrentTitleInCMW(cmwTiles, title) {
    const requiredTile = cmwTiles.find(
      (tile) => tile.focus_overlay_title == title
    );
    assert.ok(requiredTile, 'No tile found with title: ' + title);
    let qvturl = requiredTile.actions.PLAY_CONTENT.playback_info.url;
    return qvturl;
  }

  getRepresentationDataFromMpdFile(mpdFileData) {
    const doc = create(mpdFileData);
    const documentAsObject = doc.end({format: 'object'});
    let videoProfileData;
    let AdaptationSets = documentAsObject.MPD.Period.AdaptationSet;
    for (let i = 0; i < AdaptationSets.length; i++) {
      if (
        JSON.stringify(AdaptationSets[i]).includes('"@contentType":"video"')
      ) {
        videoProfileData = AdaptationSets[i].Representation;
      }
    }
    return videoProfileData;
  }

  async parseBitrateDetailsFromAdbCatlogFile(adbLogs) {
    // let adbLogs = this._readTextFile(filePath);
    let lines = adbLogs.split('\n');
    let videoBitrate = [];
    let audioBitrate = [];
    console.log(lines.length, 'length');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('D LimitTrackSelection')) {
        if (lines[i].includes('video/mp4')) {
          videoBitrate.push(lines[i]);
        } else if (lines[i].includes('audio/mp4')) {
          audioBitrate.push(lines[i]);
        }
      }
    }
    return {videoBitrate, audioBitrate};
  }

  async _readTextFile(file) {
    let rawFile = new XMLHttpRequest();
    let allText;
    rawFile.open('GET', file, false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          allText = rawFile.responseText;
        }
      }
    };
    rawFile.send(null);
    return allText;
  }
}

module.exports = NetworkThrottleUtil;
