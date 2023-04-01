const s3 = require("../s3database");

module.exports = {
  name: "commands",
  description: "Shows commands in a list.",
  async execute(message, args) {
    const messages = [];
    messages[0] = "List of commands:\n";
    if (args && args[0] === "all") {
      const sounds = await s3.getSounds("sounds");
      sounds
        .sort()
        .filter((sound) => !sound.Key.endsWith("/"))
        .map((sound) => sound.Key.split("/")[1].split(".")[0])
        .forEach((sound) => {
          messages[0] += `${sound}, `;
        });
    } else {
      const sounds = await s3.getSoundsForGuild(message.guildId);

      sounds
        .map((sound) => sound.toLowerCase())
        .sort()
        .forEach((sound) => {
          if (messages[0].length + sound.length + 2 < 2000) {
            messages[0] += `${sound}, `;
          } else {
            if (messages[1] === undefined) {
              messages[1] = "";
            }
            messages[1] += `${sound}, `;
          }
        });
    }

    messages.forEach((text) => {
      message.channel.send(text.substring(0, text.length - 2));
    });
  },
};
