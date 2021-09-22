const socketio = require("socket.io");

const sockets = (server) => {
	const io = socketio(server);

	return io.on("connection", (socket) => {
		return socket;
	});
};

module.exports = sockets;
