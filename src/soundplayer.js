const s3 = require('./s3database');

async function play(voiceChannel, soundNames, folder = 'sounds') {
	try {
		const playlistName = soundNames[0];
		const playlist = await s3.getPlaylist(playlistName);
		if(playlist) {
			soundNames = JSON.parse(playlist);
		}

		const sounds = await s3.getSounds(folder);
    
		const legitSoundNames = soundNames.filter(soundName => {
			const namePart = soundName.split('(')[0];
			const regex = new RegExp('\\/' + namePart + '\\.');
			return sounds.find(sound => regex.test(sound.Key));
		});

		const connection = await voiceChannel.join();
		await playNextSound(connection, legitSoundNames, sounds);
	}
	catch(e) {
		console.log(e);
	}
}

async function playFromFile(voiceChannel, file) {
	const connection = await voiceChannel.join();
	return connection.play(file);
}

function playNextSound(connection, soundNames, sounds) {
  return new Promise((resolve, reject) => {
    const nextSound = soundNames.shift();
    if(nextSound) {
      const soundSplit = nextSound.split('(');
      const namePart = soundSplit[0];
      let timePart;
      if(soundSplit[1]) {
        timePart = parseFloat(soundSplit[1].split(')')[0]);
      }
      const regex = new RegExp('\\/' + namePart + '\\.');
      const soundKey = sounds.find(sound => regex.test(sound.Key)).Key;
      const dispatcher = connection.play('https://ruediger.s3.eu-central-1.amazonaws.com/' + soundKey);
      if(soundSplit[1]) {
        dispatcher.on('start', () => {
          setTimeout(() => {
            dispatcher.end();
          }, timePart * 1000);
        });
      }
      dispatcher.on('finish', () => {
        dispatcher.resume();
        playNextSound(connection, soundNames, sounds).then(resolve());
      });
    }
  });
}

exports.play = play;
exports.playFromFile = playFromFile;
