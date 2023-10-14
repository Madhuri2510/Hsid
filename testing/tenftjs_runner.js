#!/usr/bin/env node
const {Command} = require('commander');
const Codecept = require('codeceptjs/lib/codecept');
const PlatformUtilsFactory = require('./helpers/platform_utils/PlatformUtilsFactory');
const tenftjsUtils = require('./utils/TenftjsUtils');
const COMCAST_TAG = 'comcast';
const MAX_COMCAST_INIT_RETRY_COUNT = 10;
const COMCAST_LOCK_EXPIRE_WAIT_TIME = 60 * 1000;

/**
 * Validate arguments and execute run-worker command
 * The implementation is based on run-worker command in
 * sling-ui/node_modules/codeceptjs/bin/codecept.js
 * @param {List} args List of command, arguments and values
 */
function execRunWorker(args) {
  const program = new Command();
  program.usage('<command> [options]');
  program
    .description('Executes tests in workers')
    .option(
      '-c, --config [file]',
      'configuration file to be used',
      'codecept.tenftjs.conf.js'
    )
    .option('-g, --grep <pattern>', 'only run tests matching <pattern>')
    .option('-i, --invert', 'inverts --grep matches')
    .option('-o, --override [value]', 'override current config options')
    .option('--suites', 'parallel execution of suites not single tests')
    .option('--debug', 'output additional information')
    .option('--verbose', 'output internal logging information')
    .option('--features', 'run only *.feature files and skip tests')
    .option('--tests', 'run only JS test files and skip features')
    .option('--profile [value]', 'configuration profile to be used')
    .option('-p, --plugins <k=v,k2=v2,...>', 'enable plugins, comma-separated')
    .option(
      '-R, --reporter <name>',
      'specify the reporter to use',
      'mochawesome'
    )
    .action(require('codeceptjs/lib/command/run-workers'));
  program.parse(args);
  console.log(
    `tenftjs_runner : execWorker: Arguments and values: ${JSON.stringify(
      program.opts()
    )}`
  );
}

/**
 * Build command and invoke run-worker using options from wrapper
 * and data filtered from websocket server
 * @param {Object} options Options from command wrapper
 * @param {Object} program Wrapper command processor
 * @param {Object} data List of devices after filtering
 */
function buildRunWorkerCmd(options, program, data) {
  /**
   * Wrapper specific arguments used for initialise stack, which to remove for run-worker
   */
  let wrapperArgs = ['targets', 'user', 'updatezephyr', 'appversion', 'server'];
  try {
    /** Pre fill commands */
    let args = [process.argv[0], process.argv[1]];
    /**
     * Construct profile option and add to command arguments
     */
    args.push(
      ...[
        '--debug',
        '--suites',
        '--profile',
        JSON.stringify({
          devices: data,
          server: options.server,
        }),
      ]
    );
    /**
     * Ignore wrapper specific arguments and fill run-worker arguments
     */
    for (const [key, value] of Object.entries(options)) {
      if (!wrapperArgs.includes(key) && undefined !== value) {
        args.push(`--${key}`);
        if (value !== true) {
          args.push(value);
        }
      }
    }
    /**
     * Modify worker count if provided
     * based on available devices
     */
    if (program.args.length === 1) {
      args.push(...program.args);
      let workerCount = args[args.length - 1];
      if (!isNaN(workerCount) && parseInt(workerCount, 10) > data.length) {
        args[args.length - 1] = data.length.toString();
      }
    } else {
      /**
       * Add worker count based on devices
       * if not provided based
       */
      args.push(data.length.toString());
    }
    console.log(
      `tenftjs_runner : buildRunWorkerCmd: Args: ${JSON.stringify(args)}`
    );
    /**
     * Invoke run-worker
     */
    execRunWorker(args);
  } catch (err) {
    console.log(
      `tenftjs_runner : buildRunWorkerCmd: Failed: ${JSON.stringify(err)}`
    );
  }
}

/**
 * Execute worker command wrapper.
 * Parse command line arguments,
 * initialise stack, build command for
 * run-workers and invoke run-worker
 */
