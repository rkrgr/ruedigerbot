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

async function getWelcomeSounds() {
	const params = { Bucket: S3_BUCKET, Key: 'welcomesounds' };
	const data = await s3.getObject(params).promise();
	if(!data) {
		return new Map();
	}
	return new Map(JSON.parse(data.Body.toString('utf-8')));
}

async function getWelcomeSound(userID) {
	const welcomeSounds = await getWelcomeSounds();
	return welcomeSounds.get(userID);
}

async function setWelcomeSound(userID, sound) {
	const welcomeSounds = await getWelcomeSounds();
	welcomeSounds.set(userID, sound);
	const json = JSON.stringify([...welcomeSounds]);

	const params = { Bucket: S3_BUCKET, Key: 'welcomesounds', Body: json };
	s3.putObject(params).promise();
}

exports.getSounds = getSounds;
exports.getWelcomeSounds = getWelcomeSounds;
exports.getWelcomeSound = getWelcomeSound;
exports.setWelcomeSound = setWelcomeSound;
