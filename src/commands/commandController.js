const playSoundCommand = require('./playSoundCommand');
const showCommandsCommand = require('./showCommandsCommand');

function executeCommand(message) {
	const text = message.content.trim().toLowerCase();
	if(text == '!commands') {
		showCommandsCommand(message.channel);
	}
	else {
		playSoundCommand(message.member, text);
	}
}

exports.executeCommand = executeCommand;
