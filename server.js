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
var gameTypes = [
    { name: '3-in-a-row', url: 'games/3inarow/game.html', code: './public/games/3inarow/Scripts/3inarow_logic.js', minPlayers: 2, maxPlayers: 2 },
    { name: 'Repello', url: 'games/repo/game.html', minPlayers: 2, maxPlayers: 6 }
];

function getListItemByParam(param, paramName, list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i][paramName] === param) {
            return list[i];
        }
    }
    return null;
}

function getGameById(id) {
    return getListItemByParam(id, "id", games);
}

function getGameByUser(user) {
    for (var i = 0; i < games.length; i++) {
        var game = games[i];
        for (var j = 0; j < game.players.length; j++) {
            if (game.players[j] === user)
                return game;
        }
    }
    return null;
}

http.listen(port, function () {
    console.log('Gameserver listening on *:' + port);
});
app.use(express.static('public'));

var listener = io.listen(http);

listener.sockets.on('connection', function (socket) {

    socket.on('client_game_leave', function (data) {
        console.log("Player left game:" + data.user);

        var game = getGameByUser(data.user);
        if (game) {
            socket.leave(game.id);
            var index = game.players.indexOf(data.user);
            game.players.splice(index, 1);

            if (game.players.length === 0) {
                var gameIndex = games.indexOf(game);
                games.splice(gameIndex, 1);
            }

            listener.to(game.id).emit('server_game_update', game);
            listener.sockets.emit('server_games', games);
        }
    });

    socket.on('client_chat', function (data) {
        if (!data.line || !data.line.trim())
            return;
        listener.sockets.emit('server_chat', data);
    });

    socket.on('client_game_event', function (data) {
        // console.log("client_game_event");

        var game = getGameByUser(data.user);
        var result = game.instance.move(data.event);

        //console.log("game move result:");
        //console.log(result);
        listener.to(game.id).emit('server_game_event', result);
        //console.log(data);
    });

    socket.on('client_game_start', function (data) {

        console.log("client_game_start:" + data.game);
        var gameType = getListItemByParam(data.game, "name", gameTypes);
        console.log("code url:" + gameType.code);
        var game = getGameByUser(data.user);
        var gameEnviroment = require(gameType.code);

        var config = {
            size: 3,
            numToWin: 3
        };
        game.instance = new gameEnviroment.game(config);
        game.instance.init();

        listener.to(game.id).emit('server_game_start', gameType);
    });

    socket.on('client_game_chat', function (data) {
        if (!data.line || !data.line.trim())
            return;
        var game = getGameByUser(data.user);
        if (game) {
            console.log('server_game_chat')
            listener.to(game.id).emit('server_game_chat', data);
        }
    });

    socket.on('client_games', function () {
        console.log('client_games');
        socket.emit('server_games', games);
    });

    socket.on('client_game_types', function () {
        console.log('client_game_types');
        socket.emit('server_game_types', gameTypes);
    });

    socket.on('client_create_game', function (data) {
        if (!data.name) {
            return;
        }
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
            listener.sockets.emit('server_games', games);
        }
        else {
            console.log('game not found: ' + request.id);
        }
    });

});

