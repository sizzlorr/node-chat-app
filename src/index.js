const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

let message = 'Welcome!';

io.on('connection', (socket) => {
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, userName: username, room });

        if (error) {
            return callback(error);
        }

        // User join the room
        socket.join(user.room);

        socket.emit('greeting', generateMessage('Admin', message));
        socket.broadcast.to(user.room).emit('greeting', generateMessage('Admin', `${user.userName} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (value, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);

        if (filter.isProfane(value)) {
            return callback('*** Profanity is not allowed! ***');
        }

        io.to(user.room).emit('greeting', generateMessage(user.userName, value));
        callback();
    });

    socket.on('sendCoords', (value, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('sendCoordsMsg', generateLocationMessage(user.userName, `https://www.google.com/maps?q=${value.lat},${value.long}`));

        callback('Location was Shared!');
    });

    socket.on('disconnect', async () => {
        const user = await removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('greeting', generateMessage('Admin', `User ${user.userName} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

// Setup Port
server.listen(port, () => {
    console.log(`--> Server is up on port ${port} <--`);
});
