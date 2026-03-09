const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require("dotenv");
dotenv.config();



// Load commands
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Initialize REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        /*/ Delete all guild commands
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                 { body: [] } // Empty array deletes all commands
        );
        console.log('Deleted all guild commands.');

        // Delete all global commands
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
                 { body: [] } // Empty array deletes all commands
        );
        console.log('Deleted all global commands.');*/

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Clear all existing commands and register new ones
        // For global commands (takes up to 1 hour to update):
        // const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        // For guild-specific commands (instant update):
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                                    { body: commands }
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error refreshing commands:', error);
    }
})();
