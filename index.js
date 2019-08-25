const { Client, MessageEmbed } = require('discord.js');
const client = new Client();
var config = require('./config.json');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}





// Pre-embeds

const help_embed = new MessageEmbed()
    // Set the title of the field
    .setTitle('Help')
    // Set the color of the embed
    .setColor(0xAFBDE8)
    // Set the main content of the embed
    .addField("sb!play `sound name`", "Play meme sound into your voice channel")
    .addField("sb!sounds", "Open list of all sounds avaliable")
    .addField("sb!example", "Play random sound as an example")
    .addField("sb!server", "Get a link to our support server")

//help_embed.type = "rich";

const no_sound_embed = new MessageEmbed()
    // Set the title of the field
    .setTitle("Can't find this sound!")
    // Set the image of the embed
    .setImage("https://pics.me.me/thumb_thinksweat-thinking-emoji-discord-meme-clipart-594776-pinclipart-49616734.png")
    // Set the color of the embed
    .setColor(0xE8AFBD)
    // Set the main content of the embed
    .setDescription("Try using `sb!sounds` to see the sounds that I can play.")

const no_user_in_vc_embed = new MessageEmbed()
    // Set the title of the field
    .setTitle("Can't find you to play a meme for!")
    // Set the image of the embed
    .setImage("https://pics.me.me/thumb_thinksweat-thinking-emoji-discord-meme-clipart-594776-pinclipart-49616734.png")
    // Set the color of the embed
    .setColor(0xE8AFBD)
    // Set the main content of the embed
    .setDescription("Join any voice channel before using this command!")

const no_command_embed = new MessageEmbed()
    // Set the title of the field
    .setTitle("You found me!")
    // Set the image of the embed
    .setImage("https://vignette.wikia.nocookie.net/lick-battle/images/b/b3/Bruh_Sound_Effect_-2.png/revision/latest?cb=20190518215204")
    // Set the color of the embed
    .setColor(0xBDE8AF)
    // Set the main content of the embed
    .addField("Thank you for using me! Type `sb!help` to see all of my commands", "And play your first sound with `sb!play bruh`")
    // Set the footer of the embed
    .setFooter("And don't forget to sb!play yeet your m8's!", "https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/yeet-amel-our.jpg")

const not_existing_command_embed = new MessageEmbed()
    // Set the title of the field
    .setTitle("Can't find this command!")
    // Set the image of the embed
    .setImage("https://media.boingboing.net/wp-content/uploads/2017/06/flat800x800075f.u2.jpg")
    // Set the color of the embed
    .setColor(0xE8AFBD)
    // Set the main content of the embed
    .setDescription("See `sb!help` for all avaliable commands.")

const support_server_embed = new MessageEmbed()
    // Set the title of the field
    .setTitle("SoundBot discord server!")
    // Set the image of the embed
    .setImage("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSssBTdJE-jp7I4UDU_pnaOCida_-AOXOh7Qpz-IPFTwQpUk_Lb")
    // Set the color of the embed
    .setColor(0xBDE8AF)
    // Set the main content of the embed
    .addField("https://discord.gg/MbTFGka", "Join our support channel, where you can ask my developers for help, and support me!")
    //.setURL("https://discord.gg/MbTFGka")



var server_joins_channel;
var server_leaves_channel;
var server_count_channel;
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(config.played_game);
    server_joins_channel = await client.channels.fetch(config.join_msgs_channel);
    server_leaves_channel = await client.channels.fetch(config.leave_msgs_channel);
    // server_joins_channel = client.channels.get(config.join_msgs_channel);
    // server_leaves_channel = client.channels.get(config.leave_msgs_channel);
    server_count_channel = await client.channels.fetch(config.server_count_channel);
    setInterval({
        update_server_counter();
    }, 5 * 60 * 1000);
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
                //msg.reply('You need to join a voice channel to use this command!');
                msg.channel.send(no_user_in_vc_embed);
            }
        }
        else {
            //msg.reply("Haven't found that sound in my base, choose another.");
            msg.channel.send(no_sound_embed);
        }

    }
    else if (command === "help") {
        // Send the embed to the same channel as the message
        msg.channel.send(help_embed);
    }
    else if (command === "sounds") {
        const sounds_embed = new MessageEmbed()
            .setTitle("Sounds")
            .setColor(0xAFBDE8)
            config.sounds.forEach(sound => {
                sounds_embed.addField(sound.name + " - " + "`sb!play " + sound.command + "`", sound.description);
            });
        msg.channel.send(sounds_embed);
    }
    else if (command === "example") {
        // Plays random sound as an example
        // TO-DO
        if (msg.member.voice.channel) {
            msg.channel.startTyping();
            setTimeout(async function () {

                msg.channel.stopTyping();
                    
                var min = 0;   
                var max = config.sounds.length - 1;
                var random = Math.floor(Math.random() * (+max - +min)) + +min;
                msg.channel.send("sb!play " + config.sounds[random].command)

                setTimeout(async function () {

                    // Set nickname on this server while soundeffect plays.
                    await msg.guild.member(client.user).setNickname(config.sounds[random].nickname);

                    const connection = await msg.member.voice.channel.join();
                    const dispatcher = connection.play('sounds/' + config.sounds[random].filename);
                    dispatcher.on('end', () => {
                        setTimeout( function () {
                            dispatcher.destroy();
                            connection.disconnect();
                            msg.guild.member(client.user).setNickname("");
                        }, 3000);
                    });

                }, 1000);

            }, 3000);

        }
        else {
            //msg.reply('You need to join a voice channel to use this command!');
            msg.channel.send(no_user_in_vc_embed);
        }

    }
    else if (command === "server") {
        msg.channel.send(support_server_embed);
    }
    else if (command === "") {
        msg.channel.send(no_command_embed);
    }
    else {
        msg.channel.send(not_existing_command_embed);
    }
});

client.on("guildCreate", guild => {
    const join_guild_embed = new MessageEmbed()
        .setTitle("Joined new server!")
        .addField(guild.name, guild.memberCount + " members")
        .setImage(guild.iconURL())
    server_joins_channel.send(join_guild_embed);
})

client.on("guildDelete", guild => {
    const left_guild_embed = new MessageEmbed()
        .setTitle("Kicked from server.")
        .addField(guild.name, guild.memberCount + " members")
        .setImage(guild.iconURL())
    server_leaves_channel.send(left_guild_embed);
})

function update_server_counter () {
    server_count_channel.edit({ name: "Playing memes on " + client.guilds.size + " servers." })
}

client.login(process.env.DISCORD_TOKEN);
