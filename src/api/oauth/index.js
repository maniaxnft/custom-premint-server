const express = require("express");
const router = express.Router();

const axios = require("axios");

const userModel = require("../repository/models");
const { authenticateUser } = require("../middleware");
const { id } = require("ethers/lib/utils");

router.post("/discord", authenticateUser, async (req, res) => {
  const walletAddress = req.walletAddress;
  const code = req.body?.code;
  if (code) {
    try {
      const params = new URLSearchParams();
      params.append("client_id", process.env.DISCORD_CLIENT_ID);
      params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
      params.append("scope", "identify");

      const response = await axios.post(
        "https://discord.com/api/oauth2/token",
        params,
        { headers: { "Content-type": "application/x-www-form-urlencoded" } }
      );
      const access_token = response.data?.access_token;
      const userResponse = await axios.get(
        "https://discord.com/api/users/@me",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (userResponse.data?.username && userResponse.data?.id) {
        await userModel.findOneAndUpdate(
          { walletAddress },
          {
            discordId: userResponse.data?.id,
            discordName: userResponse.data?.username,
          }
        );
        res.send(userResponse.data?.username);
      } else {
        res.sendStatus(500);
      }
    } catch (e) {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
