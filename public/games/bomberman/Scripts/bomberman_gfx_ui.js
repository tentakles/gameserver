var ACTION_MOVE_UP = 0;
var ACTION_MOVE_RIGHT = 1;
var ACTION_MOVE_DOWN = 2;
var ACTION_MOVE_LEFT = 3;
var ACTION_PLACE_BOMB = 4;

var EVENT_TYPE_EXPLOSION = 0;
var EVENT_TYPE_EXPLOSION_END = 1;
var EVENT_TYPE_POSITIONS = 2;

var OBJECT_EMPTY = ' ';
var OBJECT_BOMB = '@';
var OBJECT_DESTRUCTIBLE_BLOCK = '$';
var OBJECT_INDESTRUCTIBLE_BLOCK = '#';

var POWERUP_BOMBS = '1';
var POWERUP_BURN = '2';
var POWERUP_STRENGTH = '3';
var POWERUP_SPEED = '4';

var PLAYER_1 = "A";
var PLAYER_2 = "B";
var PLAYER_3 = "C";
var PLAYER_4 = "D";

var EXP_TYPE_CENTER = 0;
var EXP_TYPE_UP = 1;
var EXP_TYPE_DOWN = 2;
var EXP_TYPE_LEFT = 3;
var EXP_TYPE_RIGHT = 4;
var EXP_TYPE_VERT = 5;
var EXP_TYPE_HORI = 6;

var scale = 2;
var w = 32 * scale;
var h = 32 * scale;

var rows = 7;
var cols = 9;
var sprites;

var game;

var oldGrid = null;
var gameDiv = null;
var bombs = {};

var locs = {
    block: [0, 0],
    bomb: [32, 0],

    exp_center: [64, 0],
    exp_hori: [0, 32],
    exp_vert: [0, 64],
    exp_left: [32, 32],
    exp_right: [64, 32],
    exp_up: [96, 32],
    exp_down: [96, 0],

    floor: [32, 64],
    hardblock: [64, 64],
    p1: [96, 64],
    p1bomb: [0, 96],
    p2: [32, 96],
    p2bomb: [64, 96],
    p3: [96, 96],
    p3bomb: [128, 0],
    p4: [128, 32],
    p4bomb: [128, 64],
    powerup_bombs: [128, 96],
    powerup_burn: [0, 128],
    powerup_speed: [32, 128],
    powerup_strength: [64, 128],
};

function sprite(options) {
    var self = {};
    self.context = options.context;
    self.width = options.width;
    self.height = options.height;
    self.image = options.image;

    self.draw = function (offset, y, x) {
        self.context.drawImage(
            self.image,
            offset[0],
            offset[1],
            self.width,
            self.height,
            x,
            y,
            self.width,
            self.height);
    };

    return self;
}

function update_cell(r, c, char) {

    var s = [];
    s.push(locs.floor);
    if (char == OBJECT_DESTRUCTIBLE_BLOCK)
        s.push(locs.block);
    else if (char == OBJECT_INDESTRUCTIBLE_BLOCK)
        s.push(locs.hardblock);
    if (char.includes(PLAYER_1))
        s.push(locs.p1);
    if (char.includes(PLAYER_2))
        s.push(locs.p2);
    if (char.includes(PLAYER_3))
        s.push(locs.p3);
    if (char.includes(PLAYER_4))
        s.push(locs.p4);
    if (char.includes(OBJECT_BOMB)) {
        s.push(locs.bomb);
    }
    else if (char.includes(POWERUP_BOMBS))
        s.push(locs.powerup_bombs);

    else if (char.includes(POWERUP_STRENGTH))
        s.push(locs.powerup_strength);

    else if (char.includes(POWERUP_BURN))
        s.push(locs.powerup_burn);

    else if (char.includes(POWERUP_SPEED))
        s.push(locs.powerup_speed);

    for (var i = 0; i < s.length; i++) {
        sprites.draw(s[i], r * h, c * w);
    }

}

