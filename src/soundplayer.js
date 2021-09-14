const {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  entersState,
  StreamType,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const s3 = require("./s3database");
const logger = require("./logger");

const TIMEOUT = 60_000;

let player;
const soundQueue = [];

function getSoundName(sound) {
  const soundSplit = sound.split("(");
  return soundSplit[0];
}

function getSoundPlaytime(sound) {
  const soundSplit = sound.split("(");
  if (soundSplit[1]) {
    return parseFloat(soundSplit[1].split(")")[0]);
  }
  return null;
}

async function playSound(soundName, folder) {
  const namePart = getSoundName(soundName);
  const timePart = getSoundPlaytime(soundName);
  const stream = await s3.getSoundStream(namePart, folder);
  if (stream) {
    const resource = createAudioResource(stream, {
      inputType: StreamType.OggOpus,
    });
    player.play(resource);
    if (timePart) {
      await entersState(player, AudioPlayerStatus.Playing, TIMEOUT);
      setTimeout(() => {
        player.stop();
      }, timePart * 1000);
    }
    await entersState(player, AudioPlayerStatus.Idle, TIMEOUT);
  }
}

async function playSoundQueue() {
  if (soundQueue.length) {
    const { soundName, folder } = soundQueue.shift();
    await playSound(soundName, folder);
    playSoundQueue();
  }
}

async function play(voiceChannel, soundNamesIn, folder = "sounds") {
  const playlistName = soundNamesIn[0];
  const playlist = await s3.getPlaylist(playlistName);
  const soundNames = playlist ? JSON.parse(playlist) : soundNamesIn;

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  if (!player) {
    player = createAudioPlayer();
    player.on("error", (error) => {
      logger.error(error);
    });
  } else {
    player.stop();
  }
  connection.subscribe(player);

  // clear soundQueue
  soundQueue.splice(0, soundQueue.length);

  // eslint-disable-next-line no-restricted-syntax
  for (const soundName of soundNames) {
    soundQueue.push({ soundName, folder });
  }

  playSoundQueue();
}

async function playFromFile(voiceChannel, file) {
  const connection = await voiceChannel.join();
  return connection.play(file);
}

exports.play = play;
exports.playFromFile = playFromFile;
