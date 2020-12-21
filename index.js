const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const config = require('./config.json');

const soundsFolder = './sounds/';
const sounds = new Map();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	const text = message.content.toLowerCase();
	if(!text.startsWith('!') && sounds.has(text)) {
		play(message.member.voice.channel, soundsFolder + sounds.get(text));
	}
	else if(text == 'random') {
		const chosenNum = getRandomInt(sounds.size);
		const soundsArr = Array.from(sounds.values());
		play(message.member.voice.channel, soundsFolder + soundsArr[chosenNum]);
	}
	else if(text == '!schütze') {
		const members = message.member.voice.channel.members;
		const membersArr = Array.from(members.values());
		let chosenMember;
		do {
			chosenMember = membersArr[getRandomInt(members.size)];
			chosenMember.user.send('Du bist der Schütze. Drücke ein mal im Spiel den Knopf und wähle einen Spieler raus. Jeder Spieler muss sich deinem Vote anschließen.');
		} while(chosenMember.user.bot);
		console.log('Der Schütze ist ' + chosenMember.user.username + '.');
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

fs.readdir(soundsFolder, (err, files) => {
	const sortedFiles = files.sort();
	sortedFiles.forEach(file => {
		sounds.set(file.split('.')[0], file);
	});
});

client.login(config.discord_token);
