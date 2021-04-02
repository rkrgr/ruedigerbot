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

async function addSound(soundName, soundFile) {
	const soundFileTokens = soundFile.split('.');
	const fileType = soundFileTokens[soundFileTokens.length - 1];

	const request = require('request');
	request.get({ url: soundFile, encoding: null }, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			const params = { Bucket: S3_BUCKET, Key: 'sounds/' + soundName + '.' + fileType, ACL: 'public-read', ContentType: 'audio/mp3' };
			params.Body = body;

			s3.upload (params, function(err, data) {
				if (err) {
					console.log('Error', err);
				}
				if (data) {
					console.log('Upload Success', data.Location);
				}
			});
		}
	});


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
exports.addSound = addSound;
exports.getWelcomeSounds = getWelcomeSounds;
exports.getWelcomeSound = getWelcomeSound;
exports.setWelcomeSound = setWelcomeSound;
