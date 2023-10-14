const api = require('../../../config/api');
const AthenaExpress = require('athena-express');
const aws = require('aws-sdk');
const {I} = inject();

let seconds = 0;

const awsCredentials = {
  accessKeyId: api.awsCredentials.accessKeyId,
  secretAccessKey: api.awsCredentials.secretAccessKey,
  region: api.awsCredentials.region,
};

aws.config.update(awsCredentials);

const athenaExpressConfig = {
  aws,
  s3: 's3://aws-athena-query-results-695893684697-us-west-2',
}; //configuring athena-express with aws sdk object

const athenaExpress = new AthenaExpress(athenaExpressConfig);

module.exports = {
  async getAppLaunchTime() {
    let deviceGUID = [];

    //create new Array for deviceGUID
    if (api.athenaDeviceGUIDMapping) {
      for (const deviceId in api.athenaDeviceGUIDMapping) {
        deviceGUID.push("'" + api.athenaDeviceGUIDMapping[deviceId] + "'");
      }
    }

    console.log('deviceGUID====' + deviceGUID);
    // await I.reportLog({title: "deviceGUID====", value: deviceGUID});

    if (deviceGUID && deviceGUID !== null && deviceGUID.length > 0) {
      const sqlQuery = `select
            post_time_date, 
            client, 
            avg(timesincelaunch/1000 - previous_timesincelaunch/1000) as avg_load_time_seconds, 
            count(*) as app_loads 
            from 
            ( 
            select 
                post_evar6 as client, 
                post_evar26 as action_name, 
                lag(post_evar26) over (partition by post_evar1, post_evar5, visit_start_time_gmt, post_visid_low, post_visid_high order by cast(post_evar12 as double)) as previous_action, 
                post_evar11 as tab_name, 
                lag(post_evar11) over (partition by post_evar1, post_evar5, visit_start_time_gmt, post_visid_low, post_visid_high order by cast(post_evar12 as double)) as previous_tab_name, 
                cast(post_evar12 as double) as timesincelaunch, 
                cast(lag(post_evar12) over (partition by post_evar1, post_evar5, visit_start_time_gmt, post_visid_low, post_visid_high order by cast(post_evar12 as double)) as double) as previous_timesincelaunch, 
                post_evar10 as screen_name, 
                lag(post_evar10) over (partition by post_evar1, post_evar5, visit_start_time_gmt, post_visid_low, post_visid_high order by cast(post_evar12 as double)) as previous_screen_name 
                , post_time_date 
            from d_adobe_ui.adobe_transform_v2 x1 
            where post_time_date >= current_date - interval '1' day 
            and post_evar5 IN (${deviceGUID})
            ) 
            where action_name like 'Page Load|%' and previous_action = 'Application Launch|' 
            group by 1,2 
            order by post_time_date desc
            ;`;

      console.log('Executing Athena query: ' + sqlQuery);
      // await I.reportLog("Executing Athena query: " + sqlQuery);

      let results = await athenaExpress.query(sqlQuery);

      console.log('results: ' + JSON.stringify(results));

      return results;
    } else {
      await I.reportLog({
        title: 'Error deviceGUID is NULL or not matched.',
        value: deviceGUID,
      });
    }
  },
  async getPageLoadTime(previous_tab_name, tab_name) {
    let deviceGUID = [];

    //create new Array for deviceGUID
    if (api.athenaDeviceGUIDMapping) {
      for (const deviceId in api.athenaDeviceGUIDMapping) {
        deviceGUID.push("'" + api.athenaDeviceGUIDMapping[deviceId] + "'");
      }
    }

    console.log('deviceGUID====' + deviceGUID);
    // await I.reportLog("deviceGUID====" + deviceGUID);

    if (deviceGUID && deviceGUID !== null && deviceGUID.length > 0) {
      const sqlQuery = `select
            post_evar11 as tab_name,
            previous_tab_name,
            post_time_date,
            approx_percentile((cast(post_evar12 as double)/1000 - cast(previous_timesincelaunch as double)/1000),0.95) as avg_load_time_seconds,
            count(*) as records
          from
          (
          select 
            post_evar26,
            lag(post_evar26) over (partition by post_evar1, post_evar5, visit_start_time_gmt ||'|'|| post_visid_low ||'|'|| post_visid_high  order by cast(post_evar12 as double)) as previous_action,
            post_evar11,
            lag(post_evar11) over (partition by post_evar1, post_evar5, visit_start_time_gmt ||'|'|| post_visid_low ||'|'|| post_visid_high order by cast(post_evar12 as double)) as previous_tab_name,
            post_evar12,
            lag(post_evar12) over (partition by post_evar1, post_evar5, visit_start_time_gmt ||'|'|| post_visid_low ||'|'|| post_visid_high order by cast(post_evar12 as double)) as previous_timesincelaunch,
            post_time_date,
            post_evar10
            from d_adobe_ui.adobe_transform_v2 
          where post_time_date >= current_date - interval '1' day
          and post_evar5 IN (${deviceGUID})
          )
          where post_evar26 like 'Page Load%'
          and previous_tab_name = '${previous_tab_name}'
          and post_evar11 = '${tab_name}'
          group by 3, previous_tab_name,1
          order by 3
          `;

      console.log('Executing Athena query: ' + sqlQuery);
      // await I.reportLog("Executing Athena query: " + sqlQuery);

      let results = await athenaExpress.query(sqlQuery);

      // await I.reportLog("results: " + JSON.stringify(results));
      // console.log("results: " + JSON.stringify(results));

      return results;
    } else {
      await I.reportLog(
        'Error deviceGUID is NULL or not matched ' + deviceGUID
      );
    }
  },
};
