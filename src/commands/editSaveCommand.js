const fs = require("fs");
const { getAudioDurationInSeconds } = require("get-audio-duration");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

const { nanoid } = require("nanoid");

const path = require("path");

const logger = require("../logger");
const s3 = require("../s3database");

module.exports = {
  name: "editsave",
  description: "Save edit of a sound.",
  async execute(message) {
    const edit = await s3.getEdit(message.author.id);

    let startSum = 0;
    let endSum = 0;
    edit.actions.forEach((a) => {
      startSum += a.start;
      endSum += a.end;
    });

    const sound = await s3.getSound(edit.sound);

    const tempFileNameInput = path.join(
      __dirname,
      `tempEditSoundIn${nanoid()}.mp3`
    );
    const tempFileNameOutput = path.join(
      __dirname,
      `tempEditSoundOut${nanoid()}.mp3`
    );

    fs.writeFileSync(tempFileNameInput, sound);

    let duration = (await getAudioDurationInSeconds(tempFileNameInput)) * 1000;
    duration -= startSum + endSum;

    ffmpeg()
      .input(tempFileNameInput)
      .setStartTime(`${startSum}ms`)
      .setDuration(`${duration}ms`)
      .output(tempFileNameOutput)
      .on("end", async () => {
        await s3.addSoundFromFile(edit.sound, tempFileNameOutput);
        if (fs.existsSync(tempFileNameInput)) {
          fs.unlinkSync(tempFileNameInput);
        }
        if (fs.existsSync(tempFileNameOutput)) {
          fs.unlinkSync(tempFileNameOutput);
        }

        s3.deleteEdit(message.author.id);
        message.reply("Saved changes. Editing ended.");
      })
      .on("error", (err) => {
        logger.error(err);
      })
      .run();
  },
};
