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
    self.EVENT_TYPE_POSITIONS = 2;

    self.OBJECT_EMPTY = ' ';
    self.OBJECT_BOMB = '@';
    self.OBJECT_DESTRUCTIBLE_BLOCK = '$';
    self.OBJECT_INDESTRUCTIBLE_BLOCK = '#';
    self.OBJECT_BORDER = '%';

    self.EXP_TYPE_CENTER = 0;
    self.EXP_TYPE_UP = 1;
    self.EXP_TYPE_DOWN = 2;
    self.EXP_TYPE_LEFT = 3;
    self.EXP_TYPE_RIGHT = 4;
    self.EXP_TYPE_VERT = 5;
    self.EXP_TYPE_HORI = 6;

//    self.powerup_max_num = 15;
    //TODO REVERT THIS:
    self.powerup_max_num = 5;

    self.POWERUP_BOMBS = '1';
    self.POWERUP_BURN = '2';
    self.POWERUP_STRENGTH = '3';
    self.POWERUP_SPEED = '4';

    self.powerup_list = [self.POWERUP_BOMBS, self.POWERUP_BURN, self.POWERUP_STRENGTH, self.POWERUP_SPEED];

    self.playerData = {};

    self.actionDelay = 60;
    self.explosionDelay = 2000;
    self.restartDelay = 3000;
    self.explosionBurnDelay = 200;

    self.gameResettingState = false;

    self.rows = 9;
    self.cols = 11;

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
            self.grid[row][col].includes(self.OBJECT_BORDER) ||
            self.grid[row][col].includes(self.OBJECT_INDESTRUCTIBLE_BLOCK))
            return false;
        return true;
    }

    self.get_power_up = function () {
        var random = Math.ceil(Math.random() * self.powerup_max_num) - 1;

        if (random < self.powerup_list.length)
            return self.powerup_list[random];

        return '';
    };

    self.try_move = function (event, playerObj) {
        var result = { canMove: false, positions: [] };

        if (!playerObj.isAlive) {
            console.log(player + " is dead, cannot move");
            return result;
        }

        var bombRow = playerObj.row;
        var bombCol = playerObj.col;

        if (event.action === self.ACTION_PLACE_BOMB && playerObj.bombs > 0 && !self.grid[playerObj.row][playerObj.col].includes(self.OBJECT_BOMB)) {
            self.grid[playerObj.row][playerObj.col] += self.OBJECT_BOMB;

            playerObj.bombs -= 1;
            var bombId = uuid.v4();
            var bombStrength = playerObj.bombStrength;
            var explosionFunc = function () {
                var event = { grid: self.grid, type: self.EVENT_TYPE_EXPLOSION, row: bombRow, col: bombCol, size: bombStrength, bombId: bombId };
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

            result.canMove = true;
            result.positions.push([bombRow, bombCol]);
            return result;
        }

        if (playerObj.date) {
            var now = new Date();
            var millisSinceLastAction = now - playerObj.date;

            if (millisSinceLastAction > self.actionDelay * playerObj.speedFactor) {
                playerObj.date = now;
            }
            else {
                return result;
            }
        }
        else {
            playerObj.date = new Date();
        }

        switch (event.action) {
            case self.ACTION_MOVE_UP:
                if (playerObj.row > 0 && self.can_move_to_pos(playerObj.row - 1, playerObj.col)) {
                    result.positions.push([playerObj.row, playerObj.col]);
                    self.update_pos_after_move(playerObj, -1, 0);
                    result.positions.push([playerObj.row, playerObj.col]);
                    result.canMove = true;
                    return result;
                }
                break;
            case self.ACTION_MOVE_DOWN:
                if (playerObj.row < self.rows - 1 && self.can_move_to_pos(playerObj.row + 1, playerObj.col)) {

                    result.positions.push([playerObj.row, playerObj.col]);
                    self.update_pos_after_move(playerObj, 1, 0);
                    result.positions.push([playerObj.row, playerObj.col]);
                    result.canMove = true;
                    return result;
                }
                break;
            case self.ACTION_MOVE_RIGHT:
                if (playerObj.col < self.cols - 1 && self.can_move_to_pos(playerObj.row, playerObj.col + 1)) {
                    result.positions.push([playerObj.row, playerObj.col]);
                    self.update_pos_after_move(playerObj, 0, 1);
                    result.positions.push([playerObj.row, playerObj.col]);
                    result.canMove = true;
                    return result;
                }
                break;
            case self.ACTION_MOVE_LEFT:
                if (playerObj.col > 0 && self.can_move_to_pos(playerObj.row, playerObj.col - 1)) {
                    result.positions.push([playerObj.row, playerObj.col]);
                    self.update_pos_after_move(playerObj, 0, -1);
                    result.positions.push([playerObj.row, playerObj.col]);
                    result.canMove = true;
                    return result;
                }
                break;
        }
        return result;
    }

    self.handleExplosionOnPosition = function (row, col, explosionPositions, isBombOrigin, exp_dir) {
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
            explosionPositions.push([row, col, exp_dir]);
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

        }

        return !isIndestructibleBlock && !foundDestructibleBlock;
    }

    self.updateExplosionDir = function (explosions, row, col, dir) {
        for (var i = 0; i < explosions.length; i++) {
            if (explosions[i][0] === row && explosions[i][1] === col) {
                explosions[i][2] = dir;
                break;
            }
        }
    };

    self.explosion = function (event) {
        self.grid[event.row][event.col] = self.grid[event.row][event.col].replace(self.OBJECT_BOMB, ' ');

        var goLeft = true;
        var goRight = true;
        var goUp = true;
        var goDown = true;
        var i;

        var lastLeft, lastRight, lastUp, lastDown;

        self.handleExplosionOnPosition(event.row, event.col, null, true, null);
        var explosionPositions = [];
        explosionPositions.push([event.row, event.col, self.EXP_TYPE_CENTER]);
        for (i = 1; i <= event.size; i++) {
            if (goLeft) {
                goLeft = self.handleExplosionOnPosition(event.row, event.col - i, explosionPositions, false, self.EXP_TYPE_HORI);
                lastLeft = [event.row, event.col - i];
            }

            if (goRight) {
                goRight = self.handleExplosionOnPosition(event.row, event.col + i, explosionPositions, false, self.EXP_TYPE_HORI);
                lastRight = [event.row, event.col + i];
            }

            if (goDown) {
                goDown = self.handleExplosionOnPosition(event.row + i, event.col, explosionPositions, false, self.EXP_TYPE_VERT);
                lastDown = [event.row + i, event.col];
            }

            if (goUp) {
                goUp = self.handleExplosionOnPosition(event.row - i, event.col, explosionPositions, false, self.EXP_TYPE_VERT);
                lastUp = [event.row - i, event.col];
            }

        }

        if (lastLeft) {
            self.updateExplosionDir(explosionPositions, lastLeft[0], lastLeft[1], self.EXP_TYPE_LEFT);
        }

        if (lastRight) {
            self.updateExplosionDir(explosionPositions, lastRight[0], lastRight[1], self.EXP_TYPE_RIGHT);
        }

        if (lastDown) {
            self.updateExplosionDir(explosionPositions, lastDown[0], lastDown[1], self.EXP_TYPE_DOWN);
        }

        if (lastUp) {
            self.updateExplosionDir(explosionPositions, lastUp[0], lastUp[1], self.EXP_TYPE_UP);
        }

        if (!self.gameResettingState)
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

    self.checkIfPlayerWalkedInToPowerup = function (playerObj) {
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

            if (playerObj.speedFactor > config.speedFactor.min)
                playerObj.speedFactor--;
        }
    };

    self.move = function (event, player) {
        if (!self.gameResettingState) {

            var playerObj = self.playerData[player];

            var tryMove = self.try_move(event, playerObj);

            if (tryMove.canMove) {
                var playerExploded = self.checkIfPlayerWalkedInToExplosion(playerObj);
                self.checkIfPlayerWalkedInToPowerup(playerObj);

                //add latest cell contents to affected cells...
                for (var i = 0; i < tryMove.positions.length; i++) {
                    var p = tryMove.positions[i];
                    p.push(self.grid[p[0]][p[1]]);
                }

                //if not removed, an UI bug occurs where explosion tile is removed.
                if(playerExploded)
                    tryMove.positions.pop();

                return { pos: tryMove.positions, type: self.EVENT_TYPE_POSITIONS };
            }
        }

        return { cancelEvent: true };
    }

    self.checkIfPlayerWalkedInToExplosion = function (playerObj) {
        for (var i = 0; i < self.bombExplosions.length; i++) {
            var bombExplosion = self.bombExplosions[i];

            if (bombExplosion.explosionPositions) {
                for (var j = 0; j < bombExplosion.explosionPositions.length; j++) {
                    var pos = bombExplosion.explosionPositions[j];
                    if (pos[0] === playerObj.row && pos[1] === playerObj.col) {
                        //player walked in to a explosion
                        self.grid[playerObj.row][playerObj.col] = self.grid[playerObj.row][playerObj.col].replace(playerObj.char, ' ');
                        playerObj.isAlive = false;
                        self.checkWinStatus();
                        return true;
                    }
                }
            }
        }
        return false;
    }

    self.init = function () {

        var i;
        self.gameResettingState = false;

        //create internal state grid
        self.grid = [
            ['%', '%', '%', '%', '%', '%', '%', '%', '%', '%', '%'],
            ['%', ' ', ' ', '$', '$', '$', '$', '$', ' ', ' ', '%'],
            ['%', ' ', '#', '$', '#', '$', '#', '$', '#', ' ', '%'],
            ['%', '$', '$', '$', '$', '$', '$', '$', '$', '$', '%'],
            ['%', '$', '#', '$', '#', '$', '#', '$', '#', '$', '%'],
            ['%', '$', '$', '$', '$', '$', '$', '$', '$', '$', '%'],
            ['%', ' ', '#', '$', '#', '$', '#', '$', '#', ' ', '%'],
            ['%', ' ', ' ', '$', '$', '$', '$', '$', ' ', ' ', '%'],
            ['%', '%', '%', '%', '%', '%', '%', '%', '%', '%', '%']
        ];
        var playerData = [
            { char: 'A', startRow: 1, startCol: 1 },
            { char: 'B', startRow: 7, startCol: 9 },
            { char: 'C', startRow: 7, startCol: 1 },
            { char: 'D', startRow: 1, startCol: 9 }
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


