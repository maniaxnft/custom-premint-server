const crypto = require("crypto");
const oauth1a = require("oauth-1.0a");
const { v4 } = require("uuid");

class Oauth1Helper {
  static getAuthHeaderForRequest(method, base_url) {
    const oauth_consumer_key = process.env.TWITTER_CONSUMER_KEY;
    const oauth_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
    const oauth_token = process.env.TWITTER_TOKEN;
    const oauth_token_secret = process.env.TWITTER_TOKEN_SECRET;

    const oauth_timestamp = Math.floor(Date.now() / 1000);
    const oauth_nonce = v4();
    const parameters = {
      oauth_consumer_key,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp,
      oauth_nonce,
      oauth_version: "1.0",
      oauth_token: oauth_consumer_secret,
    };
    let ordered = {};
    Object.keys(parameters)
      .sort()
      .forEach(function (key) {
        ordered[key] = parameters[key];
      });
    let encodedParameters = "";
    for (let k in ordered) {
      const encodedValue = escape(ordered[k]);
      const encodedKey = encodeURIComponent(k);
      if (encodedParameters === "") {
        encodedParameters += `${encodedKey}=${encodedValue}`;
      } else {
        encodedParameters += `&${encodedKey}=${encodedValue}`;
      }
    }
    const encodedUrl = encodeURIComponent(base_url);
    encodedParameters = encodeURIComponent(encodedParameters);
    const signature_base_string = `${method}&${encodedUrl}&${encodedParameters}`;
    const secret_key = oauth_token;
    const secret_token = oauth_token_secret;
    const signing_key = `${encodeURIComponent(secret_key)}&${encodeURIComponent(
      secret_token
    )}`;

    const oauth_signature = crypto
      .createHmac("sha1", signing_key)
      .update(signature_base_string)
      .digest("base64");
    const encoded_oauth_signature = encodeURIComponent(oauth_signature);
    const header = `OAuth oauth_consumer_key="${parameters.oauth_consumer_key}",oauth_token="${parameters.oauth_token}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${parameters.oauth_timestamp}",oauth_nonce="${parameters.oauth_nonce}",oauth_version="1.0",oauth_signature="${encoded_oauth_signature}"`;
    return header;
  }
}

module.exports = Oauth1Helper;
