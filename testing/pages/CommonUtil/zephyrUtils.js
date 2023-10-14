/* eslint-disable no-undef */
const api = require('../../config/api');
//const client = require('./backend/AxiosClient');
const axios = require('axios');
const client = axios.create();
const assert = require('assert');
const Zephyr_UPDATE_EXECUTION_RESULT_URI =
  '/execution/{EXECUTION_ID}?status={EXECUTION_RESULT}&testerid={TESTER_ID}&allExecutions=false&time={TEST_DURATION}';
const ZEPHYR_GET_RELEASE_INFO_ENDPOINT = '/release';
const ZEPHYR_GET_PHASE_INFO_ENDPOINT = '/cycle/release/';
const ZEPHYR_GET_CLONE_CYCLE_ENDPOINT = '/cycle/cyclephase/clone/';
const ZEPHYR_PUT_CYCLE_INFO_ENDPOINT = '/cycle';
const Zephyr_USER_LOGIN_URI = '/user/current';
const INITIAL_PHASE_NAME = process.env.INITIAL_PHASE_NAME; //To Do get from job 'QoE-Conviva'
const Zephyr_CHANGE_ASSIGNMENTS =
  '/assignmenttree/{CYCLE_PHASE_ID}/bulk/tree/{TCR_CATALOG_TREE_ID}/from/10/to/{TESTER_ID}?cascade=true&easmode=1';
const AUTHORIZATOIN_KEY =
  'Basic c2VydmljZS1hdHZwbUBzbGluZy5jb206cTFzMmMzcjRnNW42';
const Zephyr_GET_TESTCASES_FOR_EXECUTION =
  '/execution?cyclephaseid={CYCLE_PHASE_ID}&releaseid={RELEASE_ID}&pagesize={PAGE_SIZE}';
const Zephyr_GET_COUNT_TESTCASES_BY_PHASE_URI =
  '/testcase/count?tcrcatalogtreeid={TCR_CATALOG_TREE_ID}&releaseid={RELEASE_ID}';
let Total_Count_Of_TestCases;
let allTestMap = new Map();
const currentDateMMDDYYYY = () => {
  return (
    new Date().getMonth() +
    1 +
    '/' +
    new Date().getDate() +
    '/' +
    new Date().getFullYear()
  );
};
let zephyrUser = {};

let zephyrTCMap = new Map();
let headers = {
  Authorization: AUTHORIZATOIN_KEY,
  accept: 'application/json',
  'Content-Type': 'application/json',
};
let releaseInfo = {};
let zephyrSrcInfo = {};
let zephyrDesInfo = {};
const phaseStartDate = currentDateMMDDYYYY(); //'02/10/2021';//get latest date
const phaseEndDate = currentDateMMDDYYYY(); //get latest date

