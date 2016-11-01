var game;

var ACTION_MOVE_UP = 0;
var ACTION_MOVE_RIGHT = 1;
var ACTION_MOVE_DOWN = 2;
var ACTION_MOVE_LEFT = 3;
var ACTION_PLACE_BOMB = 4;
var EVENT_TYPE_EXPLOSION = 0;

var config = null;
var columns = null;

function restart() {

}

function game_event(event) {
    var i;
    if (event.type === EVENT_TYPE_EXPLOSION) {
        var affectedTiles = "#" + event.row + "_" + event.col;

        for (i = 1; i <= event.size; i++) {
            affectedTiles += ", #" + event.row + "_" + (event.col + i);
            affectedTiles += ", #" + event.row + "_" + (event.col - i);
            affectedTiles += ", #" + (event.row + i)  + "_" + event.col;
            affectedTiles += ", #" + (event.row - i) + "_" + event.col;
        }

        $(affectedTiles).addClass("explosion");

        setTimeout(function () { $(affectedTiles).removeClass("explosion"); }, 1000);
    }

    for (var r = 0; r < config.rows; r++) {
        for (var c = 0; c < config.cols; c++) {
            i = (r * config.cols) + c;
            $(columns[i]).html(event.grid[r][c]);
            // var col = $("#" + r + "_" + c).html(event.grid[r][c]);
        }
    }

}

function try_move(action) {

    var data = { action: action };

    gameLobby.gameEvent(data);
}

function setup_game(conf) {
    config = conf;
    var gamegrid = "<table>";
    for (var r = 0; r < config.rows; r++) {
        gamegrid += "<tr>";
        for (var c = 0; c < config.cols; c++) {
            gamegrid += "<td id='" + r + "_" + c + "'>";
            gamegrid += "</td>";
        }
        gamegrid += "</tr>";
    }
    gamegrid += "</table>";

    $("#game").html(gamegrid);

    columns = $("#game").find("td");

    $("#game").focus();
    $("#game").keyup(function (event) {
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