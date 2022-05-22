const axios = require("axios");
const cron = require("node-cron");

const userModel = require("../api/auth/models");
const { wait } = require("../utils");

const updateUserInfo = (bot) => {
  cron.schedule("*/30 * * * *", () => {
    main(bot);
  });
};

const main = async (bot) => {
  try {
    const users = await userModel.find({}).lean();
    for (let user of users) {
      if (user.twitterId) {
        const res = await axios.get(
          `https://api.twitter.com/2/users/${user.twitterId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
            },
          }
        );
        const twitterName = res.data?.data?.username;
        if (twitterName) {
          await userModel.findOneAndUpdate(
            { walletAddress: user.walletAddress },
            { twitterName }
          );
        }
        await wait(1000);
      }

      if (user.discordId) {
        let discordUser = bot.users.cache.get(user.discordId);
        let discordName = discordUser?.username;
        if (discordName) {
          await userModel.findOneAndUpdate(
            { walletAddress: user.walletAddress },
            { discordName }
          );
        }
      }
    }
  } catch (e) {
    console.error("updateUserInfo: " + e.message);
  }
};

module.exports = updateUserInfo;
