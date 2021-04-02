const AWS = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
AWS.config.region = 'eu-central-1';
const s3 = new AWS.S3({
	accessKeyId: S3_ACCESS_KEY_ID,
	secretAccessKey: S3_SECRET_ACCESS_KEY,
});

function uploadWelcomesoundFile(fileContent) {
	const params = { Bucket: S3_BUCKET, Key: 'welcomesounds', Body: fileContent };

	s3.putObject(params, function(err) {
		if (err) {
			console.log(err);
		}
		else {
			console.log('Successfully uploaded data to welcomesounds bucket');
		}
	});
}

module.exports = {
	name: 'welcomesound',
	description: 'Sets the welcome sound.',
	execute(message, args) {
		const soundname = args[0];
		const params = { Bucket: S3_BUCKET, Key: 'welcomesounds' };
		s3.getObject(params, (err, data) => {
			if (err) {
				console.log(err);
			}
			else {
				const welcomesounds = new Map(JSON.parse(data.Body.toString('utf-8')));
				welcomesounds.set(message.author.id, soundname);
				const json = JSON.stringify([...welcomesounds]);
				uploadWelcomesoundFile(json);
				message.channel.send('Welcomesound "' + soundname + '" wurde für User "' + message.author.username + '" gesetzt.');
			}
		});
	},
};
