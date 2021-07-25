const soundplayer = require('../../soundplayer');

class Scene9 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  play() {
    // anfang sound spielen
    this._textChannel.send('Form der Eingabe: 1 2 3 4 5');
    soundplayer.playFromFile(this._voiceChannel, __dirname + '/morse.mp3');
    this._intervalId = setInterval(() => {
      soundplayer.playFromFile(this._voiceChannel, __dirname + '/morse.mp3');
    }, 20000);
  }
  
  async computeInput(message) {
    if(message == '5 2 1 8 6') {
      if(this._intervalId) {
        clearInterval(this._intervalId);
      }
      // sound abspielen
      this._done();
    }
  }

}

module.exports = Scene9;
