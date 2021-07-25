const soundplayer = require('../../soundplayer');

class Scene3 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
  }

  play() {
    // soundplayer.play(this._voiceChannel, ['parkplatz_frau'], 'sounds_adventure');
    setTimeout(() => {
			this._textChannel.send('', {
				files: [{
					attachment: __dirname + '/rohrrätsel.png',
					name: 'rohrrätsel.png',
				}],
			});
		}, 3000);
  }

  async computeInput(message) {
    if(message.toLowerCase() == '1 2 8') {
      // await soundplayer.play(this._voiceChannel, ['parkplatz_frau_richtig'], 'sounds_adventure');
      this._done();
    }
  }
}

module.exports = Scene3;
