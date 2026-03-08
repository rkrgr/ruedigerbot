const fs = require('node:fs');
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

async function play(channel, soundname) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on('error', (error) => {
        console.error('Voice connection error:', error);
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    playSound(connection, soundname);
}

function playSound(connection, soundname) {
    const player = createAudioPlayer();
    const subscription = connection.subscribe(player);

    if (soundname == "random") {
        const files = fs.readdirSync('./media/sounds')
            .filter(f => f.endsWith('.ogg'))
            .map(f => f.replace(/\.ogg$/, ''));

        const randomIndex = Math.floor(Math.random() * files.length);
        soundname = files[randomIndex];
    }

    const resource = createAudioResource('./media/sounds/' + soundname + '.ogg');
    player.play(resource);
}

module.exports = {
    data: new SlashCommandBuilder().setName('play').setDescription('Plays a sound.').addStringOption((option) => option.setName("soundname")
                                                                                                                        .setDescription("Name of the sound")
                                                                                                                        .setRequired(true)
                                                                                                                        .setAutocomplete(true)
    ),
    async execute(interaction) {
        if (!interaction.member.voice.channel) {
            await interaction.reply('You need to be in a voice channel to use this command!');
            return;
        }

        const soundname = interaction.options.getString("soundname");

        await interaction.reply('Playing sound ' + soundname);
        await play(interaction.member.voice.channel, soundname);
    },
};
