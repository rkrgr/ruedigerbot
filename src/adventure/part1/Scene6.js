const soundplayer = require("../../soundplayer");

class Scene6 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
  }

  async play() {
    soundplayer.play(
      this.voiceChannel,
      ["paul_start"],
      "sounds_adventure/teil1"
    );
  }

  async computeInput(message) {
    if (message.toLowerCase().includes("zylinder")) {
      soundplayer.play(
        this.voiceChannel,
        ["paul_raetsel"],
        "sounds_adventure/teil1"
      );
    }
    if (
      message.toLowerCase().includes("mitte") ||
      message.toLowerCase().includes("mittig") ||
      message.toLowerCase().includes("zwischen")
    ) {
      await soundplayer.play(
        this.voiceChannel,
        ["paul_ende"],
        "sounds_adventure/teil1"
      );
      this.done();
    }
  }
}

module.exports = Scene6;
