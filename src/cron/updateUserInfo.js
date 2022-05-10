const axios = require("axios");
const Discord = require("discord.js");
const cron = require("node-cron");

const userModel = require("../api/auth/models");
const { wait } = require("../utils");

const updateUserInfo = () => {
  cron.schedule("*/30 * * * *", () => {
    main();
  });
};

const main = async () => {
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
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

module.exports = updateUserInfo;
