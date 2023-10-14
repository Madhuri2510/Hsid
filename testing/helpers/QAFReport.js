/* eslint-disable no-bitwise */
const {getExecutionENV} = require('./ReportUtils');
const START_TIME = require('../helpers/ReportUtils').START_TIME;
const START_TIME_ISO = new Date(START_TIME).toISOString();
const {Client} = require('@elastic/elasticsearch');

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
/**
 * Based on https://github.com/qmetry/qaf-support-elasticsearch
 */
class QAFReport {
  constructor(config) {
    this.CONFIG = {
      project: {name: 'Sling-RN-E2E' /*cyclename:''*/},
      verSuffix: '_v1',
      indexName: 'qaf_results',
      esNode: 'http://localhost:9200',
      suiteName: 'Sling E2E Automation',
      qafReportingEnabled: true,
    };
    Object.assign(this.CONFIG, config);
    this.esclient = new Client({node: this.CONFIG.esNode});
  }

  async submit(test) {
    if (!this.CONFIG.qafReportingEnabled) {
      return;
    }
    try {
      let doc = await this._getQAFReportDocument(test);
      await this.esclient.index({
        index: this.CONFIG.indexName,
        id: doc.UUID,
        body: doc,
      });

      let cycle = doc.executionInfo.project.cyclename;
      if (cycle) {
        await this._updateCycle(doc, cycle);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async _updateCycle(doc, cycle) {
    let status = doc.status;
    let tcname = doc.metadata.zephyrid;
    let lastsuccess = doc.stTime;
    let lastsuccesscycle = cycle;
    if (status !== 'PASS') {
      try {
        let queryStr = `select executionInfo.project.cyclename as lastsuccesscycle , stTime as lastsuccess from ${this.CONFIG.indexName} where executionInfo.project.cyclename IS NOT NULL AND status = 'PASS' AND metadata.zephyrid = '${tcname}' order by stTime DESC limit 1`;
        const result = await this.esclient.sql.query({
          body: {
            query: queryStr,
          },
        });
        if (result && result.body.rows && result.body.rows.length > 0) {
          const data = result.body.rows.map((row) => {
            const obj = {};
            for (let i = 0; i < result.body.columns.length; i++) {
              obj[result.body.columns[i].name] = row[i];
            }
            return obj;
          });
          lastsuccess = data[0]['lastsuccess'] || null;
          lastsuccesscycle = data[0]['lastsuccesscycle'] || null;
        } else {
          lastsuccess = null;
          lastsuccesscycle = null;
        }
      } catch (err) {
        console.log(err);
        lastsuccess = null;
        lastsuccesscycle = null;
      }
    }
    const result = await this.esclient.updateByQuery({
      index: this.CONFIG.indexName,
      refresh: true,
      body: {
        script: {
          lang: 'painless',
          source: `ctx._source['laststatus'] = '${doc.status}' ; if('${lastsuccess}'!='null'){ctx._source['lastsuccess'] = '${lastsuccess}'; ctx._source['lastsuccesscycle'] = '${lastsuccesscycle}';}`,
        },
        query: {
          bool: {
            must: [
              {
                match: {'executionInfo.project.cyclename': `"${cycle}"`},
              },
              {
                match: {'metadata.zephyrid': `"${tcname}"`},
              },
            ],
          },
        },
      },
    });
  }

  async _getQAFReportDocument(test) {
    let executionInfo = await getExecutionENV(test, this.CONFIG);
    let testStTime = test.startedAt || Date.now();
    if (!this.CONFIG.project.cyclename && executionInfo.appVersion) {
      this.CONFIG.project.cyclename = executionInfo.appVersion;
    }
    let document = {
      stTime: new Date(testStTime).toISOString(),
      UUID: uuidv4(),
      name: test.title,
      status: test.state ? test.state.toUpperCase().substring(0, 4) : 'SKIP',
      className: test.parent.title,
      suite_stTime: START_TIME_ISO,
      duration: test.duration || 0,
      executionInfo: {project: {}, suitename: this.CONFIG.suiteName},
      metadata: {
        groups: [...test.tags],
        file: test.file,
        story: test.parent.title,
      },
      retry: test.retryNum || 0,
    };
    if (test.err) {
      document.exception = {
        class: test.err.constructor.name,
        detailMessage: test.err.message,
        rootCauseMessage: test.err.message,
        detailStackTrace: test.err.stack,
        messages: [test.err.message],
      };
    }

    Object.entries(test.opts).forEach(([key, value]) => {
      if (key && value) {
        document.metadata[key.toLowerCase()] = value.toString();
      }
    });
    Object.entries(executionInfo).forEach(([key, value]) => {
      if (key && value) {
        document.executionInfo[key.toLowerCase()] = value.toString();
      }
    });
    Object.entries(this.CONFIG.project).forEach(([key, value]) => {
      if (key && value) {
        document.executionInfo.project[key.toLowerCase()] = value.toString();
      }
    });

    return document;
  }
}

module.exports = QAFReport;
