const { Readable } = require("stream");
const { asyncForEach } = require("sequential-async-foreach");
const {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const s3 = require("./s3database");
const logger = require("./logger");

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

function bufferToStream(binary) {
  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });
  return readableInstanceStream;
}

function playSound(player, soundName, folder) {
  const namePart = getSoundName(soundName);
  const timePart = getSoundPlaytime(soundName);
  return new Promise((resolve) => {
    s3.getSound(namePart, folder)
      .then((sound) => {
        const stream = bufferToStream(sound);
        const resource = createAudioResource(stream);
        // console.log(stream);
        player.play(resource);
        player.on("error", (error) => {
          logger.error(error);
        });
        if (timePart) {
          player.on(AudioPlayerStatus.Playing, () => {
            setTimeout(() => {
              player.stop();
            }, timePart * 1000);
          });
        }
        player.on(AudioPlayerStatus.Idle, () => {
          resolve();
        });
      })
      .catch(() => {
        // if the sound can't be found, just don't play it
        resolve();
      });
  });
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

  const player = createAudioPlayer();
  connection.subscribe(player);

  await asyncForEach(soundNames, async (soundName) => {
    await playSound(player, soundName, folder);
  });
}

async function playFromFile(voiceChannel, file) {
  const connection = await voiceChannel.join();
  return connection.play(file);
}

exports.play = play;
exports.playFromFile = playFromFile;
