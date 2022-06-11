const Discord = require("discord.js");
const cron = require("node-cron");

const checkIfFollowingSocials = require("./social");
const updateUserInfo = require("./userInfo");
const giveaway = require("./giveaway");
// const checkForWhitelistEvents = require("./whitelist");
// const checkIfEligibleForRoles = require("./role");

const { wait } = require("../utils");

const initCrons = async () => {
  try {
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

    cron.schedule("*/60 * * * *", async () => {
      await checkIfFollowingSocials(bot);
      await updateUserInfo(bot);
      await giveaway(bot);
      // await checkForWhitelistEvents(bot);
      // checkIfEligibleForRoles(bot);
    });
  
  } catch (e) {
    console.error("Error at initCrons", e);
    throw e;
  }
};

module.exports = initCrons;
