exports.game = function game(config, players) {
    var self = this;

    self.ACTION_MOVE_UP = 0;
    self.ACTION_MOVE_RIGHT = 1;
    self.ACTION_MOVE_DOWN = 2;
    self.ACTION_MOVE_LEFT = 3;
    self.ACTION_PLACE_BOMB = 4;

    self.OBJECT_EMPTY = ' ';
    self.OBJECT_BOMB = '@';

    self.playerData = {};

    self.actionDelay = 500;
    self.explosionDelay = 2000;

    self.try_move = function (event, player) {
        var result = false;

        var playerObj = self.playerData[player];

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
            case self.ACTION_PLACE_BOMB:
                self.grid[playerObj.row][playerObj.col] += self.OBJECT_BOMB;
                console.log("W U NO BOMBU: " + self.grid[playerObj.row][playerObj.col]);

                var bombRow = playerObj.row;
                var bombCol = playerObj.col;
                
                setTimeout(function () {
                    console.log("HEJ " + bombRow + " " + bombCol);
                }, self.explosionDelay);

                result = true;
                break;
        }
        return result;
    }

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
            { char: 'A', row: 0, col: 0 },
            { char: 'B', row: 6, col: 8 },
            { char: 'C', row: 6, col: 0 },
            { char: 'D', row: 0, col: 8 }
        ];

        for (var i = 0; i < players.length; i++) {
            playerData[i].name = players[i];
            self.playerData[players[i]] = playerData[i];
            self.grid[playerData[i].row][playerData[i].col] = playerData[i].char;
        }

        return { grid: self.grid };
    }
}


