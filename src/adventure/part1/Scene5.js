const soundplayer = require("../../soundplayer");

class Scene5 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
  }

  async play() {
    await soundplayer.play(
      this.voiceChannel,
      ["parkplatz_valentina"],
      "sounds_adventure/teil1"
    );
    this.textChannel.send({
      files: [
        {
          attachment: `${__dirname}/karte_front.png`,
          name: "karte_front.png",
        },
        {
          attachment: `${__dirname}/karte_kreuze.png`,
          name: "karte_kreuze.png",
        },
        {
          attachment: `${__dirname}/karte_buchstaben.png`,
          name: "karte_buchstaben.png",
        },
        {
          attachment: `${__dirname}/karte_schwarz.png`,
          name: "karte_schwarz.png",
        },
      ],
    });
  }

  async computeInput(message) {
    if (message.toLowerCase() === "schrottplatz") {
      await soundplayer.play(
        this.voiceChannel,
        ["parkplatz_karte_geloest"],
        "sounds_adventure/teil1"
      );
      this.done();
    }
  }
}

module.exports = Scene5;
