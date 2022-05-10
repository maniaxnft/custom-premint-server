const axios = require("axios");
const Discord = require("discord.js");
const cron = require("node-cron");

const userModel = require("../api/auth/models");
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
    checkForAllUsers(bot);
  } catch (e) {
    throw new Error(e);
  }
};

const checkForAllUsers = async (bot) => {
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

  const users = await userModel.find({
    discordId: { $exists: true },
    twitterId: { $exists: true },
    walletAddress: { $exists: true },
  });
  for (let user of users) {
    const { walletAddress } = user;
    const discordMember = guild.members.cache.get(user.discordId);
    let teamMember = discordMember?._roles.filter(
      (roleId) => roleId === process.env.DISCORD_BOT_TEAM_ROLE_ID
    );
    let verified = discordMember?._roles.filter(
      (roleId) => roleId === process.env.DISCORD_BOT_VERIFIED_ROLE_ID
    );
    if (teamMember || !verified) {
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.MORALIS_API_URL}/${walletAddress}/nft/${process.env.NFT_CONTRACT_ADDRESS}/?chain=${process.env.NFT_CHAIN}&format=decimal`,
        {
          headers: {
            "x-api-key": process.env.MORALIS_WEB3_API_KEY,
          },
        }
      );
      const result = res.data?.result;
      if (result) {
        await userModel.findOneAndUpdate(
          { walletAddress },
          { ownedNFTCount: result.length }
        );
      }
      const hasRare = await checkIfRareX({
        bot,
        result,
        discordMember,
        rarexRole,
      });
      await userModel.findOneAndUpdate({ walletAddress }, { hasRare });
      checkIfManiac({ bot, result, discordMember, maniacRole });
      checkIfManiax({ bot, result, discordMember, maniaxRole });

      wait(1000);
    } catch (e) {
      sendErrorToLogChannel(bot, e.response?.data?.message, e);
    }
  }
};

const checkIfManiac = ({ bot, result, discordMember, maniacRole }) => {
  let isManiac = discordMember?._roles.filter(
    (roleId) => roleId === process.env.DISCORD_BOT_MANIAC_ROLE_ID
  );
  if (result.length === 0 && isManiac) {
    discordMember.roles.remove(maniacRole);
    sendInfoMessageToUser({
      bot,
      discordMember,
      message:
        "Your Maniac role has been withdrawn since we cannot find a Maniax NFT in your wallet.",
    });
  }
  if (result.length >= 1 && !isManiac) {
    discordMember.roles.add(maniacRole);
    sendInfoMessageToUser({
      bot,
      discordMember,
      message: "You have been promoted with Maniac Role!",
    });
  }
};

const checkIfManiax = ({ bot, result, discordMember, maniaxRole }) => {
  let isManiax = discordMember?._roles.filter(
    (roleId) => roleId === process.env.DISCORD_BOT_MANIAX_ROLE_ID
  );
  if (result.length < 5 && isManiax) {
    discordMember.roles.remove(maniaxRole);
    sendInfoMessageToUser({
      bot,
      discordMember,
      message:
        "Your ManiaX role has been withdrawn since you have less than 5 Maniax NFT",
    });
  }
  if (result.length >= 5 && !isManiax) {
    discordMember.roles.add(maniaxRole);
    sendInfoMessageToUser({
      bot,
      discordMember,
      message: "You have been promoted with ManiaX Role!",
    });
  }
};

const checkIfRareX = async ({ bot, result, discordMember, rarexRole }) => {
  let isRareX = discordMember?._roles.filter(
    (roleId) => roleId === process.env.DISCORD_BOT_RAREX_ROLE_ID
  );
  if (result.length === 0) {
    discordMember.roles.remove(rarexRole);
    return;
  }
  const tokenIds = result.map((res) => res.token_id);
  let hasRare = false;
  for (let tokenId of tokenIds) {
    const metadata = await axios.get(
      `${process.env.MORALIS_NFT_URL}/${process.env.NFT_CONTRACT_ADDRESS}/${tokenId}?chain=${process.env.NFT_CHAIN}&format=decimal&limit=500`,
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
  if (hasRare && !isRareX) {
    discordMember.roles.add(rarexRole);
    sendInfoMessageToUser({
      bot,
      discordMember,
      message: "You have been promoted with RareX Role!",
    });
  }
  if (!hasRare && isRareX) {
    discordMember.roles.remove(rarexRole);
    sendInfoMessageToUser({
      bot,
      discordMember,
      message:
        "Your RareX role has been withdrawn since we cannot find a Rare NFT",
    });
  }
  return hasRare;
};

const sendInfoMessageToUser = ({ bot, user, message }) => {
  try {
    user.send(message);
  } catch (err) {
    sendErrorToLogChannel(bot, "sendInfoMessageToUser", err);
  }
};

module.exports = checkIfEligibleForRoles;
