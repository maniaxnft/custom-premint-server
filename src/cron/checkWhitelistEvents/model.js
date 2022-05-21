const mongoose = require("mongoose");

const creativeTweetSchema = mongoose.Schema({
  twitterUserId: {
    type: String,
  },
  tweetText: {
    type: String,
  },
  twitterUserName: {
    type: String,
  },
  tweetId: {
    type: String,
  },
  tweetLink: {
    type: String,
  },
  hashtag: {
    type: String,
  },
});

const creativeTweetModel = mongoose.model("creativeTweet", creativeTweetSchema);
module.exports = creativeTweetModel;
