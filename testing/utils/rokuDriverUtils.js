const {execSync} = require('child_process');
const {spawn} = require('child_process');

module.exports = {
  /**
   * Launch the driver based on local machine setup
   */
  launchRokuDriver() {
    let os = process.platform;
    if (os.includes('darwin')) {
      execSync(
        'if pgrep RokuWebDriver_mac; then pkill RokuWebDriver_mac; fi',
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        }
      );
    }
    os.includes('darwin')
      ? spawn('./app/roku/RokuWebDriver_mac')
      : spawn('./app/roku/RokuWebDriver_win.exe');
  },
};
