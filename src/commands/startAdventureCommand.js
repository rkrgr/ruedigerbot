const adventure = require('../adventure/adventureController');

module.exports = {
	name: 'adventure',
	description: 'Starts a Ruediger adventure.',
	execute(message, args) {
		const adventureName = args[0];
    const numOfScene = args[1] ? args[1] : 1;

		adventure.start(message.member.voice.channel, message.channel, adventureName, numOfScene);
	},
};
