const soundplayer = require("../../soundplayer");

class Scene6 {
  constructor(voiceChannel, textChannel, done) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.done = done;
  }

  async play() {
    soundplayer.play(
      this.voiceChannel,
      ["paul_start"],
      "sounds_adventure/teil1"
    );
  }

  async computeInput(message) {
    if (message.toLowerCase().includes("zylinder")) {
      soundplayer.play(
        this.voiceChannel,
        ["paul_raetsel"],
        "sounds_adventure/teil1"
      );
      this.textChannel.send(
        "Die Szene ist, ein Wald sehr dicht, zu dunkel, man sieht sein eigen’ Hand vor Augen nicht. Dort ist eine Höhle, ebenso schwarz, gefüllt mit Zwergen - hier und dort Geknarz. Die Zwerge haben zweierlei Helme auf. Die einen haben blaue und die anderen rote Punkte drauf. Die Aufgabe ist leicht: Ganz ohne zu sehen, sollen die Zwerge draußen nach Farbe sortiert in einer Reihe stehen. Ganz ohne Sehen ist nicht ganz richtig. Denn jeder sieht, wie sie draußen schon stehen - das ist ganz wichtig. Nun gib’s unten ein. Wie sollen sie es machen? Ist die Antwort falsch, hast du gleich nichts mehr zu lachen."
      );
    }
    if (
      message.toLowerCase().includes("mitte") ||
      message.toLowerCase().includes("mittig") ||
      message.toLowerCase().includes("zwischen")
    ) {
      await soundplayer.play(
        this.voiceChannel,
        ["paul_ende"],
        "sounds_adventure/teil1"
      );
      this.done();
    }
  }
}

module.exports = Scene6;
