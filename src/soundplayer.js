const { Readable } = require("stream");
const s3 = require("./s3database");

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

function playSound(connection, soundName, folder) {
  const namePart = getSoundName(soundName);
  const timePart = getSoundPlaytime(soundName);
  return new Promise((resolve) => {
    s3.getSound(namePart, folder)
      .then((sound) => {
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
      })
      .catch(() => {
        // if the sound can't be found, just don't play it
        resolve();
      });
  });
}

async function play(voiceChannel, soundNamesIn, folder = "sounds") {
  try {
    const playlistName = soundNamesIn[0];
    const playlist = await s3.getPlaylist(playlistName);
    const soundNames = playlist ? JSON.parse(playlist) : soundNamesIn;

    const connection = await voiceChannel.join();

    for (soundName of soundNames) {
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

exports.play = play;
exports.playFromFile = playFromFile;
