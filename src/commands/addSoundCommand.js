const axios = require('axios');
const fs = require('fs');
const path = require('path');
const s3 = require("../s3database");

// Ensure the temp directory exists or create it
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Sanitize the filename to remove invalid characters and URL parameters
function sanitizeFilename(url) {
  const parsedUrl = new URL(url);
  let filename = path.basename(parsedUrl.pathname); // Extract filename from URL path
  // Replace invalid filename characters here if needed
  return filename;
}

module.exports = {
  name: "addsound",
  description: "Adds a sound.",
  async execute(message, args) {
    try {
      const soundName = args[0];

      if (!soundName) {
        message.reply("No sound name declared.");
        return;
      }

      if (!message.attachments.size) {
        message.reply("No sound file attached.");
        return;
      }

      const exists = await s3.isSoundExisting(soundName);
      if (exists) {
        message.reply("A sound with that name already exists.");
        return;
      }

      const soundFile = message.attachments.first();
      const tempDir = path.join(__dirname, 'temp');
      ensureDirectoryExists(tempDir); // Ensure the temp directory exists

      const sanitizedFilename = sanitizeFilename(soundFile.url); // Sanitize the filename
      const tempFilePath = path.join(tempDir, sanitizedFilename); // Create a path for the downloaded file

      // Download the file
      await downloadFile(soundFile.url, tempFilePath);

      // After downloading, proceed with adding the sound
      await s3.addSound(soundName, tempFilePath);
      await s3.addSoundToGuild(soundName, message.guild.id);
      message.reply("Sound successfully added.");

      // Optionally, clean up the downloaded file after processing
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Error deleting temporary file:", err);
        else console.log("Temporary file deleted successfully.");
      });

    } catch (error) {
      console.error("An error occurred:", error);
      message.reply("An error occurred while adding the sound.");
    }
  },
};

async function downloadFile(fileUrl, outputPath) {
  const response = await axios({
    method: 'GET',
    url: fileUrl,
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    let error = null;
    writer.on('error', err => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on('close', () => {
      if (!error) {
        resolve(true);
      }
    });
  });
}
