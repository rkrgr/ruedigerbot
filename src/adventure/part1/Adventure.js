class Adventure {
  constructor(voiceChannel, textChannel) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
  }

  start(numOfScene) {
    this._sceneNum = numOfScene;
    this._activeScene = new (require(`./Scene${this._sceneNum}`))(
      this._voiceChannel,
      this._textChannel,
      this.nextScene.bind(this)
    );
    this._activeScene.play();
  }

  nextScene() {
    this._sceneNum++;
    try {
      if (require.resolve(`./Scene${this._sceneNum}.js`)) {
        this._activeScene = new (require(`./Scene${this._sceneNum}`))(
          this._voiceChannel,
          this._textChannel,
          this.nextScene.bind(this)
        );
        this._activeScene.play();
      }
    } catch (e) {
      // adventure is done. nothing to do
    }
  }

  computeInput(message) {
    this._activeScene.computeInput(message);
  }
}

module.exports = Adventure;
