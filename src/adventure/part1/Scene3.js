const soundplayer = require("../../soundplayer");

class Scene3 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
  }

  async play() {
    await soundplayer.play(
      this.voiceChannel,
      ["baeckerei_anfang"],
      "sounds_adventure/teil1"
    );

    this.textChannel.send("", {
      files: [
        {
          attachment: `${__dirname}/rohrrätsel.png`,
          name: "rohrrätsel.png",
        },
      ],
    });
    this.textChannel.send("Form der Eingabe: 1 2 3");
  }

  async computeInput(message) {
    const input = message.split(" ").sort();
    if (input[0] === "1" && input[1] === "2" && input[2] === "8") {
      await soundplayer.play(
        this.voiceChannel,
        ["baeckerei_ende"],
        "sounds_adventure/teil1"
      );
      this.done();
    }
  }
}

module.exports = Scene3;
