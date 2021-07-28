const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, getRoomUsers, userLeave} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socket(server);

const botName = 'BOT'

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// run when client connects
io.on('connection', socket => {
	socket.on('joinRoom', ({username, room}) => {
		const user = userJoin(socket.id, username, room)
		socket.join(user.room)

		// emits to the client that's connecting
		socket.emit('message', formatMessage(botName, 'Welcome to chat!'));

		// broadcast when a user connects - emits to everybody except the user that's connecting
		socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`));

		// send users and room
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room)
		})
	})

	

	// listen for chatMessage and emit it to the front end
	socket.on('chatMessage', msg => {
		const user = getCurrentUser(socket.id)

		io.to(user.room).emit('message', formatMessage(user.username, msg));
	})

	// runs when client disconnects
	socket.on('disconnect', () => {
		const user = userLeave(socket.id)
		if (user) {
			// emits to all the clients in general (in specific room - to(...))
			io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));
			io.to(user.room).emit('roomUsers', {
				room: user.room,
				users: getRoomUsers(user.room)
			})
		}
		});
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () =>
	console.log(`Server is up and running on port ${PORT}`)
);
