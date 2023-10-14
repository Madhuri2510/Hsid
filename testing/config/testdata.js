const environment = (process.env.DISH_EXECUTION_ENV || 'release').toLowerCase(); // used in pipeline execution

const testdata = {
  release: {},
  //Need to update below data based on beta users
  debug: {},
};
module.exports = testdata[environment];
