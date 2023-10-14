const oauth1a = require('oauth-1.0a');
const crypto = require('crypto');
const api = require('../../../config/api');

class OAuthHelper {
  static getAuthHeaderForRequest(request, token) {
    const oauth = oauth1a({
      consumer: {key: api.consumer_key, secret: api.consumer_secret},
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });
    const authorization = oauth.authorize(request, token);
    return oauth.toHeader(authorization);
  }
}
module.exports = OAuthHelper;
