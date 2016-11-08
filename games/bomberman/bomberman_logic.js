exports.game = function game(config, players, eventCallback, gameUpdateCallback, gameId) {
    var self = this;

    self.gameId = gameId;
    self.eventCallback = eventCallback;
    self.gameUpdateCallback = gameUpdateCallback;

    self.ACTION_MOVE_UP = 0;
    self.ACTION_MOVE_RIGHT = 1;
    self.ACTION_MOVE_DOWN = 2;
    self.ACTION_MOVE_LEFT = 3;
    self.ACTION_PLACE_BOMB = 4;

    self.EVENT_TYPE_EXPLOSION = 0;

    self.OBJECT_EMPTY = ' ';
    self.OBJECT_BOMB = '@';
    self.OBJECT_DESTRUCTIBLE_BLOCK = '$';

    self.playerData = {};

    self.actionDelay = 300;
    self.explosionDelay = 2000;

    self.try_move = function (event, player) {
        var result = false;

        var playerObj = self.playerData[player];

        if (!playerObj.isAlive) {
            console.log(player + " is dead :(");
            return false;
        }

        if (event.action === self.ACTION_PLACE_BOMB && playerObj.bombs > 0) {
            self.grid[playerObj.row][playerObj.col] += self.OBJECT_BOMB;

            var bombRow = playerObj.row;
            var bombCol = playerObj.col;

            playerObj.bombs -= 1;
            setTimeout(function () {
                var event = { grid: self.grid, type: self.EVENT_TYPE_EXPLOSION, row: bombRow, col: bombCol, size: playerObj.bombStrength };
                self.explosion(event);
                self.eventCallback(event, self.gameId);
                playerObj.bombs += 1;
            }, self.explosionDelay);

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
                if (playerObj.row > 0 && self.grid[playerObj.row - 1][playerObj.col] === self.OBJECT_EMPTY) {
                    result = true;
                    var resultObj = self.OBJECT_EMPTY;
                    if (self.grid[playerObj.row][playerObj.col].includes(self.OBJECT_BOMB))
                        resultObj = self.OBJECT_BOMB;
                    self.grid[playerObj.row][playerObj.col] = resultObj;
                    playerObj.row -= 1;
                    self.grid[playerObj.row][playerObj.col] = playerObj.char;
                }
                break;
            case self.ACTION_MOVE_DOWN:
                if (playerObj.row < config.rows - 1 && self.grid[playerObj.row + 1][playerObj.col] === self.OBJECT_EMPTY) {
                    result = true;
                    var resultObj = self.OBJECT_EMPTY;
                    if (self.grid[playerObj.row][playerObj.col].includes(self.OBJECT_BOMB))
                        resultObj = self.OBJECT_BOMB;
                    self.grid[playerObj.row][playerObj.col] = resultObj;
                    playerObj.row += 1;
                    self.grid[playerObj.row][playerObj.col] = playerObj.char;
                }
                break;
            case self.ACTION_MOVE_RIGHT:
                if (playerObj.col < config.cols - 1 && self.grid[playerObj.row][playerObj.col + 1] === self.OBJECT_EMPTY) {
                    result = true;
                    var resultObj = self.OBJECT_EMPTY;
                    if (self.grid[playerObj.row][playerObj.col].includes(self.OBJECT_BOMB))
                        resultObj = self.OBJECT_BOMB;
                    self.grid[playerObj.row][playerObj.col] = resultObj;
                    playerObj.col += 1;
                    self.grid[playerObj.row][playerObj.col] = playerObj.char;
                }
                break;
            case self.ACTION_MOVE_LEFT:
                if (playerObj.col > 0 && self.grid[playerObj.row][playerObj.col - 1] === self.OBJECT_EMPTY) {
                    result = true;
                    var resultObj = self.OBJECT_EMPTY;
                    if (self.grid[playerObj.row][playerObj.col].includes(self.OBJECT_BOMB))
                        resultObj = self.OBJECT_BOMB;
                    self.grid[playerObj.row][playerObj.col] = resultObj;
                    playerObj.col -= 1;
                    self.grid[playerObj.row][playerObj.col] = playerObj.char;
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
    }

    self.explosion = function (event) {
        self.grid[event.row][event.col] = self.grid[event.row][event.col].replace(self.OBJECT_BOMB, ' ');

        for (var i = 1; i <= event.size; i++) {
            self.handleExplosionOnPosition(event.row, event.col);
            self.handleExplosionOnPosition(event.row, event.col + 1);
            self.handleExplosionOnPosition(event.row, event.col - 1);
            self.handleExplosionOnPosition(event.row + 1, event.col);
            self.handleExplosionOnPosition(event.row - 1, event.col);
        }

    };

    self.move = function (event, player) {
        // console.log(event.action);
        var canMove = self.try_move(event, player);
        return { grid: self.grid, cancelEvent: !canMove };
    }

    self.init = function () {
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

        for (var i = 0; i < players.length; i++) {
            playerData[i].name = players[i].name;
            playerData[i].wins = 0;
            playerData[i].bombs = 1;
            playerData[i].bombStrength = 1;
            playerData[i].isAlive = true;

            playerData[i].row = playerData[i].startRow;
            playerData[i].col = playerData[i].startCol;

            self.playerData[players[i].name] = playerData[i];
            self.grid[playerData[i].row][playerData[i].col] = playerData[i].char;
        }

        return { grid: self.grid };
    }
}


