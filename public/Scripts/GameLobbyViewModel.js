
function GameLobbyViewModel(socket) {

    var self = this;

    /*******************
     ***  Variabler  ***
     *******************/

    self.title = ko.observable("");

    self.nickname = ko.observable("");
    self.chatRow = ko.observable("");
    
    self.createGameName = ko.observable("");
    self.createGamePassword = ko.observable("");

    self.chats = ko.observableArray([]);
    self.games = ko.observableArray([]);

    //modes
    self.lobbyMode = ko.observable(false);
    self.startMode = ko.observable(true);
    self.lobbyMode = ko.observable(false);
    self.gameMode = ko.observable(false);
    self.createGameMode = ko.observable(false);

    /********************************************
    Initialisering
    *********************************************/

    //initierar vymodellen
    self.init = function () {
        //self.games(["hey", "loo", "there"]);
        //self.games.push({ name: 'spel1', available: '3/4' });
        socket.on('server_chat', function (data) {
            self.chats.push(data);
            $('#chatBox').animate({ scrollTop: $('#chatBox').prop("scrollHeight") }, 100);
        });

        socket.on('server_games', function (data) {
            self.games(data);
        });

        socket.emit('client_games', {});
    }

    self.init();

    self.joinGame = function (item) {
        alert('joinGame');
    };
    
    self.cancelCreateGame = function () {
        self.createGameMode(false);
        self.gameMode(true);
    };

    self.doCreateGame = function () {
        socket.emit('client_create_game', { 'name': self.createGameName(), 'password': self.createGamePassword() });
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

    self.submitNicknameKeyPress = function (d, e) {
        if (e.keyCode == 13) {
            self.submitNickname();
        }
        return true;
    };
    
    self.submitChatKeyPress = function (d, e) {
        if (e.keyCode == 13) {
            self.submitChat();
        }
        return true;
    };

    self.submitNickname = function () {
        self.createGameMode(false);
        self.startMode(false);
        self.lobbyMode(true);
        self.gameMode(true);
    }
}

