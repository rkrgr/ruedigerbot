const fs = require('node:fs');
const { SlashCommandBuilder } = require('discord.js');
const {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require('@discordjs/voice');

let currentPlayer = null;
let currentConnection = null;

async function play(channel, soundname, times) {
    // Stop currently playing sound
    if (currentPlayer) {
        currentPlayer.stop();
        currentPlayer = null;
    }

    // Create connection only if not already connected
    if (!currentConnection || channel.id != currentConnection.joinConfig.channelId) {
        currentConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        currentConnection.on('error', (error) => {
            console.error('Voice connection error:', error);
        });

        await entersState(currentConnection, VoiceConnectionStatus.Ready, 30_000);
    }

    playSound(currentConnection, soundname, times);
}

function getRandomSound() {
    const files = fs.readdirSync('./media/sounds')
    .filter(f => f.endsWith('.ogg'))
    .map(f => f.replace(/\.ogg$/, ''));

    const randomIndex = Math.floor(Math.random() * files.length);
    return files[randomIndex];
}

function playSound(connection, soundname, times) {
    const player = createAudioPlayer();
    currentPlayer = player;

    connection.subscribe(player);

    let count = 0;

    const playOnce = () => {
        let selectedSound = soundname;

        if (soundname === "random") {
            selectedSound = getRandomSound();
        }

        const resource = createAudioResource(`./media/sounds/${selectedSound}.ogg`);
        player.play(resource);
        count++;
    };

    player.on(AudioPlayerStatus.Idle, () => {
        if (count < times) {
            playOnce();
        } else {
            currentPlayer = null;
        }
    });

    playOnce();
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a sound.')
    .addStringOption(option =>
    option.setName("soundname")
    .setDescription("Name of the sound")
    .setRequired(true)
    .setAutocomplete(true)
    )
    .addIntegerOption(option =>
    option.setName("times")
    .setDescription("How many times to play the sound")
    .setRequired(false)
    .setMinValue(1)
    ),

    async execute(interaction) {
        if (!interaction.member.voice.channel) {
            await interaction.reply('You need to be in a voice channel to use this command!');
            return;
        }

        const soundname = interaction.options.getString("soundname");
        const times = interaction.options.getInteger("times") ?? 1;

        await interaction.reply(`Playing sound ${soundname.toUpperCase()} ${times} time(s)`);

        await play(interaction.member.voice.channel, soundname, times);
    },
};
