#!/usr/bin/env node
const program = require('commander');
const Codecept = require('codeceptjs/lib/codecept');

if (
  process.versions.node &&
  process.versions.node.split('.') &&
  process.versions.node.split('.')[0] < 8
) {
  console.log('NodeJS >= 8 is required to run.');
  //print();
  console.log('Please upgrade your NodeJS engine');
  console.log(`Current NodeJS version: ${process.version}`);
  process.exit(1);
}

program.usage('<command> [options]');
program.version(Codecept.version());

program
  .command('init [path]')
  .description('Creates dummy config in current dir or [path]')
  .action(require('codeceptjs/lib/command/init'));

program
  .command('migrate [path]')
  .description('Migrate json config to js config in current dir or [path]')
  .action(require('codeceptjs/lib/command/configMigrate'));

program
  .command('shell [path]')
  .alias('sh')
  .description('Interactive shell')
  .option('--verbose', 'output internal logging information')
  .option('--profile [value]', 'configuration profile to be used')
  .action(require('codeceptjs/lib/command/interactive'));

program
  .command('list [path]')
  .alias('l')
  .description('List all actions for I.')
  .action(require('codeceptjs/lib/command/list'));

program
  .command('def [path]')
  .description('Generates TypeScript definitions for all I actions.')
  .option('-c, --config [file]', 'configuration file to be used')
  .option('-o, --output [folder]', 'target folder to paste definitions')
  .action(require('codeceptjs/lib/command/definitions'));

program
  .command('run [test]')
  .description('Executes tests')

  // codecept-only options
  .option('--steps', 'show step-by-step execution')
  .option('--debug', 'output additional information')
  .option('--verbose', 'output internal logging information')
  .option('-o, --override [value]', 'override current config options')
  .option('--profile [value]', 'configuration profile to be used')
  .option('-c, --config [file]', 'configuration file to be used')
  .option('--features', 'run only *.feature files and skip tests')
  .option('--tests', 'run only JS test files and skip features')
  .option('-p, --plugins <k=v,k2=v2,...>', 'enable plugins, comma-separated')

  // mocha options
  .option('--colors', 'force enabling of colors')
  .option('--no-colors', 'force disabling of colors')
  .option('-G, --growl', 'enable growl notification support')
  .option('-O, --reporter-options <k=v,k2=v2,...>', 'reporter-specific options')
  .option('-R, --reporter <name>', 'specify the reporter to use')
  .option('-S, --sort', 'sort test files')
  .option('-b, --bail', 'bail after first test failure')
  .option('-d, --debug', "enable node's debugger, synonym for node --debug")
  .option('-g, --grep <pattern>', 'only run tests matching <pattern>')
  .option('-f, --fgrep <string>', 'only run tests containing <string>')
  .option('-i, --invert', 'inverts --grep and --fgrep matches')
  .option('--full-trace', 'display the full stack trace')
  .option(
    '--compilers <ext>:<module>,...',
    'use the given module(s) to compile files'
  )
  .option('--debug-brk', "enable node's debugger breaking on the first line")
  .option(
    '--inline-diffs',
    'display actual/expected differences inline within each string'
  )
  .option(
    '--no-exit',
    'require a clean shutdown of the event loop: mocha will not call process.exit'
  )
  .option('--recursive', 'include sub directories')
  .option('--trace', 'trace function calls')
  .option('--child <string>', 'option for child processes')

  .action(require('codeceptjs/lib/command/run'));

program
  .command('run-rerun [test]')
  .description('Executes tests in more than one test suite run')

  // codecept-only options
  .option('--steps', 'show step-by-step execution')
  .option('--debug', 'output additional information')
  .option('--verbose', 'output internal logging information')
  .option('-o, --override [value]', 'override current config options')
  .option('--profile [value]', 'configuration profile to be used')
  .option('-c, --config [file]', 'configuration file to be used')
  .option('--features', 'run only *.feature files and skip tests')
  .option('--tests', 'run only JS test files and skip features')
  .option('-p, --plugins <k=v,k2=v2,...>', 'enable plugins, comma-separated')

  // mocha options
  .option('--colors', 'force enabling of colors')
  .option('--no-colors', 'force disabling of colors')
  .option('-G, --growl', 'enable growl notification support')
  .option('-O, --reporter-options <k=v,k2=v2,...>', 'reporter-specific options')
  .option('-R, --reporter <name>', 'specify the reporter to use')
  .option('-S, --sort', 'sort test files')
  .option('-b, --bail', 'bail after first test failure')
  .option('-d, --debug', "enable node's debugger, synonym for node --debug")
  .option('-g, --grep <pattern>', 'only run tests matching <pattern>')
  .option('-f, --fgrep <string>', 'only run tests containing <string>')
  .option('-i, --invert', 'inverts --grep and --fgrep matches')
  .option('--full-trace', 'display the full stack trace')
  .option(
    '--compilers <ext>:<module>,...',
    'use the given module(s) to compile files'
  )
  .option('--debug-brk', "enable node's debugger breaking on the first line")
  .option(
    '--inline-diffs',
    'display actual/expected differences inline within each string'
  )
  .option(
    '--no-exit',
    'require a clean shutdown of the event loop: mocha will not call process.exit'
  )
  .option('--recursive', 'include sub directories')
  .option('--trace', 'trace function calls')
  .option('--child <string>', 'option for child processes')

  .action(require('codeceptjs/lib/command/run-rerun'));

program
  .command('run-workers <workers>')
  .description('Executes tests in workers')
  .option('-c, --config [file]', 'configuration file to be used')
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
  .option('-R, --reporter <name>', 'specify the reporter to use')
  .action(require('codeceptjs/lib/command/run-workers'));

program.on('command:*', (cmd) => {
  console.log(`\nUnknown command ${cmd}\n`);
  program.outputHelp();
});

if (process.argv.length <= 2) {
  program.outputHelp();
}
program.parse(process.argv);
