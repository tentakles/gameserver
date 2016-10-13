var game;
var needsRestart = false;

function try_move() {
    if (needsRestart) {
        $("#result").removeClass("highlight");
        $("#result").html("");
        $("td").html("");
        needsRestart = false;
        game.init();
    }

    var id = $(this).attr('id');
    var coords = id.split("_");

    if (!game.can_move(coords[0], coords[1])) {
        return;
    }
    $(this).html(game.currentPlayer).hide().fadeIn("slow");
	var result = game.move(coords[0], coords[1]);    
    if (result === game.RESULT_DRAW) {
        needsRestart = true;
        $("#result").addClass("highlight");
        $("#result").html("Table full. Nobody wins");
		game.switchPlayers();
    }
    else if (result === game.RESULT_WIN) {
        needsRestart = true;
        $("#result").addClass("highlight");
        $("#result").html(game.currentPlayer + " wins!");
		game.switchPlayers();
    }
    else if (result === game.RESULT_ILLEGAL) {
        alert("Illegal move! This should not happen?");
    }
    else {
        $("#result").html(game.currentPlayer + "´s turn");
    }
}

$(function () {
    var config = {
        size: 3,
        numToWin: 3
    };

    game = new threeinarow(config);
    game.init();

    var gamegrid = "<table>"
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
    $("#result").html(game.currentPlayer + "´s turn");
    $("td").click(try_move);
});