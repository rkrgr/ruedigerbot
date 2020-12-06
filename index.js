const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

const soundsFolder = './sounds/';
const sounds = new Map();

client.once('ready', () => {
	fs.readdir(soundsFolder, (err, files) => {
		const sortedFiles = files.sort();
		sortedFiles.forEach(file => {
			sounds.set(file.split('.')[0], file);
		});
	});

	console.log('Ready!');
});

client.on('message', message => {
	const text = message.content.toLowerCase();
	if(!text.startsWith('!') && sounds.has(text)) {
		play(message.member.voice.channel, soundsFolder + sounds.get(text));
	}
	else if(text == 'random') {
		const chosenNum = getRandomInt(sounds.size);
		const soundsArr = Array.from(sounds, ([id, value]) => (value));
		play(message.member.voice.channel, soundsFolder + soundsArr[chosenNum]);
	}
	else if(text == '!narre') {
		const members = message.member.voice.channel.members;
		const chosenNum = getRandomInt(members.size);
		const membersArr = Array.from(members, ([id, value]) => (value));
		membersArr[chosenNum].send('Du bist der Narre.');
		console.log(membersArr[chosenNum]);
	}
	else if(text == '!commands') {
		let commands = 'Liste der Befehle:\n';
		sounds.forEach((value, key) => {
			commands += key + ', ';
		});
		commands = commands.substring(0, commands.length - 2);
		message.channel.send(commands);
	}
});

async function play(voiceChannel, path) {
	const connection = await voiceChannel.join();
	connection.play(path);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

client.login('NzM3NjkxNDM0NDUwMjg4NjUw.XyBCrw.miJTnsBnOkavi1ukK2Pj7F21JQU');
