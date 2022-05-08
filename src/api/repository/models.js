const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  walletAddress: {
    type: String,
  },
  nonce: {
    type: String,
  },
  discordId: {
    type: String,
  },
  discordName: {
    type: String,
  },
  twitterId: {
    type: String,
  },
  twitterName: {
    type: String,
  },
  isFollowingFromTwitter: {
    type: Boolean,
  },
  isDiscordMember: {
    type: Boolean,
  },
  ownedNFTCount: {
    type: Number,
  },
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
