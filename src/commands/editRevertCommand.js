/*const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

const { nanoid } = require("nanoid");

const path = require("path");

const logger = require("../logger");
const s3 = require("../s3database");
const { playFromFile } = require("../soundplayer");

module.exports = {
  name: "editrevert",
  description: "Reverts latest edit.",
  async execute(message) {
    const edit = await s3.getEdit(message.author.id);

    edit.actions.pop();

    let startSum = 0;
    edit.actions.forEach((a) => {
      startSum += a.start;
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

    ffmpeg()
      .input(tempFileNameInput)
      .setStartTime(`${startSum}ms`)
      .output(tempFileNameOutput)
      .on("end", async () => {
        const dispatcher = await playFromFile(
          message.member.voice.channel,
          tempFileNameOutput
        );
        dispatcher.on("close", () => {
          if (fs.existsSync(tempFileNameInput)) {
            fs.unlinkSync(tempFileNameInput);
          }
          if (fs.existsSync(tempFileNameOutput)) {
            fs.unlinkSync(tempFileNameOutput);
          }
        });
        dispatcher.on("finish", () => {
          if (fs.existsSync(tempFileNameInput)) {
            fs.unlinkSync(tempFileNameInput);
          }
          if (fs.existsSync(tempFileNameOutput)) {
            fs.unlinkSync(tempFileNameOutput);
          }
        });
      })
      .on("error", (err) => {
        logger.error(err);
      })
      .run();

    s3.updateEdit(message.author.id, edit.actions);
  },
};
*/