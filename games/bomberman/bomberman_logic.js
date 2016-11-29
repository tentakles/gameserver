var uuid = require('node-uuid');

exports.game = function game(gameId, config, players, sendGameEvent, sendGameUpdate, sendGameChat) {
    var self = this;

    self.gameId = gameId;

    self.sendGameEvent = sendGameEvent;
    self.sendGameUpdate = sendGameUpdate;
    self.sendGameChat = sendGameChat;

    self.ACTION_MOVE_UP = 0;
    self.ACTION_MOVE_RIGHT = 1;
    self.ACTION_MOVE_DOWN = 2;
    self.ACTION_MOVE_LEFT = 3;
    self.ACTION_PLACE_BOMB = 4;

    self.EVENT_TYPE_EXPLOSION = 0;
    self.EVENT_TYPE_EXPLOSION_END = 1;

    self.OBJECT_EMPTY = ' ';
    self.OBJECT_BOMB = '@';
    self.OBJECT_DESTRUCTIBLE_BLOCK = '$';
    self.OBJECT_INDESTRUCTIBLE_BLOCK = '#';

    self.playerData = {};

    self.actionDelay = 300;
    self.explosionDelay = 2000;
    self.restartDelay = 3000;
    self.explosionBurnDelay = 1000;

    self.gameResettingState = false;

    self.bombExplosions = [];

    self.update_pos_after_move = function (playerObj, rowDelta, colDelta) {
        self.grid[playerObj.row][playerObj.col] = self.grid[playerObj.row][playerObj.col].replace(playerObj.char, "");
        playerObj.row += rowDelta;
        playerObj.col += colDelta;
        self.grid[playerObj.row][playerObj.col] += playerObj.char;
    }

    self.can_move_to_pos = function (row, col) {
        if (self.grid[row][col].includes(self.OBJECT_BOMB) ||
            self.grid[row][col].includes(self.OBJECT_DESTRUCTIBLE_BLOCK) ||
            self.grid[row][col].includes(self.OBJECT_INDESTRUCTIBLE_BLOCK))
            return false;
        return true;
    }

    self.try_move = function (event, player) {
        var result = false;

        var playerObj = self.playerData[player];

        if (!playerObj.isAlive) {
            console.log(player + " is dead, cannot move");
            return false;
        }

        if (event.action === self.ACTION_PLACE_BOMB && playerObj.bombs > 0) {
            self.grid[playerObj.row][playerObj.col] += self.OBJECT_BOMB;

            var bombRow = playerObj.row;
            var bombCol = playerObj.col;

            playerObj.bombs -= 1;
            var explosionId = setTimeout(function () {
                var bombId = uuid.v4();
                var event = { grid: self.grid, type: self.EVENT_TYPE_EXPLOSION, row: bombRow, col: bombCol, size: playerObj.bombStrength, bombId: bombId };
                self.explosion(event);
                self.sendGameEvent(self.gameId, event);
                playerObj.bombs += 1;
                
                setTimeout(function() {
                    var event = { grid: self.grid, type: self.EVENT_TYPE_EXPLOSION_END, bombId: bombId };
                    self.sendGameEvent(self.gameId, event);
                }, self.explosionBurnDelay * playerObj.bombBurn);

            }, self.explosionDelay);

            self.bombExplosions.push(explosionId);

            return true;
        }

        if (playerObj.date) {
            var now = new Date();
            var millisSinceLastAction = now - playerObj.date;
            // console.log(millisSinceLastAction);
            if (millisSinceLastAction > self.actionDelay) {
                playerObj.date = now;
            }
            else {
                return false;
            }
        }
        else {
            playerObj.date = new Date();
        }

        switch (event.action) {
            case self.ACTION_MOVE_UP:
                if (playerObj.row > 0 && self.can_move_to_pos(playerObj.row - 1, playerObj.col)) {
                    result = true;
                    self.update_pos_after_move(playerObj, -1, 0);
                }
                break;
            case self.ACTION_MOVE_DOWN:
                if (playerObj.row < config.rows - 1 && self.can_move_to_pos(playerObj.row + 1, playerObj.col)) {
                    result = true;
                    self.update_pos_after_move(playerObj, 1, 0);
                }
                break;
            case self.ACTION_MOVE_RIGHT:
                if (playerObj.col < config.cols - 1 && self.can_move_to_pos(playerObj.row, playerObj.col + 1)) {
                    result = true;
                    self.update_pos_after_move(playerObj, 0, 1);
                }
                break;
            case self.ACTION_MOVE_LEFT:
                if (playerObj.col > 0 && self.can_move_to_pos(playerObj.row, playerObj.col - 1)) {
                    result = true;
                    self.update_pos_after_move(playerObj, 0, -1);
                }
                break;
        }
        return result;
    }

    self.handleExplosionOnPosition = function (row, col) {
        if (self.grid[row] && (self.grid[row][col] === self.OBJECT_DESTRUCTIBLE_BLOCK))
            self.grid[row][col] = self.OBJECT_EMPTY;

        for (var i = 0; i < players.length; i++) {

            var player = self.playerData[players[i].name];
            if (self.grid[row] && self.grid[row][col] && self.grid[row][col].indexOf(player.char) > -1) {
                self.grid[row][col] = self.grid[row][col].replace(player.char, ' ');
                player.isAlive = false;
            }
        }

        return !(self.grid[row] && (self.grid[row][col] === self.OBJECT_INDESTRUCTIBLE_BLOCK));
    }

    self.explosion = function (event) {
        self.grid[event.row][event.col] = self.grid[event.row][event.col].replace(self.OBJECT_BOMB, ' ');

        var goLeft = true;
        var goRight = true;
        var goUp = true;
        var goDown = true;
        var i;

        self.handleExplosionOnPosition(event.row, event.col);

        for (i = 1; i <= event.size; i++) {
            if (goLeft)
                goLeft = self.handleExplosionOnPosition(event.row, event.col - i);
            if (goRight)
                goRight = self.handleExplosionOnPosition(event.row, event.col + i);
            if (goDown)
                goDown = self.handleExplosionOnPosition(event.row + i, event.col);
            if (goUp)
                goUp = self.handleExplosionOnPosition(event.row - i, event.col);
        }

        var numPlayersAlive = 0;
        var lastPlayerAlive = null;
        for (i = 0; i < players.length; i++) {
            if (self.playerData[players[i].name].isAlive) {
                numPlayersAlive++;
                lastPlayerAlive = players[i];
            }
        }

        if (numPlayersAlive <= 1) {
            self.gameResettingState = true;
            for (i = 0; i < self.bombExplosions.length; i++) {
                clearTimeout(self.bombExplosions[i]);
            }
            self.bombExplosions = [];

            setTimeout(function () {
                if (numPlayersAlive === 1) {
                    //somebody won
                    lastPlayerAlive.wins++;

                    if (lastPlayerAlive.wins == config.matchLength) {
                        var message = lastPlayerAlive.name + " Wins game!";
                        self.sendGameChat(self.gameId, message, true);

                        for (var i = 0; i < players.length; i++) {
                            players[i].wins = 0;
                        }
                    }
                    else {
                        var message = lastPlayerAlive.name + " Wins set!";
                        self.sendGameChat(self.gameId, message);
                    }

                    self.sendGameUpdate(self.gameId);
                }
                else {
                    //its a draw
                    var message = "Draw! Nobody wins set.";
                    self.sendGameChat(self.gameId, message);
                }

                self.init();
                var event = { grid: self.grid };
                self.sendGameEvent(self.gameId, event);
            }, self.restartDelay);
        }
    };

    self.move = function (event, player) {
        // console.log(event.action);

        if (self.gameResettingState)
            return { cancelEvent: true };

        var canMove = self.try_move(event, player);
        return { grid: self.grid, cancelEvent: !canMove };
    }

    self.init = function () {

        var i;
        self.gameResettingState = false;

        //create internal state grid
        self.grid = [
            [' ', ' ', '$', '$', '$', '$', '$', ' ', ' '],
            [' ', '#', '$', '#', '$', '#', '$', '#', ' '],
            ['$', '$', '$', '$', '$', '$', '$', '$', '$'],
            ['$', '#', '$', '#', '$', '#', '$', '#', '$'],
            ['$', '$', '$', '$', '$', '$', '$', '$', '$'],
            [' ', '#', '$', '#', '$', '#', '$', '#', ' '],
            [' ', ' ', '$', '$', '$', '$', '$', ' ', ' ']];

        var playerData = [
            { char: 'A', startRow: 0, startCol: 0 },
            { char: 'B', startRow: 6, startCol: 8 },
            { char: 'C', startRow: 6, startCol: 0 },
            { char: 'D', startRow: 0, startCol: 8 }
        ];

        for (i = 0; i < players.length; i++) {
            playerData[i].name = players[i].name;
            playerData[i].wins = 0;
            playerData[i].bombs = 1;
            playerData[i].bombStrength = 4;
            playerData[i].bombBurn = 1;
            playerData[i].isAlive = true;

            playerData[i].row = playerData[i].startRow;
            playerData[i].col = playerData[i].startCol;

            self.playerData[players[i].name] = playerData[i];
            self.grid[playerData[i].row][playerData[i].col] = playerData[i].char;
        }

        return { grid: self.grid };
    }
}


