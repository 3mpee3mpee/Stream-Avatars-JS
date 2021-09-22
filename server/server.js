const path = require("path");
const http = require("http");
const express = require("express");
require("dotenv").config();
const twitchEmotions = require('./helpers/twitchEmotions');

// Initialize
const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = http.createServer(app);
const socket = require("./socket")(httpServer);

//process
process.on("message", async (event) => {
	if (socket && event.joined) socket.emit("addUser", event.joined);
	if (socket && event.message) socket.emit("message", event.message);
	if (socket && event.changeModel) socket.emit("change", event.changeModel);
    if (socket && event.emotes) {
        let urls = await twitchEmotions(event.emotes);
        socket.emit('emotes', urls);
    };
});

//Statics
app.use(express.static(path.resolve(__dirname, "../public")));

//start server
httpServer.listen(PORT, () => console.log(`Server is running on ${PORT}`));
