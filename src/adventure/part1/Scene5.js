const soundplayer = require("../../soundplayer");

class Scene5 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  async play() {
    await soundplayer.play(
      this._voiceChannel,
      ["parkplatz_valentina"],
      "sounds_adventure/teil1"
    );
    this._textChannel.send("", {
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
    if (message.toLowerCase() == "schrottplatz") {
      await soundplayer.play(
        this._voiceChannel,
        ["parkplatz_karte_geloest"],
        "sounds_adventure/teil1"
      );
      this._done();
    }
  }
}

module.exports = Scene5;
