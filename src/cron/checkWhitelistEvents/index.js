/* eslint-disable no-console */
const axios = require("axios");
const Discord = require("discord.js");
const cron = require("node-cron");

const userModel = require("../../api/auth/models");
const creativeTweetModel = require("./model");

const {
  wait,
  sendInfoMessageToUser,
  sendErrorToLogChannel,
} = require("../../utils");

const checkWhitelistEvents = () => {
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
    }
    await getTweetsWithHashtag({ bot });
  } catch (e) {
    console.log(e);
  }
};

const checkIfMetntioned = async ({ bot, user, nextToken }) => {
  try {
    let mentioned = false;
    const start_time = new Date(
      process.env.TWITTER_MENTION_EVENT_START_DATE
    ).toISOString();
    const end_time = new Date(
      process.env.TWITTER_MENTION_EVENT_END_DATE
    ).toISOString();

    let query = `start_time=${start_time}&end_time=${end_time}&max_results=100&exclude=replies,retweets`;
    if (nextToken) {
      query = query.concat(`&pagination_token=${nextToken}`);
    }
    // https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
    const response = await axios.get(
      `https://api.twitter.com/2/users/2244994945/tweets?${query}`,
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
    const newNextToken = response.data?.meta?.next_token;
    if (newNextToken) {
      await checkIfMetntioned({ bot, user, nextToken: newNextToken });
    }
    return mentioned;
  } catch (e) {
    console.log("Error at checkIfMetntioned");
    sendErrorToLogChannel(bot, "Error at checkIfMetntioned", e);
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

const getTweetsWithHashtag = async ({ bot }) => {
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
        // VALIDATION
        const twitterUserId = tweet.user?.id;
        const tweetText = tweet.text;
        const twitterUserName = tweet.user?.name;
        const tweetId = tweet.id;
        const userScreenName = tweet.user?.screen_name;
        const tweetLink = `https://twitter.com/${userScreenName}/status/${tweetId}`;
        if (
          !twitterUserId ||
          !tweetText ||
          !twitterUserName ||
          !tweetId ||
          !userScreenName
        ) {
          return;
        }
        const isNotRetweet = tweetText.substring(0, 2) !== "RT";
        const isTweetAlreadySent = await creativeTweetModel
          .findOne({
            tweetId,
          })
          .lean()
          .exec();

        // EXECUTION
        if (!isTweetAlreadySent && !isNotRetweet) {
          const sent = await sentMostCreativeTweetsToDiscord({
            bot,
            tweetText,
            twitterUserId,
            tweetLink,
            twitterUserName,
          });
          if (sent) {
            await creativeTweetModel.create({
              tweetText,
              twitterUserId,
              tweetLink,
              twitterUserName,
              hashtag: process.env.TWITTER_MOST_CREATIVE_TWEETS_HASHTAG,
            });
          }
          await wait(1000);
        }
      }
    }
  } catch (e) {
    sendErrorToLogChannel(bot, "Error at getMostCreativeTweets", e);
    console.log("Error at getMostCreativeTweets");
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
  if (bot) {
    try {
      const channel = await bot?.channels?.cache?.get(
        process.env.DISCORD_BOT_MOST_CREATIVE_TWEETS_CHANNEL_ID
      );

      const messageEmbed = new Discord.MessageEmbed()
        .setColor(`#${process.env.DISCORD_BOT_COLOR}`)
        .addFields(
          { name: "Twitter Username", value: twitterUserName },
          { name: "Twitter UserId", value: twitterUserId.toString() },
          { name: "Tweet Link", value: tweetLink },
          { name: "Tweet Text", value: tweetText }
        );
      await channel.send({ embeds: [messageEmbed] });
      return true;
    } catch (e) {
      console.log("Error at sentMostCreativeTweetsToDiscord");
      throw e;
    }
  }
  return false;
};

module.exports = checkWhitelistEvents;
