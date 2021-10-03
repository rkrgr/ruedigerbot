const soundplayer = require("../../soundplayer");

class Scene9 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
  }

  async play() {
    await soundplayer.play(
      this.voiceChannel,
      ["parkplatz_schwarze_karte"],
      "sounds_adventure/teil1"
    );
    this.textChannel.send({
      files: [
        {
          attachment: `${__dirname}/karte_front.png`,
          name: "karte_front.png",
        },
        {
          attachment: `${__dirname}/karte_schwarz.png`,
          name: "karte_schwarz.png",
        },
      ],
    });
  }

  async computeInput(message) {
    if (message.toLowerCase() === "fisch") {
      await soundplayer.play(
        this.voiceChannel,
        ["ende"],
        "sounds_adventure/teil1"
      );
      this.done();
    }
  }
}

module.exports = Scene9;
