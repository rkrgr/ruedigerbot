const s3 = require("../s3database");

module.exports = {
  name: "commands",
  description: "Shows commands in a list.",
  async execute(message) {
    let commands = "List of commands:\n";
    const sounds = await s3.getSounds("sounds");
    sounds
      .filter((sound) => !sound.Key.endsWith("/"))
      .map((sound) => sound.Key.split("/")[1].split(".")[0])
      .forEach((sound) => {
        commands += `${sound}, `;
      });
    commands = commands.substring(0, commands.length - 2);
    message.channel.send(commands);
  },
};
