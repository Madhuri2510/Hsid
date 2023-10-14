const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
let platformName = process.argv[2];
const resultStats = require('./email-report/generateResultStats');
const date = new Date();
const userCred = require('./email-report/userAccount.json');
const users = require('./email-report/users');
const reportLink = require('./email-report/reportLink.json');
let reportStorageLink;
const platform = require('./email-report/platform.json');
let minCountOfTCsForSendingMail = process.argv[3];
let totalExecutedTCs = resultStats.SumOfTCs - resultStats.TotalSkippedTCs;
let today = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
if (totalExecutedTCs >= minCountOfTCsForSendingMail) {
  if (platformName.toUpperCase() === platform.browser) {
    reportStorageLink = reportLink.browser;
  } else if (platformName.toUpperCase() === platform.fireTV) {
    reportStorageLink = reportLink.fireTV;
  } else if (platformName.toUpperCase() === platform.roku) {
    reportStorageLink = reportLink.roku;
  }

  const mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: userCred.userName,
      pass: userCred.password,
    },
  });

  mailTransporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve('./email-report/mailTemplate/'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./email-report/mailTemplate/'),
  };

  mailTransporter.use('compile', hbs(handlebarOptions));

  let mailDetails = {
    from: users.sender,
    to: users.all,
    cc: users.cc,
    subject: `OnStream Automation Report - ${platformName}`,
    template: 'mailTemplate',
    context: {
      resultStats: resultStats,
      date: today,
      platform: platformName,
      link: reportStorageLink,
    },
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log('Error Occurs');
      console.log(err);
    } else {
      console.log('Email sent successfully');
    }
  });
} else {
  console.log(
    `Not sending email report since test cases count is less than ${minCountOfTCsForSendingMail}`
  );
}
