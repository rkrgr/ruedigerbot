const express = require('express');
const bot = require('./bot');

const app = express();

app.get('/labyrinth', (req, res) => {
	res.sendFile('./adventure/episode2/labyrinth.html', { root: __dirname });
});

app.get('/labyrinth_solved', (req, res) => {
	bot.episode2LabyrinthFinished();
	res.send('Gelöst');
});

function start(port) {
	app.listen(port, () => console.log(`listening on port ${port}!`));
}

exports.start = start;
