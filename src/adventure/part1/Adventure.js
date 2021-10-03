/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
class Adventure {
  constructor(voiceChannel, textChannel) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
  }

  start(numOfScene) {
    this.sceneNum = parseInt(numOfScene, 10);
    this.activeScene = new (require(`./Scene${this.sceneNum}`))(
      this.voiceChannel,
      this.textChannel,
      this.nextScene.bind(this)
    );
    this.activeScene.play();
  }

  nextScene() {
    this.sceneNum += 1;
    try {
      if (require.resolve(`./Scene${this.sceneNum}.js`)) {
        this.activeScene = new (require(`./Scene${this.sceneNum}`))(
          this.voiceChannel,
          this.textChannel,
          this.nextScene.bind(this)
        );
        this.activeScene.play();
      }
    } catch (e) {
      // adventure is done. nothing to do
    }
  }

  computeInput(message) {
    this.activeScene.computeInput(message);
  }
}

module.exports = Adventure;
