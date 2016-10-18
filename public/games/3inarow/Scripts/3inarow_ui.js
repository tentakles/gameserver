var game;
var needsRestart = false;

var RESULT_DRAW = 0;
var RESULT_WIN = 1;
var RESULT_CONTINUE = 2;
var RESULT_ILLEGAL = 3;

function move_completed(event) {

    if (event.x && event.y) {
        var col = $("#" + event.y + "_" + event.x);
        col.html(event.currentPlayer).hide().fadeIn("slow");
    }

    if (event.result === RESULT_DRAW) {
        $("#result").addClass("highlight");
        $("#result").html("Table full. Nobody wins");
        needsRestart = true;
    }
    else if (event.result === RESULT_WIN) {
        $("#result").addClass("highlight");
        $("#result").html(event.currentPlayer + " wins!");
        needsRestart = true;
    }
    else if (event.result === RESULT_CONTINUE) {
        $("#result").html(event.currentPlayer + "´s turn");
    }
    else if (event.result === RESULT_ILLEGAL) {
        $("#result").html("Illegal move! This should not happen?");
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





    //if (!game.can_move(coords[0], coords[1])) {
    //    return;
    //}
    //$(this).html(game.currentPlayer).hide().fadeIn("slow");
    //var result = game.move(coords[0], coords[1]);    
    //if (result === game.RESULT_DRAW) {
    //    needsRestart = true;
    //    $("#result").addClass("highlight");
    //    $("#result").html("Table full. Nobody wins");
    //	game.switchPlayers();
    //}
    //else if (result === game.RESULT_WIN) {
    //    needsRestart = true;
    //    $("#result").addClass("highlight");
    //    $("#result").html(game.currentPlayer + " wins!");
    //	game.switchPlayers();
    //}
    //else if (result === game.RESULT_ILLEGAL) {
    //    alert("Illegal move! This should not happen?");
    //}
    //else {
    //    $("#result").html(game.currentPlayer + "´s turn");
    //}
}

$(function () {
    var config = {
        size: 3,
        numToWin: 3
    };

    ////   alert(viewModel);
    //   game = new threeinarow(config);

    gameLobby.registerGameEventCallback(move_completed);

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

    // $("#result").html(game.currentPlayer + "´s turn");

    $("td").click(try_move);
});