const axios = require("axios");
const Discord = require("discord.js");
const cron = require("node-cron");

const userModel = require("../api/repository/models");
const { sendErrorToLogChannel, wait } = require("../utils");

const checkIfEligibleForRoles = () => {
  cron.schedule("*/30 * * * *", () => {
    main();
  });
};

const main = async () => {
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
    await bot.login(process.env.DISCORD_BOT_TOKEN);
    await wait(3000);
    // eslint-disable-next-line no-console
    console.log("Discord bot is logged in");
    check(bot);
  } catch (e) {
    throw new Error(e);
  }
};

const check = async (bot) => {
  const guild = await bot.guilds?.fetch(process.env.DISCORD_BOT_GUILD_ID);
  const maniacRole = guild.roles?.cache?.find(
    (r) => r.id === `${process.env.DISCORD_BOT_MANIAC_ROLE_ID}`
  );
  const maniaxRole = guild.roles?.cache?.find(
    (r) => r.id === `${process.env.DISCORD_BOT_MANIAX_ROLE_ID}`
  );
  const rarexRole = guild.roles?.cache?.find(
    (r) => r.id === `${process.env.DISCORD_BOT_RAREX_ROLE_ID}`
  );

  const users = await userModel.find({}).lean();
  for (let user of users) {
    if (user.walletAddress && user.discordId && user.twitterId) {
      try {
        const res = await axios.get(
          `${process.env.MORALIS_API_URL}/${user.walletAddress}/nft/${process.env.NFT_CONTRACT_ADDRESS}/?chain=${process.env.NFT_CHAIN}&format=decimal`,
          {
            headers: {
              "x-api-key": process.env.MORALIS_WEB3_API_KEY,
            },
          }
        );
        const result = res.data?.result;
        const discordUser = guild.members.cache.get(user.discordId);
        checkIfManiac(result, discordUser, maniacRole);
        checkIfManiax(result, discordUser, maniaxRole);
        await checkIfRareX(result, discordUser, rarexRole);
        wait(1000);
      } catch (e) {
        sendErrorToLogChannel(bot, e.response?.data?.message, e);
      }
    }
  }
};

const checkIfManiac = (result, discordUser, maniacRole) => {
  if (result.length === 0) {
    discordUser.roles.remove(maniacRole);
  }
  if (result.length === 1) {
    discordUser.roles.add(maniacRole);
  }
};

const checkIfManiax = (result, discordUser, maniaxRole) => {
  if (result.length < 5) {
    discordUser.roles.remove(maniaxRole);
  }
  if (result.length >= 5) {
    discordUser.roles.add(maniaxRole);
  }
};

const checkIfRareX = async (result, discordUser, rarexRole) => {
  if (result.length === 0) {
    discordUser.roles.remove(rarexRole);
    return;
  }

  const tokenIds = result.map((res) => res.token_id);
  let hasRare = false;
  for (let tokenId of tokenIds) {
    const metadata = await axios.get(
      `${process.env.MORALIS_NFT_URL}/${process.env.NFT_CONTRACT_ADDRESS}/${tokenId}?chain=${process.env.NFT_CHAIN}&format=decimal`,
      {
        headers: {
          "x-api-key": process.env.MORALIS_WEB3_API_KEY,
        },
      }
    );
    const meta = JSON.parse(metadata?.data?.metadata);
    const rarity = meta?.attributes
      ? meta.attributes[meta.attributes.length - 1]?.value
      : undefined;
    if (rarity === "Rare") {
      hasRare = true;
      break;
    }
  }
  if (hasRare) {
    discordUser.roles.add(rarexRole);
  } else {
    discordUser.roles.remove(rarexRole);
  }
};

module.exports = checkIfEligibleForRoles;
