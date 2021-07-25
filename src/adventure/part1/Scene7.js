const soundplayer = require('../../soundplayer');

class Scene7 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  async play() {
    this._done();
  }

  async computeInput(message) {
    
  }
}

module.exports = Scene7;
