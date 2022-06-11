const axios = require("axios");
const { sendErrorToLogChannel, wait } = require("../../utils");

const tagYourFriends = async ({ bot, user, nextToken }) => {
  try {
    let isTagged = false;
    const startTime = new Date(process.env.TWITTER_FRIENDS_EVENT_START_DATE);
    const endTime = new Date(process.env.TWITTER_FRIENDS_EVENT_END_DATE);

    const quoteTweetId = process.env.TWITTER_QUOTE_TWEET_ID;
    if(quoteTweetId === 'notyet') {
      return;
    }

    let query = `max_results=100&tweet.fields=created_at&user.fields=id&expansions=entities.mentions.username%2Cauthor_id&exclude=replies%2Cretweets`;
    if (nextToken) {
      query = query.concat(`&pagination_token=${nextToken}`);
    }
    // https://developer.twitter.com/en/docs/twitter-api/tweets/quote-tweets/api-reference/get-tweets-id-quote_tweets
    const response = await axios.get(
      `https://api.twitter.com/2/tweets/${quoteTweetId}/quote_tweets?${query}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      }
    );
    await wait(3000);
    const tweets = response.data?.data;
    if (response.data?.meta?.result_count === 0 || !Array.isArray(tweets)) {
      return false;
    }

    for (let tweet of tweets) {
      if (
        tweet.created_at &&
        tweet.author_id &&
        Array.isArray(tweet.entities?.mentions)
      ) {
        const isBetweenDates =
          new Date(tweet.created_at) > startTime &&
          endTime < new Date(tweet.created_at);
        const isAuthor = tweet.author_id === user.twitterId;
        const didRequirement = tweet.entities?.mentions?.length >= 3;
        if (isAuthor && didRequirement && isBetweenDates) {
          isTagged = true;
          break;
        }
      }
    }
    const newNextToken = response.data?.meta?.next_token;
    if (newNextToken && !isTagged) {
      await tagYourFriends({ bot, user, nextToken: newNextToken });
    }
    return isTagged;
  } catch (e) {
    console.error("Error at tagYourFriends");
    sendErrorToLogChannel(bot, "Error at tagYourFriends", e);
    throw e;
  }
};

module.exports = tagYourFriends;
