const sendErrorToLogChannel = async (bot, message, e) => {
  if (bot && message) {
    const channel = await bot.channels?.cache?.get(
      process.env.DISCORD_BOT_INFO_CHANNEL_ID
    );
    if (e?.message && channel) {
      channel.send(`${message}, error message: ${e?.message}`);
    } else if (!e?.message && channel) {
      channel.send(`${message}`);
    }
  }
};

module.exports = {
  sendErrorToLogChannel,
};
