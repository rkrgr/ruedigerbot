const logger = require("../logger");
const s3 = require("../s3database");

module.exports = {
  name: "welcomesound",
  description: "Sets the welcome sound.",
  async execute(message, args) {
    const soundName = args[0];

    const sounds = await s3.getSounds("sounds");
    const soundNames = sounds
      .filter((sound) => !sound.Key.endsWith("/"))
      .map((sound) => sound.Key.split("/")[1].split(".")[0]);

    if (!soundNames.includes(soundName)) {
      message.channel.send(`Sound ${soundName} does not exist.`);
      return;
    }
    try {
      s3.setWelcomeSound(message.author.id, soundName);
      message.channel.send(
        `Welcomesound "${soundName}" was set for User "${message.author.username}".`
      );
    } catch (error) {
      logger.error(error);
      message.channel.send("Welcomesound could not be set.");
    }
  },
};
