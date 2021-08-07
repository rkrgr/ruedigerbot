const soundplayer = require("../../soundplayer");

class Scene1 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  async play() {
    await soundplayer.play(
      this._voiceChannel,
      ["parkplatzStart"],
      "sounds_adventure/teil1"
    );
    this._done();
  }
}

module.exports = Scene1;
