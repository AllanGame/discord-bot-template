module.exports = {
    name: "help",
    usage: "help {options}",
    alias: ["commands"],
    cooldown: 3,
    onlyowner: false,
    onlydev: false,
    perms: [],
    run: (client, message, args, storage) => {

      // the best help command 👍
      message.channel.send(client.commands);

    }
  };
