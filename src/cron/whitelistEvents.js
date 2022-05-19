/* eslint-disable no-console */
const axios = require("axios");
const Discord = require("discord.js");
const cron = require("node-cron");

const userModel = require("../api/auth/models");
const {
  wait,
  sendInfoMessageToUser,
  sendErrorToLogChannel,
} = require("../utils");

const whiteListEvents = () => {
  main();
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
      const didFirstRequirement = await checkIfMetntioned({ bot, user });
      if (didFirstRequirement) {
        await addMemberXRole({ bot, user });
        break;
      }
      //   const didSecondRequirement = await checkIfTagged({ bot, user });
      //   if (didSecondRequirement) {
      //     await addMemberXRole({ bot, user });
      //     break;
      //   }
      await getMostCreativeTweets({ bot });
    }
  } catch (e) {
    console.log(e);
  }
};

const checkIfMetntioned = async ({ bot, user }) => {
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
    sendErrorToLogChannel(bot, "Error at checkIfMetntioned", e);
    console.log("Error at checkIfMetntioned");
    throw e;
  }
};

// const checkIfTagged = async ({ bot }) => {
//   try {
//     const query = `&tweet.fields=author_id,conversation_id,created_at,in_reply_to_user_id,referenced_tweets&expansions=author_id,in_reply_to_user_id,referenced_tweets.id&user.fields=name,username`;
//     const response = await axios.get(
//       `https://api.twitter.com/2/tweets/search/recent${process.env.TWITTER_WHITELIST_TWEET_ID}${query}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
//         },
//       }
//     );
//     console.log(JSON.stringify(response.data, null, 2));
//     await wait(1000);
//     return true;
//   } catch (e) {
//     sendErrorToLogChannel(bot, "Error at checkIfTagged", e);
//     console.log("Error at checkIfTagged");
//     throw e;
//   }
// };

const getMostCreativeTweets = async ({ bot }) => {
  try {
    const query = `?q=%23${process.env.TWITTER_MOST_CREATIVE_TWEETS_HASHTAG}&result_type=recent`;
    const response = await axios.get(
      `https://api.twitter.com/1.1/search/tweets.json${query}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );
    const tweets = response.data?.statuses;
    if (Array.isArray(tweets)) {
      for (const tweet of tweets) {
        const twitterUserId = tweet.user?.id;
        const tweetText = tweet.text;
        const twitterUserName = tweet.user?.name;
        let tweetLink = "";
        if (tweet.user?.screen_name && tweet.id) {
          tweetLink = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id}`;
        }
        await sentMostCreativeTweetsToDiscord({
          bot,
          tweetText,
          twitterUserId,
          tweetLink,
          twitterUserName,
        });
        await wait(1000);
      }
    }
  } catch (e) {
    sendErrorToLogChannel(bot, "Error at getMostCreativeTweets", e);
    console.log("Error at getMostCreativeTweets");
    throw e;
  }
};

const addMemberXRole = async ({ bot, user }) => {
  try {
    const guild = await bot.guilds?.fetch(process.env.DISCORD_BOT_GUILD_ID);

    const memberxRole = guild.roles?.cache?.find(
      (r) => r.id === `${process.env.DISCORD_BOT_MEMBERX_ROLE_ID}`
    );
    const guildMember = guild.members.cache.get(user.discordId);
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
    sendErrorToLogChannel(bot, "Error at addMemberXRole", e);
    throw e;
  }
};

const sentMostCreativeTweetsToDiscord = async ({
  bot,
  tweetText,
  twitterUserId,
  tweetLink,
  twitterUserName,
}) => {
  if (
    bot &&
    tweetText &&
    tweetText.substring(0, 2) !== "RT" &&
    twitterUserId &&
    tweetLink &&
    twitterUserName
  ) {
    const channel = await bot?.channels?.cache?.get(
      process.env.DISCORD_BOT_MOST_CREATIVE_TWEETS_CHANNEL_ID
    );
    const message = {
      twitterUserName,
      twitterUserId,
      tweetText,
      tweetLink,
    };
    const msg = JSON.stringify(JSON.parse(JSON.stringify(message)), null, 2);
    channel.send("```json\n" + msg + "\n```");
  }
};

module.exports = whiteListEvents;
