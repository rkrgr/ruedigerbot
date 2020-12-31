module.exports = class Episode2 {
	constructor(voiceChannel, textChannel, play) {
		this.voiceChannel = voiceChannel;
		this.textChannel = textChannel;
		this.play = play;
		this.gedichtCounter = 0;
	}

	start() {
		this.play(this.voiceChannel, __dirname + '/anfang.mp3');
		setTimeout(() => {
			this.textChannel.send('', {
				files: [{
					attachment: __dirname + '/rüdiger.jpg',
					name: 'rüdiger.jpg',
				}],
			});
		}, 28000);
		setTimeout(() => {
			this.textChannel.send('https://ruediger.herokuapp.com/labyrinth');
		}, 54000);
	}

	checkCommands(command) {
		if(command == 'zettel') {
			this.play(this.voiceChannel, __dirname + '/zettel.mp3');
		}
		if(command == 'elfrida') {
			this.gedichtCounter = 1;
		}
		else if (this.gedichtCounter == 1) {
			this.setGedichtCounter(command == 'gnom');
		}
		else if (this.gedichtCounter == 2) {
			this.setGedichtCounter(command == 'cena');
		}
		else if (this.gedichtCounter == 3) {
			this.setGedichtCounter(command == 'ballern');
		}
		else if (this.gedichtCounter == 4) {
			this.setGedichtCounter(command == 'goldkrone');
		}
		else if (this.gedichtCounter == 5) {
			this.setGedichtCounter(command == 'jägermeister');
		}
		else if (this.gedichtCounter == 6) {
			this.setGedichtCounter(command == 'sekt');
		}
		else if (this.gedichtCounter == 7) {
			this.setGedichtCounter(command == 'uwe');
		}
		else if (this.gedichtCounter == 8) {
			this.setGedichtCounter(command == 'pepps');
		}
		else if (this.gedichtCounter == 9) {
			this.setGedichtCounter(command == 'safety dance');
		}
		else if (this.gedichtCounter == 10) {
			this.setGedichtCounter(command == 'michi');
			if(this.gedichtCounter == 11) {
				setTimeout(() => {
					this.play(this.voiceChannel, __dirname + '/briefe.mp3');
				}, 5000);
			}
		}

		if(command == 'brief 1') {
			this.play(this.voiceChannel, __dirname + '/brief1.mp3');
		}
		if(command == 'brief 2') {
			this.play(this.voiceChannel, __dirname + '/brief2.mp3');
		}
		if(command == 'brief 3') {
			this.play(this.voiceChannel, __dirname + '/brief3.mp3');
		}
		if(command == 'musik') {
			this.play(this.voiceChannel, __dirname + '/piano.mp3');
		}
		if(command == 'power torpedo') {
			this.play(this.voiceChannel, __dirname + '/aufzugAnfang.mp3');
			setTimeout(() => {
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/zahlenfeld.png',
						name: 'zahlenfeld.png',
					}],
				});
			}, 4000);
			setTimeout(() => {
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto1.png',
						name: 'Foto1.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto4.png',
						name: 'Foto4.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto9.png',
						name: 'Foto9.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto2.png',
						name: 'Foto2.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto10.png',
						name: 'Foto10.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto3.png',
						name: 'Foto3.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto5.png',
						name: 'Foto5.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto8.png',
						name: 'Foto8.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto6.png',
						name: 'Foto6.png',
					}],
				});
				this.textChannel.send('', {
					files: [{
						attachment: __dirname + '/Foto7.png',
						name: 'Foto7.png',
					}],
				});
			}, 14000);
			if(command == '5 3 0 8 1 7 6 2 7 5') {
				this.play(this.voiceChannel, __dirname + '/aufzugFahrt1.mp3');
				setTimeout(() => {
					this.textChannel.send('', {
						files: [{
							attachment: __dirname + '/kreuzworträtsel.jpg',
							name: 'kreuzworträtsel.jpg',
						}],
					});
				}, 45000);
			}
			if(command == 'franziska') {
				this.play(this.voiceChannel, __dirname + '/aufzugFahrt2.mp3');
			}
			if(command == 'hold op') {
				this.play(this.voiceChannel, __dirname + '/aufzugAusgang.mp3');
				setTimeout(() => {
					this.textChannel.send('', {
						files: [{
							attachment: __dirname + '/zahlenfeld.png',
							name: 'zahlenfeld.png',
						}],
					});
				}, 22000);
			}
			if(command == '3 7 9 1 2 11 5 10 4 6 8 x') {
				this.play(this.voiceChannel, __dirname + '/ende.mp3');
			}
		}
	}

	labyrinthFinished() {
		this.play(this.voiceChannel, __dirname + '/fall.mp3');
		setTimeout(() => {
			this.textChannel.send('https://www.onlinepianist.com/virtual-piano');
		}, 23000);
	}

	setGedichtCounter(correct) {
		if(correct) {
			this.gedichtCounter++;
		}
		else {
			this.gedichtCounter = 0;
		}
	}
};
