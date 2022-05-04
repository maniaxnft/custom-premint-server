const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  walletAddress: {
    type: String,
  },
  nonce: {
    type: String,
  },
  discord: {
    type: String,
  },
  twitter: {
    type: String,
  },
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
