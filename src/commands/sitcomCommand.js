const { getVoiceConnection } = require("@discordjs/voice");

const { play } = require("../soundplayer");

let on = false;

function randLaugh() {
  const laughs = ["haha", "hahaha", "hahahaha", "haha4", "haha5"];
  return laughs[Math.floor(Math.random() * laughs.length)];
}

module.exports = {
  name: "sitcom",
  description: "Sitcom mode.",
  execute(message) {
    on = !on;

    const connection = getVoiceConnection(message.guildId);
    const { receiver } = connection;

    let speakingStart = 0;

    receiver.speaking.on("start", (userId) => {
      if (on) {
        speakingStart = Date.now();
      }
    });

    receiver.speaking.on("end", (userId) => {
      if (on) {
        const speakingEnd = Date.now();
        const speakingTime = speakingEnd - speakingStart;

        console.log(speakingTime);

        if (speakingTime > 1000 && speakingTime < 4000) {
          const laugh = randLaugh();
          play(message.member.voice.channel, [laugh]);
        }
      }
    });

    if (on) {
      message.reply("Sitcom mode activated.");
    } else {
      message.reply("Sitcom mode deactivated.");
    }
  },
};
