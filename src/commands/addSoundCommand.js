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

    const soundFile = message.attachments.first();
    s3.addSound(soundName, soundFile.url);
  },
};
