const soundplayer = require('../../soundplayer');

class Scene3 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  play() {
    // soundplayer.play(this._voiceChannel, ['parkplatz_frau'], 'sounds_adventure');

    this._textChannel.send('', {
      files: [{
        attachment: __dirname + '/rohrrätsel.png',
        name: 'rohrrätsel.png',
      }],
    });
    this._textChannel.send('Form der Eingabe: 1 2 3');
  }

  async computeInput(message) {
    const input = message.split(' ').sort();
    if(input[0] == '1' && input[1] == '2' && input[2] == '8') {
      // await soundplayer.play(this._voiceChannel, ['parkplatz_frau_richtig'], 'sounds_adventure');
      this._done();
    }
  }
}

module.exports = Scene3;
