const Discord = require("discord.js");
const client = new Discord.Client();
const mongoose = require("mongoose");
const data = require("./utils/data.json");
let fs = require("fs");

// Command and event handler.

client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

fs.readdir(__dirname + "/commands", (err, files) => {
    if(err) {
        console.log(err);
        return;
    }

    let jsfiles = files.filter((f) => f.split(".").pop() === "js");
    if(jsfiles.length < 0) {
        console.log("[WARN] No commands to load.");
        return;
    }

    console.log(`[INFO] Loading ${jsfiles.length} commands.`);

    jsfiles.forEach((f, i) => {
        let fileName = f.substring(0, f.length - 3);
        let fileContents = require("./commands/" + f);
        client.commands.set(fileName, fileContents);
        delete require.cache[require.resolve(`./commands/${fileName}.js`)];
    });
});

for(const file of fs.readdirSync("./events")) {
    if(file.endsWith("js")) {
        let fileName = file.substring(0, file.length - 3);
        let fileContents = require("./events/" + file);
        client.on(fileName, fileContents.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    }
}

// Database conecction (MongoDB)

 let uri = `mongodb+srv://${data.database.username}:${data.database.password}@${data.database.url}/development?retryWrites=true&w=majority`;


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, function(err) {
    if(err) {
        console.log(`[ERROR] Error trying to connect to the database .\n${err}`);
        process.exit(1);
        return;
    }
    console.log(`[INFO] Connected to ${data.database.url} (MongoDB)`);
});


client.login(data.token.discord).then(() => {
    console.log(`[INFO] Logged in ${client.user.tag}.`);
}).catch((err) => {
    console.log(`[ERROR] Can't login. \n${err}`);
});
