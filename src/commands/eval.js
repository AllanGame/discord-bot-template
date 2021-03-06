module.exports = {
	name: "eval",
	usage: "eval <code>",
	alias: ["e", "evaluate"],
	cooldown: 3,
	onlyowner: false,
  /*use !dev add <user> or go to your database, user collecitions and change the dev option to true*/
	onlydev: true,
	perms: [],
	run: (client, message, args, storage) => {
		const Discord = require("discord.js");
		const code = args.join(" ");
		if (!args[0]) {
				return message.channel.send(`What will you evaluate, ${message.member}?`);
		}

			let limit = 980;

			function evalCode(output) { return `\`\`\`js\n${output}\n\`\`\``; }

			function embed(input, output, type, color, footer, large, error) {
				const e = new Discord.MessageEmbed().setAuthor(`Evaluated by ${message.author.username}`, `${message.author.displayAvatarURL({ format: "png", dynamic: true, size: 2048 })}`).setFooter(`${footer}`, `${client.user.displayAvatarURL({ format: "png", dynamic: true, size: 2048 })}`).setColor(color);
				let embed;
				if (error) {
					return embed =
          e.addField("Type", `\`\`\`prolog\n${type}\n\`\`\``, true)
          .addField("Evalued in", `\`\`\`yaml\n${new Date()-message.createdTimestamp}ms\n\`\`\``, true)
          .addField("Input", `${input}`)
          .addField("Output", `${output}`);
				}
				else {
					if (large) {
						return embed = e.setDescription("Check the console for view the complete evaluation.").addField("Type", `\`\`\`prolog\n${type}\n\`\`\``, true).addField("Evalued in", `\`\`\`yaml\n${new Date()-message.createdTimestamp}ms\n\`\`\``, true).addField("Input", `${input}`).addField("Output", `${output}`);
					}
					else {
						return embed =
            e.addField("Type", `\`\`\`prolog\n${type}\n\`\`\``, true)
            .addField("Evalued in", `\`\`\`yaml\n${new Date()-message.createdTimestamp}ms\n\`\`\``, true)
            .addField("Input", input)
            .addField("Output", output);
					}
				}
			}
			try {
				let evalued = eval(code);
				let evaltype = typeof(evalued);
				let evalTypeSplitted = evaltype.split("");
				let evalType = evalTypeSplitted[0].toUpperCase() + evalTypeSplitted.slice(1).join("");
				if (typeof(evalued) !== "string" ? evalued = require("util").inspect(evalued, { depth: }) : evalued);
				const txt = "" + evalued;
				if (txt.length > limit) {
					message.channel.send(embed(evalCode(code), evalCode(txt.slice(0, limit)), evalType, "GREEN", "Evaluation", true, false));
					console.log(txt);
				}
				else {
					message.channel.send(embed(evalCode(code), evalCode(txt), evalType, "GREEN", "Evaluation", false, false));
				}
			}
			catch (err) {
				const errType = err.toString().split(":")[0];
				message.channel.send(embed(evalCode(code), evalCode(err), errType, "RED", "Wrong evaluation", false, true));
			}
		}
};
