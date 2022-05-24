const Discord = require("discord.js");

const checkIfFollowingSocials = require("./socials");
const updateUserInfo = require("./userInfo");
const checkForWhitelistEvents = require("./whitelist");
// const checkIfEligibleForRoles = require("./roles");

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

    checkIfFollowingSocials(bot);
    updateUserInfo(bot);
    checkForWhitelistEvents(bot);
    // checkIfEligibleForRoles(bot);
  } catch (e) {
    console.error("Error at initCrons", e);
    throw e;
  }
};

module.exports = initCrons;
