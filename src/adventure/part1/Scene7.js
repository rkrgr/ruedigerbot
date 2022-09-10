const soundplayer = require("../../soundplayer");

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

function isPosEqual(arr1, arr2) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

class Scene7 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;

    this.pos = [12, 5];
    this.dir = [-1, 0];
    this.currentTarget = obstacle1Pos;
    this.beepActive = true;
  }

  async play() {
    await soundplayer.play(
      this.voiceChannel,
      ["schrottplatz_anfang"],
      "sounds_adventure/teil1"
    );
    this.playBeepLoop();
  }

  abort() {
    this.beepActive = false;
  }

  async computeInput(message) {
    if (message === "rechts") {
      if (isPosEqual(this.dir, [-1, 0])) {
        this.dir = [0, 1];
      } else if (isPosEqual(this.dir, [0, 1])) {
        this.dir = [1, 0];
      } else if (isPosEqual(this.dir, [1, 0])) {
        this.dir = [0, -1];
      } else {
        this.dir = [-1, 0];
      }
    } else if (message === "links") {
      if (isPosEqual(this.dir, [-1, 0])) {
        this.dir = [0, -1];
      } else if (isPosEqual(this.dir, [0, -1])) {
        this.dir = [1, 0];
      } else if (isPosEqual(this.dir, [1, 0])) {
        this.dir = [0, 1];
      } else {
        this.dir = [-1, 0];
      }
    } else if (message === "vor") {
      const nextPos = [this.pos[0] + this.dir[0], this.pos[1] + this.dir[1]];
      if (
        nextPos[0] < 0 ||
        nextPos[0] >= height ||
        nextPos[1] < 0 ||
        nextPos[1] >= width
      ) {
        this.textChannel.send("Hier ist ein Zaun. Ich kann hier nicht lang.");
      } else {
        this.pos = nextPos;
      }
    } else if (message === "zurück") {
      const nextPos = [this.pos[0] - this.dir[0], this.pos[1] - this.dir[1]];
      if (
        nextPos[0] < 0 ||
        nextPos[0] >= height ||
        nextPos[1] < 0 ||
        nextPos[1] >= width
      ) {
        this.textChannel.send("Hier ist ein Zaun. Ich kann hier nicht lang.");
      } else {
        this.pos = nextPos;
      }
    }

    if (isPosEqual(this.pos, this.currentTarget)) {
      if (isPosEqual(this.currentTarget, obstacle1Pos)) {
        this.beepActive = false;
        this.currentTarget = obstacle2Pos;
        await soundplayer.play(
          this.voiceChannel,
          ["schrottplatz_mikrowelle"],
          "sounds_adventure/teil1"
        );
        this.beepActive = true;
        this.playBeepLoop();
      } else if (isPosEqual(this.currentTarget, obstacle2Pos)) {
        this.beepActive = false;
        this.currentTarget = ruedigerPos;
        await soundplayer.play(
          this.voiceChannel,
          ["schrottplatz_massage"],
          "sounds_adventure/teil1"
        );
        this.beepActive = true;
        this.playBeepLoop();
      } else if (isPosEqual(this.currentTarget, ruedigerPos)) {
        this.beepActive = false;
        await soundplayer.play(
          this.voiceChannel,
          ["schrottplatz_ruediger_gefunden"],
          "sounds_adventure/teil1"
        );
        this.done();
      }
    }
  }

  distanceTo(target) {
    return (
      Math.abs(target[0] - this.pos[0]) + Math.abs(target[1] - this.pos[1])
    );
  }

  playBeepLoop() {
    setTimeout(async () => {
      if (this.beepActive) {
        await soundplayer.play(
          this.voiceChannel,
          ["beep"],
          "sounds_adventure/teil1"
        );
        this.playBeepLoop();
      }
    }, this.distanceTo(this.currentTarget) * 1000);
  }
}

module.exports = Scene7;
