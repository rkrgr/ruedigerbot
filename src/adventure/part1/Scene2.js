const soundplayer = require("../../soundplayer");

class Scene2 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
  }

  play() {
    soundplayer.play(
      this.voiceChannel,
      ["parkplatz_frau"],
      "sounds_adventure/teil1"
    );
  }

  async computeInput(message) {
    if (
      message.toLowerCase() === "dänisch" ||
      message.toLowerCase() === "dänemark"
    ) {
      await soundplayer.play(
        this.voiceChannel,
        ["parkplatz_frau_richtig"],
        "sounds_adventure/teil1"
      );
      this.done();
    }
  }
}

module.exports = Scene2;
