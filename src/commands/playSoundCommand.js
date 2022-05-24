const { play } = require("../soundplayer");

module.exports = {
  name: "play",
  description: "Play a sound.",
  execute(message, args) {
    if (message.member.voice.channel) {
      play(message.member.voice.channel, args);
    }
  },
};
