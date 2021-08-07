const soundplayer = require("../../soundplayer");

class Scene1 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
  }

  async play() {
    await soundplayer.play(
      this.voiceChannel,
      ["parkplatzStart"],
      "sounds_adventure/teil1"
    );
    this.done();
  }
}

module.exports = Scene1;
