const fs = require("fs");
const path = require("path");

const {
  getSignedUrl,
} = require("@aws-sdk/s3-request-presigner");

const {
  Upload,
} = require("@aws-sdk/lib-storage");

const {
  GetObjectCommand,
  S3,
  PutObjectCommand
} = require("@aws-sdk/client-s3");

const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");


const normalize = require("ffmpeg-normalize");
const logger = require("./logger");

// Umgebungsvariablen direkt destrukturieren
const { S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

// Erstellen einer neuen S3-Instanz mit den spezifischen Konfigurationen
const s3 = new S3({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: "eu-central-1",
});

// Tell fluent-ffmpeg where it can find FFmpeg
//ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfmpegPath('C:\\dev\\ffmpeg\\bin\\ffmpeg.exe');

async function getSound(soundName, folder) {
  const params = { Bucket: S3_BUCKET, Key: `${folder}/${soundName}.mp3` };
  try {
    const result = await s3.getObject(params);
    return result.Body;
  } catch (error) {
    throw new Error(`Can't get sound ${soundName}.`);
  }
}

async function getSoundStream(soundName, folder) {
  const params = { Bucket: S3_BUCKET, Key: `${folder}/${soundName}` };
  try {
    await s3.headObject(params);
    const response = await s3.getObject(params);
    return response.Body;
  } catch (error) {
    console.log(error)
    logger.error(`Can't get sound ${soundName}.`);
  }
  return undefined;
}

async function getSounds(folder) {
  const params = { Bucket: S3_BUCKET, Prefix: `${folder}/` };
  try {
    const data = await s3.listObjectsV2(params);
    return data.Contents;
  } catch (e) {
    logger.error(e);
    return [];
  }
}

async function addSound(soundName, soundFilePath) {
  // Assuming soundFilePath is the path to the downloaded file
  const outputBaseName = path.join(__dirname, "tempSound");
  const outputMp3 = `${outputBaseName}.mp3`;
  const outputOgg = `${outputBaseName}.ogg`;

  try {
    // If your normalization step is necessary and supports local file paths
    await normalize({
      input: soundFilePath,
      output: outputMp3,
      loudness: {
        normalization: "ebuR128",
        target: {
          input_i: -23,
          input_lra: 7.0,
          input_tp: -2.0,
        },
      },
    });

    // Processing the file with FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(outputMp3)
        .audioCodec("libopus")
        .format("ogg")
        .on('start', commandLine => console.log('Spawned Ffmpeg with command:', commandLine))
        .on('codecData', data => console.log('Input is', data.audio, 'audio with', data.video, 'video'))
        .on('stderr', stderrLine => console.log('Stderr output:', stderrLine))
        .on('error', (err, stdout, stderr) => {
          console.error('Cannot process video:', err.message);
          console.error('FFmpeg stderr:', stderr);
          reject(err);
        })
        .on('end', () => {
          console.log('Processing finished successfully');
          resolve();
        })
        .save(outputOgg);
    });

    // Upload the processed file to S3
    const params = {
      Bucket: process.env.S3_BUCKET, // Ensure this is correctly referenced
      Key: `sounds/${soundName.toLowerCase()}`, // Ensure the file extension is included
      ContentType: "audio/opus",
      Body: fs.readFileSync(outputOgg),
    };

    // Assuming Upload is correctly set up for AWS SDK v3
    const data = await s3.send(new PutObjectCommand(params));
    console.log("Upload Success", data.Location);

  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    // Cleanup: Consider removing the temporary files to free up space
    [outputMp3, outputOgg].forEach(file => {
      fs.unlink(file, err => {
        if (err) console.error(`Error deleting temporary file ${file}:`, err);
        else console.log(`Temporary file ${file} deleted successfully.`);
      });
    });
  }
}

async function addSoundFromFile(soundName, soundFile) {
  const soundFileTokens = soundFile.split(".");
  const fileType = soundFileTokens[soundFileTokens.length - 1];

  const data = fs.readFileSync(soundFile);
  const params = {
    Bucket: S3_BUCKET,
    Key: `sounds/${soundName.toLowerCase()}.${fileType}`,
    ACL: "public-read",
    ContentType: "audio/mp3",
    Body: data,
  };
  return new Upload({
    client: s3,
    params,
  }).done();
}

async function getWelcomeSounds() {
  const params = { Bucket: process.env.S3_BUCKET, Key: "welcomesounds" }; // Assume the file is JSON and named "welcomesounds.json"
  try {
    // Using the GetObjectCommand with the S3 client
    const command = new GetObjectCommand(params);
    const data = await s3.send(command);
    
    // The SDK returns a stream in Body, you need to convert it to a string
    const bodyContents = await streamToString(data.Body);
    return new Map(JSON.parse(bodyContents));
  } catch (error) {
    console.log("Error fetching welcome sounds:", error);
    return new Map(); // Return an empty map in case of error
  }
}

// Helper function to convert a stream to a string
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

async function getWelcomeSound(userID) {
  const welcomeSounds = await getWelcomeSounds();
  return welcomeSounds.get(userID);
}

