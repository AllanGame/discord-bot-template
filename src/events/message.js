module.exports = (client, message) =>  {
    const { Console } = require("console");
    var Discord = require("discord.js");
    var GuildSchema = require("../models/guild.js");
    var UserSchema = require("../models/user.js");
    let misc = require("../utils/misc.json")
    let args = message.content.split(" ");

    // check if the user is in the database, if not add it
    UserSchema.findOne({
        userID: message.author.id
    }, (err, user) => {
        if(err) {
            console.log(err);
        }

        if(!user) {
            const newUserSchema = new UserSchema({
                userID: message.author.id,
                lang: "lang_en",
                blacklisted: false,
                dev: false
            });
            return newUserSchema.save();
        }
        var lang = require(`../langs/${user.lang}.json`);

        var blacklistedEmbed = new Discord.MessageEmbed()
            .setTitle(lang.embed.titleerror)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(lang.embed.blacklisted)
            .setColor("RED")
            .setFooter(lang.embed.footer)
            .setTimestamp();

        if(message.channel.type === "dm"){
          return;
        }

    // check if the guild is in the database, if not add it
        GuildSchema.findOne({
            guildID: message.guild.id
        }, (err, guild) => {
            if(err) {
                console.error();(err);
            }


            if(!guild) {
                const newGuildSchema = new GuildSchema({
                    guildID: message.guild.id,
                    prefix: "!" /*default prefix, you can change it*/
                });
                return newGuildSchema.save();
            }

            var prefix = guild.prefix;
            // If someone tags the bot, they will respond with the prefix
            if(message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
                message.channel.send(`Prefix: \`${prefix}\``);
            }

            var errorEmbed = new Discord.MessageEmbed()
            .setTitle(lang.embed.titleerror)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(lang.embed.error)
            .setColor("RED")
            .setFooter(lang.embed.footer)
            .setTimestamp();

            if(!message.content.startsWith(prefix)) {
                return;
            }

            if(message.author.bot) {
                return;
            }

            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase();

            var cmd = client.commands.get(command) || client.commands.find((c) => c.alias && c.alias.includes(command));

            if(!cmd) {
                return;
            }

            if(user.blacklisted) {
                message.channel.send(blacklistedEmbed).then((msg) => {
                    msg.delete({ timeout: 10000 });
                    return;
                });
                return;
            }


            if(cmd.onlyowner) {
                if(!misc.owners.id.includes(message.author.id)) {
                    message.channel.send(lang.command.onlydev);
                    return;
                }
            }

            if(cmd.onlydev) {
                if(!user.dev) {
                    message.channel.send(lang.command.onlydev);
                    return;
                }
            }
            if(!message.member.permissions.has(cmd.perms)) {
                message.channel.send("no permss");
                return;
            }

            var storage = {
                guild: guild,
                user: user,
                lang: lang,
                prefix: prefix,
                errorEmbed: errorEmbed,
                GuildSchema: GuildSchema,
                UserSchema: UserSchema,
                Discord: Discord
            };

            const cmdCooldown = Math.floor(cmd.cooldown * 1000);
            const endCooldown = Math.floor(Date.now() + cmdCooldown);

            if(!client.cooldowns.has(`${message.author.id}.${cmd.name}`)) {
                client.cooldowns.set(`${message.author.id}.${cmd.name}`, 0);
            }

            const userCooldown = client.cooldowns.get(`${message.author.id}.${cmd.name}`);

            if(Date.now() < userCooldown) {
                let restCooldown = userCooldown - Date.now();
                let seconds = Math.floor(restCooldown / 1000);
                let cooldownMessage = lang.command.cooldown.replace("{command}", cmd.name).replace("{seconds}", seconds);
                message.channel.send(cooldownMessage).then((msg) => {
                    msg.delete({timeout: restCooldown});
                });
                return;
            }
            else {
                try {
                    cmd.run(client, message, args, storage);
                    client.cooldowns.set(`${message.author.id}.${cmd.name}`, endCooldown);
                } catch(err) {
                    message.channel.send(errorEmbed);
                    console.log(err);
                    client.channels.resolve("your-channel-id").send(`error \`${cmd.name}\`. for more information check console.\n` + "```js\n" + err + "```");
                }
            }
        });
    });
};
