var game;

var ACTION_MOVE_UP = 0;
var ACTION_MOVE_RIGHT = 1;
var ACTION_MOVE_DOWN = 2;
var ACTION_MOVE_LEFT = 3;
var ACTION_PLACE_BOMB = 4;

var EVENT_TYPE_EXPLOSION = 0;
var EVENT_TYPE_EXPLOSION_END = 1;

var rows = 7;
var cols = 9;

var oldGrid = null;

var config = null;
var columns = null;

var gameDiv = null;

var bombs = {};

function restart() {

}

function game_event(event) {
    var i;
    if (event.type === EVENT_TYPE_EXPLOSION) {
        bombs[event.bombId] = event;
    }
    if (event.type === EVENT_TYPE_EXPLOSION_END) {
        delete bombs[event.bombId];
    }

    //paint explosions
    columns.removeClass("explosion"); 
    
    for (var key in bombs) {
        if (bombs.hasOwnProperty(key)) {
            var bomb = bombs[key];

            var affectedTiles = "";

            for (i = 0; i < bomb.explosionPositions.length; i++) {
                var pos = bomb.explosionPositions[i];
                if (affectedTiles !== "")
                    affectedTiles += ", ";
                affectedTiles += "#" + pos[0] + "_" + pos[1];
            }

            gameDiv.find(affectedTiles).addClass("explosion");
        }
    }

    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            if (oldGrid === null || oldGrid[r][c] !== event.grid[r][c]) {
                i = (r * cols) + c;
                $(columns[i]).html(event.grid[r][c]);
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
    var gamegrid = "<table>";
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