class ZephyrUtil {
  state = {
    result: [],
  };
  //Invoke this from Suiterunner
  constructor(releaseName, currentCycle, currentPhaseName) {
    this.releaseName = releaseName;
    this.currentCycle = currentCycle;
    this.currentPhaseName = currentPhaseName;
    console.log('constructor this.currentPhaseName' + this.currentPhaseName);
    //GET CURRENT ZEPHYR USER
    this.getZephyrUser();
    //GETTING RELEASE INFO
    this.getReleaseInfo(releaseName, currentCycle);
  }
  async getReleaseInfo(releaseName, currentCycle) {
    this.phaseCnt = 0;
    const response = await client.get(
      `${api.zephyr.host}${ZEPHYR_GET_RELEASE_INFO_ENDPOINT}`,
      {
        headers,
      }
    );
    //TODO need to handle response
    this.state.result = response.data;
    this.state.result.forEach((item) => {
      if (releaseName === item.name) {
        releaseInfo.name = item.name;
        releaseInfo.id = item.id;
        releaseInfo.description = item.description;
        releaseInfo.startDate = item.startDate;
        releaseInfo.releaseStartDate = item.releaseStartDate;
        releaseInfo.endDate = item.endDate;
        releaseInfo.releaseEndDate = item.releaseEndDate;
        releaseInfo.createdDate = item.createdDate;
        releaseInfo.status = item.status;
        releaseInfo.projectId = item.projectId;
        releaseInfo.orderId = item.orderId;
        releaseInfo.globalRelease = item.globalRelease;
        releaseInfo.projectRelease = item.projectRelease;
        //console.log(releaseInfo.name + ": " + releaseInfo.id)
      }
    });
    this.setPhaseInfo(currentCycle);
  }
  async setPhaseInfo(currentCycle) {
    console.log('set Phase Info' + releaseInfo.id);
    const response = await client.get(
      `${api.zephyr.host}${ZEPHYR_GET_PHASE_INFO_ENDPOINT}${releaseInfo.id}`,
      {
        headers: headers,
      }
    );
    this.state.result = response;
    this.state.result.data.forEach((item) => {
      if (currentCycle === item.name) {
        const cycleInfo = item.cyclePhases;
        let phaseName = '';
        zephyrSrcInfo.cycleID = item.id;
        console.log('zephyrSrcInfo.cycleID' + zephyrSrcInfo.cycleID);
        cycleInfo.forEach((cycle) => {
          phaseName = cycle.name;
          if (INITIAL_PHASE_NAME == phaseName) {
            zephyrSrcInfo.tcrCatalogTreeId = cycle.tcrCatalogTreeId;
            zephyrSrcInfo.phaseName = INITIAL_PHASE_NAME;
            zephyrSrcInfo.phaseID = cycle.id;
          }
        });
        this.clonePhase(currentCycle);
      }
    });
  }
  async clonePhase(currentCycle) {
    console.log('zephyr phase id:' + zephyrSrcInfo.phaseID);
    await client
      .post(
        `${api.zephyr.host}${ZEPHYR_GET_CLONE_CYCLE_ENDPOINT}${zephyrSrcInfo.phaseID}`,
        {},
        {
          headers: headers,
        }
      )
      .then((response) => {
        zephyrDesInfo.tcrCatalogTreeId = response.data.tcrCatalogTreeId;
        zephyrDesInfo.phaseID = response.data.id;
        zephyrDesInfo.phaseName = this.currentPhaseName;
        zephyrDesInfo.cycleID = '/' + zephyrSrcInfo.cycleID;
      })
      .catch(console.log('failed clone phase'));
    console.log('clone phase success');
    this.renamePhase();
  }
  async updatePhaseInfo(currentCycle) {
    let url = `${api.zephyr.host}${ZEPHYR_GET_PHASE_INFO_ENDPOINT}${releaseInfo.id}`;
    console.log('Update Phase Info:' + url);
    await client
      .get(url, {
        headers: headers,
      })
      .then((response) => {
        console.log('RESPONSE RECEIVED post: ', response);
      })
      .catch(console.log('Failed update phase' + response));
    console.log('Response:' + response);
    this.state.result = response.data;
    let done = false;
    this.state.result.forEach((item) => {
      if (currentCycle === item.name) {
        const cycleInfo = item.cyclePhases;
        console.log('Update phase cycle info:' + cycleInfo);
        let phaseName = '';
        zephyrSrcInfo.cycleID = item.cycleID;
        zephyrDesInfo.cycleID = item.cycleID;
        console.log('zephyrDesInfo.cycleID');
        cycleInfo.forEach((cycle) => {
          phaseName = cycle.name;
          if (INITIAL_PHASE_NAME === phaseName) {
            if (this.phaseCnt == 0) {
              zephyrSrcInfo.tcrCatalogTreeId = cycle.tcrCatalogTreeId;
              zephyrSrcInfo.phaseName = INITIAL_PHASE_NAME;
              zephyrSrcInfo.phaseID = cycle.phaseID;
            } else {
              zephyrDesInfo.tcrCatalogTreeId = cycle.tcrCatalogTreeId;
              zephyrDesInfo.phaseName = this.currentPhaseName;
              zephyrDesInfo.phaseID = cycle.phaseID;
              done = true;
              //break;
            }
          }
          console.log('Update Phase info sucess');
          this.renamePhase();
        });
        if (done) {
          //break;
        }
      }
    });
  }
  async renamePhase() {
    let response = await client
      .put(
        `${api.zephyr.host}${ZEPHYR_PUT_CYCLE_INFO_ENDPOINT}${zephyrDesInfo.cycleID}/phase`,
        {
          phaseEndDate: phaseEndDate,
          name: phaseStartDate + '_' + this.currentPhaseName,
          freeForm: true,
          tcrCatalogTreeId: zephyrDesInfo.tcrCatalogTreeId,
          id: zephyrDesInfo.phaseID,
          phaseStartDate: phaseStartDate,
        },
        {
          headers: headers,
        }
      )
      .catch(console.log);
    console.log('rename Phase suceess');
    this.getTotalCountOfTestCases();
  }

