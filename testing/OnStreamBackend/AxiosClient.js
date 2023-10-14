/* eslint-disable no-undef */
const https = require('https');
const axiosRetry = require('axios-retry');
const axios = require('axios');
const client = axios.create();
const {I} = inject();
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

var startTime, endTime;

axiosRetry(client, {
  retries: 1,
  retryCondition: (error) => {
    return true;
  },
  shouldResetTimeout: true,
  retryDelay: () => {
    return 5000;
  },
});

client.defaults.httpsAgent = httpsAgent;
client.defaults.timeout = 180000;
client.interceptors.request.use(
  (request) => {
    let message = {
      method: request.method,
      url: request.url,
      body: request.data,
    };
    console.log('Starting Request', JSON.stringify(message, null, 2));
    startTime = new Date().getTime();
    return request;
  },
  (error) => {
    I.reportLog(error.message);
    throw error.message;
  }
);

client.interceptors.response.use(
  (response) => {
    endTime = new Date().getTime();
    if (endTime - startTime > 60000) {
      throw `Response took longer than 1 minute time: Actual time taken: ${
        endTime - startTime
      }`;
    }
    console.log(
      `${response.status} : ${response.config.method} ${
        response.config.url
      } - ${endTime - startTime} ms`
    );
    if (I !== undefined) {
      I.reportLog(
        `${response.status} : ${response.config.method} ${
          response.config.url
        } - ${endTime - startTime} ms`
      );
    } else {
      console.log('I is undefined');
    }
    return response;
  },
  (error) => {
    let message = {msg: error.message};
    if (error.response) {
      message.response = {
        status: error.response.status,
        headers: error.response.headers,
        body: error.response.data,
      };
    }
    let title = 'Error in request';
    if (error.config) {
      title = `Axios-Error: ${error.config.method} ${error.config.url}`;
    }
    console.log(title);
    if (I !== undefined) {
      I.reportLog({
        title: title,
        value: message,
      });
    }
    throw error;
  }
);
module.exports = client;
