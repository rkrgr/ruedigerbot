const soundplayer = require('../../soundplayer');

class Scene9 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  async play() {
    await soundplayer.play(this._voiceChannel, ['parkplatz_schwarze_karte'], 'sounds_adventure');
  }
  
  async computeInput(message) {
    if(message.toLowerCase() == 'fisch') {
      await soundplayer.play(this._voiceChannel, ['ende'], 'sounds_adventure');
      this._done();
    }
  }
}

module.exports = Scene9;
