const client = require('./AxiosClient');
const api = require('../../../config/api');
const assert = require('assert');
const GameData = require('../../sportsbook/GameData');
const CmwUtil = require('./CmwUtil');

const SPORTSBOOK_ENDPOINT = {
  ACTIVE_LEAGUE: '/activeLeague',
  MLB_LEAGUE: '/betting?league=mlb',
  NBA_LEAGUE: '/betting?league=nba',
  NFL_LEAGUE: '/betting?league=nfl',
  NCAAF_LEAGUE: '/betting?league=ncaaf',
  NHL_LEAGUE: '/betting?league=nhl',
  NCAAB_LEAGUE: '/betting?league=ncaab',
  SEND_SMS: '/sms',
};

class SportsBookUtil {
  constructor(cmwUtil = new CmwUtil()) {
    this.cmwUtil = cmwUtil;
  }

  async getActiveLeaguesData() {
    let headers = await this.cmwUtil._getHeaders();
    const response = await client.get(
      `${api.sportsbook.host}${SPORTSBOOK_ENDPOINT.ACTIVE_LEAGUE}`,
      {
        headers: headers,
      }
    );
    return response.data;
  }

  async getLeagueData(league) {
    let headers = await this.cmwUtil._getHeaders();
    let leagueResponse;
    switch (league.toLowerCase()) {
      case 'mlb':
        leagueResponse = await client.get(
          `${api.sportsbook.host}${SPORTSBOOK_ENDPOINT.MLB_LEAGUE}`,
          {
            headers: headers,
          }
        );
        break;
      case 'nfl':
        leagueResponse = await client.get(
          `${api.sportsbook.host}${SPORTSBOOK_ENDPOINT.NFL_LEAGUE}`,
          {
            headers: headers,
          }
        );
        break;
      case 'nba':
        leagueResponse = await client.get(
          `${api.sportsbook.host}${SPORTSBOOK_ENDPOINT.NBA_LEAGUE}`,
          {
            headers: headers,
          }
        );
        break;
      case 'ncaaf':
        leagueResponse = await client.get(
          `${api.sportsbook.host}${SPORTSBOOK_ENDPOINT.NCAAF_LEAGUE}`,
          {
            headers: headers,
          }
        );
        break;
      case 'nhl':
        leagueResponse = await client.get(
          `${api.sportsbook.host}${SPORTSBOOK_ENDPOINT.NHL_LEAGUE}`,
          {
            headers: headers,
          }
        );
        break;
      case 'ncaab':
        leagueResponse = await client.get(
          `${api.sportsbook.host}${SPORTSBOOK_ENDPOINT.NCAAB_LEAGUE}`,
          {
            headers: headers,
          }
        );
        break;
    }
    return leagueResponse.data;
  }

  async getHomeTeamGameData(gameID, league) {
    const response = await this.getLeagueData(league);
    const gameCardData = await response.games.find(
      (game) => game.id === gameID
    );
    let alias = gameCardData.homeTeam.alias;
    let winChance = gameCardData.homeTeam.winChance;
    let spread = gameCardData.homeTeam.spread;
    let mLine = gameCardData.homeTeam.mLine;
    let total = gameCardData.total;
    let name = gameCardData.homeTeam.name;
    let city = gameCardData.homeTeam.city;
    const homeTeamData = new GameData(
      alias,
      winChance,
      spread,
      mLine,
      total,
      name,
      city
    );
    return homeTeamData;
  }

  async getAwayTeamGameData(gameID, league) {
    const response = await this.getLeagueData(league);
    const gameCardData = await response.games.find(
      (game) => game.id === gameID
    );
    let alias = gameCardData.awayTeam.alias;
    let winChance = gameCardData.awayTeam.winChance;
    let spread = gameCardData.awayTeam.spread;
    let mLine = gameCardData.awayTeam.mLine;
    let total = gameCardData.total;
    let name = gameCardData.awayTeam.name;
    let city = gameCardData.awayTeam.city;
    const awayTeamData = new GameData(
      alias,
      winChance,
      spread,
      mLine,
      total,
      name,
      city
    );
    return awayTeamData;
  }

  async getActiveLeaguesNames() {
    let activeLeaguesData = await this.getActiveLeaguesData();
    let leagueInfo = activeLeaguesData.activeLeague;
    let activeLeagues = [];
    leagueInfo.forEach((league) => {
      if (league.gameCount > 0) {
        activeLeagues.push(league.alias);
      }
    });
    return activeLeagues;
  }

  async getSendLinkAPIResponse(event_ID, phoneNumber) {
    let headers = await this.cmwUtil._getHeaders();
    const SMS_PARAMS =
      '?eventId=' +
      event_ID +
      '&phoneNumber=' +
      phoneNumber +
      '&eventType=betting';
    const smsResponse = await client.get(
      `${api.sportsbook.host}${SPORTSBOOK_ENDPOINT.SEND_SMS}${SMS_PARAMS}`,
      {
        headers: headers,
      }
    );
    return smsResponse.data.result;
  }
}
module.exports = SportsBookUtil;
