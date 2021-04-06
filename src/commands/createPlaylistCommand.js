const s3 = require('../s3database');

module.exports = {
	name: 'playlist',
	description: 'Creates a playlist.',
	execute(message, args) {
		const name = args.shift();
		s3.addPlaylist(name, args);
		message.reply('Playlist "' + name + '" created.');
	},
};
