const {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  entersState,
  demuxProbe,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const s3 = require("./s3database");
const logger = require("./logger");

const TIMEOUT = 300_000;
let currentTimeout;
let isPlayingQueue = false;

let player;
const soundQueue = [];

function getSoundName(sound) {
  const soundSplit = sound.split("(");
  return soundSplit[0].toLowerCase();
}

function getSoundPlaytime(sound) {
  const soundSplit = sound.split("(");
  if (soundSplit[1]) {
    return parseFloat(soundSplit[1].split(")")[0]);
  }
  return null;
}

async function playSound(soundName, folder) {
  clearTimeout(currentTimeout);
  const namePart = getSoundName(soundName);
  const timePart = getSoundPlaytime(soundName);
  let readStream;
  if (soundName.startsWith("http")) {
    readStream = ytdl(soundName, {
      filter: "audioonly",
    });
  } else {
    readStream = await s3.getSoundStream(namePart, folder);
  }
  if (readStream) {
    const { stream, type } = await demuxProbe(readStream);
    const resourceOptions = { inputType: type };
    if (soundName.startsWith("http")) {
      resourceOptions.inlineVolume = true;
    }
    const resource = createAudioResource(stream, resourceOptions);
    if (soundName.startsWith("http")) {
      resource.volume.setVolume(0.3);
    }
    player.play(resource);
    await entersState(player, AudioPlayerStatus.Playing, TIMEOUT);
    if (timePart) {
      currentTimeout = setTimeout(() => {
        player.stop();
      }, timePart * 1000);
    }
    await entersState(player, AudioPlayerStatus.Idle, TIMEOUT);
  }
}

async function playSoundQueue() {
  isPlayingQueue = true;
  if (soundQueue.length) {
    const { soundName, folder } = soundQueue.shift();
    await playSound(soundName, folder);
    await playSoundQueue();
  } else {
    isPlayingQueue = false;
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
  }
  connection.subscribe(player);

  // clear soundQueue
  soundQueue.splice(0, soundQueue.length);

  // eslint-disable-next-line no-restricted-syntax
  for (const soundName of soundNames) {
    soundQueue.push({ soundName, folder });
  }

  if (isPlayingQueue) {
    player.stop();
  } else {
    await playSoundQueue();
  }
}

async function playFromFile(voiceChannel, file) {
  const connection = await voiceChannel.join();
  return connection.play(file);
}

function isPlaying() {
  return player.state === AudioPlayerStatus.Playing;
}

exports.play = play;
exports.playFromFile = playFromFile;
exports.isPlaying = isPlaying;
