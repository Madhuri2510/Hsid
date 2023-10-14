#!/usr/bin/env node
const {Command} = require('commander');
const Codecept = require('codeceptjs/lib/codecept');

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
      'codecept.browser.conf.js'
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
    `browser_runner : execWorker: Arguments and values: ${JSON.stringify(
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
  let wrapperArgs = ['targets', 'server'];
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
      `browser_runner : buildRunWorkerCmd: Args: ${JSON.stringify(args)}`
    );
    /**
     * Invoke run-worker
     */
    execRunWorker(args);
  } catch (err) {
    console.log(
      `browser_runner : buildRunWorkerCmd: Failed: ${JSON.stringify(err)}`
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
    .option(
      '--server [value]',
      'Selenium Server/Grid URL',
      'http://127.0.0.1:4444/wd/hub'
    )
    .option(
      '-c, --config [file]',
      'configuration file to be used',
      'codecept.browser.conf.js'
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
    `browser_runner : execWrapper: Arguments and values: ${JSON.stringify(
      program.opts()
    )}`
  );

  let uuidList = options.targets.split('|');
  /* validate inputs from command*/
  if (uuidList.length > 0) {
    buildRunWorkerCmd(options, program, uuidList);
  } else {
    console.log('browser_runner : execWrapper: Device list empty');
  }
}

/**
 * Invoke execWrapper for command processing
 */
execWrapper();
