const axios = require("axios");
const { sendErrorToLogChannel, wait } = require("../../utils");

const checkIfMentioned = async ({ bot, user, nextToken }) => {
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

    const newNextToken = response.data?.meta?.next_token;
    if (newNextToken) {
      await checkIfMentioned({ bot, user, nextToken: newNextToken });
    }
    return mentioned;
  } catch (e) {
    console.log("Error at checkIfMetntioned");
    sendErrorToLogChannel(bot, "Error at checkIfMetntioned", e);
  }
};

module.exports = checkIfMentioned;
