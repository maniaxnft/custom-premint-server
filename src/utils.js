const sendErrorToLogChannel = async (bot, message, e) => {
  if (bot && message) {
    const channel = await bot?.channels?.cache?.get(
      process.env.DISCORD_BOT_INFO_CHANNEL_ID
    );
    if (e?.response?.data && channel) {
      channel.send(`${message}, error message: ${e.response.data}`);
    } else if (e?.message && channel) {
      channel.send(`${message}, error message: ${e.message}`);
    } else if (!e?.message && channel) {
      channel.send(`${message}`);
    }
  }
};
const wait = require("timers/promises").setTimeout;

const sendInfoMessageToUser = async ({ bot, message }) => {
  try {
    const channel = await bot.channels?.cache?.get(
      process.env.DISCORD_BOT_LEVELUP_CHANNEL_ID
    );
    channel.send(message);
  } catch (err) {
    sendErrorToLogChannel(bot, "sendInfoMessageToUser", err);
  }
};

const addMemberXRole = async ({ bot, user }) => {
  try {
    const guild = await bot.guilds?.fetch(process.env.DISCORD_BOT_GUILD_ID);

    const memberxRole = guild.roles?.cache?.find(
      (r) => r.id === `${process.env.DISCORD_BOT_MEMBERX_ROLE_ID}`
    );
    const guildMember = guild.members.cache.get(user.discordId);
    let isTeamMember = guildMember?._roles.filter(
      (roleId) => roleId === process.env.DISCORD_BOT_TEAM_ROLE_ID
    );
    let isVerified = guildMember?._roles.filter(
      (roleId) => roleId === process.env.DISCORD_BOT_VERIFIED_ROLE_ID
    );
    let isMemberX = guildMember?._roles.filter(
      (roleId) => roleId === process.env.DISCORD_BOT_MEMBERX_ROLE_ID
    );

    if (!isMemberX && !isTeamMember && isVerified) {
      guildMember.roles.add(memberxRole);
      sendInfoMessageToUser({
        bot,
        guildMember,
        message: `<@${user.discordId}> You have been promoted with <@&${memberxRole.id}> Role !`,
      });
    }
    await wait(1000);
  } catch (e) {
    console.error("Error at addMemberXRole", e);
    sendErrorToLogChannel(bot, "Error at addMemberXRole", e);
  }
};

module.exports = {
  sendInfoMessageToUser,
  sendErrorToLogChannel,
  wait,
  addMemberXRole,
};
