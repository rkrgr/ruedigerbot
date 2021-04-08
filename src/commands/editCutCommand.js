const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const { nanoid } = require('nanoid');

const path = require('path');

const s3 = require('../s3database');
const { playFromFile } = require('../soundplayer');

module.exports = {
	name: 'editcut',
	description: 'Cut currently edited sound.',
	async execute(message, args) {
		if(args.length < 1) {
			message.reply('Incorrect number of arguments.');
			return;
		}
		if(args.length == 1) {
			args[1] = 0;
		}
		const start = args[0];
		const end = args[1];

		const edit = await s3.getEdit(message.author.id);

		edit.actions.push({ start: parseInt(start), end: parseInt(end) });

		let startSum = 0;
		let endSum = 0;
		edit.actions.forEach(a => {
			startSum += a.start;
			endSum += a.end;
		});

		const sound = await s3.getSound(edit.sound);

		const tempFileNameInput = path.join(__dirname, 'tempEditSoundIn' + nanoid() + '.mp3');
		const tempFileNameOutput = path.join(__dirname, 'tempEditSoundOut' + nanoid() + '.mp3');

		fs.writeFileSync(tempFileNameInput, sound);

		ffmpeg()
			.input(tempFileNameInput)
			.setStartTime(startSum + 'ms')
			.output(tempFileNameOutput)
			.on('end', async function() {
				const dispatcher = await playFromFile(message.member.voice.channel, tempFileNameOutput);
				dispatcher.on('close', () => {
					fs.unlinkSync(tempFileNameInput);
					fs.unlinkSync(tempFileNameOutput);
				});
				dispatcher.on('finish', () => {
					fs.unlinkSync(tempFileNameInput);
					fs.unlinkSync(tempFileNameOutput);
				});
			})
			.on('error', function(err) {
				console.log('error: ', err);
			}).run();

		s3.updateEdit(message.author.id, edit.actions);
	},
};
