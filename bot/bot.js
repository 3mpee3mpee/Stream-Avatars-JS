const tmi = require("tmi.js");
const path = require("path");
const { fork } = require("child_process");
const botConfig = require("./config");

// Initialize TMI
const bot = new tmi.client(botConfig);
const childProcess = fork(path.resolve(__dirname, "../server/server.js"));

// Events
bot.on("connected", (address, port) => {
	console.log("Connected to: ", address, "on port: ", port);
});

bot.on("join", (channel, username, self) => {
	childProcess.send({ joined: username });
});

bot.on("message", (channel, userstate, message, self) => {
	if (message == "!jiraya" || message == "!naruto") {
		childProcess.send({ changeModel: [userstate.username, message.slice(1)] });
	}
    if (userstate.emotes) {
        childProcess.send({emotes: userstate.emotes});
    }
	childProcess.send({ message: [userstate.username, message] });
});

// Connection to twitch
bot.connect();
