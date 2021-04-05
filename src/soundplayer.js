const s3 = require('./s3database');

async function play(voiceChannel, soundNames) {
	try {
		const connection = await voiceChannel.join();
		const sounds = await s3.getSounds();
		const legitSoundNames = soundNames.filter(soundName => {
			const namePart = soundName.split('(')[0];
			const regex = new RegExp('\\/' + namePart + '\\.');
			return sounds.find(sound => regex.test(sound.Key));
		});
		playNextSound(connection, legitSoundNames, sounds);
	}
	catch(e) {
		console.log(e);
	}
}

function playNextSound(connection, soundNames, sounds) {
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
			playNextSound(connection, soundNames, sounds);
		});
	}
}

module.exports = play;
