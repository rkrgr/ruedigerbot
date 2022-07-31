const s3 = require("../s3database");

module.exports = {
  name: "import",
  description: "Imports sound to guild.",
  execute(message, args) {
    const soundName = args[0];

    if (!soundName) {
      message.reply("No sound name declared.");
      return;
    }

    s3.addSoundToGuild(soundName, message.guildId);
  },
};
