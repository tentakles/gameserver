exports.game = function game(config, players) {
    var self = this;

    self.RESULT_DRAW = 0;
    self.RESULT_WIN = 1;
    self.RESULT_CONTINUE = 2;
    self.RESULT_ILLEGAL = 3;

    self.player1 = "X";
    self.player2 = "O";
    self.currentPlayer = self.player1;
    self.currentPlayerIndex = 0;
    self.grid = [];

    self.check_diag = function (y, x) {
        var numInARow = 0;

        for (var i = 0; i < config.size; i++) {
            if (!self.grid[i + y] || !self.grid[i + y][i + x]) {
                return false;
            }
            if (self.grid[i + y][i + x] !== self.currentPlayer) {
                numInARow = 0;
                continue;
            }
            numInARow++;
            if (numInARow === config.numToWin) {
                return true;
            }
        }

        return false;
    }

    self.check_reverse_diag = function (y, x) {
        var numInARow = 0;

        while (true) {
            if (!self.grid[y] || !self.grid[y][x]) {
                return false;
            }
            var val = self.grid[y][x];
            x++;
            y--;

            if (val !== self.currentPlayer) {
                numInARow = 0;
                continue;
            }
            numInARow++;
            if (numInARow === config.numToWin) {
                return true;
            }
        }
        return false;
    }

    self.check_win = function (y, x) {

        //check draw
        var numEmpty = 0;
        for (var i = 0; i < config.size; i++) {
            for (var j = 0; j < config.size; j++) {
                if (self.grid[i][j] === "")
                    numEmpty++;
            }
        }
        if (numEmpty === 0) {
            return self.RESULT_DRAW;
        }

        var numInARow = 0;
        //check col
        for (var i = 0; i < config.size; i++) {
            if (self.grid[y][i] !== self.currentPlayer) {
                numInARow = 0;
                continue;
            }
            numInARow++;

            if (numInARow === config.numToWin) {
                return self.RESULT_WIN;
            }
        }

        numInARow = 0;
        //check row
        for (var i = 0; i < config.size; i++) {
            if (self.grid[i][x] !== self.currentPlayer) {
                numInARow = 0;
                continue;
            }
            numInARow++;

            if (numInARow === config.numToWin) {
                return self.RESULT_WIN;
            }
        }

        //check diagonals
        for (var row = 0; row < config.size; row++) {
            for (var col = 0; col < config.size; col++) {
                if (self.check_diag(row, col) || self.check_reverse_diag(row, col)) {
                    return self.RESULT_WIN;
                }
            }
        }

        return self.RESULT_CONTINUE;
    }

    self.can_move = function (y, x) {
        return self.grid[y][x] === "";
    }

    self.switchPlayers = function () {
        if (self.currentPlayerIndex === players.length - 1)
            self.currentPlayerIndex = 0;
        else self.currentPlayerIndex++;

        if (self.currentPlayer === self.player1)
            self.currentPlayer = self.player2;
        else
            self.currentPlayer = self.player1;
    }

    self.move = function (event, player) {
        var y = event.y;
        var x = event.x;

        var illegalResponse = {
            result: self.RESULT_ILLEGAL, sendOnlyToPlayer: true, currentPlayer: players[self.currentPlayerIndex] + " (" + self.currentPlayer + ")"
        };

        if (player !== players[self.currentPlayerIndex])
            return illegalResponse;

        if (self.can_move(y, x)) {
            self.grid[y][x] = self.currentPlayer;
            var result = self.check_win(y, x);
            var response = { result: result, x: x, y: y, lastPlayer: self.currentPlayer };
            if (result === self.RESULT_DRAW || result === self.RESULT_WIN) {
                var initResponse = self.init();
                response.currentPlayer = initResponse.currentPlayer;
                return response;
            }

            self.switchPlayers();
            response.currentPlayer = players[self.currentPlayerIndex] + " (" + self.currentPlayer + ")";

            return response;
        }
        else {
            return illegalResponse;
        }
    }

    self.init = function () {

        //create internal state grid
        self.grid = [];
        for (var y = 0; y < config.size; y++) {
            for (var x = 0; x < config.size; x++) {
                if (!self.grid[y])
                    self.grid[y] = [];
                self.grid[y][x] = "";
            }
        }

        return { currentPlayer: players[self.currentPlayerIndex] + " (" + self.currentPlayer + ")" };
    }
}


