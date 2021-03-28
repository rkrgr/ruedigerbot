const AWS = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
AWS.config.region = 'eu-central-1';
const s3 = new AWS.S3({
	accessKeyId: S3_ACCESS_KEY_ID,
	secretAccessKey: S3_SECRET_ACCESS_KEY,
});

async function execute(channel) {
	let commands = 'Liste der Befehle:\n';
	const sounds = await getSounds();
	sounds.filter(sound => !sound.Key.endsWith('/')).map(sound => sound.Key.split('/')[1].split('.')[0]).forEach(sound => {
		commands += sound + ', ';
	});
	commands = commands.substring(0, commands.length - 2);
	channel.send(commands);
}

async function getSounds() {
	const params = { Bucket: S3_BUCKET, Prefix: 'sounds/' };
	const data = await s3.listObjectsV2(params).promise();
	return data.Contents;
}

module.exports = execute;
