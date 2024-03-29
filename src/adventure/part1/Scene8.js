const soundplayer = require("../../soundplayer");

class Scene8 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
  }

  async play() {
    await soundplayer.play(
      this.voiceChannel,
      ["garage_kampf"],
      "sounds_adventure/teil1"
    );
    this.textChannel.send("Form der Eingabe: 1 2 3 4 5");
    soundplayer.play(this.voiceChannel, ["morse"], "sounds_adventure/teil1");
    this.intervalId = setInterval(() => {
      soundplayer.play(this.voiceChannel, ["morse"], "sounds_adventure/teil1");
    }, 20000);
  }

  abort() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async computeInput(message) {
    if (message === "5 2 1 8 6") {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      await soundplayer.play(
        this.voiceChannel,
        ["garage_gespraech"],
        "sounds_adventure/teil1"
      );
      this.done();
    }
  }
}

module.exports = Scene8;
