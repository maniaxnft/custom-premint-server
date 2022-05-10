const express = require("express");
const router = express.Router();

const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2");

const userModel = require("../auth/models");
const { authenticateUser, checkCaptcha } = require("../middleware");
const twitterCallbackModel = require("./model");
const { checkIfFollowingTwitter, checkIfDiscordMember } = require("./services");

router.post("/discord", authenticateUser, checkCaptcha, async (req, res) => {
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
        const user = await userModel.findOneAndUpdate(
          { walletAddress },
          {
            discordId: userResponse.data?.id,
            discordName: userResponse.data?.username,
          },
          { new: true }
        );
        await checkIfDiscordMember(user);
        res.send(userResponse.data?.username);
      } else {
        res.status(500);
      }
    } catch (e) {
      res.status(400);
    }
  } else {
    res.status(401);
  }
});

router.post(
  "/twitter/request_token",
  authenticateUser,
  checkCaptcha,
  async (req, res) => {
    const walletAddress = req.walletAddress;
    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY,
      appSecret: process.env.TWITTER_CONSUMER_SECRET,
    });

    try {
      const response = await client.generateAuthLink(
        process.env.TWITTER_CALLBACK_URL
      );
      const oauthToken = response?.oauth_token;
      const oauthTokenSecret = response?.oauth_token_secret;
      if (oauthToken && oauthTokenSecret) {
        await twitterCallbackModel.create({
          walletAddress,
          oauthToken,
          oauthTokenSecret,
        });
        res.send(response.oauth_token);
      } else {
        res.status(500);
      }
    } catch (e) {
      res.status(500);
    }
  }
);

router.get("/twitter/callback", authenticateUser, async (req, res) => {
  const oauth_token = req.query?.oauth_token;
  const twitterCallback = await twitterCallbackModel
    .findOne({
      oauthToken: oauth_token,
    })
    .lean();
  try {
    const oauth_verifier = req.query?.oauth_verifier;
    const twitterCallback = await twitterCallbackModel
      .findOne({
        oauthToken: oauth_token,
      })
      .lean();
    const oauthTokenSecret = twitterCallback?.oauthTokenSecret;
    if (oauthTokenSecret && oauth_token && oauth_verifier) {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: oauth_token,
        accessSecret: oauthTokenSecret,
      });
      try {
        const user = await client.login(oauth_verifier);
        if (user.userId && user.screenName) {
          const userInDb = await userModel.findOneAndUpdate(
            { walletAddress: twitterCallback.walletAddress },
            {
              twitterId: user.userId,
              twitterName: user.screenName,
            },
            { new: true }
          );
          await checkIfFollowingTwitter(userInDb);
          await twitterCallbackModel.deleteOne({
            oauthToken: oauth_token,
          });
        } else {
          await twitterCallbackModel.findOneAndUpdate(
            { walletAddress: twitterCallback.walletAddress },
            {
              error: "Something went wrong",
            }
          );
        }
      } catch (e) {
        await twitterCallbackModel.findOneAndUpdate(
          { walletAddress: twitterCallback.walletAddress },
          {
            error: "Invalid verifier or access tokens",
          }
        );
      }
    } else {
      await twitterCallbackModel.findOneAndUpdate(
        { walletAddress: twitterCallback.walletAddress },
        {
          error: "You denied the app or your session expired",
        }
      );
    }
  } catch (e) {
    await twitterCallbackModel.findOneAndUpdate(
      { walletAddress: twitterCallback?.walletAddress },
      {
        error: "Something went wrong",
      }
    );
  } finally {
    res.redirect(`${process.env.CLIENT_URL}?twitter_result=done`);
  }
});

router.get("/twitter/check", authenticateUser, async (req, res) => {
  const walletAddress = req.walletAddress;
  try {
    const user = await userModel.findOne({ walletAddress });
    const twitterCallback = await twitterCallbackModel.findOne({
      walletAddress,
    });
    if (!twitterCallback) {
      res.status(200);
    }
    if (twitterCallback?.error) {
      res.status(400).send(twitterCallback?.error);
    }
    if (user.twitterName && user.twitterId) {
      res.send(user.twitterName);
    } else {
      res.status(400);
    }
  } catch (e) {
    res.status(500);
  }
});

module.exports = router;
