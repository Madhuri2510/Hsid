const client = require('./AxiosClient');
// const OAuthHelper = require('./OAuthHelper');
// const UmsUtil = require('./UmsUtil');
const api = require('../../../config/api');
// const {TABS} = require('../../mainmenu/constants');
const RELEASES_ENDPOINT = {
  RELEASE: '/releases/',
  RELEASE_GROUP: '/release_groups',
  RELEASE_STAGE_NAME: '/production',
  TOP_RELEASE_GROUPS: '/top_releases_session_trends',
};

const PROJECT_ENDPOINT = {
  PROJECT: '/projects/',
};

const ERRORS_ENDPOINT = {
  ERROR: '/errors',
};

class BugsnagUtil {
  async _getHeaders() {
    let headers = {
      Host: 'api.bugsnag.com',
      Authorization: `${api.bugsnag.token}`,
      'X-Version': 2,
    };
    return headers;
  }
  async getAllReleaseGroupData() {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.bugsnag.host}${PROJECT_ENDPOINT.PROJECT}${api.bugsnag.projectId}${RELEASES_ENDPOINT.RELEASE_GROUP}`,
      {
        headers: headers,
        params: {
          release_stage_name: 'production',
        },
      }
    );
    return response.data;
  }

  async getParticularRelease(id) {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.bugsnag.host}${PROJECT_ENDPOINT.PROJECT}${api.bugsnag.projectId}${RELEASES_ENDPOINT.RELEASE}${id}`,
      {
        headers: headers,
      }
    );
    return response.data;
  }

  async getReleaseErrors() {
    let headers = await this._getHeaders();
    const topReleaseBuild = await bugsnagUtil.getTopReleaseSession();
    const latestBuild = topReleaseBuild.top_release_groups[0].app_version;
    const response = await client.get(
      `${api.bugsnag.host}${PROJECT_ENDPOINT.PROJECT}${api.bugsnag.projectId}${ERRORS_ENDPOINT.ERROR}`,
      {
        headers: headers,
        params: {
          'filters[event.since][][type]': 'eq',
          'filters[event.since][][value]': '30d',
          'filters[error.status][][type]': 'eq',
          'filters[error.status][][value]': 'open',
          'filters[release.seen_in][][type]': 'eq',
          'filters[release.seen_in][][value]': latestBuild,
          'filters[app.release_stage][][value]': 'production',
          'filters[app.release_stage][][type]': 'eq',
        },
      }
    );
    return response.data;
  }

  async getTopReleaseSession() {
    let headers = await this._getHeaders();
    const response = await client.get(
      `${api.bugsnag.host}${PROJECT_ENDPOINT.PROJECT}${api.bugsnag.projectId}${RELEASES_ENDPOINT.RELEASE_GROUP}${RELEASES_ENDPOINT.TOP_RELEASE_GROUPS}${RELEASES_ENDPOINT.RELEASE_STAGE_NAME}`,
      {
        headers: headers,
      }
    );
    return response.data;
  }
}
module.exports = BugsnagUtil;
