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

    this.textChannel.send({
      content:
        "Form der Eingabe: 1 2 3\nIch habe mir neue Öfen für die Backstube gekauft. Die neuen Öfen laufen auf Gas. Ich würde gerne das vorhandene Rohrsystem im Keller verwenden, um nicht nur Wasser zu den Wasserhähnen zu transportieren, sondern auch Gas zu den Öfen. Wasser und Gas darf sich natürlich nicht vermischen. Deswegen muss an bestimmten Stellen ein Ventil angebracht werden, um die Verbindung dort zu trennen. Ich habe allerdings nur drei Ventile. Kannst du mir sagen, wo ich die drei Ventile anbringen soll?",
      files: [
        {
          attachment: `${__dirname}/rohrrätsel.png`,
          name: "rohrrätsel.png",
        },
      ],
    });
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
