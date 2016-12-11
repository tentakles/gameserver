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

    self.powerup_max_num=15;

    self.POWERUP_BOMBS = '1';
    self.POWERUP_BURN = '2';
    self.POWERUP_STRENGTH = '3';
    self.POWERUP_SPEED = '4';

    self.powerup_list = [ self.POWERUP_BOMBS, self.POWERUP_BURN,  self.POWERUP_STRENGTH,self.POWERUP_SPEED];

    self.playerData = {};

    self.actionDelay = 60;
    self.explosionDelay = 2000;
    self.restartDelay = 3000;
    self.explosionBurnDelay = 200;

    self.gameResettingState = false;

    self.rows = 7;
    self.cols = 9;

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

    self.get_power_up=function(){
    var random = Math.ceil(Math.random() * self.powerup_max_num)-1;

    if(random < self.powerup_list.length)
        return  self.powerup_list[random];

    return '';
    };

    self.try_move = function (event, player) {
        var result = false;

        var playerObj = self.playerData[player];

        if (!playerObj.isAlive) {
            console.log(player + " is dead, cannot move");
            return false;
        }

        var bombRow = playerObj.row;
        var bombCol = playerObj.col;

        if (event.action === self.ACTION_PLACE_BOMB && playerObj.bombs > 0 && !self.grid[playerObj.row][playerObj.col].includes(self.OBJECT_BOMB)) {
            self.grid[playerObj.row][playerObj.col] += self.OBJECT_BOMB;

            playerObj.bombs -= 1;
            var bombId = uuid.v4();
            var explosionFunc = function () {
                var event = { grid: self.grid, type: self.EVENT_TYPE_EXPLOSION, row: bombRow, col: bombCol, size: playerObj.bombStrength, bombId: bombId };
                event.explosionPositions = self.explosion(event);

                //remove ourselves from coming explosions
                for (var i = 0; i < self.bombExplosions.length; i++) {
                    var bombExplosion = self.bombExplosions[i];
                    if (bombExplosion.bombId === bombId) {
                        bombExplosion.explosionPositions = event.explosionPositions;
                        break;
                    }
                }

                self.sendGameEvent(self.gameId, event);
                playerObj.bombs += 1;

                setTimeout(function () {
                    var event = { grid: self.grid, type: self.EVENT_TYPE_EXPLOSION_END, bombId: bombId };
                    self.sendGameEvent(self.gameId, event);

                    //remove ourselves from coming explosions
                    for (var i = 0; i < self.bombExplosions.length; i++) {
                        var bombExplosion = self.bombExplosions[i];
                        if (bombExplosion.bombId === bombId) {
                            self.bombExplosions.splice(i, 1);
                            break;
                        }
                    }

                }, self.explosionBurnDelay * playerObj.bombBurnFactor);

            };

            var explosionId = setTimeout(explosionFunc, self.explosionDelay);

            self.bombExplosions.push({ funcId: explosionId, func: explosionFunc, bombId: bombId, row: bombRow, col: bombCol });

            return true;
        }

        if (playerObj.date) {
            var now = new Date();
            var millisSinceLastAction = now - playerObj.date;

            if (millisSinceLastAction > self.actionDelay * playerObj.speedFactor) {
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
                if (playerObj.row < self.rows - 1 && self.can_move_to_pos(playerObj.row + 1, playerObj.col)) {
                    result = true;
                    self.update_pos_after_move(playerObj, 1, 0);
                }
                break;
            case self.ACTION_MOVE_RIGHT:
                if (playerObj.col < self.cols - 1 && self.can_move_to_pos(playerObj.row, playerObj.col + 1)) {
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

    self.handleExplosionOnPosition = function (row, col, explosionPositions, isBombOrigin) {
        var foundDestructibleBlock = false;

        if (!self.grid[row] || self.grid[row][col] === undefined)
            return false;

        if (self.grid[row][col].includes(self.POWERUP_BOMBS)) {
         self.grid[row][col] = self.grid[row][col].replace(self.POWERUP_BOMBS, '');            
        }
        else if (self.grid[row][col].includes(self.POWERUP_BURN)) {
         self.grid[row][col] = self.grid[row][col].replace(self.POWERUP_BURN, '');            
        }
        else if (self.grid[row][col].includes(self.POWERUP_STRENGTH)) {
         self.grid[row][col] = self.grid[row][col].replace(self.POWERUP_STRENGTH, '');            
        }
        else if (self.grid[row][col].includes(self.POWERUP_SPEED)) {
         self.grid[row][col] = self.grid[row][col].replace(self.POWERUP_SPEED, '');            
        }

        if (self.grid[row][col] === self.OBJECT_DESTRUCTIBLE_BLOCK) {
            foundDestructibleBlock = true;
            self.grid[row][col] = self.get_power_up();
        }

        for (var i = 0; i < players.length; i++) {
            var player = self.playerData[players[i].name];
            if (self.grid[row][col].indexOf(player.char) > -1) {
                self.grid[row][col] = self.grid[row][col].replace(player.char, ' ');
                player.isAlive = false;
            }
        }
        var isIndestructibleBlock = self.grid[row][col] === self.OBJECT_INDESTRUCTIBLE_BLOCK;
        if (!isIndestructibleBlock && explosionPositions) {
            explosionPositions.push([row, col]);
        }

        if (!isBombOrigin && self.grid[row][col].includes(self.OBJECT_BOMB)) {

            for (var i = 0; i < self.bombExplosions.length; i++) {
                var bombExplosion = self.bombExplosions[i];
                if (bombExplosion.row === row && bombExplosion.col === col) {
                    clearTimeout(bombExplosion.funcId);
                    bombExplosion.func();
                    break;
                }
            }

            //DO STUFF
        }

        return !isIndestructibleBlock && !foundDestructibleBlock;
    }

    self.explosion = function (event) {
        self.grid[event.row][event.col] = self.grid[event.row][event.col].replace(self.OBJECT_BOMB, ' ');

        var goLeft = true;
        var goRight = true;
        var goUp = true;
        var goDown = true;
        var i;

        self.handleExplosionOnPosition(event.row, event.col, null, true);
        var explosionPositions = [];
        explosionPositions.push([event.row, event.col]);
        for (i = 1; i <= event.size; i++) {
            if (goLeft) {
                goLeft = self.handleExplosionOnPosition(event.row, event.col - i, explosionPositions);
            }
            if (goRight) {
                goRight = self.handleExplosionOnPosition(event.row, event.col + i, explosionPositions);
            }
            if (goDown) {
                goDown = self.handleExplosionOnPosition(event.row + i, event.col, explosionPositions);
            }
            if (goUp) {
                goUp = self.handleExplosionOnPosition(event.row - i, event.col, explosionPositions);
            }
        }

        self.checkWinStatus();
        return explosionPositions;
    };

    self.checkWinStatus = function () {
        var i;
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
                clearTimeout(self.bombExplosions[i].funcId);
            }
            self.bombExplosions = [];

            setTimeout(function () {
                if (numPlayersAlive === 1) {
                    //somebody won
                    lastPlayerAlive.wins++;

                    if (lastPlayerAlive.wins === config.matchLength.value) {
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


    }

    self.checkIfPlayerWalkedInToPowerup = function (player) {
        var playerObj = self.playerData[player];
        var row = playerObj.row;
        var col = playerObj.col;

        if (self.grid[row][col].includes(self.POWERUP_BOMBS)) {
            self.grid[row][col] = self.grid[row][col].replace(self.POWERUP_BOMBS, '');
            playerObj.bombs++;
        }
        else if (self.grid[row][col].includes(self.POWERUP_BURN)) {
            self.grid[row][col] = self.grid[row][col].replace(self.POWERUP_BURN, '');
             playerObj.bombBurnFactor++;
        }
        else if (self.grid[row][col].includes(self.POWERUP_STRENGTH)) {
            self.grid[row][col] = self.grid[row][col].replace(self.POWERUP_STRENGTH, '');
             playerObj.bombStrength++;
        }
        else if (self.grid[row][col].includes(self.POWERUP_SPEED)) {
            self.grid[row][col] = self.grid[row][col].replace(self.POWERUP_SPEED, '');

            if(playerObj.speedFactor > config.speedFactor.min)
                playerObj.speedFactor--;
        }
    };

    self.move = function (event, player) {
        // console.log(event.action);

        if (self.gameResettingState)
            return { cancelEvent: true };

        var canMove = self.try_move(event, player);

        if (canMove) {
            self.checkIfPlayerWalkedInToExplosion(player);
            self.checkIfPlayerWalkedInToPowerup(player);
        }

        return { grid: self.grid, cancelEvent: !canMove };
    }

    self.checkIfPlayerWalkedInToExplosion = function (player) {
        var playerObj = self.playerData[player];

        for (var i = 0; i < self.bombExplosions.length; i++) {
            var bombExplosion = self.bombExplosions[i];

            if (bombExplosion.explosionPositions) {
                for (var j = 0; j < bombExplosion.explosionPositions.length;j++) {
                    var pos = bombExplosion.explosionPositions[j];
                    if (pos[0] === playerObj.row && pos[1] === playerObj.col) {
                        //player walked in to a explosion
                        self.grid[playerObj.row][playerObj.col] = self.grid[playerObj.row][playerObj.col].replace(playerObj.char, ' ');
                        playerObj.isAlive = false;
                        self.checkWinStatus();
                        break;
                    }
                }
            }
        }
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

        //init player properties
        for (i = 0; i < players.length; i++) {
            playerData[i].name = players[i].name;
            playerData[i].isAlive = true;

            playerData[i].row = playerData[i].startRow;
            playerData[i].col = playerData[i].startCol;

            self.playerData[players[i].name] = playerData[i];
            self.grid[playerData[i].row][playerData[i].col] = playerData[i].char;

            //custom properties
            playerData[i].bombs = config.bombs.value;
            playerData[i].bombStrength = config.bombStrength.value;
            playerData[i].bombBurnFactor = config.bombBurnFactor.value;
            playerData[i].speedFactor = config.speedFactor.value;
        }

        return { grid: self.grid };
    }
}


