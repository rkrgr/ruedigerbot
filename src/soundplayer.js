const { Readable } = require("stream");
const s3 = require("./s3database");

async function play(voiceChannel, soundNames, folder = "sounds") {
  try {
    const playlistName = soundNames[0];
    const playlist = await s3.getPlaylist(playlistName);
    if (playlist) {
      soundNames = JSON.parse(playlist);
    }

    const connection = await voiceChannel.join();

    for (const soundName of soundNames) {
      await playSound(connection, soundName, folder);
    }
  } catch (e) {
    console.log(e);
  }
}

async function playFromFile(voiceChannel, file) {
  const connection = await voiceChannel.join();
  return connection.play(file);
}

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

function playSound(connection, soundName, folder) {
  return new Promise(async (resolve) => {
    const namePart = getSoundName(soundName);
    const timePart = getSoundPlaytime(soundName);
    try {
      const sound = await s3.getSound(namePart, folder);
      const dispatcher = connection.play(bufferToStream(sound));
      if (timePart) {
        dispatcher.on("start", () => {
          setTimeout(() => {
            dispatcher.end();
          }, timePart * 1000);
        });
      }
      dispatcher.on("finish", () => {
        resolve();
      });
    } catch {
      // if the sound can't be found, just don't play it
      resolve();
    }
  });
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

exports.play = play;
exports.playFromFile = playFromFile;
