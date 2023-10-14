const client = require('./AxiosClient');
const api = require('./api');
const dayjs = require('dayjs');
const constants = require('../config/constants.js');
const {index} = require('../config/constants.js');
const SPORTS_ENDPOINT = {
  GAMES: '/games?',
};
class Sports {
  static cachedSportsData = null;
  /**
   * Get Date Range parameter to call Nagrastar sports API
   * @returns Date range parameter
   */
  async getDateRangeParam() {
    let yesterday = dayjs().add(-1, 'day').format('YYYY-DD-M');
    let dayAfter = dayjs().add(2, 'day').format('YYYY-DD-M');
    let encodedTimeZone = '%20%2B0000'; // +0000
    let startDate = 'startDate=' + yesterday + encodedTimeZone;
    let endDate = '&endDate=' + dayAfter + encodedTimeZone;
    return startDate + endDate;
  }

  /**
   * Get data of all available games across all leagues
   * @returns sports data of all leagues
   */
  async getSportsData() {
    if (this.cachedSportsData != null) {
      return this.cachedSportsData;
    }
    let DATERANGE = await this.getDateRangeParam();
    const response = await client.get(
      `${api.sports.data}${SPORTS_ENDPOINT.GAMES}${DATERANGE}`
    );
    this.cachedSportsData = response.data.content;
    return response.data.content;
  }

  /**
   * Get games count for any league
   * @param {string} league
   * @returns number of games in particular league
   */
  async getGamesCount(league) {
    let sportsData = await this.getSportsData();
    let games = sportsData.filter((game) => game.league == league);
    return games.length;
  }

  /**
   * Fetches data of all games in given league
   * @param {string} league - name of the league
   * @returns Games data for particular league
   */
  async getGamesData(league) {
    let sportsData = await this.getSportsData();
    let games = sportsData.filter((game) => game.league == league);
    return games;
  }

  /**
   * Get all active leagues with atleast 1 valid game
   * @returns array of active league names
   */
  async getActiveLeagues() {
    let activeLeagues = [];
    for (let i = 0; i < constants.leagues.length; i++) {
      if ((await this.getGamesCount(constants.leagues[i])) > 0) {
        activeLeagues.push(constants.leagues[i]);
      }
    }
    activeLeagues = activeLeagues.reverse();
    activeLeagues.forEach((league) => {
      let count = this.getValidGamesCount(league);
      if (count === 0) {
        activeLeagues.splice(index, 1);
      }
    });  
    return activeLeagues;
  }

  /**
   * Get Live games count in given league
   * @param {string} league
   * @returns number of live games in a given league
   */
  async getLiveGamesCount(league) {
    let games = await this.getGamesData(league);
    let liveGames = games.filter(
      (game) => game.gameStatus === constants.gameStatus.live
    );
    return liveGames.length;
  }

  /**
   * Get Upcoming games count in given league
   * @param {string} league
   * @returns number of Upcoming games in a given league
   */
  async getUpcomingGamesCount(league) {
    let games = await this.getGamesData(league);
    let upcomingGames = games.filter(
      (game) => game.gameStatus === constants.gameStatus.upcoming
    );
    return upcomingGames.length;
  }

  /**
   * Get completed games count in given league
   * @param {string} league
   * @returns number of completed games in a given league
   */
  async getCompletedGamesCount(league) {
    let games = await this.getGamesData(league);
    let completedGames = games.filter(
      (game) => game.gameStatus === constants.gameStatus.completed
    );
    return completedGames.length;
  }

  /**
   * Get cancelled games count in given league
   * @param {string} league
   * @returns number of cancelled games in a given league
   */
  async getCancelledGamesCount(league) {
    let games = await this.getGamesData(league);
    let cancelledGames = games.filter(
      (game) => game.gameStatus === constants.gameStatus.cancelled
    );
    return cancelledGames.length;
  }

  /**
   * Get Valid games count in given league
   * @param {string} league
   * @returns number of valid games in a given league
   */
  async getValidGamesCount(league) {
    let liveGames = await this.getLiveGamesCount(league);
    let completedGames = await this.getCompletedGamesCount(league);
    let upcomingGames = await this.getUpcomingGamesCount(league);
    let cancelledGames = await this.getCancelledGamesCount(league);
    let validGames =
      liveGames + completedGames + upcomingGames - cancelledGames;
    return validGames;
  }

  /**
   * Check if any league is currently active
   * @returns true or false
   */
  async areLeaguesActive() {
    let activeLeagues = await this.getActiveLeagues();
    if (activeLeagues.length === 0) {
      return false;
    } else {
      return true;
    }
  }
}
module.exports = Sports;
