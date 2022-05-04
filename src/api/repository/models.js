const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  walletAddress: {
    type: String,
    unique: true,
  },
  nonce: {
    type: String,
    unique: true,
  },
  discord: {
    type: String,
    unique: true,
  },
  twitter: {
    type: String,
    unique: true,
  },
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
