var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var express = require('express');
var app = express();
var port = 8001;
var http = require('http').Server(app);
var uuid = require('node-uuid');

var games = [];
var internal_games = [];

function getListItemByParam(param,paramName,list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i][paramName] === param) {
            return list[i];
        }
    }
    return null;
}

function getGameById(id) {
	return getListItemByParam(id,"id",games);
}

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
        var game = { id: uuid.v4(), players: [data.playerName], name: data.name, needPassword: data.password ? true : false, available: 'N/A', joinable: true }
        console.log('client_create_game:' + game.id);
        games.push(game);
        internal_games.push({ name: data.name, password: data.password });
        listener.sockets.emit('server_games', games);
        socket.emit('server_create_game_success', game);
        socket.join(game.id);
    });

    socket.on('client_join_game', function (request) {
        console.log('client_join_game');
        var game = getGameById(request.id);
        game.players.push(request.playerName);
        socket.join(game.id);
        if (game) {
            socket.emit('server_join_game_success', game);
            listener.to(game.id).emit('server_game_update', game);
        }
        else {
            console.log('game not found: ' + request.id);
        }
    });

});

