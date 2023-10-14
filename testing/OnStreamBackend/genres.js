const client = require('./AxiosClient');
const {build} = inject();
const buildType = () => {
  return build.buildType == 'release' ? './api' : './apiQaEnv';
};
const path = buildType();
const api = require(path);
const genresEndPoint = require('./endpoints').HEROKU.channelGenres;
let CMP = require('./cmp');
let cmp = new CMP();
let EPG = require('./epg');
let epg = new EPG();
let genres;
let channelGenres;
let smartboxID;

/**
 *
 * @returns an object containing body for genres API request
 */
const setGenresBody = async function _setGenresAPIBody() {
  if (smartboxID == undefined) {
    smartboxID = await cmp.getSmartBoxId();
  }
  let channelIds = [];
  channelIds = await epg.getAllChannelIds();
  let body = {
    smartBoxId: smartboxID,
    channelIds: channelIds,
  };
  return body;
};

/**
 *
 * @returns genres available for the current smartbox ID
 */
const fetchGenres = async function fetchGenres() {
  let body = await setGenresBody();
  const fetchGenres = await client.post(
    `${api.heroku.api}${genresEndPoint}`,
    body
  );
  genres = fetchGenres.data.result.genreButtons;
  return genres;
};

/**
 *
 * @returns an object containing channel ids and the genres they are associated with
 */
const fetchChannelGenres = async function fetchChannelGenres() {
  let body = await setGenresBody();
  const fetchGenres = await client.post(
    `${api.heroku.api}${genresEndPoint}`,
    body
  );
  channelGenres = fetchGenres.data.result.channelGenres;
  return channelGenres;
};

/**
 *
 * @returns an array containing all genres names
 */
const getGenreNames = async function getGenreNames() {
  if (genres == undefined) {
    genres = await fetchGenres();
  }
  let genreNames = [];
  genres.forEach((genre) => {
    genreNames.push(genre.genreName);
  });
  return genreNames;
};

/**
 *
 * @param {string} genreName
 * @returns genre id for respective genre name
 */
const getGenreId = async function getGenreId(genreName) {
  if (genres == undefined) {
    genres = await fetchGenres();
  }
  for (let iteration = 0; iteration < genres.length; iteration++) {
    if (genres[iteration].genreName === genreName) {
      return genres[iteration].genreId;
    }
  }
  throw 'unable to fetch genre ID';
};

/**
 *
 * @param {string} genre
 * @returns count of channels available in respective genre
 */
const getChannelCount = async function getChannelCount(genre) {
  let channelCount = 0;
  if (channelGenres == undefined) {
    channelGenres = await fetchChannelGenres();
  }
  let genreId = await getGenreId(genre);
  let genreIds = Object.values(channelGenres);
  genreIds.forEach((idList) => {
    if (idList != null) {
      if (idList.includes(genreId)) {
        channelCount += 1;
      }
    }
  });
  return channelCount;
};

module.exports = {
  fetchGenres,
  fetchChannelGenres,
  getGenreNames,
  getGenreId,
  getChannelCount,
};
