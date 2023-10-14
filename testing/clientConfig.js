/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const suiteName = require('./config/suiteName');
let userIndex = 0;
class clientConfig {
  userCredentials = {
    username: '',
    password: '',
  };
  //userIndex is for the user to be considered from the list - By defult it is 0(first value from the user list).
  async setUserCredentials(env, userType, specificSuite = null, userindex) {
    const json = env;
    if (userType === null || userType === '') {
      return (this.userCredentials = {});
    }
    var envData = userType.split('.');
    let userData = json[envData[0]][envData[1]][envData[2]];
    for (let [key, value] of Object.entries(suiteName)) {
      if (specificSuite == value) {
        userData = userData[value];
      }
    }
    if (userindex && userindex > 0) {
      this.userCredentials = userData[userindex - 1];
      return this.userCredentials;
    } else {
      let indexValue = await this.getUserIndex(userData.length);
      // let randomIndex = Math.floor(Math.random() * userData.length);
      // this.userCredentials = userData[randomIndex];
      this.userCredentials = userData[indexValue];
      return this.userCredentials;
    }
  }
  /**
   * it returns the index number from the existing array of accounts passed
   */
  async getUserIndex(accountsIndexNumber) {
    if (userIndex >= accountsIndexNumber) {
      userIndex = 0;
      return userIndex;
    } else {
      while (userIndex < accountsIndexNumber) {
        //updaing the global index value
        userIndex = userIndex + 1;
        // returning the current index value
        return userIndex - 1;
      }
    }
  }
}

module.exports = new clientConfig();
