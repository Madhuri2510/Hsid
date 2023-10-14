/* eslint-disable no-undef */
let addMochawesomeContext;
let currentTest;
let currentSuite;

const {threadId} = require('worker_threads');
const {clearString} = require('codeceptjs/lib/utils');
const fs = require('fs');
const path = require('path');
const builder = require('xmlbuilder');
const resultTypeMapping = {failed: 'FAIL', passed: 'PASS', skipped: 'SKIP'};
const startTime = new Date();
const stringify = require('json-stringify-safe');
const resultIcon = {failed: '❌', success: '✔'};

const {applyFilter, setJiraConfig, reportIssue} = require('./JiraUtils');
const QAFReport = require('./QAFReport');
let qafReport;
class Mochawesome extends Helper {
  constructor(config) {
    super(config);

    // set defaults
    this.options = {
      uniqueScreenshotNames: false,
      disableScreenshots: false,
      resultDir: './output',
    };

    addMochawesomeContext = require('mochawesome/addContext');
    this._createConfig(config);
    qafReport = new QAFReport(config);
    setJiraConfig(config);
    this.initReport();
  }

  initReport() {
    this.root = builder.create('testng-results', {
      total: '0',
      pass: '0',
      fail: '0',
      skip: '0',
    });
    this.suiteNode = this.root.ele('suite', {
      name: 'test1',
      'started-at': startTime.toISOString(),
    });
    this.testNode = this.suiteNode.ele('test', {
      name: 'test1',
      'started-at': startTime.toISOString(),
    });
    this.testCounter = {failed: 0, passed: 0, skipped: 0, total: 0};
    try {
      fs.mkdirSync(this.options.resultDir, {recursive: true});
    } catch (e) {
      console.log('Cannot create folder ', e);
    }
  }

  _createConfig(config) {
    Object.assign(this.options, config);
  }

  async _beforeSuite(suite) {
    currentSuite = suite;
    currentTest = '';
    const skipedTest = await applyFilter(suite);
    if (skipedTest) {
      for (const test of skipedTest) {
        await qafReport.submit(test);
      }
    }
  }

  _afterSuite(suite) {
    this.recordResult(suite);
  }

  _before(test) {
    if (currentSuite && currentSuite.ctx) {
      currentTest = {test: currentSuite.ctx.currentTest};
    }
    test.startedAt = new Date();
  }

  _test(test) {
    currentTest = {test};
  }

  _afterStep(step) {
    if (step.helperMethod === 'reportLog') {
      return;
    }
    const message = resultIcon[step.status] + ' ' + step.toString();
    return this.reportLog(message);
  }

  async _passed(test) {
    test.finishedAt = new Date();
    this.reportLog(`StartedAt: ${test.startedAt}`);
    this.reportLog(`FinishedAt: ${test.finishedAt}`);
    await qafReport.submit(test);
  }

  async _failed(test) {
    test.finishedAt = new Date();
    this.reportLog(`StartedAt: ${test.startedAt}`);
    this.reportLog(`FinishedAt: ${test.finishedAt}`);
    await qafReport.submit(test);
    await reportIssue(test);
    if (this.options.disableScreenshots) {
      return;
    }
    let fileName;
    // Get proper name if we are fail on hook
    if (test.ctx.test.type === 'hook') {
      currentTest = {test: test.ctx.test};
      // ignore retries if we are in hook
      test._retries = -1;
      fileName = clearString(`${test.title}_${currentTest.test.title}`);
    } else {
      currentTest = {test};
      fileName = clearString(test.title);
    }
    if (this.options.uniqueScreenshotNames) {
      const uuid = test.uuid || test.ctx.test.uuid;
      fileName = `${fileName.substring(0, 10)}_${uuid}`;
    }
    if (test._retries < 1 || test._retries === test.retryNum) {
      fileName = `${fileName}.failed.png`;
      return addMochawesomeContext(currentTest, fileName);
    }
  }

  recordResult(suite) {
    //console.log(suite);
    let testToReport = suite.tests.filter((t) => {
      return t.state && t.type === 'test';
    });
    if (testToReport.length > 0) {
      let classNode = this.testNode.ele('class', {name: suite.title});
      testToReport.forEach((test) => {
        let testMethod = classNode.ele('test-method', {
          status: resultTypeMapping[test.state].toUpperCase(),
          signature: test.id,
          name: test.title,
          'duration-ms': test.duration,
        });
        try {
          testMethod.att('started-at', test.startedAt.toISOString());
          testMethod.att('finished-at', test.finishedAt.toISOString());
        } catch (err) {
          console.log(err);
        }
        let reportOutput = '';
        if (test.context) {
          reportOutput = Array.isArray(test.context)
            ? test.context.join('<br />')
            : stringify(test.context, null, 2);
        }
        if (test.screenshot) {
          reportOutput +=
            '<br/><img src="' +
            test.screenshot +
            '" alt="' +
            test.screenshot +
            '" />';
        }
        testMethod.ele('reporter-output').ele('line').dat(reportOutput);
        if (test.err) {
          testMethod
            .ele('exception', {class: test.err.constructor.name})
            .ele('short-stacktrace')
            .dat(test.err);
        }

        this.testCounter[test.state]++;
        this.testCounter.total++;
      });
    }
    let endTime = new Date();
    let duration = endTime - startTime;
    try {
      this.testNode.att('finished-at', endTime.toISOString());
      this.testNode.att('duration-ms', duration);
      this.suiteNode.att('finished-at', endTime.toISOString());
      this.suiteNode.att('duration-ms', duration);

      Object.keys(this.testCounter).map((key, index) => {
        this.root.att(key, this.testCounter[key]);
      });
    } catch (err) {
      console.log(err);
    }
    var xml = this.root.end({pretty: true});
    //console.log(xml);
    fs.writeFileSync(
      path.join(this.options.resultDir, `testng-results-${threadId}.xml`),
      xml
    );
  }

  reportLog(context) {
    if (currentTest === '') {
      currentTest = {test: currentSuite.ctx.test};
    }
    return addMochawesomeContext(currentTest, context);
  }

  static getCurrentTest() {
    if (currentTest === '') {
      currentTest = {test: currentSuite.ctx.test};
    }
    return currentTest;
  }
}

module.exports = Mochawesome;
