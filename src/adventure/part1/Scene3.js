const soundplayer = require('../../soundplayer');

class Scene3 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  async play() {
    await soundplayer.play(this._voiceChannel, ['baeckerei_anfang'], 'sounds_adventure/teil1');

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
      await soundplayer.play(this._voiceChannel, ['baeckerei_ende'], 'sounds_adventure/teil1');
      this._done();
    }
  }
}

module.exports = Scene3;
