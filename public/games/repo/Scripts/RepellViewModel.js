
function RepellViewModel(canvaselement) {

    var self = this;

    /*******************
     ***  Variabler  ***
     *******************/

    self.EVENT_SELECT = 0;

    self.rows = 12;
    self.cols = 12;
    self.activeObjectColor="yellow";
    self.canvasDrawer = null;

    self.status = ko.observable("");
    self.currentPlayer = ko.observable(null);

    self.players = ko.observableArray([]);
    self.items = [];

    /*******************
    ***    Metoder   ***
    *******************/

    self.ItemSum = function (items) {
        var sum = 0;
        for (var i = 0; i < items.length; i++) {
            sum += items[i].Value;
        }
        return sum;
    };

    self.getColFromPos = function (pos) {
        return pos % self.cols;
    }

    self.getRowFromPos = function (pos) {
        return Math.floor(pos / self.cols);
    }

    self.positionOutOfBounds = function (pos) {
        return (pos < 0 || pos >= self.board.length)
    }

    self.approachTarget = function (item) {

        var scaleFactor = 8;
        var diff = Math.abs(item.Size - item.TargetSize);
        var resize = Math.ceil(diff / scaleFactor);

        var xdiff = Math.abs(item.X - item.TargetX);
        var xresize = Math.ceil(xdiff / scaleFactor);

        var ydiff = Math.abs(item.Y - item.TargetY);
        var yresize = Math.ceil(ydiff / scaleFactor);

        if (item.Size < item.TargetSize)
            item.Size += resize;
        else if (item.Size > item.TargetSize)
            item.Size -= resize;

        if (item.X < item.TargetX)
            item.X += xresize;
        else if (item.X > item.TargetX)
            item.X -= xresize;

        if (item.Y < item.TargetY)
            item.Y += yresize;
        else if (item.Y > item.TargetY)
            item.Y -= yresize;
    };

    //ritar upp spelplanen
    self.drawGame = function () {

        var i = 0;
        var x = 0;
        var y = 0;

        console.log(self.canvasDrawer.width + " " + self.canvasDrawer.height);

        var xs = (self.canvasDrawer.width / self.cols);
        var ys = (self.canvasDrawer.height / self.rows);
        var textoffsetx = xs / 2;
        var textoffsety = ys / 2;

        for (i = 0; i < self.board.length; i++) {

            var xo = x * xs;
            var yo = y * ys;

            var obj = self.board[i];

            var bgColor = self.getBgColor(i);

            self.canvasDrawer.rect(xo, yo, xs, ys, bgColor);
            //self.canvasDrawer.text(i, xo + textoffsetx, yo + textoffsety, "black");
            self.canvasDrawer.text(obj.Num, xo + textoffsetx, yo + textoffsety, "black");

            if ((i + 1) % self.cols == 0 && i > 0) {
                y++;
                x = 0;
            }
            else {
                x++;
            }
        }

        var needRedraw = false;

        //todo sortera things på storlek
        for (i = 0; i < self.items.length; i++) {
            var item = self.items[i];

            if (!self.positionOutOfBounds(item.Pos)) {


                self.canvasDrawer.circle(item.X, item.Y, item.Size, item.Color);

                if (item.TargetX != item.X || item.TargetY != item.Y || item.Size != item.TargetSize) {
                    self.approachTarget(item);
                    needRedraw = true;
                }
            }

        }

        if (needRedraw) {
            setTimeout(self.drawGame, 1000 / 60);
        }
    }

    //omvandlar ett musevent till en position på brädet, och kör metoden som omvandlar ett markering på brädet till en händelse
    self.handleClick = function (e) {

        var x = e.offsetX;
        var y = e.offsetY;

        var xunit = (self.canvasDrawer.width / self.cols);
        var yunit = (self.canvasDrawer.height / self.rows);

        var xx = Math.floor(x / xunit);
        var yy = Math.floor(y / yunit);

        var i = xx + (yy * self.cols);
        //console.log("klick på ruta: " + i);

        var data = { type: self.EVENT_SELECT, position: i };
        gameLobby.gameEvent(data);
    }

    self.initGame = function (item, event) {
    }

    //hämtar bakgrundsfärg för en tile
    self.getBgColor = function (index) {

        var obj = self.board[index];

        var bgColor = obj.Color;

        if (self.currentPlayer.Pos == index)
            bgColor = self.currentPlayer.Color;
        if (self.oldpos == index && self.playerHasPlacedMovedTarget && !self.gameOver)
            bgColor = self.activeObjectColor;
        if (self.errorPos == index)
            bgColor = self.errorColor;

        return bgColor;
    }

    self.game_event = function (event) {
        console.log("Game event");

        if (event) {
            console.log(event);

            self.board = event.board;
            self.items = event.items;
            self.status(event.status);
            self.players(event.players);

            self.playerHasPlacedMovedTarget = event.playerHasPlacedMovedTarget;
            self.gameOver = event.gameOver;
            self.oldpos = event.oldpos;

            for (var i = 0; i < event.players.length; i++) {
                if (event.players[i].IsCurrentPlayer)
                    self.currentPlayer = event.players[i];
            }

            self.drawGame();
        }

    }

    /********************************************
    Initialisering
    *********************************************/

    self.setup_game = function (config) {
        console.log("Setup game");
        console.log(config);
    }

    //initierar vymodellen
    self.init = function () {
        canvaselement.click(self.handleClick);
        self.canvasDrawer = new CanvasDrawer(canvaselement);
    }

    self.init();
}

