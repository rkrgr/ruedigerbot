const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const express = require('express');

const soundsFolder = './sounds/';
const sounds = new Map();
let welcomesounds = new Map();

let episode2;

const port = process.env.PORT || 80;

client.once('ready', () => {
	const welcomesoundsData = JSON.parse(fs.readFileSync('welcomesounds.json'));
	if(Object.keys(welcomesoundsData).length > 0) {
		welcomesounds = new Map(welcomesoundsData);
	}

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
	else if(text.startsWith('!welcomesound')) {
		const soundname = text.split(' ')[1];

		if(sounds.get(soundname) == undefined) {
			message.channel.send('Sound mit dem Namen "' + soundname + '" nicht bekannt.');
		}
		else {
			welcomesounds.set(message.author.id, soundname);

			const json = JSON.stringify([...welcomesounds]);
			console.log(json);
			fs.writeFile('./welcomesounds.json', json, (err) => {
				if (err) {
					console.error(err);
					throw err;
				}

				console.log('Saved data to file.');
				message.channel.send('Welcomesound "' + soundname + '" wurde für User "' + message.author.username + '" gesetzt.');
			});
		}
	}

	require('./adventure/episode1/episode1').checkCommands(message, play);

	if(text == 'install sprachmodul') {
		const Episode2 = require('./adventure/episode2/episode2');
		episode2 = new Episode2(message.member.voice.channel, message.channel, play);
		episode2.start();
	}

	if(episode2 != null) {
		episode2.checkCommands(text);
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	const oldVoice = oldState.channelID;
	const newVoice = newState.channelID;

	if(oldVoice == null && newVoice != null) {
		const soundname = welcomesounds.get(newState.member.user.id);
		if(soundname !== undefined) {
			play(newState.member.voice.channel, soundsFolder + sounds.get(soundname));
		}
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

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
client.login(process.env.DISCORD_TOKEN);

const app = express();

app.get('/labyrinth', (req, res) => {
	res.sendFile('./adventure/episode2/labyrinth.html', { root: __dirname });
});

app.get('/labyrinth_solved', (req, res) => {
	episode2.labyrinthFinished();
	res.send('Gelöst');
});

app.listen(port, () => console.log(`listening on port ${port}!`));
