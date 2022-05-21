const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
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

const creativeTweetModel = mongoose.model("creativeTweet", userSchema);
module.exports = creativeTweetModel;
