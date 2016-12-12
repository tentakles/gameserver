var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var express = require('express');
var app = express();
var port = process.env.PORT || process.env.port || 8001;
var http = require('http').Server(app);
var uuid = require('node-uuid');

var games = [];
var internal_games = [];
var gameTypes = [
    { name: 'bomberman', url: 'games/bomberman/game.html', config: { matchLength: { value: 3, name: 'Match length', min: 1, max: 100 }, bombs: { value: 1, name: 'Bombs', min: 1, max: 10 }, bombStrength: { value: 1, name: 'Bomb power', min: 1, max: 10 }, bombBurnFactor: { value: 5, name: 'Bomb burn time', min: 1, max: 20 }, speedFactor: { value: 5, name: 'Player walk delay', min: 1, max: 10 } }, code: './games/bomberman/bomberman_logic.js', minPlayers: 2, maxPlayers: 4 },

    { name: 'bomberman gfx', url: 'games/bomberman/gamegfx.html', config: { matchLength: { value: 3, name: 'Match length', min: 1, max: 100 }, bombs: { value: 1, name: 'Bombs', min: 1, max: 10 }, bombStrength: { value: 1, name: 'Bomb power', min: 1, max: 10 }, bombBurnFactor: { value: 5, name: 'Bomb burn time', min: 1, max: 20 }, speedFactor: { value: 5, name: 'Player walk delay', min: 1, max: 10 } }, code: './games/bomberman/bomberman_logic.js', minPlayers: 2, maxPlayers: 4 },

    { name: 'N-in-a-row', url: 'games/3inarow/game.html', config: { size: { value: 3, name: 'Game size', min: 3, max: 20 }, numToWin: { value: 3, name: 'Win length', min: 3, max: 5 }, matchLength: { value: 3, name: 'Match length', min: 1, max: 100 } }, code: './games/3inarow/3inarow_logic.js', minPlayers: 2, maxPlayers: 2 },
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
            if (game.players[j].name === user)
                return game;
        }
    }
    return null;
}

function sendGameUpdate(gameId) {
    var game = getGameById(gameId);
    updateGameState(game);
    listener.to(game.id).emit('server_game_update', game);
}

function sendGameChat(gameId, line, important) {
    var game = getGameById(gameId);
    if (game) {
        var message = { user: "(Game)", fromGame: true, line: line, important: important === true }
        console.log('server_game_chat');
        listener.to(game.id).emit('server_game_chat', message);
    }
}

function updateGameState(game) {
    game.joinable = game.players.length < game.gameType.maxPlayers && !game.instance;
}

console.log('Trying to start on node version:' + process.version);

http.listen(port, function () {
    console.log('Gameserver listening on *:' + port);
});
app.use(express.static('public'));

var listener = io.listen(http);

function handleClientLeave(socket) {

}

