const { Collection, Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
const requireAll = require("require-all");
const logger = require("./src/logger");
const wednesdaySchedule = require("./src/wednesdaySchedule");

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const s3 = require("./src/s3database");

const { play } = require("./src/soundplayer");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});
client.commands = new Collection();

const commands = requireAll({
  dirname: `${__dirname}/src/commands`,
  filter: /^(.+Command)\.js$/,
});

Object.keys(commands).forEach((commandName) => {
  const command = commands[commandName];
  client.commands.set(command.name, command);
});

const adventure = require("./src/adventure/adventureController");

client.once("ready", () => {
  wednesdaySchedule(client.user);
  logger.info("Ready!");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.PREFIX)) {
    if (adventure.adventureIsActive()) {
      adventure.computeInput(message.content.trim());
    }
    return;
  }

  const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/);
  const command = args.shift();

  try {
    if (client.commands.has(command)) {
      client.commands.get(command).execute(message, args);
    } else {
      // try to play sound if command does not exist
      args.unshift(command);
      client.commands.get("play").execute(message, args);
    }
  } catch (error) {
    logger.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.member.user.bot) return;
  const oldVoice = oldState.channelId;
  const newVoice = newState.channelId;

  if (oldVoice == null && newVoice != null) {
    if (new Date().getDay() === 3) {
      // on wednesday
      play(newState.member.voice.channel, ["wednesday"]);
    } else {
      s3.getWelcomeSound(newState.member.user.id).then((soundName) => {
        if (soundName) {
          play(newState.member.voice.channel, [soundName]);
        }
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
