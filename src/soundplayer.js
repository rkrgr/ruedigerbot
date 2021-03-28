const AWS = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
AWS.config.region = 'eu-central-1';
const s3 = new AWS.S3({
	accessKeyId: S3_ACCESS_KEY_ID,
	secretAccessKey: S3_SECRET_ACCESS_KEY,
});

async function play(voiceChannel, soundName) {
	try {
		const connection = await voiceChannel.join();
		const sounds = await getSounds();
		const regex = new RegExp('\\/' + soundName + '\\.');
		const soundFound = sounds.find(sound => regex.test(sound.Key));
		if(soundFound) {
			const soundKey = sounds.find(sound => regex.test(sound.Key)).Key;
			connection.play('https://ruediger.s3.eu-central-1.amazonaws.com/' + soundKey);
		}
	}
	catch(e) {
		console.log(e);
	}
}

async function getSounds() {
	const params = { Bucket: S3_BUCKET, Prefix: 'sounds/' };
	const data = await s3.listObjectsV2(params).promise();
	return data.Contents;
}

module.exports = play;
