
exports.game = function game(gameId, config, players, sendGameEvent, sendGameUpdate, sendGameChat) {

    function PlayerModel(name, c, drops) {
        var self = this;
        self.Name = name;
        self.Items = [];
        self.Pos = -1;
        self.Drops = drops;
        self.Color = c;
        self.TargetSize = 12;
        self.IsCurrentPlayer = false;

        self.Targeted = true;
        self.setSize = function () {
            self.Size = self.TargetSize * 10;
        };

        self.setSize();

        self.TargetX = 0;
        self.TargetY = 0;
        self.X = 0;
        self.Y = 0;

        self.ItemSum = function () {
            var sum = 0;
            for (var i = 0; i < self.Items.length; i++) {
                sum += self.Items[i].Value;
            }
            return sum;
        };
    }

    function ItemModel(c, v, p) {
        var self = this;
        self.Color = c;
        self.Value = v;
        self.Pos = p;
        self.Size = 7;
        self.TargetSize = 7;
        self.Targeted = true;
        self.IsNew = true;
        self.clone = function () {
            return new ItemModel(self.Color, self.Value, self.Pos);
        };

        self.TargetX = 0;
        self.TargetY = 0;
        self.X = 0;
        self.Y = 0;
    }

    var self = this;
    self.rows = 12;
    self.cols = 12;

    self.colors = ["brown", "blue", "green", "purple", "red", "white"];

    self.originalItems = [new ItemModel("grey", 3, 13),
    new ItemModel("grey", 3, 22),
    new ItemModel("black", 1, 52),
    new ItemModel("orange", 5, 55),
    new ItemModel("black", 1, 88),
    new ItemModel("black", 1, 91),
    new ItemModel("grey", 3, 121),
    new ItemModel("grey", 3, 130)];

    self.board = [{ Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" },
    { Num: 2, Color: "white" }, { Num: 4, Color: "lightblue" }, { Num: 6, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "lightblue" }, { Num: 1, Color: "white" },
    { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 3, Color: "lightgreen" }, { Num: 4, Color: "lightgreen" }, { Num: 6, Color: "lightgreen" }, { Num: 2, Color: "lightgreen" }, { Num: 3, Color: "lightgreen" }, { Num: 5, Color: "lightgreen" }, { Num: 6, Color: "lightgreen" }, { Num: 4, Color: "lightgreen" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" },
    { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "lightgreen" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 5, Color: "lightgreen" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" },
    { Num: 5, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "lightgreen" }, { Num: 5, Color: "white" }, { Num: 1, Color: "lightblue" }, { Num: 3, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "lightblue" }, { Num: 2, Color: "white" }, { Num: 5, Color: "lightgreen" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" },
    { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "lightgreen" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 5, Color: "lightgreen" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" },
    { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "lightgreen" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 2, Color: "lightgreen" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" },
    { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "lightgreen" }, { Num: 3, Color: "white" }, { Num: 5, Color: "lightblue" }, { Num: 1, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "lightblue" }, { Num: 6, Color: "white" }, { Num: 3, Color: "lightgreen" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" },
    { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 3, Color: "lightgreen" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" }, { Num: 4, Color: "lightgreen" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" },
    { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "lightgreen" }, { Num: 5, Color: "lightgreen" }, { Num: 2, Color: "lightgreen" }, { Num: 3, Color: "lightgreen" }, { Num: 4, Color: "lightgreen" }, { Num: 6, Color: "lightgreen" }, { Num: 2, Color: "lightgreen" }, { Num: 5, Color: "lightgreen" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" },
    { Num: 5, Color: "white" }, { Num: 1, Color: "lightblue" }, { Num: 3, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "lightblue" }, { Num: 4, Color: "white" },
    { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" },];

    self.okToPlacePlayerColor = "lightgreen";
    self.allowSuicide = true;

    self.playerHasMoved = false;
    self.playerHasPlacedMovedTarget = false;
    self.oldpos = 0;
    self.errorPos = -1;

    self.clone = function (data) {
        return JSON.parse(JSON.stringify(data));
    };

    self.customCloneList = function (list) {
        var result = [];

        for (var i = 0; i < list.length; i++) {
            result.push(list[i].clone());
        }

        return result;
    };

    self.updateItemStatus = function (resetNew) {

        var height = 530;
        var width = 530;
        var xs = (width / self.cols);
        var ys = (height / self.rows);

        for (i = 0; i < self.items.length; i++) {
            var item = self.items[i];

            if (!self.positionOutOfBounds(item.Pos)) {
                var xo = self.getColFromPos(item.Pos) * xs;
                var yo = self.getRowFromPos(item.Pos) * ys;

                var x = Math.floor(xo + (xs / 2));
                var y = Math.floor(yo + (ys / 2));

                if (item.TargetX != x || item.TargetY != y) {
                    item.TargetX = x;
                    item.TargetY = y;
                    item.Size = item.Size * 3;
                }

                if (item.Reset) {
                    item.X = item.TargetX;
                    item.Y = item.TargetY;
                    item.Reset= false;
                }

                if (resetNew) {
                    item.X = item.TargetX;
                    item.Y = item.TargetY;
                    item.Size = item.TargetSize;
                }
            }
        }
    };

    self.getNewPlayers = function () {
        var list = [];
        for (var i = 0; i < players.length; i++) {
            var p = new PlayerModel(players[i].name, self.colors[i], config.startMagnets.value);
            list.push(p);
        }
        return list;
    }

    //gets the player from the players array in the constructor
    self.getRealPlayerByName = function (name) {
        for (i = 0; i < players.length; i++) {
            if (players[i].name === name) {
                return players[i];
            }
        }

        return null;
    };

    self.init = function () {
        console.log('Init repello');
        self.players = self.getNewPlayers();
        self.items = self.customCloneList(self.originalItems);
        for (var i = 0; i < self.players.length; i++) {
            var p = self.players[i];
            self.items.push(p);
        }

        var num = Math.floor(Math.random() * players.length);
        self.selectUserByNum(num);

        self.nextTurn();

        self.updateItemStatus(true);

        return self.getResult();
    }

    self.getResult = function () {
        var result = {
            status: self.getStatus(),
            board: self.board,
            items: self.items,
            players: self.players,
            playerHasPlacedMovedTarget: self.playerHasPlacedMovedTarget,
            gameOver: self.gameOver(),
            oldpos: self.oldpos
        };
        return result;
        // return self.clone(result);
    };

    self.move = function (event, player) {

        if (self.gameOver()) {
            return self.init();
        }

        if (self.currentPlayer.Name === player) {
            self.updateItemStatus(true);
            self.positionSelect(event.position);
            self.updateItemStatus(false);
            return self.getResult();
        }
        else {
            console.log("wrong player");
        }

        return { cancelEvent: true };
    }

    //väljer aktuell spelare på index
    self.selectUserByNum = function (num) {
        self.currentPlayer = self.players[num];
    }

    //byter tur till nästa spelare om det är möjligt
    self.nextTurn = function () {

        if (self.validMovesLeft()) {
            self.currentPlayer.IsCurrentPlayer = false;
            var num = self.players.indexOf(self.currentPlayer);

            num++;
            if (num === self.players.length)
                num = 0;

            self.selectUserByNum(num);

            if (self.currentPlayer.Drops > 0) {
                self.playerHasMoved = false;
                self.playerHasPlacedMovedTarget = false;
                self.currentPlayer.IsCurrentPlayer = true;
            }
            else {
                self.nextTurn();
            }
        }
    }

    //returnerar huruvida någon användare kan röra på sig
    self.validMovesLeft = function () {

        for (var i = 0; i < self.players.length; i++) {
            var u = self.players[i];
            if (u.Drops > 0)
                return true;
        }

        return false;
    }

    self.gameOver = function () {
        return !self.validMovesLeft() && self.noAdjacentObjects();
    }

    //uppdaterar spelstatustexten
    self.getStatus = function () {

        var playerTitle = self.currentPlayer.Name + '´s turn: ';

        if (self.positionOutOfBounds(self.currentPlayer.Pos) && !self.playerHasMoved) {
            return playerTitle + "Place piece on Green Cell";
        }

        else if (!self.gameOver()) {

            if (!self.playerHasMoved)
                return playerTitle + "Move with your piece (click cell in wanted direction)";
            else if (!self.playerHasPlacedMovedTarget)
                return playerTitle + "Choose object to start magnetic reaction";
            else
                return playerTitle + "Choose target for magnetic reaction";
        }
        else {
            var winners = self.getWinners();
            var playerNames = "";

            for (var i = 0; i < winners.length; i++) {

                if (playerNames !== "" && i < winners.length - 1)
                    playerNames += ", ";
                else if (playerNames !== "" && i === winners.length - 1)
                    playerNames += " and ";

                playerNames += winners[i].Name;
            }

            if (winners.length > 1) {
                var message = "Game over. Draw between " + playerNames + "!";
                sendGameChat(gameId, message, true);
                return message;
            }
            else {
                var winner = self.getRealPlayerByName(playerNames);
                winner.wins++;
                var message;
                if (winner.wins === config.matchLength.value) {
                    message = playerNames + " Wins game!";
                    sendGameChat(gameId, message, true);
                    for (var i = 0; i < players.length; i++) {
                        players[i].wins = 0;
                    }
                }
                else {
                    message = playerNames + " Wins set!";
                    sendGameChat(gameId, message);
                }
                sendGameUpdate(gameId);

                //add extra info for UI
                message += " Click game to continue playing.";
                return message;
            }
        }
    }

    self.getWinners = function () {

        var maxPoints = -1;
        var winners = [];

        for (var i = 0; i < self.players.length; i++) {

            var p = self.players[i];

            if (p.ItemSum() > maxPoints) {
                maxPoints = p.ItemSum();
            }
        }

        for (var i = 0; i < self.players.length; i++) {

            var p = self.players[i];

            if (p.ItemSum() == maxPoints) {
                winners.push(p);
            }
        }
        return winners;
    }


    self.positionOutOfBounds = function (pos) {

        return (pos < 0 || pos >= self.board.length)

    }

    //returnerar huruvida ett objekt ligger intill ett annat objekt
    self.hasAdjacentObject = function (item) {

        var positions = [];
        positions.push(item.Pos - 1);
        positions.push(item.Pos + 1);
        positions.push(item.Pos - self.cols);
        positions.push(item.Pos + self.cols);

        positions.push(item.Pos - self.cols + 1);
        positions.push(item.Pos + self.cols + 1);
        positions.push(item.Pos - self.cols - 1);
        positions.push(item.Pos + self.cols - 1);

        for (var i = 0; i < positions.length; i++) {

            var p = positions[i];

            if (self.positionOutOfBounds(p))
                continue;

            if (self.getThingOnPosition(p) != null && (!self.isNotlogicalPushRowDiff(item.Pos, p)))
                return true;
        }

        return false;
    }

    //returerar huruvida något objekt på kartan har ett intilliggande objekt
    self.noAdjacentObjects = function () {

        for (var i = 0; i < self.board.length; i++) {
            var thingOnPosition = self.getThingOnPosition(i);
            if (thingOnPosition != null) {
                if (self.hasAdjacentObject(thingOnPosition)) {
                    console.log("objekt på position: " + i + " har närliggande objekt");
                    return false;
                }
            }
        }

        return true;
    }

    //returnerar huruvida spelet är redo att gå till nästa tur
    self.isReadyForNextTurn = function () {

        if (self.playerHasMoved && self.noAdjacentObjects())
            return true;

        return false;
    }

    //returnerar ett svar på om det är en giltig distans att gå för en spelare
    self.validDistance = function (player, newpos) {

        var diff = Math.abs(player - newpos);
        if (diff == 1 || diff == self.cols || diff == self.cols - 1 || diff == self.cols + 1)
            return true;

        return false;
    }

    self.getNewPos = function (oldPos, pos) {
        var diff = oldPos - pos;
        var item = self.board[pos];

        var lastCol = self.getColFromPos(pos);

        for (var i = 1; i < item.Num; i++) {

            pos = pos - diff;
            var newCol = self.getColFromPos(pos);
            var colDiff = Math.abs(lastCol - newCol);

            if (self.positionOutOfBounds(pos) || colDiff > 1)
                return -1;

            var thingOnPosition = self.getThingOnPosition(pos);
            if (thingOnPosition != null)
                return undefined;
            console.log("godkänd pos:" + pos);
            var lastCol = newCol;
        }

        return pos;
    }

    //används när användaren markerar en position
    //flöde 1: användare markerar sin startposition
    //flöde 2: användare markerar var den vill gå
    //flöde 3: användare markerar vilket objekt som skall påverka ett annat med magnetism
    //flöde 4: användare markerar vilket objekt som skall påverkas av magnetism
    self.positionSelect = function (i) {

        var item = self.board[i];
        self.errorPos = -1;

        var player = self.currentPlayer;
        var thingOnPosition = self.getThingOnPosition(i);

        //flöde 1: användare markerar sin startposition

        if (self.positionOutOfBounds(player.Pos) && !self.playerHasPlacedMovedTarget && !self.playerHasMoved) {
            if (item.Color == self.okToPlacePlayerColor && thingOnPosition == null) {
                player.Pos = i;
                item.Targeted = true;
                player.setSize();
            }
        }
        //flöde 2: användare markerar var den vill gå
        else if (!self.playerHasMoved && thingOnPosition == null && self.validDistance(player.Pos, i)) {
            //kolla nuvarande position och antalet steg med mera i den riktningen man vill gå.
            var tempPos = self.getNewPos(player.Pos, i);

            if (tempPos != undefined) {
                var drop = new ItemModel("black", 1, player.Pos);
                player.Drops -= 1;
                drop.Reset = true;
                self.items.push(drop);

                if (self.positionOutOfBounds(tempPos) && player.Drops > 0) {
                    var drop = new ItemModel("black", 1, tempPos);
                    player.Drops -= 1;
                    player.Items.push(drop);
                }

                player.Pos = tempPos;
                //player.Targeted=false;
                self.playerHasMoved = true;
            }

            else {
                self.errorPos = i;
            }
        }

        //flöde 3: användare markerar vilket objekt som skall påverka ett annat med magnetism
        else if (!self.playerHasPlacedMovedTarget && self.playerHasMoved && thingOnPosition != null) {
            //todo also check if has anything in adjacent position

            if (self.hasAdjacentObject(thingOnPosition)) {
                console.log("flyttar objekt på " + i);
                self.playerHasPlacedMovedTarget = true;
                self.oldpos = i;
            }
            else {
                self.errorPos = i;
            }
        }
        //flöde 4: användare markerar vilket objekt som skall påverkas av magnetism
        else if (self.playerHasPlacedMovedTarget && self.playerHasMoved && thingOnPosition != null) {
            //todo also check if has anything in adjacent position

            var diff = thingOnPosition.Pos - self.oldpos;

            if (diff == 0) {
                //trigger reset
                self.playerHasPlacedMovedTarget = false;
            }
            else if (self.validDistance(self.oldpos, thingOnPosition.Pos)) {

                var newPos = thingOnPosition.Pos + diff;

                if (!self.getThingOnPosition(newPos) || self.isNotlogicalPushRowDiff(newPos, thingOnPosition.Pos)) {

                    //todo fixme alla väderstreck skall fungera
                    if (self.isOut(newPos, thingOnPosition.Pos)) {
                        console.log("objekt utkastat.");
                        thingOnPosition.Pos = -1;

                        if (thingOnPosition instanceof ItemModel) {
                            player.Items.push(thingOnPosition);
                        }
                        else if (thingOnPosition instanceof PlayerModel) {

                            //todo fixme få välja vilken drop man ska ha?! eller ta den värdefullaste?:O

                            if (thingOnPosition.Items.length > 0) {
                                player.Items.push(thingOnPosition.Items.pop());
                            }
                            var otherPlayersDrops = thingOnPosition.Drops;
                            if (otherPlayersDrops > 0) {
                                thingOnPosition.Drops = otherPlayersDrops - 1;
                                var drop = new ItemModel("black", 1, player.Pos);
                                player.Items.push(drop);
                            }
                        }
                    }
                    else {
                        thingOnPosition.Pos = newPos;
                        console.log("objekt flyttat på " + i);

                    }

                }

                if (!self.noAdjacentObjects()) {
                    self.playerHasPlacedMovedTarget = false;
                }
            }
        }

        if (self.isReadyForNextTurn()) {
            self.nextTurn();
        }

    }

    self.getColFromPos = function (pos) {
        return pos % self.cols;
    }

    self.getRowFromPos = function (pos) {
        return Math.floor(pos / self.cols);
    }

    self.isNotlogicalPushRowDiff = function (newPos, oldPos) {

        var c1 = self.getColFromPos(newPos);
        var c2 = self.getColFromPos(oldPos);

        var cdiff = Math.abs(c1 - c2);

        return (cdiff > 1);
    }

    self.isOut = function (newPos, oldPos) {

        var isOut = self.positionOutOfBounds(newPos);

        if (isOut)
            return true;

        return self.isNotlogicalPushRowDiff(newPos, oldPos);
    }

    //tar bort objekt på en position om den finns där
    self.removeThingOnPosition = function (pos) {

        var item = self.getThingOnPosition(pos);

        if (item != null) {
            self.items.remove(item);
        }
    }

    //returnerar ett objekt på en position, null om inget finns där
    self.getThingOnPosition = function (pos) {

        //object stored outside playingfield not allowed.
        if (!self.positionOutOfBounds(pos)) {

            for (i = 0; i < self.items.length; i++) {
                var item = self.items[i];

                if (item.Pos === pos)
                    return item;
            }
        }

        return null;
    }

}