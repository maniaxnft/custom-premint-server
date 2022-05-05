const crypto = require("crypto");
const OAuth1a = require("oauth-1.0a");

const createOauthHeader = (request) => {
  const oauth = new OAuth1a({
    consumer: {
      key: process.env.TWITTER_CONSUMER_KEY,
      secret: process.env.TWITTER_CONSUMER_SECRET,
    },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    },
  });

  const authorization = oauth.authorize(request, {
    key: process.env.TWITTER_TOKEN,
    secret: process.env.TWITTER_TOKEN_SECRET,
  });

  return oauth.toHeader(authorization).Authorization;
};

module.exports = { createOauthHeader };