async function execWrapper() {
  const program = new Command();
  program.usage('<command> [options]');
  program.version(Codecept.version());
  program
    .description('Execute CI test stage')
    .option('--targets [value]', 'Target devices separated by pipe symbol', '')
    .option('--user [value]', 'User type', 'Local')
    .option('--updatezephyr', 'Update Zephyr')
    .option('--appversion [value]', 'App version', 'Not Available')
    .option(
      '--server [value]',
      'Sandstorm Websocket Server URL',
      'http://192.168.2.4:4000'
    )
    .option(
      '-c, --config [file]',
      'configuration file to be used',
      'codecept.tenftjs.conf.js'
    )
    .option('-g, --grep <pattern>', 'only run tests matching <pattern>')
    .option('-i, --invert', 'inverts --grep matches')
    .option('-o, --override [value]', 'override current config options')
    /*This options should be enabled always. Default value is set in execRunWorker
    .option('--suites', 'parallel execution of suites not single tests')
    .option('--debug', 'output additional information')*/
    .option('--verbose', 'output internal logging information')
    .option('--features', 'run only *.feature files and skip tests')
    .option('--tests', 'run only JS test files and skip features')
    /* Profile argument will be constructed in wrapper, don't consider from command line
    .option('--profile [value]', 'configuration profile to be used') */
    .option('-p, --plugins <k=v,k2=v2,...>', 'enable plugins, comma-separated')
    .option(
      '-R, --reporter <name>',
      'specify the reporter to use',
      'mochawesome'
    );
  program.parse(process.argv);
  let options = program.opts();
  console.log(
    `tenftjs_runner : execWrapper: Arguments and values: ${JSON.stringify(
      program.opts()
    )}`
  );

  let uuidList = options.targets.split('|');
  /* validate inputs from command*/
  if (uuidList.length > 0) {
    if (options.targets.toLowerCase().includes(COMCAST_TAG)) {
      /** Launch app in comcast device */
      uuidList = await initComcastDevices(
        options.server,
        uuidList,
        options.appversion,
        options.updatezephyr ? true : false,
        options.user
      );
    }
  }
  if (uuidList.length > 0) {
    console.log(
      `tenftjs_runner : execWrapper: Devices after launch filter ${uuidList}`
    );
    /**
     * Initialize stack
     */
    let data = await tenftjsUtils.initialiseStack(
      options.server,
      uuidList,
      options.appversion,
      options.updatezephyr ? true : false,
      options.user
    );
    if (data.length > 0) {
      buildRunWorkerCmd(options, program, data);
    } else {
      console.log('tenftjs_runner : execWrapper: No valid devices found');
    }
  } else {
    console.log('tenftjs_runner : execWrapper: Device list empty');
  }
}

/**
 * Launch application in Comcast devices from the list of UUID.
 * Removes id from list if launch fails
 * @param {string} webSocketServer URL of the websocket server
 * @param {list} uuidList List of device UUIDs of devices under test
 * @param {string} appVersion Application version for validation
 * @param {boolean} isZephyr Zephyr update flag for validation
 * @param {string} buildUser Build user type for validation
 * @returns updated uuidList
 */
async function initComcastDevices(
  webSocketServer,
  uuidList,
  appVersion,
  isZephyr,
  buildUser
) {
  let launchList = JSON.parse(JSON.stringify(uuidList));
  let retryCount = 0;
  let listIndex = 0;
  let isComcast = false;
  while (launchList.length > 0 && retryCount < MAX_COMCAST_INIT_RETRY_COUNT) {
    retryCount++;
    console.log(`tenftjs_runner : initComcastDevices: Try: ${retryCount}`);
    listIndex = launchList.length;
    while (listIndex--) {
      if (launchList[listIndex].toLowerCase().startsWith(COMCAST_TAG)) {
        /** Launch app in Comcast*/
        isComcast = true;
        try {
          const comcastDevice = PlatformUtilsFactory.getPlatformUtils({
            uuid: launchList[listIndex],
            type: tenftjsUtils.getPlatformTypeFromId(launchList[listIndex]),
          });
          await comcastDevice.comcastInit();
        } catch (err) {
          console.log(
            `tenftjs_runner : initComcastDevices: Comcast init failed: ${launchList[listIndex]} ${err}`
          );
        }
      } else {
        /** Remove device ID from list if it is not Comcast - no app launch required */
        launchList.splice(listIndex, 1);
      }
    }
    /** Wait for comcast app to launch ro key expiry */
    if (isComcast) {
      await new Promise((resolve) => {
        setTimeout(resolve, COMCAST_LOCK_EXPIRE_WAIT_TIME);
      });
      /** Check if device appeared in sand storm and get details */
      let data = await tenftjsUtils.initialiseStack(
        webSocketServer,
        launchList,
        appVersion,
        isZephyr,
        buildUser
      );
      /** Remove device ID from launch list if app is launched successfully */
      for (listIndex = 0; listIndex < data.length; listIndex++) {
        let uuid = data[listIndex].uuid;
        if (launchList.includes(uuid)) {
          launchList.splice(launchList.indexOf(uuid), 1);
        }
      }
    }
  }
  /** Remove all failed device ID from list */
  launchList.forEach((element) => {
    uuidList.splice(uuidList.indexOf(element), 1);
  });
  return uuidList;
}

/**
 * Invoke execWrapper for command processing
 */
execWrapper();
