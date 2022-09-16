const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
  } = require("@discordjs/voice");
  
  const players = new Map();
  
  function getPlayer(voiceChannel) {
    let player = players.get(voiceChannel.id);
    if (!player) {
      player = createAudioPlayer();
      player.on("error", (error) => {
        console.log(error);
      });
      players.set(voiceChannel.id, player);
    }
    return player;
  }

  async function playFromFile(voiceChannel, file) {
    const resource = createAudioResource(file);

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    
    const player = getPlayer(voiceChannel);
    connection.subscribe(player);

    await player.play(resource);
  }
  
  function isPlaying(voiceChannel) {
    return getPlayer(voiceChannel).state === AudioPlayerStatus.Playing;
  }
  
  exports.playFromFile = playFromFile;
  exports.isPlaying = isPlaying;