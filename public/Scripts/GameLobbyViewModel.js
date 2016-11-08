
function GameLobbyViewModel(socket) {

    var self = this;

    /*******************
     ***  Variabler  ***
     *******************/

    self.title = ko.observable("");

    self.nickname = ko.observable("");
    self.chatRow = ko.observable("");
    self.gameChatRow = ko.observable("");
    self.gameName = ko.observable("");
    self.gamePassword = ko.observable("");

    self.isAdmin = ko.observable(false);

    self.selectedGame = ko.observable(null);

    self.createGameName = ko.observable("");
    self.createGamePassword = ko.observable("");

    self.chats = ko.observableArray([]);
    self.gameChats = ko.observableArray([]);
    self.games = ko.observableArray([]);
    self.gamePlayers = ko.observableArray([]);
    self.gameTypes = ko.observableArray([]);

    //modes
    self.lobbyMode = ko.observable(false);
    self.startMode = ko.observable(true);
    self.lobbyMode = ko.observable(false);
    self.gameMode = ko.observable(false);
    self.createGameMode = ko.observable(false);
    self.gameLobbyMode = ko.observable(false);

    /********************************************
    Initialisering
    *********************************************/

    self.game = null;

    self.joinGameWithPassword = function () {
        socket.emit('client_join_game', { 'id': self.lastGameId, 'password': self.gamePassword() });
    }

    self.gameEvent = function (event) {
        socket.emit('client_game_event', { event: event });
    }

    self.registerGame = function (startCallback, eventCallback) {
        startCallback(self.currentGame.config);
        eventCallback(self.currentGame.result);
        self.gameEventCallback = eventCallback;
    }

    //initierar vymodellen
    self.init = function () {
        socket.on('server_game_event', function (data) {
            if (self.gameEventCallback)
                self.gameEventCallback(data);
        });

        socket.on('server_game_start', function (game) {
            self.currentGame = game;
            $("#gameWrapper").load(game.gameType.url);
        });

        socket.on('server_chat', function (data) {
            self.chats.push(data);
            $('#chatBox').animate({ scrollTop: $('#chatBox').prop("scrollHeight") }, 100);
        });

        socket.on('server_game_chat', function (data) {
            self.gameChats.push(data);
            $('#gameChatBox').animate({ scrollTop: $('#gameChatBox').prop("scrollHeight") }, 100);
        });

        socket.on('server_games', function (data) {
            self.games(data);
        });

        socket.on('server_game_types', function (data) {
            self.gameTypes(data);
        });

        socket.on('server_nickname_response', function (response) {
            if (response.result === true)
                self.enterLobby();
            else
                alert("Can not enter lobby! Check nickname.");
        });

        socket.on('server_create_game_success', function (game) {
            self.enterGame(game, true);
        });

        socket.on('server_join_game_success', function (game) {
            self.enterGame(game, false);
        });

        socket.on('server_game_update', function (game) {
            self.gamePlayers(game.players);
            self.gameName(game.name);
        });

        socket.emit('client_games');
        socket.emit('client_game_types');
    }

    self.init();

    self.enterGame = function (game, isAdmin) {
        self.gamePlayers(game.players);
        self.gameName(game.name);
        self.createGameMode(false);
        self.gameLobbyMode(true);
        self.isAdmin(isAdmin);
        self.gameMode(false);
        self.title('Welcome to game "' + game.name + '", selected game: ' + game.gameType.name);
    };

    self.joinGame = function (game) {
        if (game.needPassword) {
            self.lastGameId = game.id;
            self.gamePassword("");
            $('#passwordModal').modal();
        }
        else
            socket.emit('client_join_game', { 'id': game.id });
    };

    self.cancelCreateGame = function () {
        self.createGameMode(false);
        self.gameMode(true);
    };

    self.doCreateGame = function () {
        socket.emit('client_create_game', {
            'name': self.createGameName(),
            'password': self.createGamePassword(),
            'gameName': self.selectedGame().name
        });
    };

    self.createGame = function () {
        self.createGameName("");
        self.createGamePassword("");
        self.selectedGame(undefined);
        self.createGameMode(true);
        self.gameMode(false);
    };

    self.submitChat = function () {
        socket.emit('client_chat', self.chatRow());
        self.chatRow("");
    };

    self.submitChatKeyPress = function (d, e) {
        if (e.keyCode === 13) {
            self.submitChat();
        }
        return true;
    };

    self.submitGameChat = function () {
        socket.emit('client_game_chat', self.gameChatRow());
        self.gameChatRow("");
    };

    self.submitGameChatKeyPress = function (d, e) {
        if (e.keyCode === 13) {
            self.submitGameChat();
        }
        return true;
    };

    self.submitNicknameKeyPress = function (d, e) {
        if (e.keyCode === 13) {
            self.submitNickname();
        }
        return true;
    };

    self.submitNickname = function () {
        socket.emit('client_nickname_submit', { 'nickname': self.nickname() });
    }

    self.enterLobby = function () {
        self.createGameMode(false);
        self.startMode(false);
        self.lobbyMode(true);
        self.gameMode(true);
        self.gameLobbyMode(false);
        self.title('Welcome ' + self.nickname());
    }

    self.startGame = function () {
        socket.emit('client_game_start');
    }

    self.leaveGame = function () {
        socket.emit('client_game_leave');
        self.enterLobby();
        $("#gameWrapper").html("");
    }
}

