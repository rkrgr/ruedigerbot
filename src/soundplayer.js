const s3 = require('./s3database');

async function play(voiceChannel, soundNames) {
	try {
		const connection = await voiceChannel.join();
		const sounds = await s3.getSounds();
		const legitSoundNames = soundNames.filter(soundName => {
			const regex = new RegExp('\\/' + soundName + '\\.');
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
		const regex = new RegExp('\\/' + nextSound + '\\.');
		const soundKey = sounds.find(sound => regex.test(sound.Key)).Key;
		const dispatcher = connection.play('https://ruediger.s3.eu-central-1.amazonaws.com/' + soundKey);
		dispatcher.on('finish', () => {
			playNextSound(connection, soundNames, sounds);
		});
	}
}

module.exports = play;
