const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  nonce: {
    type: String,
    required: true,
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
