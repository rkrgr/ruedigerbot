let fapcount = 0;
let fapOn = false;

module.exports = {
	checkCommands: (message, play) => {
		const text = message.content.toLowerCase();
		if (text == 'reboot') {
			play(message.member.voice.channel, __dirname + '/ton1.mp3');
		}
		if (text == 'ja') {
			play(message.member.voice.channel, __dirname + '/ton2.mp3');
		}
		if (text.startsWith('400')) {
			play(message.member.voice.channel, __dirname + '/ton3.mp3');
		}
		if (text.startsWith('2630')) {
			play(message.member.voice.channel, __dirname + '/ton4.mp3');
			message.channel.send('https://drive.google.com/drive/folders/1QuKMTac8MdNv78t04MYdB0xa-1AJSIUu?usp=sharing');
		}
		if (text == '116') {
			play(message.member.voice.channel, __dirname + '/ton5.mp3');
		}
		if (text == 'mozart') {
			play(message.member.voice.channel, __dirname + '/ton6.mp3');
		}
		if (text == 'DE2120050000165842725XXX'.toLowerCase()) {
			play(message.member.voice.channel, __dirname + '/ton7.mp3');
			fapOn = true;
		}
		if (text.startsWith(';;') && fapOn) {
			fapcount += 1;
			if (fapcount == 2) {
				play(message.member.voice.channel, __dirname + '/ton8.mp3');
			}
		}
	},
};
