const axios = require("axios");
const cron = require("node-cron");

const userModel = require("../../api/auth/models");
const { sendErrorToLogChannel, wait } = require("../../utils");

const Index = (bot) => {
  cron.schedule("*/30 * * * *", () => {
    giveaway({ bot, nextToken: "" });
  });
};

const giveaway = async ({ bot, nextToken }) => {
  const startDate = new Date(process.env.GIVEAWAY_START_DATE);
  const endDate = new Date(process.env.GIVEAWAY_END_DATE);
  const currentDate = new Date();
  if (
    !(startDate <= currentDate && endDate >= currentDate) ||
    process.env.GIVEAWAY_TWEET_ID === "notyet"
  ) {
    return;
  }
  try {
    let query = `max_results=100&tweet.fields=created_at`;
    if (nextToken) {
      query = query.concat(`&pagination_token=${nextToken}`);
    }
    // https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/get-tweets-id-retweeted_by
    const response = await axios.get(
      `https://api.twitter.com/2/tweets/${process.env.GIVEAWAY_TWEET_ID}/retweeted_by${query}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );
    await wait(3000);
    const twitterUsers = response.data?.data;
    if (
      response.data?.meta?.result_count === 0 ||
      !Array.isArray(twitterUsers)
    ) {
      return false;
    }

    for (let twitterUser of twitterUsers) {
      await userModel.findOneAndUpdate(
        {
          discordId: { $exists: true },
          twitterId: twitterUser?.id,
          isFollowingFromTwitter: true,
          walletAddress: { $exists: true },
        },
        { giveaway: true }
      );
    }

    const newNextToken = response.data?.meta?.next_token;
    if (newNextToken) {
      await giveaway({ bot, nextToken: newNextToken });
    }
  } catch (e) {
    console.log("Error at checkIfMetntioned");
    sendErrorToLogChannel(bot, "Error at checkIfMetntioned", e);
  }
};

module.exports = Index;