function game_event(event) {
    window.requestAnimationFrame(function () {

        console.log("Bomberman game event");
        var i;
        if (event.type === EVENT_TYPE_EXPLOSION) {
            bombs[event.bombId] = event;
        }
        else if (event.type === EVENT_TYPE_EXPLOSION_END) {
            delete bombs[event.bombId];
        }
        else if (event.type === EVENT_TYPE_POSITIONS) {
            for (i = 0; i < event.pos.length; i++) {
                var pos = event.pos[i];
                update_cell(pos[0], pos[1], pos[2]);
                oldGrid[pos[0]][pos[1]] = pos[2];
            }

            return;
        }

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (oldGrid === null || oldGrid[r][c] !== event.grid[r][c] || event.type === EVENT_TYPE_EXPLOSION_END || event.type === EVENT_TYPE_EXPLOSION) {
                    var char = event.grid[r][c];
                    update_cell(r, c, char);
                }
            }
        }

        var explosionData = [];

        for (var key in bombs) {
            if (bombs.hasOwnProperty(key)) {
                var bomb = bombs[key];

                for (i = 0; i < bomb.explosionPositions.length; i++) {
                    var pos = bomb.explosionPositions[i];
                    var col = (pos[0] * cols) + pos[1];

                    var hasCenter = explosionData[col] === locs.exp_center;
                    var hasHori = explosionData[col] === locs.exp_left || explosionData[col] === locs.exp_right || explosionData[col] === locs.exp_hori;
                    var hasVert = explosionData[col] === locs.exp_up || explosionData[col] === locs.exp_down || explosionData[col] === locs.exp_vert;

                    if (!hasCenter) {
                        var sprite = locs.exp_center;
                        if (pos[2] == EXP_TYPE_DOWN) {
                            if (hasVert)
                                sprite = locs.exp_vert;
                            else
                                sprite = locs.exp_down;
                        }

                        else if (pos[2] == EXP_TYPE_UP) {
                            if (hasVert)
                                sprite = locs.exp_vert;
                            else
                                sprite = locs.exp_up;
                        }

                        if (pos[2] == EXP_TYPE_LEFT) {

                            if (hasHori)
                                sprite = locs.exp_hori;
                            else
                                sprite = locs.exp_left;
                        }
                        else if (pos[2] == EXP_TYPE_RIGHT) {

                            if (hasHori)
                                sprite = locs.exp_hori;
                            else
                                sprite = locs.exp_right;
                        }

                        if (pos[2] == EXP_TYPE_VERT) {
                            if (!hasHori)
                                sprite = locs.exp_vert;
                        }
                        else if (pos[2] == EXP_TYPE_HORI) {
                            if (!hasVert)
                                sprite = locs.exp_hori;
                        }

                        sprites.draw(sprite, pos[0] * h, pos[1] * w);
                        explosionData[col] = sprite;
                    }

                }
            }
        }
        oldGrid = event.grid;
    }
    );
}

function try_move(action) {
    var data = { action: action };
    gameLobby.gameEvent(data);
}

function setup_game(conf) {
    console.log("Setup_game: Bomberman");

}

$(function () {
    console.log("Bomberman ONload");

    gameDiv = $("#game");

    var spriteSheetImg = new Image();
    //spriteSheetImg.src = "spritesheet.png";
    spriteSheetImg.addEventListener("load", function () {
        gameLobby.registerGame(setup_game, game_event);
        console.log("img Load");
    });
    spriteSheetImg.src = "games/bomberman/gfx/transpspritesheet2x.png";
    var canvas;

    canvas = gameDiv[0];
    canvas.width = w * cols;
    canvas.height = h * rows;

    for (var key in locs) {
        if (locs.hasOwnProperty(key)) {
            var obj = locs[key];
            obj[0] = obj[0] * scale;
            obj[1] = obj[1] * scale;
        }
    }

    sprites = sprite({
        context: canvas.getContext("2d"),
        width: w,
        height: h,
        image: spriteSheetImg
    });

    gameDiv.focus();
    gameDiv.keyup(function (event) {
        switch (event.which) {
            case 32:
                try_move(ACTION_PLACE_BOMB);
                break;
            case 37:
                try_move(ACTION_MOVE_LEFT);
                break;
            case 38:
                try_move(ACTION_MOVE_UP);
                break;
            case 39:
                try_move(ACTION_MOVE_RIGHT);
                break;
            case 40:
                try_move(ACTION_MOVE_DOWN);
                break;
        }

    });


});