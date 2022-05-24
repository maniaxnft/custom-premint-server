const cron = require("node-cron");

const tagYourFriends = require("./tagYourFriends");
const checkIfMentioned = require("./checkIfMentioned");
const mostCreativeTweets = require("./mostCreativeTweets");

const userModel = require("../../api/auth/models");
const { addMemberXRole } = require("../../utils");

const checkWhitelistEvents = (bot) => {
  cron.schedule("*/30 * * * *", () => {
    if (
      new Date().toISOString() >
      new Date(process.env.TWITTER_WHITELIST_START_DATE).toISOString()
    ) {
      check(bot);
    }
  });
};

const check = async (bot) => {
  try {
    const users = await userModel
      .find({ twitterId: { $exists: true }, discordId: { $exists: true } })
      .lean()
      .exec();

    for (let user of users) {
      const didFirstRequirement = await checkIfMentioned({ bot, user });
      if (didFirstRequirement) {
        await addMemberXRole({ bot, user });
        break;
      }
      const didSecondRequirement = await tagYourFriends({ bot, user });
      if (didSecondRequirement) {
        await addMemberXRole({ bot, user });
        break;
      }
    }
    // Third requirement
    await mostCreativeTweets({ bot });
  } catch (e) {
    console.error("checkWhitelistEvents: " + e.message);
  }
};

module.exports = checkWhitelistEvents;
