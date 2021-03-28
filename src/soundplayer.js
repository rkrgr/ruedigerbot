const soundsFolder = './sounds/';

async function play(voiceChannel, soundName) {
	const connection = await voiceChannel.join();
	const soundPath = getSound(soundName);
	connection.play(soundPath);
}

function getSound(soundName) {
	return soundsFolder + soundName;
}

module.exports = play;
