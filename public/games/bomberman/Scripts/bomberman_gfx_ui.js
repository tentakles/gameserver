var game;

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

var rows = 7;
var cols = 9;

var oldGrid = null;

var config = null;
var columns = null;

var gameDiv = null;

var bombs = {};

function restart() {

}


function update_cell(r, c, char) {
    i = (r * cols) + c;

    var sprite = 'floor';
    if (char == OBJECT_DESTRUCTIBLE_BLOCK)
        sprite = "block";
    else if (char == OBJECT_INDESTRUCTIBLE_BLOCK)
        sprite = "hardblock";
    else if (char.includes(OBJECT_BOMB)) {
        sprite = "bomb";

        if (char.includes(PLAYER_1)) {
            sprite = "p1bomb";
        }
        else if (char.includes(PLAYER_2)) {
            sprite = "p2bomb";
        }
        else if (char.includes(PLAYER_3)) {
            sprite = "p3bomb";
        }
        else if (char.includes(PLAYER_4)) {
            sprite = "p4bomb";
        }
    }
    else if (char.includes(PLAYER_1))
        sprite = "p1";
    else if (char.includes(PLAYER_2))
        sprite = "p2";
    else if (char.includes(PLAYER_3))
        sprite = "p3";
    else if (char.includes(PLAYER_4))
        sprite = "p4";
    else if (char.includes(POWERUP_BOMBS))
        sprite = "powerup-bombs";

    else if (char.includes(POWERUP_STRENGTH))
        sprite = "powerup-strength";

    else if (char.includes(POWERUP_BURN))
        sprite = "powerup-burn";

    else if (char.includes(POWERUP_SPEED))
        sprite = "powerup-speed";

    $(columns[i]).removeClass().addClass("sprite sprite-" + sprite);

}

function game_event(event) {
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

    columns.removeClass('sprite-exp-center sprite-exp-down sprite-exp-hori sprite-exp-left sprite-exp-right sprite-exp-up sprite-exp-vert');
    for (var key in bombs) {
        if (bombs.hasOwnProperty(key)) {
            var bomb = bombs[key];

            //var affectedTiles = "";

            for (i = 0; i < bomb.explosionPositions.length; i++) {

                var pos = bomb.explosionPositions[i];
                var elm = gameDiv.find("#" + pos[0] + "_" + pos[1]);

                var sprite = "sprite-exp-center";
                var hasCenter = elm.hasClass("sprite-exp-center")
                var hasHori = elm.hasClass("sprite-exp-left") || elm.hasClass("sprite-exp-right") || elm.hasClass("sprite-exp-hori");
                var hasVert = elm.hasClass("sprite-exp-up") || elm.hasClass("sprite-exp-down") || elm.hasClass("sprite-exp-vert");

                if (pos[2] == EXP_TYPE_DOWN && !hasCenter) {
                    if (hasVert)
                        sprite = "sprite-exp-vert";
                    else
                        sprite = "sprite-exp-down";
                }

                else if (pos[2] == EXP_TYPE_UP && !hasCenter) {
                    if (hasVert)
                        sprite = "sprite-exp-vert";
                    else
                        sprite = "sprite-exp-up";
                }
                if (pos[2] == EXP_TYPE_LEFT && !hasCenter) {

                    if (hasHori)
                        sprite = "sprite-exp-hori";
                    else
                        sprite = "sprite-exp-left";
                }

                else if (pos[2] == EXP_TYPE_RIGHT && !hasCenter) {

                    if (hasHori)
                        sprite = "sprite-exp-hori";
                    else
                        sprite = "sprite-exp-right";
                }

                if (pos[2] == EXP_TYPE_VERT && !hasCenter) {
                    if (!hasHori)
                        sprite = "sprite-exp-vert";
                }

                else if (pos[2] == EXP_TYPE_HORI && !hasCenter) {
                    if (!hasVert)
                        sprite = "sprite-exp-hori";
                }

                elm.removeClass().addClass("sprite " + sprite);
            }

        }
    }

    oldGrid = event.grid;
}

function try_move(action) {
    var data = { action: action };
    gameLobby.gameEvent(data);
}

function setup_game(conf) {
    console.log("Setup_game: Bomberman");
    config = conf;
    gameDiv = $("#game");
    var gamegrid = "<table tabindex='0'>";
    for (var r = 0; r < rows; r++) {
        gamegrid += "<tr>";
        for (var c = 0; c < cols; c++) {
            gamegrid += "<td id='" + r + "_" + c + "'>";
            gamegrid += "</td>";
        }
        gamegrid += "</tr>";
    }
    gamegrid += "</table>";

    gameDiv.html(gamegrid);

    columns = gameDiv.find("td");

    gameDiv.find("table").focus();

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

}

$(function () {
    gameLobby.registerGame(setup_game, game_event);
});