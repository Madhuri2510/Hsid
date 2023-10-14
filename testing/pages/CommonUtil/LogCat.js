const logCatCommand = require('./adbCommands');
const deviceID = require('../../config/deviceId.js');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');
const {I, platformName} = inject();
const {exec} = require('child_process');
var cmd = require('node-cmd');
let processId;
const execProm = util.promisify(exec);
const constants = require('../../config/constants.js');

class LogCat {
  async captureLog(modulename) {
    //create deviceLog folder if it doesn't exist
    let dir = './output/deviceLog';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log('Log Folder created successfully!');
    }
    let filePath = `./output/deviceLog/${modulename}.txt`;
    let deviceId =
      platformName.platform == constants.platform.firetv
        ? deviceID.FireTVDeviceID
        : deviceID.Evolve2DeviceID;
    let logCat = logCatCommand.logCatCommand.replace('deviceId', deviceId);
    console.log('logCatCommand from _captureLog:', logCat);
    //Execute LogCat Command
    exec(`${logCat} > ${filePath}`, (error, stdout, stderr) => {
      if (error != null) {
        console.log('error occured');
      }
    });
    console.log('log cat command has been executed');
  }

  async killLogProcess() {
    let deviceId =
      platformName.platform == constants.platform.firetv
        ? deviceID.FireTVDeviceID
        : deviceID.Evolve2DeviceID;
    let processId = await this.getProcessId();
    if (processId != undefined) {
      let killPid = logCatCommand.killPidOfLogCatCommand
        .replace('deviceId', deviceId)
        .replace('processId', processId);
      console.log(killPid);
      await this.runShellCommand(killPid);
    }
  }
  /**
   * Returns ProcessId
   */
  async getProcessId() {
    let deviceId =
      platformName.platform == constants.platform.firetv
        ? deviceID.FireTVDeviceID
        : deviceID.Evolve2DeviceID;
    let processIdCommand = logCatCommand.pidOfLogCatCommand.replace(
      'deviceId',
      deviceId
    );
    console.log(processIdCommand);
    let processId = await this.runShellCommand(processIdCommand);
    processId = processId.stdout;
    processId = processId.toString().split(' ')[1];
    await I.wait(10);
    console.log(processId);
    return processId;
  }
  /**
   * Executes shell command
   * Takes command as parameter
   * Returns Object Result having attributes Error,Stdout and Stderr
   */
  async runShellCommand(command) {
    let result;
    try {
      result = await execProm(command);
    } catch (ex) {
      result = ex;
    }
    return result;
  }
}

module.exports = LogCat;
