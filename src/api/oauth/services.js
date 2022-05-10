const axios = require("axios");
const Discord = require("discord.js");

const { wait, sendErrorToLogChannel } = require("../../utils");
const userModel = require("../auth/models");

const checkIfFollowingTwitter = async (user) => {
  const walletAddress = user.walletAddress;
  const twitterId = user.twitterId;
  if (walletAddress && twitterId) {
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
      { walletAddress },
      { isFollowingFromTwitter }
    );
    if (nextToken && !isFollowingFromTwitter) {
      await checkNextPage(accessToken, nextToken, walletAddress, twitterId);
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
  await wait(300);
  const isFollowingFromTwitter =
    res.data?.data?.filter(
      (account) => account.id === process.env.TWITTER_OFFICIAL_CHANNEL_ID
    ).length === 1;
  await userModel.findOneAndUpdate(
    { walletAddress },
    { isFollowingFromTwitter }
  );
  if (isFollowingFromTwitter || !res?.data?.meta?.next_token) {
    return;
  }
  await checkNextPage(
    accessToken,
    res?.data?.meta?.next_token,
    walletAddress,
    twitterId
  );
};

const checkIfDiscordMemberAndVerified = async (user) => {
  const walletAddress = user.walletAddress;
  const discordId = user.discordId;
  if (walletAddress && discordId) {
    let bot = "";
    try {
      bot = new Discord.Client({
        intents: [
          Discord.Intents.FLAGS.GUILDS,
          Discord.Intents.FLAGS.GUILD_MESSAGES,
          Discord.Intents.FLAGS.GUILD_MEMBERS,
          Discord.Intents.FLAGS.GUILD_PRESENCES,
          Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        ],
      });
      await bot.login(process.env.DISCORD_BOT_TOKEN);
      await wait(500);
      const guild = await bot.guilds?.fetch(process.env.DISCORD_BOT_GUILD_ID);
      const discordMember = guild.members.cache.get(discordId);

      let verified = discordMember?._roles.filter(
        (roleId) => roleId === process.env.DISCORD_BOT_VERIFIED_ROLE_ID
      );

      if (verified) {
        await userModel.findOneAndUpdate(
          { walletAddress },
          { isDiscordMember: discordMember ? true : false }
        );
      }
    } catch (e) {
      sendErrorToLogChannel(bot, "Error on checkIfFollowingSocials", e);
    }
  }
};

module.exports = { checkIfFollowingTwitter, checkIfDiscordMemberAndVerified };
