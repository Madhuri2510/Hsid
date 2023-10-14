/* eslint-disable no-undef */
const client = require('./AxiosClient');
const api = require('../../../config/api');
const {getGitConfig} = require('../../../config/gitConfig');
const SPOTLIGHT_RECOMMENDATION_ENDPOINT =
  '/recommended-spotlight/recommendations';
const CATEGORIES_RECOMMENDATION_ENDPOINT =
  '/recommended-categories/recommendations';
const MOST_WATCHED_CHANNELS = '/mostwatchedchannels/user';

const CmsUtil = require('./CmsUtil');
const environment = getGitConfig('DISH_EXECUTION_ENV').toLowerCase();
const platform = getGitConfig('PLATFORM');

class BigDataUtil {
  constructor(user_details) {
    this.user_details = user_details;
    this.user_guid = user_details.guid;
    this.entitledKey = Buffer.from(
      user_details.subscriptionpacks
        .map((subscription) => subscription.id)
        .join(','),
      'binary'
    ).toString('base64');
    //TO-DO: call geo location api
    this.timezone = '-0700';
    this.dma = '770';
    if (platform === 'androidTV') {
      this.platform = 'android';
    } else {
      this.platform = api.platform;
    }
  }

  async getRecommendedSpotlight(ribbon_id) {
    const params = new URLSearchParams({
      userID: this.user_guid,
      ribbonID: ribbon_id,
      entitledKey: this.entitledKey,
    }).toString();
    const response = await client.get(
      `${api.bigdata.host}${SPOTLIGHT_RECOMMENDATION_ENDPOINT}?${params}`
    );
    return response.data;
  }

  static async getTilesDetails(tiles) {
    const assetDetails = [];
    for (const tile of tiles) {
      let assetDetail = await BigDataUtil.getTileDetails(tile);
      if (assetDetail) {
        assetDetail._explanations = tile.explanations;
        assetDetail.type = tile.type;
        assetDetails.push(assetDetail);
      }
    }
    return assetDetails;
  }

  static async getTileDetails(tile) {
    try {
      if (tile.type === 'liveChannel' || tile.type === 'channel') {
        let channel = await CmsUtil.getChannelDetail(tile.id);
        return channel;
      } else if (tile.type === 'asset') {
        let asset = await CmsUtil.getAssetInfo(tile.id);
        return asset;
      } else if (tile.type === 'franchise') {
        let franchise = await CmsUtil.getFranchisesInfo(tile.id);
        return franchise;
      } else if (tile.type === 'program') {
        let program = await CmsUtil.getProgramInfo(tile.id);
        return program;
      }
    } catch (error) {
      //This should not happen
      console.log(`Tile not found in CMS: ${JSON.stringify(tile)}`);
    }
  }

  async getMostWatchedChannelByUser() {
    const params = new URLSearchParams({
      userId: this.user_guid,
    }).toString();
    const response = await client.get(
      `${api.bigdata.bigdatamostwatched}${MOST_WATCHED_CHANNELS}?${params}`
    );
    return response.data.most_watched_channels;
  }

  async getRecommendedCategoryTiles(categoryName) {
    const params = new URLSearchParams({
      userID: this.user_guid,
      categoryID: categoryName,
      entitledKey: this.entitledKey,
    }).toString();
    const response = await client.get(
      `${api.bigdata.host}${CATEGORIES_RECOMMENDATION_ENDPOINT}?${params}`
    );
    return response.data.tiles;
  }

  async getPopularSearchesRecommendation() {
    const params = new URLSearchParams({
      userID: this.user_guid,
      pack_guid: this.user_details.subscriptionpacks
        .map((subscription) => subscription.id)
        .join(','),
    }).toString();
    const response = await client.get(
      `${api.bigdata.popularSearches}/popularsearches/v1/dma/${this.dma}/offset/${this.timezone}/platform/${this.platform}?${params}`
    );
    return response.data;
  }

  async getOnDemandTiles(screen, ribbon) {
    let tiles = [];
    let response = [];
    let error = null;
    for (let subscription of this.user_details.subscriptionpacks) {
      ribbon = ribbon.replace(new RegExp(' ', 'g'), '%20');
      let domainId = environment === 'beta' ? 4 : 1;

      response = await client
        .get(
          `${api.bigdata.collectionServices}/api/v3/ribbon/dma/${this.dma}/offset/${this.timezone}/domain/${domainId}/product/sling/platform/${this.platform}/screen/${screen}/ribbon/${ribbon}?state=active&pack_ids=${subscription.id}`,
          {headers: {'accept-encoding': 'gzip'}}
        )
        .catch(async (err) => {
          error = err.response.status;
        });
      if (error === 404 && environment === 'beta') {
        continue;
      }
      if (response.data.tiles) {
        response.data.tiles.forEach((tile) => {
          tiles.push(tile);
        });
      }
    }
    return tiles;
  }
}
module.exports = BigDataUtil;
