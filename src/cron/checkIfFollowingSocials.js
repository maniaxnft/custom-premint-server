const axios = require("axios");
const Discord = require("discord.js");
const cron = require("node-cron");

const userModel = require("../api/auth/models");
const { sendErrorToLogChannel, wait } = require("../utils");

const checkIfFollowingSocials = () => {
  cron.schedule("*/30 * * * *", () => {
    main();
  });
};

const main = async () => {
  const bot = new Discord.Client({
    intents: [
      Discord.Intents.FLAGS.GUILDS,
      Discord.Intents.FLAGS.GUILD_MESSAGES,
      Discord.Intents.FLAGS.GUILD_MEMBERS,
      Discord.Intents.FLAGS.GUILD_PRESENCES,
      Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
  });
  try {
    await bot.login(process.env.DISCORD_BOT_TOKEN);
    await wait(3000);
    check(bot);
  } catch (e) {
    throw new Error(e);
  }
};

const check = async (bot) => {
  const guild = await bot.guilds?.fetch(process.env.DISCORD_BOT_GUILD_ID);
  const users = await userModel
    .find({
      discordId: { $exists: true },
      twitterId: { $exists: true },
      walletAddress: { $exists: true },
    })
    .lean();
  for (let user of users) {
    const { walletAddress, twitterId, discordId } = user;
    try {
      const discordMember = guild.members.cache.get(discordId);
      await userModel.findOneAndUpdate(
        { walletAddress },
        { isDiscordMember: discordMember ? true : false }
      );
      const tokenRes = await axios.post(
        `https://api.twitter.com/oauth2/token?grant_type=client_credentials`,
        {},
        {
          auth: {
            username: process.env.TWITTER_CONSUMER_KEY,
            password: process.env.TWITTER_CONSUMER_SECRET,
          },
        }
      );
      const accessToken = tokenRes.data?.access_token;

      const res = await axios.get(
        `https://api.twitter.com/2/users/${twitterId}/following?max_results=1000`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const nextToken = res?.data?.meta?.next_token;
      const isFollowingFromTwitter =
        res.data?.data?.filter(
          (account) => account.id === process.env.TWITTER_OFFICIAL_CHANNEL_ID
        ).length === 1;
      await userModel.findOneAndUpdate(
        { walletAddress: user.walletAddress },
        { isFollowingFromTwitter }
      );
      if (nextToken && !isFollowingFromTwitter) {
        await checkNextPage(accessToken, nextToken, walletAddress, twitterId);
      }
    } catch (e) {
      sendErrorToLogChannel(bot, "Error on checkIfFollowingSocials", e);
    }
  }
};

const checkNextPage = async (
  accessToken,
  nextToken,
  walletAddress,
  twitterId
) => {
  const res = await axios.get(
    `https://api.twitter.com/2/users/${twitterId}/following?max_results=1000&pagination_token=${nextToken}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  await wait(1000);
  const isFollowingFromTwitter =
    res.data?.data?.filter(
      (account) => account.id === process.env.TWITTER_OFFICIAL_CHANNEL_ID
    ).length === 1;
  await userModel.findOneAndUpdate(
    { walletAddress },
    { isFollowingFromTwitter }
  );
  if (isFollowingFromTwitter || !res.data?.meta?.next_token) {
    return;
  }
  await checkNextPage(
    accessToken,
    res?.data?.meta?.next_token,
    walletAddress,
    twitterId
  );
};

module.exports = checkIfFollowingSocials;
