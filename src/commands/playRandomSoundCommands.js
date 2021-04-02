const play = require('../soundplayer');

const AWS = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
AWS.config.region = 'eu-central-1';
const s3 = new AWS.S3({
	accessKeyId: S3_ACCESS_KEY_ID,
	secretAccessKey: S3_SECRET_ACCESS_KEY,
});

async function getSounds() {
	const params = { Bucket: S3_BUCKET, Prefix: 'sounds/' };
	const data = await s3.listObjectsV2(params).promise();
	return data.Contents;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
	name: 'random',
	description: 'Play a random sound.',
	async execute(message) {
		const sounds = await getSounds();
		const soundnames = sounds.filter(sound => !sound.Key.endsWith('/')).map(sound => sound.Key.split('/')[1].split('.')[0]);
		const randomSound = soundnames[getRandomInt(soundnames.length - 1)];
		play(message.member.voice.channel, randomSound);
	},
};
