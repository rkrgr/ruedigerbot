const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');

const dotenv = require("dotenv");
dotenv.config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers,] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

let files = null;

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const focusedValue = interaction.options.getFocused();
        const folderPath = './media/sounds';
        if (files === null) {
            files = fs.readdirSync(folderPath)
                .filter(f => f.endsWith('.ogg'))
                .map(f => f.replace(/\.ogg$/, ''));

            files.push('random');
            files.sort();
        }

        const filtered = files.filter(f => f.includes(focusedValue)).slice(0, 25);

        await interaction.respond(
            filtered.map(f => ({ name: f, value: f }))
        );
        return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (newState.member.user.bot) return;
    const oldVoice = oldState.channelId;
    const newVoice = newState.channelId;

    if (oldVoice == null && newVoice != null) {
        if (new Date().getDay() === 3) {
            // on wednesday
            play(newState.member.voice.channel, ["wednesday"]);
        } else {
            let data = JSON.parse(fs.readFileSync('welcomesounds.json', 'utf8'));
            let soundname = data[newState.member.id];
            if (soundname) {
                let command = client.commands.get("play");
                let interaction = {
                  member: newState.member,
                  options: {
                      getString: () => soundname,
                  },
                  reply: async (msg) => console.log("Bot would reply:", msg),
                };
                command.execute(interaction);
            }
        }
    }
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
