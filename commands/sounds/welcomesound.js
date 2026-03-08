const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder().setName('welcomesound').setDescription('Set a welcome sound').addStringOption((option) => option.setName("soundname")
                                                                                                                                    .setDescription("Name of the sound")
                                                                                                                                    .setRequired(true)),
    async execute(interaction) {
        const soundname = interaction.options.getString("soundname");

        let data = JSON.parse(fs.readFileSync('welcomesounds.json', 'utf8'));

        data[interaction.member.id] = soundname;
        fs.writeFileSync('welcomesounds.json', JSON.stringify(data, null, 2));

        await interaction.reply('Welcome sound set!');
    },
};


