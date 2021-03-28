const playSoundCommand = require('./PlaySoundCommand');

function executeCommand(message) {
	const text = message.content.toLowerCase();
	playSoundCommand(message.member, text);
}

exports.executeCommand = executeCommand;
