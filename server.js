var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var express = require('express');
var app = express();
var port = 8001;
var http = require('http').Server(app);

var games = [];
var internal_games = [];

http.listen(port, function () {
    console.log('Gameserver listening on *:' + port);
});
app.use(express.static('public'));

var listener = io.listen(http);

listener.sockets.on('connection', function (socket) {
    socket.on('client_chat', function (data) {
        console.log(data.line);
        listener.sockets.emit('server_chat', data);
    });

    socket.on('client_games', function () {
        console.log('client_games');
        socket.emit('server_games', games);
    });

    socket.on('client_create_game', function (data) {
        console.log('client_create_game');
        games.push({ name: data.name, needPassword: data.password ? true : false, available: 'N/A', joinable: true });
        internal_games.push({ name: data.name, password: data.password});
        listener.sockets.emit('server_games', games);
        socket.emit('server_create_game_status', true);
    });
});

