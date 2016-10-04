
function GameLobbyViewModel(socket) {

    var self = this;

    /*******************
     ***  Variabler  ***
     *******************/

    self.title = ko.observable("Mitt fina namn");
    self.showGame = ko.observable(false);
    self.startMode = ko.observable(true);
    self.lobbyMode = ko.observable(false);
    self.nickname = ko.observable("");
    self.chatRow = ko.observable("");
    self.chats = ko.observableArray([]);

    /********************************************
    Initialisering
    *********************************************/

    //initierar vymodellen
    self.init = function () {
        socket.on('chat', function (data) {
            self.chats.push(data);
            $('#chatBox').animate({ scrollTop: $('#chatBox').prop("scrollHeight") }, 100);
        });
    }

    self.init();

    self.submitChat = function () {
        socket.emit('client_data', { 'line': self.chatRow(), 'user': self.nickname() });
        self.chatRow("");
    };


    self.submitChatKeyPress = function (d, e) {
        if (e.keyCode == 13) {
            self.submitChat();
        }
        return true;
    };

    self.submitNickname = function () {
        self.startMode(false);
        self.lobbyMode(true);
    }
}