listener.sockets.on('connection', function (socket) {

    socket.on('disconnect', function () {
        console.log('client game leave');
        handleClientLeave(socket);
    });

    socket.on('client_game_leave', function () {
        console.log("Player left game:" + socket.nickname);
        var game = getGameByUser(socket.nickname);
        if (game) {
            var gameIndex;
            var player;
            for (var i = 0; i < game.players.length; i++) {
                if (game.players[i].name === socket.nickname) {
                    player = game.players[i];
                    break;
                }
            }

            if (player) {
                if (player.isAdmin && !game.instance) {
                    listener.to(game.id).emit('server_game_close');
                    game.players = [];
                    var clients = listener.to(game.id).connected;
                    for (var key in clients) {
                        if (clients.hasOwnProperty(key)) {
                            var clientSocket = clients[key];
                            clientSocket.leave(game.id);
                        }
                    }
                }

                else {
                    var index = game.players.indexOf(player);
                    game.players.splice(index, 1);
                    socket.emit('server_game_close');
                    socket.leave(game.id);
                }
                if (game.instance && game.players.length < game.gameType.minPlayers) {
                    listener.to(game.id).emit('server_game_close');
                    game.players = [];
                    var clients = listener.to(game.id).connected;
                    for (var key in clients) {
                        if (clients.hasOwnProperty(key)) {
                            var clientSocket = clients[key];
                            clientSocket.leave(game.id);
                        }
                    }
                }
            }

            if (game.players.length === 0) {
                gameIndex = games.indexOf(game);
                games.splice(gameIndex, 1);
            }
            updateGameState(game);
            sendGameChat(game.id, socket.nickname + " leaves the game");
            listener.to(game.id).emit('server_game_update', game);
            listener.sockets.emit('server_games', games);
        }
    });

    socket.on('client_nickname_submit', function (data) {
        var response = { result: true };
        if (!data.nickname || !data.nickname.trim())
            response.result = false;
        else
            socket.nickname = data.nickname.trim();
        socket.emit('server_nickname_response', response);
    });

    socket.on('client_chat', function (line) {
        if (!line || !line.trim())
            return;
        var message = { user: socket.nickname, line: line }
        listener.sockets.emit('server_chat', message);
    });

    socket.on('client_game_chat', function (line) {
        if (!line || !line.trim())
            return;
        var game = getGameByUser(socket.nickname);
        if (game) {
            var message = { user: socket.nickname, line: line, fromGame: false, important: false }
            console.log('server_game_chat');
            listener.to(game.id).emit('server_game_chat', message);
        }
    });

    socket.on('client_game_event', function (data) {
        var game = getGameByUser(socket.nickname);

        if (!game)
            return;

        var result = game.instance.move(data.event, socket.nickname);

        if (result.cancelEvent)
            return;

        if (result.sendOnlyToPlayer)
            socket.emit('server_game_event', result);
        else
            listener.to(game.id).emit('server_game_event', result);
    });

    function sendGameEvent(gameId, data) {
        listener.to(gameId).emit('server_game_event', data);
    }

    function mapConfigValues(gameConfig, userConfig) {
        var result = JSON.parse(JSON.stringify(gameConfig));

        if (userConfig) {
            for (var key in result) {
                if (result.hasOwnProperty(key)) {
                    var userValue = userConfig[key];
                    if (userValue && userValue.value) {
                        var parsedUserValue = parseInt(userValue.value)
                        if (parsedUserValue >= result[key].min && parsedUserValue <= result[key].max)
                            result[key].value = parsedUserValue;
                    }
                }
            }
        }

        return result;
    };

    socket.on('client_game_start', function (clientConfig) {
        var game = getGameByUser(socket.nickname);
        var player = getListItemByParam(socket.nickname, "name", game.players);
        if (player && player.isAdmin && game && game.players.length <= game.gameType.maxPlayers && game.players.length >= game.gameType.minPlayers) {
            var gameType = game.gameType;
            console.log("client_game_start:" + gameType.name + " by: " + socket.nickname);
            console.log("code url:" + gameType.code);

            var gameEnviroment = require(gameType.code);

            var controlledGameConfig = mapConfigValues(gameType.config, clientConfig);

            game.instance = new gameEnviroment.game(game.id, controlledGameConfig, game.players, sendGameEvent, sendGameUpdate, sendGameChat);
            var result = game.instance.init();

            var response = { gameType: gameType, config: controlledGameConfig, result: result };

            updateGameState(game);
            listener.sockets.emit('server_games', games);

            listener.to(game.id).emit('server_game_start', response);
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
        var players = [{ name: socket.nickname, wins: 0, isAdmin: true }];

        var gameType = getListItemByParam(data.gameName, "name", gameTypes);
        var game = { id: uuid.v4(), players: players, name: data.name, needPassword: data.password ? true : false, available: 'N/A', gameType: gameType };
        updateGameState(game);
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
        if (game.needPassword) {
            var internal_game = getListItemByParam(game.name, "name", internal_games);
            if (request.password !== internal_game.password) {
                socket.emit('server_join_game_fail');
                return;
            }
        }

        if (game && game.joinable) {
            game.players.push({ name: socket.nickname, wins: 0, isAdmin: false });
            socket.join(game.id);
            socket.emit('server_join_game_success', game);
            updateGameState(game);
            sendGameChat(game.id, socket.nickname + " joins the game");
            listener.to(game.id).emit('server_game_update', game);
            listener.sockets.emit('server_games', games);
        }
        else {
            console.log('game not found or joinable: ' + request.id);
        }
    });

});

