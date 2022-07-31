const s3 = require("../s3database");

module.exports = {
  name: "commands",
  description: "Shows commands in a list.",
  async execute(message, args) {
    let commands = "List of commands:\n";
    if (args && args[0] === "all") {
      const sounds = await s3.getSounds("sounds");
      sounds
        .filter((sound) => !sound.Key.endsWith("/"))
        .map((sound) => sound.Key.split("/")[1].split(".")[0])
        .forEach((sound) => {
          commands += `${sound}, `;
        });
    } else {
      const sounds = await s3.getSoundsForGuild(message.guildId);
      sounds.forEach((sound) => {
        commands += `${sound}, `;
      });
    }

    commands = commands.substring(0, commands.length - 2);
    message.channel.send(commands);
  },
};
