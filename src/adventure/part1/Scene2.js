const soundplayer = require('../../soundplayer');

class Scene2 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  play() {
    soundplayer.play(this._voiceChannel, ['parkplatz_frau'], 'sounds_adventure');
  }

  async computeInput(message) {
    if(message.toLowerCase() == 'dänisch' || message.toLowerCase() == 'dänemark') {
      await soundplayer.play(this._voiceChannel, ['parkplatz_frau_richtig'], 'sounds_adventure');
      this._done();
    }
  }
}

module.exports = Scene2;
