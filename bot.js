const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const AWS = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;

const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
AWS.config.region = 'eu-central-1';
const s3 = new AWS.S3({
	accessKeyId: S3_ACCESS_KEY_ID,
	secretAccessKey: S3_SECRET_ACCESS_KEY,
});

const soundsFolder = './sounds/';
const sounds = new Map();
let welcomesounds = new Map();

client.once('ready', () => {
	loadWelcomesoundFile();
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

			uploadWelcomesoundFile(json);
			message.channel.send('Welcomesound "' + soundname + '" wurde für User "' + message.author.username + '" gesetzt.');
		}
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

function uploadWelcomesoundFile(fileContent) {
	const params = { Bucket: S3_BUCKET, Key: 'welcomesounds', Body: fileContent };

	s3.putObject(params, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			console.log('Successfully uploaded data to welcomesounds bucket');
		}
	});
}

function loadWelcomesoundFile() {
	const params = { Bucket: S3_BUCKET, Key: 'welcomesounds' };

	s3.getObject(params, (err, data) => {
		if (err) {
			console.log(err);
		}
		else {
			const welcomesoundsData = JSON.parse(data.Body.toString('utf-8'));
			if(Object.keys(welcomesoundsData).length > 0) {
				welcomesounds = new Map(welcomesoundsData);
				console.log('Welcomesounds loaded.');
			}
		}
	});
}

fs.readdir(soundsFolder, (err, files) => {
	const sortedFiles = files.sort();
	sortedFiles.forEach(file => {
		sounds.set(file.split('.')[0], file);
	});
});

client.login(process.env.DISCORD_TOKEN);
