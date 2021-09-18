const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const ffmpeg = require("fluent-ffmpeg");
const normalize = require("ffmpeg-normalize");
const logger = require("./logger");

const { S3_BUCKET } = process.env;
const { S3_ACCESS_KEY_ID } = process.env;
const { S3_SECRET_ACCESS_KEY } = process.env;
AWS.config.region = "eu-central-1";
const s3 = new AWS.S3({
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
});

async function getSound(soundName, folder) {
  const params = { Bucket: S3_BUCKET, Key: `${folder}/${soundName}.mp3` };
  try {
    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    throw new Error(`Can't get sound ${soundName}.`);
  }
}

async function getSoundStream(soundName, folder) {
  const params = { Bucket: S3_BUCKET, Key: `${folder}/${soundName}` };
  try {
    await s3.headObject(params).promise();
    return s3.getObject(params).createReadStream();
  } catch (error) {
    logger.error(`Can't get sound ${soundName}.`);
  }
  return undefined;
}

async function getSounds(folder) {
  const params = { Bucket: S3_BUCKET, Prefix: `${folder}/` };
  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents;
  } catch (e) {
    logger.error(e);
    return [];
  }
}

async function addSound(soundName, soundFile) {
  const fileName = path.join(__dirname, "tempSound");

  await normalize({
    input: soundFile,
    output: `${fileName}.mp3`,
    loudness: {
      normalization: "ebuR128",
      target: {
        input_i: -23,
        input_lra: 7.0,
        input_tp: -2.0,
      },
    },
  });

  ffmpeg(`${fileName}.mp3`)
    .audioCodec("libopus")
    .format("ogg")
    .save(`${fileName}.ogg`)
    .on("end", () => {
      const params = {
        Bucket: S3_BUCKET,
        Key: `sounds/${soundName.toLowerCase()}`,
        ContentType: "audio/opus",
      };

      // ffmpeg -i input.mp3 -c:a libopus -b:a 32k -vbr on -compression_level 10 -frame_duration 60 -application voip output.opus

      params.Body = fs.readFileSync(`${fileName}.ogg`);

      s3.upload(params, (err, data) => {
        if (err) {
          logger.error(err);
        }
        if (data) {
          logger.info("Upload Success", data.Location);
        }
      });
    });
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
  return s3.upload(params).promise();
}

async function getWelcomeSounds() {
  const params = { Bucket: S3_BUCKET, Key: "welcomesounds" };
  const data = await s3.getObject(params).promise();
  if (!data) {
    return new Map();
  }
  return new Map(JSON.parse(data.Body.toString("utf-8")));
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
  s3.putObject(params).promise();
}

async function getPlaylist(name) {
  const params = { Bucket: S3_BUCKET, Key: `playlists/${name}.json` };
  try {
    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch {
    return null;
  }
}

function addPlaylist(name, sounds) {
  const params = {
    Bucket: S3_BUCKET,
    Key: `playlists/${name.toLowerCase()}.json`,
    ACL: "public-read",
  };
  params.Body = JSON.stringify(sounds);

  s3.upload(params, (err, data) => {
    if (err) {
      logger.error(err);
    }
    if (data) {
      logger.info("Upload Success", data.Location);
    }
  });
}

async function getPlaylists() {
  const params = { Bucket: S3_BUCKET, Prefix: "playlists/" };
  const playlists = (await s3.listObjectsV2(params).promise()).Contents;
  playlists.shift();
  const playlistNames = playlists.map(
    (playlist) => playlist.Key.split("/")[1].split(".")[0]
  );
  return playlistNames;
}

async function addEdit(userID, soundName) {
  const params = { Bucket: S3_BUCKET, Key: `edits/${userID}` };
  params.Body = JSON.stringify({ sound: soundName, actions: [] });

  s3.upload(params, (err, data) => {
    if (err) {
      logger.error(err);
    }
    if (data) {
      logger.info("Upload Success", data.Location);
    }
  });
}

async function getEdit(userID) {
  const params = { Bucket: S3_BUCKET, Key: `edits/${userID}` };
  const result = await s3.getObject(params).promise();
  return JSON.parse(result.Body);
}

async function updateEdit(userID, actions) {
  const params = { Bucket: S3_BUCKET, Key: `edits/${userID}` };
  const edit = await getEdit(userID);
  params.Body = JSON.stringify({ sound: edit.sound, actions });

  s3.upload(params, (err, data) => {
    if (err) {
      logger.error(err);
    }
    if (data) {
      logger.info("Upload Success", data.Location);
    }
  });
}

async function deleteEdit(userID) {
  const params = { Bucket: S3_BUCKET, Key: `edits/${userID}` };
  return s3.deleteObject(params).promise();
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
