// application
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

// dot env and configuration dependencies
require('dotenv').config();
const config = require('config');

// constant variables
const DB_URL = `mongodb+srv://${config.get('db-username')}:${config.get(
    'db-password'
)}@cluster0.8ez2y.mongodb.net/${config.get(
    'db-name'
)}?retryWrites=true&w=majority`;

// third party dependencies
const chalk = require('chalk');

// middlewares
const setMiddleware = require('./api/middlewares/middlewares');
setMiddleware(app);

// routes
const setRoutes = require('./api/routes/route');
setRoutes(app);

// database
const mongoose = require('mongoose');

// errors
const apiErrorHandler = require('./api/errors/errorHandler');
const Message = require('./api/models/Message');
app.use(apiErrorHandler);

// connect
io.on('connection', (socket) => {
    let room;
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        room = roomId;
    });
    socket.on('send-message', (messageObject, chatRoom) => {
        io.to(room).emit('recive-message', messageObject, chatRoom);
    });
});

const PORT = process.env.PORT || 8080;

mongoose
    .connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        server.listen(PORT, () => {
            console.log(chalk.green(`Server running on port ${PORT}`));
        });
    })
    .catch((e) => {
        console.log(chalk.red(`Could not serve the application`));
        console.log(e);
    });
