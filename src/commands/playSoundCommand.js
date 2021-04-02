const play = require('../soundplayer');

module.exports = {
	name: 'play',
	description: 'Play a sound.',
	execute(message, args) {
		const soundName = args[0];
		play(message.member.voice.channel, soundName);
	},
};
