const Discord = require('discord.js');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const s3 = require('./src/s3database');

const play = require('./src/soundplayer');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

	const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
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
		s3.getWelcomeSound(newState.member.user.id).then(soundName => {
			if(soundName) {
				play(newState.member.voice.channel, soundName);
			}
		});
	}
});

client.login(process.env.DISCORD_TOKEN);
