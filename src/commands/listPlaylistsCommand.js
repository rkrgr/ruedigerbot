const s3 = require("../s3database");

module.exports = {
  name: "playlists",
  description: "Lists all playlists.",
  async execute(message) {
    const playlists = await s3.getPlaylists();
    let result = "Playlists:\n";
    result += playlists.shift();
    playlists.forEach((name) => {
      result += `, ${name}`;
    });
    message.channel.send(result);
  },
};
