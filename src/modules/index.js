const Discord = require("discord.js");

const invites = require("./invites");
const { wait } = require("../utils");

const modules = async () => {
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

    await invites({ bot });
  } catch (e) {
    console.log(e);
  }
};

module.exports = modules;