  async assignAllTestCases() {
    console.log('assign test cases ');
    let url = `${api.zephyr.host}${Zephyr_CHANGE_ASSIGNMENTS}`;
    url = url.replace('{CYCLE_PHASE_ID}', zephyrDesInfo.phaseID);
    url = url.replace('{TESTER_ID}', this.zephyrUser.id);
    url = url.replace('{TCR_CATALOG_TREE_ID}', zephyrDesInfo.tcrCatalogTreeId);

    const response = await client.put(url, {}, {headers});
    console.log('response of assign test case', response);
  }
  async getZephyrUser() {
    console.log('get zephr user');
    console.log('client' + `${api.zephyr.host}${Zephyr_USER_LOGIN_URI}`);
    let url = `${api.zephyr.host}${Zephyr_USER_LOGIN_URI}`;
    const response = await client.get(url, {
      headers,
    });
    this.zephyrUser = response.data;
  }
  async getTotalCountOfTestCases() {
    const Zephyr_GET_COUNT_TESTCASES_BY_PHASE_URI =
      '/testcase/count?tcrcatalogtreeid={TCR_CATALOG_TREE_ID}&releaseid={RELEASE_ID}';
    let url = `${api.zephyr.host}${Zephyr_GET_COUNT_TESTCASES_BY_PHASE_URI}`;
    console.log('TCR_CATALOG_TREE_ID:' + zephyrSrcInfo.tcrCatalogTreeId);
    url = url.replace('{RELEASE_ID}', releaseInfo.id);
    url = url.replace('{TCR_CATALOG_TREE_ID}', zephyrDesInfo.tcrCatalogTreeId);
    console.log('ZEPHYR REQUEST URL:getTotalCountOfTestCases:' + url);
    const response = await client.get(url, {headers});
    this.Total_Count_Of_TestCases = response.data;
    this.assignAllTestCases();
  }
  async getAllTestCasesForExecution(statusMap) {
    let url = `${api.zephyr.host}${Zephyr_GET_TESTCASES_FOR_EXECUTION}`;
    url = url
      .replace('{CYCLE_PHASE_ID}', zephyrDesInfo.phaseID)
      .replace('{RELEASE_ID}', releaseInfo.id)
      .replace('{PAGE_SIZE}', this.Total_Count_Of_TestCases);

    const jsonObj = await client.get(url, {headers});
    var resultLength = jsonObj.data.results.length;
    for (let i = 0; i < resultLength; i++) {
      var result = jsonObj.data.results[i];
      var tree = jsonObj.data.results[i].tcrTreeTestcase;
      var testcase = tree.testcase;
      allTestMap.set(testcase.testcaseId, result.id);
    }
    //console.log('Final map:',allTestMap);
    //console.log('statusMap :' ,statusMap);
    for (let key of statusMap.keys()) {
      if (allTestMap.has(parseInt(key))) {
        this.updateTestCaseStatus(
          allTestMap.get(parseInt(key)),
          statusMap.get(key),
          '72'
        ); //
      } else {
        console.log(key + ' test not part of this phase');
      }
    }
  }
  async updateTestCaseStatus(id, executionStatus, executionTime) {
    let url = `${api.zephyr.host}${Zephyr_UPDATE_EXECUTION_RESULT_URI}`;

    let executionID = id;

    url = url
      .replace('{EXECUTION_ID}', executionID)
      .replace('{EXECUTION_RESULT}', executionStatus)
      .replace('{TESTER_ID}', this.zephyrUser.id)
      .replace('{TEST_DURATION}', executionTime);
    console.log('ZEPHYR RESULT URL#####' + url);

    let fields = {
      id: executionID,
      status: executionStatus,
    };
    let response = await client.put(url, fields, {headers}).catch(console.log);
  }
}
module.exports = ZephyrUtil;
