const play = require('../soundplayer');

module.exports = {
	name: 'play',
	description: 'Play a sound.',
	execute(message, args) {
		play(message.member.voice.channel, args[0]);
	},
};
