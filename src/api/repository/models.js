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
  twitterId: {
    type: String,
  },
  discordName: {
    type: String,
  },
  twitterName: {
    type: String,
  },
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
