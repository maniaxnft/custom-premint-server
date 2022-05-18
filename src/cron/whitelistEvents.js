/* eslint-disable no-console */
const axios = require("axios");
const Discord = require("discord.js");
const cron = require("node-cron");

const userModel = require("../api/auth/models");
const { wait, sendInfoMessageToUser } = require("../utils");

const updateUserInfo = () => {
  cron.schedule("*/30 * * * *", () => {
    main();
  });
};

const main = async () => {
  try {
    const users = await userModel
      .find({ twitterId: { $exists: true }, discordId: { $exists: true } })
      .lean()
      .exec();

    const bot = new Discord.Client({
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

    for (let user of users) {
      const didFirstRequirement = await checkIfMetntioned({ user });
      if (didFirstRequirement) {
        await addMemberXRole({ bot, user });
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const checkIfMetntioned = async ({ user }) => {
  try {
    let mentioned = false;
    const start_time = new Date("10 March 2022 00:00 UTC").toISOString();
    const end_time = new Date("10 April 2022 23:59 UTC").toISOString();
    const query = `start_time=${start_time}&end_time=${end_time}&max_results=100&exclude=replies,retweets`;
    const response = await axios.get(
      `https://api.twitter.com/2/users/${user.twitterId}/tweets?${query}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );
    await wait(1000);
    const tweets = response.data?.data;
    if (response.data?.meta?.result_count === 0 || !Array.isArray(tweets)) {
      return false;
    }

    for (let tweet of tweets) {
      if (
        tweet.text.includes(`@${process.env.TWITTER_OFFICIAL_CHANNEL_NAME}`)
      ) {
        mentioned = true;
        break;
      }
    }
    return mentioned;
  } catch (e) {
    console.log("Error at checkIfMetntioned");
    throw e;
  }
};

const addMemberXRole = async ({ bot, user }) => {
  try {
    const guild = await bot.guilds?.fetch(process.env.DISCORD_BOT_GUILD_ID);

    const memberxRole = guild.roles?.cache?.find(
      (r) => r.id === `${process.env.DISCORD_BOT_MEMBERX_ROLE_ID}`
    );
    let guildMember = bot.users.cache.get(user.discordId);
    let isTeamMember = guildMember?._roles.filter(
      (roleId) => roleId === process.env.DISCORD_BOT_TEAM_ROLE_ID
    );
    let isVerified = guildMember?._roles.filter(
      (roleId) => roleId === process.env.DISCORD_BOT_VERIFIED_ROLE_ID
    );
    let isMemberX = guildMember?._roles.filter(
      (roleId) => roleId === process.env.DISCORD_BOT_MEMBERX_ROLE_ID
    );

    if (!isMemberX && !isTeamMember && isVerified) {
      guildMember.roles.add(memberxRole);
      sendInfoMessageToUser({
        bot,
        guildMember,
        message: `<@${user.discordId}> You have been promoted with <@&${memberxRole.id}> Role !`,
      });
    }
    await wait(1000);
  } catch (e) {
    console.log("Error at addMemberXRole");
    throw e;
  }
};

module.exports = updateUserInfo;
