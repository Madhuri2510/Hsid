let date = '';
let time = '';
var today = '';
class UtilsCodecept {
  //All the common util methods will be defined here

  getDateTime() {
    //Returns current date and time
    today = new Date();
    date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();
    var time =
      today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();
    var dateTime = '_' + date + '_' + time;
    return dateTime;
  }
  appendDateTime(scenarioName) {
    return scenarioName;
  }
  async getTime() {
    today = new Date();
    time =
      today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();
    return time;
  }

  async convertTimetoSeconds(time, delimiter) {
    let timeComponent = await time.split(delimiter);
    let hours, minutes, seconds, timeInSeconds;
    let tArraySize = timeComponent.length;

    // Below check is because there is a possibility of time display either in MM:SS or HH:MM:SS based on Total playaback duration
    if (tArraySize < 3) {
      hours = 0;
    } else {
      hours = timeComponent[tArraySize - 3];
    }
    minutes = timeComponent[tArraySize - 2];
    seconds = timeComponent[tArraySize - 1];
    timeInSeconds = +hours * 60 * 60 + +minutes * 60 + +seconds;
    return timeInSeconds;
  }
}

module.exports = new UtilsCodecept();
