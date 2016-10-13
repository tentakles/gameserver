
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
    self.isAdmin = ko.observable(false);

    self.createGameName = ko.observable("");
    self.createGamePassword = ko.observable("");

    self.chats = ko.observableArray([]);
    self.gameChats = ko.observableArray([]);
    self.games = ko.observableArray([]);
    self.gamePlayers = ko.observableArray([]);

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

    //initierar vymodellen
    self.init = function () {
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

        socket.emit('client_games', {});
    }

    self.init();

    self.enterGame = function (game, isAdmin) {
        self.gamePlayers(game.players);
        self.gameName(game.name);
        self.createGameMode(false);
        self.gameLobbyMode(true);
        self.isAdmin(isAdmin);
        self.gameMode(false);
        self.title('Welcome to game "' + game.name + '"');
    };

    self.joinGame = function (item) {
        socket.emit('client_join_game', { 'id': item.id, 'playerName': self.nickname() });
    };

    self.cancelCreateGame = function () {
        self.createGameMode(false);
        self.gameMode(true);
    };

    self.doCreateGame = function () {
        socket.emit('client_create_game', { 'playerName': self.nickname(), 'name': self.createGameName(), 'password': self.createGamePassword() });
    };

    self.createGame = function () {
        self.createGameName("");
        self.createGamePassword("");

        self.createGameMode(true);
        self.gameMode(false);
    };

    self.submitChat = function () {
        socket.emit('client_chat', { 'line': self.chatRow(), 'user': self.nickname() });
        self.chatRow("");
    };

    self.submitChatKeyPress = function (d, e) {
        if (e.keyCode == 13) {
            self.submitChat();
        }
        return true;
    };

    self.submitGameChat = function () {
        socket.emit('client_game_chat', { 'line': self.gameChatRow(), 'user': self.nickname() });
        self.gameChatRow("");
    };

    self.submitGameChatKeyPress = function (d, e) {
        if (e.keyCode == 13) {
            self.submitGameChat();
        }
        return true;
    };

    self.submitNicknameKeyPress = function (d, e) {
        if (e.keyCode == 13) {
            self.submitNickname();
        }
        return true;
    };



    self.submitNickname = function () {
        self.createGameMode(false);
        self.startMode(false);
        self.lobbyMode(true);
        self.gameMode(true);
        self.title('Welcome ' + self.nickname());
    }
}

