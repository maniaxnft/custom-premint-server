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

module.exports = {
  sendInfoMessageToUser,
  sendErrorToLogChannel,
  wait,
};
