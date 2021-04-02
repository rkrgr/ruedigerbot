const s3 = require('./s3database');

async function play(voiceChannel, soundName) {
	try {
		const connection = await voiceChannel.join();
		const sounds = await s3.getSounds();
		const regex = new RegExp('\\/' + soundName + '\\.');
		const soundFound = sounds.find(sound => regex.test(sound.Key));
		if(soundFound) {
			const soundKey = sounds.find(sound => regex.test(sound.Key)).Key;
			connection.play('https://ruediger.s3.eu-central-1.amazonaws.com/' + soundKey);
		}
	}
	catch(e) {
		console.log(e);
	}
}

module.exports = play;
