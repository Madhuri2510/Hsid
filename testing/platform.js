/* eslint-disable no-undef */
// this file will pick up the platform based on the cofig we are setting ex. codecept.androidTv.conf
platformFn = () => {
  const platform = ['androidTV', 'appleTV', 'mobile', 'fireTV', 'browser'];
  const data = [];
  platform.forEach((pl) => {
    const flag = process.argv.forEach((item) => {
      if (item.toString().includes('codecept.' + pl + '.conf')) {
        data.push(pl);
      }
    });
  });
  return data[0];
};
module.exports = platformFn();
