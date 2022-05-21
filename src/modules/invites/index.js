const cron = require("node-cron");

const userModel = require("../../api/auth/models");
const { addMemberXRole, sendErrorToLogChannel } = require("../../utils");

const inviteModel = require("./model");

const checkDiscordInvites = async ({ bot }) => {
  await updateInvites({ bot });

  cron.schedule("*/30 * * * *", () => {
    updateInvites({ bot });
  });

  bot.on("guildMemberAdd", async (member) => {
    try {
      const newInvites = await member.guild.invites.fetch();
      const oldInvites = await inviteModel.find({}).lean().exec();
      const invite = newInvites.find(
        (i) =>
          i.uses >
          oldInvites.filter((oldInvite) => oldInvite.code === i.code)[0]
      );
      const inviter = await bot.users.fetch(invite.inviter.id);
      const channel = await bot.channels.cache.get(
        process.env.DISCORD_INVITE_TRACKER_CHANNEL_ID
      );

      if (inviter) {
        channel.send(
          `${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`
        );
      }
      await updateInvites();
    } catch (e) {
      console.log("Error at guildMemberAdd");
      sendErrorToLogChannel(bot, "Error at guildMemberAdd", e);
    }
  });
};

const updateInvites = async ({ bot }) => {
  try {
    const guild = await bot.guilds?.fetch(process.env.DISCORD_BOT_GUILD_ID);
    guild.invites.fetch().then((guildInvites) => {
      guildInvites.map(async (invite) => {
        const inviterId = invite.inviter.id;
        const uses = invite.uses;
        const code = invite.code;
        await inviteModel.findOneAndUpdate(
          {
            inviterId,
            uses,
            code,
          },
          {
            upsert: true,
            new: true,
          }
        );
        const user = await userModel.findOne({ discordId: inviterId });
        if (invite.uses >= 10 && user) {
          addMemberXRole({ bot, user });
        }
      });
    });
  } catch (e) {
    console.log("Error at updateInvites");
    throw e;
  }
};

module.exports = checkDiscordInvites;
