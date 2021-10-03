const soundplayer = require("../../soundplayer");

const validNumbers = ["1", "2", "3", "4", "5", "6", "7", "8"];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class Scene4 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
    this.newGame();
  }

  async play() {
    await soundplayer.play(
      this.voiceChannel,
      ["garage_zahlenschloss"],
      "sounds_adventure/teil1"
    );
    this.textChannel.send("Form der Eingabe:\n1 2 3 4 5");
  }

  async computeInput(message) {
    const input = message.split(" ");
    if (this.check(input)) {
      await soundplayer.play(
        this.voiceChannel,
        ["garage_shutdown"],
        "sounds_adventure/teil1"
      );
      this.done();
    }
  }

  check(input) {
    if (input.length !== 5) {
      this.textChannel.send("Nicht die korrekte Anzahl an Ziffern.");
      return false;
    }

    let correctPos = 0;
    let correctDigit = 0;
    const clone = [...this.board];

    for (let i = 0; i < input.length; i += 1) {
      if (!validNumbers.includes(input[i])) {
        this.textChannel.send(`${input[i]} ist keine valide Ziffer.`);
        return false;
      }

      if (input[i] === this.board[i]) {
        correctPos += 1;
        clone[i] = "x";
      }
    }

    for (let i = 0; i < input.length; i += 1) {
      if (clone[i] !== "x" && clone.includes(input[i])) {
        correctDigit += 1;
        clone[clone.indexOf(input[i])] = 0;
      }
    }

    if (correctPos === 5) {
      return true;
    }

    this.remainingLives -= 1;
    if (this.remainingLives === 0) {
      this.textChannel.send("Zu viele Fehlversuche. Code wird zurückgesetzt.");
      this.newGame();
    } else {
      this.textChannel.send(
        `Ziffern an der richtigen Stelle: ${correctPos} - Richtige Ziffern an der falschen Stelle: ${correctDigit}`
      );
    }

    return false;
  }

  newGame() {
    this.remainingLives = 12;
    this.board = [];
    for (let i = 0; i < 5; i += 1) {
      this.board.push(`${getRandomInt(8) + 1}`);
    }
  }
}

module.exports = Scene4;
