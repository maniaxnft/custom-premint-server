const axios = require("axios");
const Discord = require("discord.js");

const userModel = require("../api/repository/models");
const { sendErrorToLogChannel } = require("../utils");

const checkIfEligibleForRoles = async () => {
  const bot = new Discord.Client({
    intents: [
      Discord.Intents.FLAGS.GUILDS,
      Discord.Intents.FLAGS.GUILD_MESSAGES,
      Discord.Intents.FLAGS.GUILD_MEMBERS,
      Discord.Intents.FLAGS.GUILD_PRESENCES,
      Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
  });
  try {
    await bot.login(process.env.DISCORD_TOKEN);
  } catch (e) {
    throw new Error(e);
  }

  const guild = await bot.guilds?.fetch(process.env.DISCORD_GUILD_ID);
  const maniacRole = guild.roles.cache.find(
    (r) => r.id === `${process.env.DISCORD_MANIAC_ROLE_ID}`
  );
  const maniaxRole = guild.roles.cache.find(
    (r) => r.id === `${process.env.DISCORD_MANIAX_ROLE_ID}`
  );

  const users = await userModel.find({}).lean();
  for (let user of users) {
    if (user.walletAddress) {
      try {
        const res = await axios.get(
          `${process.env.MORALIS_API_URL}/${user.walletAddress}/nft/${process.env.NFT_CONTRACT_ADDRESS}/?chain=${process.env.NFT_CHAIN}&format=decimal`,
          {
            headers: {
              "x-api-key": process.env.MORALIS_WEB3_API_KEY,
            },
          }
        );
        const nftnumberOfNftsOwned = res.data?.result?.size;
        if (nftnumberOfNftsOwned === 1) {
          guild.members.cache.get(user.discordId).roles.add(maniacRole);
        }
        if (nftnumberOfNftsOwned >= 5) {
          guild.members.cache.get(user.discordId).roles.add(maniaxRole);
        }
      } catch (e) {
        sendErrorToLogChannel(bot, e.response?.data?.message, e);
      }
    }
  }
};

module.exports = {
  checkIfEligibleForRoles,
};
