const soundplayer = require("../../soundplayer");

const beepFile = `${__dirname}/beep.mp3`;
const width = 8;
const height = 13;
const obstacle1Pos = [9, 2];
const obstacle2Pos = [5, 6];
const ruedigerPos = [2, 1];

/*
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 4, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 3, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 2, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 1, 0, 0], */

class Scene7 {
  constructor(voiceChannel, textChannel, done) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._done = done;

    this._pos = [12, 5];
    this._dir = [-1, 0];
    this._currentTarget = obstacle1Pos;
  }

  async play() {
    await soundplayer.play(
      this._voiceChannel,
      ["schrottplatz_anfang"],
      "sounds_adventure/teil1"
    );
    this._connection = await this._voiceChannel.join();
    this._beepActive = true;
    this.playBeepLoop(1000);
  }

  async computeInput(message) {
    if (message == "rechts") {
      if (this.isPosEqual(this._dir, [-1, 0])) {
        this._dir = [0, 1];
      } else if (this.isPosEqual(this._dir, [0, 1])) {
        this._dir = [1, 0];
      } else if (this.isPosEqual(this._dir, [1, 0])) {
        this._dir = [0, -1];
      } else {
        this._dir = [-1, 0];
      }
    } else if (message == "links") {
      if (this.isPosEqual(this._dir, [-1, 0])) {
        this._dir = [0, -1];
      } else if (this.isPosEqual(this._dir, [0, -1])) {
        this._dir = [1, 0];
      } else if (this.isPosEqual(this._dir, [1, 0])) {
        this._dir = [0, 1];
      } else {
        this._dir = [-1, 0];
      }
    } else if (message == "vor") {
      const nextPos = [
        this._pos[0] + this._dir[0],
        this._pos[1] + this._dir[1],
      ];
      if (
        nextPos[0] < 0 ||
        nextPos[0] >= height ||
        nextPos[1] < 0 ||
        nextPos[1] >= width
      ) {
        this._textChannel.send("Hier ist ein Zaun. Ich kann hier nicht lang.");
      } else {
        this._pos = nextPos;
      }
    } else if (message == "zurück") {
      const nextPos = [
        this._pos[0] - this._dir[0],
        this._pos[1] - this._dir[1],
      ];
      if (
        nextPos[0] < 0 ||
        nextPos[0] >= height ||
        nextPos[1] < 0 ||
        nextPos[1] >= width
      ) {
        this._textChannel.send("Hier ist ein Zaun. Ich kann hier nicht lang.");
      } else {
        this._pos = nextPos;
      }
    }

    if (this.isPosEqual(this._pos, this._currentTarget)) {
      if (this.isPosEqual(this._currentTarget, obstacle1Pos)) {
        this._beepActive = false;
        this._currentTarget = obstacle2Pos;
        await soundplayer.play(
          this._voiceChannel,
          ["schrottplatz_mikrowelle"],
          "sounds_adventure/teil1"
        );
        this._beepActive = true;
        this.playBeepLoop(1000);
      } else if (this.isPosEqual(this._currentTarget, obstacle2Pos)) {
        this._beepActive = false;
        this._currentTarget = ruedigerPos;
        await soundplayer.play(
          this._voiceChannel,
          ["schrottplatz_massage"],
          "sounds_adventure/teil1"
        );
        this._beepActive = true;
        this.playBeepLoop(1000);
      } else if (this.isPosEqual(this._currentTarget, ruedigerPos)) {
        this._beepActive = false;
        await soundplayer.play(
          this._voiceChannel,
          ["schrottplatz_ruediger_gefunden"],
          "sounds_adventure/teil1"
        );
        this._done();
      }
    }
  }

  distanceTo(target) {
    return (
      Math.abs(target[0] - this._pos[0]) + Math.abs(target[1] - this._pos[1])
    );
  }

  isPosEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  }

  async playBeepLoop(speed) {
    setTimeout(async () => {
      if (this._beepActive) {
        const dispatcher = this._connection.play(beepFile);
        dispatcher.on("finish", () => {
          if (this._beepActive) {
            this.playBeepLoop(this.distanceTo(this._currentTarget) * 1000);
          }
        });
      }
    }, speed);
  }
}

module.exports = Scene7;
