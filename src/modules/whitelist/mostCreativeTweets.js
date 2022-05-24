const axios = require("axios");
const { wait, sendErrorToLogChannel } = require("../../utils");
const creativeTweetModel = require("./model");
const Discord = require("discord.js");

const mostCreativeTweets = async ({ bot }) => {
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
    console.error("Error at mostCreativeTweets");
    sendErrorToLogChannel(bot, "Error at mostCreativeTweets", e);
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
      console.error("sentMostCreativeTweetsToDiscord: " + e.message);
      throw e;
    }
  }
  return false;
};

module.exports = mostCreativeTweets;
