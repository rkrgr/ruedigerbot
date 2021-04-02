const Discord = require('discord.js');
const fs = require('fs');
const { prefix } = require('./config.json');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const play = require('./src/soundplayer');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
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

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	try {
		if (client.commands.has(command)) {
			client.commands.get(command).execute(message, args);
		}
		else {
			// try to play sound if command does not exist
			client.commands.get('play').execute(message, [ command ]);
		}
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	const oldVoice = oldState.channelID;
	const newVoice = newState.channelID;

	if(oldVoice == null && newVoice != null) {
		loadWelcomesoundFile(welcomesounds => {
			const soundname = welcomesounds.get(newState.member.user.id);
			if(soundname !== undefined) {
				play(newState.member.voice.channel, soundname);
			}
		});
	}
});

function loadWelcomesoundFile(callback) {
	const params = { Bucket: S3_BUCKET, Key: 'welcomesounds' };

	s3.getObject(params, (err, data) => {
		if (err) {
			console.log(err);
		}
		else {
			const welcomesoundsData = JSON.parse(data.Body.toString('utf-8'));
			if(Object.keys(welcomesoundsData).length > 0) {
				callback(new Map(welcomesoundsData));
			}
			callback(new Map());
		}
	});
}

client.login(process.env.DISCORD_TOKEN);
