const express = require("express");
const router = express.Router();

const { generateNonce } = require("siwe");

router.get("/nonce", function (req, res, next) {
  const nonce = generateNonce();
  res.send(nonce);
});

module.exports = router;
