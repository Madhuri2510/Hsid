const arguments = process.argv.slice(2);
const spawn = require('cross-spawn');

const genrateCommand = () => {
  const codeceptConfFile = `codecept.${arguments[0]}.conf.js`;
  const codeceptcommand = `npx codeceptjs run --config=./${codeceptConfFile} --reporter mochawesome --profile ${arguments[1]}:${arguments[2]}`;
  return codeceptcommand;
};

const execute = async () => {
  const command = await genrateCommand().split(' ');
  const check = spawn(`${command.shift()}`, command, {stdio: 'inherit'});
};

execute();
