const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('./config.json');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}





client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(config.played_game);
});

client.on('message', async msg => {
    // Ignore all bots
    if (msg.author.bot) return;

    // Ignore non guild messages
    if (!msg.guild) return;

    // Ignore messages not starting with the prefix (in config.json)
    if (msg.content.indexOf(config.prefix) !== 0) return;

    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    // Saves "shifted" piece to a command variable;
    const command = args.shift().toLowerCase();

    if (command === 'play') {
        // Joins all arrays in one string (without spaces)
        var args_string = args.join('');
        // Returns ARRAYS of filtrated by object property
        var sounds = config.sounds.filter(obj => {
            return obj.command === args_string;
        });


        if (sounds.length === 1) {
            if (msg.member.voice.channel) {
                // Set nickname on this server while soundeffect plays.
                await msg.guild.member(client.user).setNickname(sounds[0].nickname);

                const connection = await msg.member.voice.channel.join();
                const dispatcher = connection.play('sounds/' + sounds[0].filename);
                dispatcher.on('end', () => {
                    setTimeout( function () {
                        dispatcher.destroy();
                        connection.disconnect();
                        msg.guild.member(client.user).setNickname("");
                    }, 3000);
                });
            }
            else {
                msg.reply('You need to join a voice channel to use this command!');
            }
        }
        else {
            msg.reply("Haven't found that sound in my base, choose another.");
        }

    }
});

client.login(process.env.DISCORD_TOKEN);