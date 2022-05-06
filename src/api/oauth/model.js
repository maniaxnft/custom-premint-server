const mongoose = require("mongoose");

const twitterCallbackSchema = mongoose.Schema({
  walletAddress: {
    type: String,
  },
  oauthToken: {
    type: String,
  },
  oauthTokenSecret: {
    type: String,
  },
  error: {
    type: String,
  },
});

const twitterCallbackModel = mongoose.model(
  "twitter-callback",
  twitterCallbackSchema
);
module.exports = twitterCallbackModel;
