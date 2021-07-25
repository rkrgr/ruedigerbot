const soundplayer = require('../../soundplayer');

class Scene6 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  async play() {
    soundplayer.play(this._voiceChannel, ['paul_start'], 'sounds_adventure');
  }
  
  async computeInput(message) {
    if(message.toLowerCase().contains('zylinder')) {
      soundplayer.play(this._voiceChannel, ['paul_raetsel'], 'sounds_adventure');
    }
    if(message.toLowerCase().contains('mitte') || message.toLowerCase().contains('mittig') || message.toLowerCase().contains('zwischen')) {
      await soundplayer.play(this._voiceChannel, ['paul_ende'], 'sounds_adventure');
      this._done();
    }
  }
}

module.exports = Scene6;
