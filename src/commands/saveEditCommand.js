const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const { nanoid } = require('nanoid');

const s3 = require('../s3database');

module.exports = {
	name: 'editsave',
	description: 'Save edit of a sound.',
	async execute(message) {
		const edit = await s3.getEdit(message.author.id);

		let startSum = 0;
		let endSum = 0;
		edit.actions.forEach(a => {
			startSum += a.start;
			endSum += a.end;
		});

		const sound = await s3.getSound(edit.sound);

		const tempFileNameInput = 'tempEditSoundIn' + nanoid() + '.mp3';
		const tempFileNameOutput = 'tempEditSoundOut' + nanoid() + '.mp3';

		fs.writeFileSync(tempFileNameInput, sound);

		ffmpeg()
			.input(tempFileNameInput)
			.setStartTime(startSum + 'ms')
			.output(tempFileNameOutput)
			.on('end', async function() {
				await s3.addSoundFromFile(edit.sound, tempFileNameOutput);
				fs.unlinkSync(tempFileNameInput);
				fs.unlinkSync(tempFileNameOutput);

				s3.deleteEdit(message.author.id);
				message.reply('Saved changes. Editing ended.');
			})
			.on('error', function(err) {
				console.log('error: ', err);
			}).run();
	},
};
