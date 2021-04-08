const s3 = require('../s3database');

module.exports = {
	name: 'edit',
	description: 'Edit a sound.',
	async execute(message, args) {
		const soundName = args[0];

		message.reply('Editing of "' + soundName + '" started.');

		s3.addEdit(message.author.id, soundName);
	},
};
