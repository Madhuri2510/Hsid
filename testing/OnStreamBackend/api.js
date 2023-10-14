const config = {
  cmp: {
    host: 'https://cmp.watchdishtv.com/cmp/cmp_api',
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
    api: 'https://dishonstream-api.herokuapp.com/api',
  },
  cmpBackend: {
    host: 'https://cmp.watchdishtv.com/cmp/',
  },
};
module.exports = config;
