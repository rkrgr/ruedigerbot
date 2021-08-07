const s3 = require("../s3database");

module.exports = {
  name: "editabort",
  description: "Aborts editing a sound.",
  async execute(message) {
    await s3.deleteEdit(message.author.id);
    message.reply("Edit aborted.");
  },
};
