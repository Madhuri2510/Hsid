const client = require('axios').default;
const {addToContext, getZepherID, getExecutionENV} = require('./ReportUtils');
const gitConfig = require('../config/gitConfig');

const REST_API_ENDPOINT = '/rest/api/2';
const SEARCH_BUG_JQL = 'issuetype = Bug  AND text ~ ';
const SEARCH_OPEN_BUG_JQL = `status != Done  AND ${SEARCH_BUG_JQL}`;
const SEARCH_EXISTING_BUG_To_REOPEN_JQL = `resolution not in ( Duplicate, "Won\'t Do") AND ${SEARCH_BUG_JQL}`;
const SEARCH_EXISTING_BUG_To_IGNORE_JQL = `resolution in (Duplicate, "Won\'t Do") AND ${SEARCH_BUG_JQL}`;
const SEARCH_OPEN_BUGJS10ft_JQL = `status != Done AND labels in (10ft-JS) AND ${SEARCH_BUG_JQL}`;

class JiraUtils {
  static options = {
    JIRA_URL: 'https://p-jira.imovetv.com',
    credentials: '',
    skipOnOpenIssues: false,
    reportBug: false,
  };

  static setJiraConfig(config) {
    Object.assign(JiraUtils.options, config);
  }

  static async skipOnOpenIssues(test) {
    if (JiraUtils.options.skipOnOpenIssues) {
      let testCaseId = getZepherID(test);
      if (!testCaseId) {
        test.pending = true;
        test.err = new Error('Test without test case ID');
        test.err.name = 'PendingTestCase';
        test.run = function skip() {
          this.skip();
        };
        return true;
      }
      console.log(`Looking for open issues for ${testCaseId}`);
      // Added logic for Js10ft platform defect skip.
      //let queryString = `${SEARCH_OPEN_BUG_JQL}"zephyrid ${testCaseId}"`;
      let queryString = gitConfig.isJS10ftPlatform()
        ? `${SEARCH_OPEN_BUGJS10ft_JQL}"zephyrid ${testCaseId}"`
        : `${SEARCH_OPEN_BUG_JQL}"zephyrid ${testCaseId}"`;
      const response = await JiraUtils.searchJiraIssues(queryString);
      //console.log(response);
      if (response.data && response.data.total > 0) {
        let issues = response.data.issues.map(
          (a) =>
            `\r\n${a.key} : [${a.fields.status.name}] : ${a.fields.summary}`
        );
        let msg = `Found known open issue(s) ${issues}`;
        test.opts.issues = response.data.issues.map((a) => a.key);
        console.log(
          `excluding ${testCaseId} from execution:  ${test.title} ${msg}`
        );
        test.pending = true;
        test.err = new Error(msg);
        test.err.name = 'Known issue(s)';
        test.run = function skip() {
          this.skip();
        };
        return true;
      }
      return false;
    }
  }

