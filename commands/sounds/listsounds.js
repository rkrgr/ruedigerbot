const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('listsounds')
    .setDescription('List all sounds.'),
    async execute(interaction) {
        const folderPath = './media/sounds';
        try {
            // Read all .ogg files and remove the .ogg extension
            const files = fs.readdirSync(folderPath)
            .filter(f => f.endsWith('.ogg'))
            .map(f => f.replace(/\.ogg$/, ''));

            if (files.length === 0) {
                await interaction.reply('No sounds found in the `media/sounds` folder.');
                return;
            }

            // Split the list into chunks of 1500 characters (Discord's message limit is 2000)
            const chunkSize = 1500;
            const chunks = [];
            let currentChunk = '';

            for (const file of files) {
                const newLine = `${file}, `;
                if (currentChunk.length + newLine.length > chunkSize) {
                    chunks.push(currentChunk.trim());
                    currentChunk = newLine;
                } else {
                    currentChunk += newLine;
                }
            }

            // Add the last chunk
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
            }

            // Send the first message
            await interaction.reply(`**Available Sounds:**\n\`\`\`${chunks[0]}\`\`\``);

            // Send the rest as follow-up messages
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp(`\`\`\`${chunks[i]}\`\`\``);
            }
        } catch (error) {
            console.error('Error listing sounds:', error);
            await interaction.reply('An error occurred while listing sounds.');
        }
    },
};
