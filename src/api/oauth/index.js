const express = require("express");
const router = express.Router();

const axios = require("axios");
const OAuth = require("oauth");
const util = require("util");

const userModel = require("../repository/models");
const { authenticateUser } = require("../middleware");
const { id } = require("ethers/lib/utils");
const { createOauthHeader } = require("./helper");

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

router.get("/twitter/request_token", authenticateUser, async (req, res) => {
  const url = `https://api.twitter.com/oauth/request_token`;
  const method = "POST";
  const params = new URLSearchParams({
    oauth_callback: process.env.TWITTER_CALLBACK_URL,
  });

  try {
    const response = await axios.post(url, undefined, {
      params,
      headers: {
        Authorization: createOauthHeader({
          method,
          url: `${url}?${params}`,
        }),
      },
    });
    console.log(response.data);
    res.send(response.data);
  } catch (e) {
    console.log(e?.response?.data);
    res.sendStatus(500);
  }
});

module.exports = router;
