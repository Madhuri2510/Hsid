/* eslint-disable no-undef */
const Detox = require('./helpers/Detox');
let configuration = process.env.CONF || 'androidTV';

describe('Detox', function () {
  // this.retries(1);
  this.timeout(0);

  before(async () => {
    console.log(configuration);
    global.codecept_dir = __dirname;
    I = new Detox({
      configuration,
      reloadReactNative: true,
    });
    return I._beforeSuite();
  });

  beforeEach(async () => {
    await I._before();
  });

  afterEach(async () => await I._after());

  after(async () => await I._afterSuite());

  describe('Welcome', () => {
    beforeEach(async () => {
      await I.see('Home');
    });

    it('should have Home screen', async () => {
      await I.see('Home');
    });
  });
});
