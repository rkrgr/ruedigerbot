const express = require('express');

const app = express();

app.get('/labyrinth', (req, res) => {
	res.sendFile('./adventure/episode2/labyrinth.html', { root: __dirname });
});

function start(port) {
	app.listen(port, () => console.log(`listening on port ${port}!`));
}

exports.start = start;
