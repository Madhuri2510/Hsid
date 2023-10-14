const log4js = require('log4js');

log4js.configure({
  appenders: {
    fileAppender: {
      type: 'file',
      filename: './logs/automation.log',
      maxLogSize: 10485760,
      backups: 5,
      compress: false,
    },
    console: {type: 'console'},
  },
  categories: {
    default: {appenders: ['fileAppender', 'console'], level: 'all'},
  },
});

module.exports = {
  getLogger(className) {
    return log4js.getLogger(className);
  },
};
