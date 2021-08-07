const soundplayer = require("../../soundplayer");

const validNumbers = ["1", "2", "3", "4", "5", "6", "7", "8"];

class Scene3 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;
    this.newGame();
  }

  async play() {
    await soundplayer.play(
      this._voiceChannel,
      ["garage_zahlenschloss"],
      "sounds_adventure/teil1"
    );
    this._textChannel.send("Form der Eingabe:\n1 2 3 4 5");
  }

  async computeInput(message) {
    const input = message.split(" ");
    if (this.check(input)) {
      await soundplayer.play(
        this._voiceChannel,
        ["garage_shutdown"],
        "sounds_adventure/teil1"
      );
      this._done();
    }
  }

  check(input) {
    if (input.length != 5) {
      this._textChannel.send("Nicht die korrekte Anzahl an Ziffern.");
      return false;
    }

    let correctPos = 0;
    let correctDigit = 0;
    const clone = [...this._board];

    for (let i = 0; i < input.length; i++) {
      if (!validNumbers.includes(input[i])) {
        this._textChannel.send(`${input[i]} ist keine valide Ziffer.`);
        return false;
      }

      if (input[i] == this._board[i]) {
        correctPos++;
        clone[i] = "x";
      }
    }

    for (let i = 0; i < input.length; i++) {
      if (clone[i] != "x" && clone.includes(input[i])) {
        correctDigit++;
        clone[clone.indexOf(input[i])] = 0;
      }
    }

    if (correctPos == 5) {
      return true;
    }

    if (--this._remainingLives == 0) {
      this._textChannel.send("Zu viele Fehlversuche. Code wird zurückgesetzt.");
      this.newGame();
    } else {
      this._textChannel.send(
        `Ziffern an der richtigen Stelle: ${correctPos} - Richtige Ziffern an der falschen Stelle: ${correctDigit}`
      );
    }

    return false;
  }

  newGame() {
    this._remainingLives = 12;
    this._board = [];
    for (let i = 0; i < 5; i++) {
      this._board.push(`${getRandomInt(8) + 1}`);
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = Scene3;
