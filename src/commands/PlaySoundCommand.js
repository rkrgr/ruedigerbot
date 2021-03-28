const play = require('../soundplayer');

function execute(member, text) {
	play(member.voice.channel, text);
}

module.exports = execute;