  static async applyFilter(suite) {
    const skippedTests = [];
    if (JiraUtils.options.skipOnOpenIssues) {
      for (const test of suite.tests) {
        const skipped = await JiraUtils.skipOnOpenIssues(test);
        if (skipped) {
          skippedTests.push(test);
        }
      }
    }
    return skippedTests;
  }
  static async searchJiraIssues(queryString) {
    const params = new URLSearchParams({
      jql: queryString,
      fields: ['key', 'summary', 'status', 'resolution'],
    }).toString();
    let response = {};
    try {
      response = await client.get(`${JiraUtils.issueSearchUrl}?${params}`, {
        headers: JiraUtils.jiraReqHeaders,
      });
    } catch (error) {
      console.log(error);
      response = error.response
        ? error.response
        : error.data && error.data.response
        ? error.data.response
        : {};
    }
    return response;
  }
  static async reportIssue(test) {
    //report only assertion failures
    if (
      JiraUtils.options.reportBug &&
      test.err &&
      test.err.constructor.name === 'AssertionError'
    ) {
      let errMsg = test.err.message;
      let testCaseId = getZepherID(test);
      let jQLSerchOptions = `"zephyrid ${testCaseId}" AND text ~ "${errMsg}"`;
      let response = {};
      let queryString = '';
      //should be ignored if resolved as Won't Do or Duplicate,
      try {
        queryString = `${SEARCH_EXISTING_BUG_To_IGNORE_JQL}${jQLSerchOptions}`;
        response = await JiraUtils.searchJiraIssues(queryString);
      } catch (error) {
        console.log(error);
        response = error.response
          ? error.response
          : error.data && error.data.response
          ? error.data.response
          : {};
      }

      if (response.data && response.data.total > 0) {
        addToContext(test, `Existing issue  to ignore JQL: ${queryString}`);
        //do nothing....
        let issuesDetails = response.data.issues.map(
          (a) =>
            `\n${JiraUtils.options.JIRA_URL}/browse/${a.key} : [${a.fields.status.name}] : ${a.fields.summary}`
        );
        addToContext(test, `Found issue(s) to ignore: ${issuesDetails}`);
        return;
      }

      //alredy exist reopen it if not resolved as Won't Do or Duplicate,
      queryString = `${SEARCH_EXISTING_BUG_To_REOPEN_JQL}${jQLSerchOptions}`;
      try {
        response = await JiraUtils.searchJiraIssues(queryString);
      } catch (error) {
        console.log(error);
      }
      test.opts.issues = [];
      if (response.data && response.data.total > 0) {
        addToContext(test, `Existing issue JQL: ${queryString}`);

        //should it be reopened or create new???
        response.data.issues.forEach(async (issue) => {
          //let resolution = issue.fields.resolution?issue.fields.resolution.name:'';
          test.opts.issues.push(issue.key);
          addToContext(
            test,
            `Existing issue: [${issue.key}]: ${issue.fields.summary}`
          );
          addToContext(
            test,
            `${JiraUtils.options.JIRA_URL}/browse/${issue.key}`
          );
        });
        //return;
      }
      //cerate new
      response = {};
      try {
        let exeEnv = await getExecutionENV(test, null);
        response = await client.post(
          JiraUtils.issueCreateUrl,
          JiraUtils._createNewIssueRequestBody(test, exeEnv),
          {
            headers: JiraUtils.jiraReqHeaders,
          }
        );
        //test.jiraIssue = response.data.key;
        if (response.data && response.data.key) {
          let issueLink = `${JiraUtils.options.JIRA_URL}/browse/${response.data.key}`;
          addToContext(test, 'New Issue Created in JIRA:');
          addToContext(test, issueLink);
          test.opts.issues.push(response.data.key);
        }
      } catch (error) {
        console.log(error);
        response = error.response
          ? error.response
          : error.data && error.data.response
          ? error.data.response
          : {};
        addToContext(test, `Unable to create issue ${error}: ${error.message}`);
      }
    }
  }
  static _createNewIssueRequestBody(test, exeEnv) {
    // let desc = test.title + '\r\n' + test.context.join('\r\n');
    let reqBody = {
      fields: {
        summary: `E2E-Auto: ${test.opts.ZephyrId} ${test.err.message}`,
        reporter: {
          name: 'service-tcoe@sling.com',
        },
        description:
          'E2E-Auto bug found in execution (Detailed explaination will come soon)',
        issuetype: {
          id: '10004', //Bug
        },
        project: {
          key: 'RNUI',
        },
        priority: {
          id: '8', // Major (P2)
        },
        // environment: `Environment: ${exeEnv.env} \r\n\App version : ${exeEnv.appVersion}\r\n\r\n${exeEnv.modleGroup} - ${exeEnv.os} `,
        customfield_12503: {
          value: 'FireTV',
        },
        customfield_18202: exeEnv.os ? [exeEnv.os] : ['Fire OS 6.2.8.0'], //Device OS Version is required
        customfield_18203: exeEnv.model ? [exeEnv.model] : ['AFTMM'], //Device Model is required.
        customfield_12503: {value: 'FireTV'},
        customfield_13001: [{id: '13002'}],
        customfield_18400: 'N/A',
        customfield_18401: 'N/A',
      },
    };
    return reqBody;
  }

  static get issueCreateUrl() {
    return `${JiraUtils.options.JIRA_URL}${REST_API_ENDPOINT}/issue`;
  }
  static get issueSearchUrl() {
    return `${JiraUtils.options.JIRA_URL}${REST_API_ENDPOINT}/search`;
  }
  static get jiraReqHeaders() {
    return {
      Authorization: `Basic ${JiraUtils.options.credentials}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }
}

module.exports = JiraUtils;
