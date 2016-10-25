var game;

var ACTION_MOVE_UP = 0;
var ACTION_MOVE_RIGHT = 1;
var ACTION_MOVE_DOWN = 2;
var ACTION_MOVE_LEFT = 3;
var ACTION_PLACE_BOMB = 4;


function restart() {

}

function game_event(event) {

}

function try_move(action) {

    var data = { action: action };

    gameLobby.gameEvent(data);
}

function setup_game(config) {

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

    $("#game").focus();
    $("#game").keydown(function (event) {
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