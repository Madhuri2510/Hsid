const config = {
  cmp: {
    host: 'https://cmp.qa.dcm.dishtech.org/cmp/cmp_api',
  },
  smartbox: {
    id: 'https://streaming0.watchdishtv.com/serviceepginterface/identifier',
  },
  epg: {
    epgdata:
      'https://streaming0.watchdishtv.com/serviceepginterface/serviceepgdata',
  },
  sports: {
    data: 'https://nsapi-stag.echodata.tv/Gamefinder/api',
  },
  cosmos: {
    data: 'https://dishonstream-api-cosmos.herokuapp.com/api/metadata/bulkprograms',
  },
  heroku: {
    api: 'https://dishonstream-api-dev.herokuapp.com/api',
  },
  cmpBackend: {
    host: 'https://cmp.qa.dcm.dishtech.org/cmp',
  },
};
module.exports = config;
