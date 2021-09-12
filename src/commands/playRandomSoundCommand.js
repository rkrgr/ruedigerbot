const { play } = require("../soundplayer");
const s3 = require("../s3database");

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
  name: "random",
  description: "Play a random sound.",
  async execute(message) {
    const sounds = await s3.getSounds("sounds");
    const soundnames = sounds
      .filter((sound) => !sound.Key.endsWith("/"))
      .map((sound) => sound.Key.split("/")[1].split(".")[0]);
    const randomSound = soundnames[getRandomInt(soundnames.length - 1)];
    play(message.member.voice.channel, [randomSound]);
  },
};
