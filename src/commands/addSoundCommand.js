const s3 = require("../s3database");

module.exports = {
  name: "addsound",
  description: "Adds a sound.",
  execute(message, args) {
    const soundName = args[0];

    if (!soundName) {
      message.reply("No sound name declared.");
      return;
    }

    if (!message.attachments.size) {
      message.reply("No sound file attached.");
      return;
    }

    if (s3.isSoundExisting(soundName)) {
      message.reply("A sound with that name already exists.");
    }

    const soundFile = message.attachments.first();
    s3.addSound(soundName, soundFile.url);
    s3.addSoundToGuild(soundName, message.guildId);
  },
};
