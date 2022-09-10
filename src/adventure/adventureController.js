/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

let adventure = null;

function computeInput(message) {
  adventure.computeInput(message);
}

function adventureIsActive() {
  return adventure !== null;
}

function start(voiceChannel, textChannel, adventureName, numOfScene = 1) {
  if (adventure) {
    adventure.abort();
  }
  adventure = new (require(`./${adventureName}/Adventure`))(
    voiceChannel,
    textChannel
  );
  adventure.start(numOfScene);
}

module.exports.computeInput = computeInput;
module.exports.adventureIsActive = adventureIsActive;
module.exports.start = start;
