const express = require('express');

const app = express();
const port = 3000;

app.get('/labyrinth', (req, res) => {
	res.sendFile('./adventure/episode2/labyrinth.html', { root: __dirname });
});

app.listen(port, () => console.log(`listening on port ${port}!`));
