var game;
var needsRestart = false;

var RESULT_DRAW = 0;
var RESULT_WIN = 1;
var RESULT_CONTINUE = 2;
var RESULT_ILLEGAL = 3;

function game_event(event) {
    var resultBox = $("#result").html("");

    if (event.x && event.y) {
        var col = $("#" + event.y + "_" + event.x);
        col.html(event.lastPlayer).hide().fadeIn("slow");
    }

    if (event.result === RESULT_DRAW) {
        resultBox.addClass("highlight");
        resultBox.html("Table full. Nobody wins");
        needsRestart = true;
    }
    else if (event.result === RESULT_WIN) {
        resultBox.addClass("highlight");
        resultBox.html(event.lastPlayer + " wins!");
        needsRestart = true;
    }
    //else if (event.result === RESULT_CONTINUE) {
    //}
    else if (event.result === RESULT_ILLEGAL) {
        resultBox.html("Illegal move!");
    }

    if (event.currentPlayer) {
        resultBox.html(resultBox.html() + "<br>" + event.currentPlayer + "´s turn");
    }
}

function try_move() {
    if (needsRestart) {
        $("#result").removeClass("highlight");
        $("#result").html("");
        $("td").html("");
        needsRestart = false;
    }

    var id = $(this).attr('id');
    var coords = id.split("_");
    var data = { y: coords[0], x: coords[1] };

    gameLobby.gameEvent(data);
}

function setup_game(config) {

    var gamegrid = "<table>";
    for (var r = 0; r < config.size; r++) {
        gamegrid += "<tr>";
        for (var c = 0; c < config.size; c++) {
            gamegrid += "<td id='" + r + "_" + c + "'>";
            gamegrid += "</td>";
        }
        gamegrid += "</tr>";
    }
    gamegrid += "</table>";

    $("#game").html(gamegrid);
    $("td").click(try_move);

}

$(function () {
    gameLobby.registerGame(setup_game, game_event);
});