async function setWelcomeSound(userID, sound) {
  const welcomeSounds = await getWelcomeSounds();
  welcomeSounds.set(userID, sound);
  const json = JSON.stringify([...welcomeSounds]);

  const params = { Bucket: S3_BUCKET, Key: "welcomesounds", Body: json };
  s3.putObject(params);
}

async function getPlaylist(name) {
  const params = { Bucket: S3_BUCKET, Key: `playlists/${name}.json` };
  try {
    const result = await s3.getObject(params);
    return result.Body;
  } catch {
    return null;
  }
}

async function addPlaylist(name, sounds) {
  const params = {
    Bucket: S3_BUCKET,
    Key: `playlists/${name.toLowerCase()}.json`,
    Body: JSON.stringify(sounds),
  };

  try {
    const data = await new Upload({
      client: s3,
      params,
    }).done();
    logger.info("Upload Success", data.Location);
  } catch (err) {
    logger.error(err);
  }
}

async function getPlaylists() {
  const params = { Bucket: S3_BUCKET, Prefix: "playlists/" };
  const playlists = (await s3.listObjectsV2(params)).Contents;
  playlists.shift();
  const playlistNames = playlists.map(
    (playlist) => playlist.Key.split("/")[1].split(".")[0]
  );
  return playlistNames;
}

async function addEdit(userID, soundName) {
  const params = { Bucket: S3_BUCKET, Key: `edits/${userID}`, Body: JSON.stringify({ sound: soundName, actions: [] }) };
  try {
    const data = await new Upload({
      client: s3,
      params,
    }).done();
    logger.info("Upload Success", data.Location);
  } catch (err) {
    logger.error(err);
  }
}

async function getEdit(userID) {
  const params = { Bucket: S3_BUCKET, Key: `edits/${userID}` };
  const result = await s3.getObject(params);
  return JSON.parse(result.Body);
}

async function updateEdit(userID, actions) {
  const params = { Bucket: S3_BUCKET, Key: `edits/${userID}` };
  const edit = await getEdit(userID);
  params.Body = JSON.stringify({ sound: edit.sound, actions });
  try {
    const data = await new Upload({
      client: s3,
      params,
    }).done();
    logger.info("Upload Success", data.Location);
  } catch (err) {
    logger.error(err);
  }
}

async function deleteEdit(userID) {
  const params = { Bucket: S3_BUCKET, Key: `edits/${userID}` };
  return s3.deleteObject(params);
}

async function getGuildSounds() {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: "guildSounds",
  });

  try {
    const response = await s3.send(command);
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    const str = await response.Body.transformToString();
    
    if (!str) {
      return new Map();
    }
    
    return new Map(JSON.parse(str));
  } catch (err) {
    console.error(err);
  }
}

async function getSoundsForGuild(guildId) {
  const allSounds = await getGuildSounds();
  const guildSounds = allSounds.get(guildId);
  if (!guildSounds) {
    return [];
  }
  return guildSounds;
}

async function addSoundToGuild(soundName, guildId) {
  const allSounds = await getGuildSounds(); // Assuming getGuildSounds() returns a Map
  let guildSounds = allSounds.get(guildId);

  if (!guildSounds) {
    guildSounds = [];
  }
  
  if (!guildSounds.includes(soundName)) {
    guildSounds.push(soundName);
    allSounds.set(guildId, guildSounds);

    const json = JSON.stringify([...allSounds]);

    const params = { 
      Bucket: process.env.S3_BUCKET, // Ensure S3_BUCKET is correctly specified
      Key: "guildSounds.json", // Assuming the file is named "guildSounds.json"
      Body: json,
      ContentType: "application/json" // Specify the content type for proper handling
    };

    try {
      const command = new PutObjectCommand(params);
      await s3.send(command); // No need to call .promise() in v3
      console.log("Sound erfolgreich hinzugefügt und aktualisiert.");
    } catch (error) {
      console.error("Fehler beim Hochladen der Sounds: ", error);
      throw error; // Weitergabe des Fehlers an den aufrufenden Code
    }
  }
}

async function isSoundExisting(soundName) {
  const params = { Bucket: S3_BUCKET, Key: `sounds/${soundName}` };
  try {
    await s3.headObject(params);
    return true; // Das Objekt existiert
  } catch (error) {
    if (error.name === 'NotFound') {
      return false; // Das Objekt existiert nicht
    }
    // Loggen und Weitergeben anderer Fehler
    logger.error(error);
    throw error;
  }
}

exports.getSound = getSound;
exports.getSoundStream = getSoundStream;
exports.getSounds = getSounds;
exports.addSound = addSound;
exports.addSoundFromFile = addSoundFromFile;
exports.getWelcomeSounds = getWelcomeSounds;
exports.getWelcomeSound = getWelcomeSound;
exports.setWelcomeSound = setWelcomeSound;
exports.getPlaylist = getPlaylist;
exports.addPlaylist = addPlaylist;
exports.getPlaylists = getPlaylists;
exports.addEdit = addEdit;
exports.getEdit = getEdit;
exports.updateEdit = updateEdit;
exports.deleteEdit = deleteEdit;
exports.addSoundToGuild = addSoundToGuild;
exports.getSoundsForGuild = getSoundsForGuild;
exports.isSoundExisting = isSoundExisting;
