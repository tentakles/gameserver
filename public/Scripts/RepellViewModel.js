
function RepellViewModel(appName, canvaselement) {

    var self = this;

    /*******************
     ***  Variabler  ***
     *******************/

    self.version = 0.2;
		
	self.rows = 12;
    self.cols = 12;
	
    self.canvasDrawer = null;
	self.logic=null;
	
    self.status = ko.observable("");
    self.showNumPlayers = ko.observable(false);
    self.showNamePlayers = ko.observable(false);
    self.showGame = ko.observable(false);
    self.appName = ko.observable(appName + " " + self.version);
    self.currentPlayer = ko.observable(null);
    self.numPlayers = ko.observable(2);
    self.numStartDrops = ko.observable(10);

    self.players = ko.observableArray([]);
    self.items = ko.observableArray([]);

    self.colors = ["brown", "blue", "green", "purple", "red", "white"];

    self.originalItems = [new ItemModel("grey", 3, 13),
            new ItemModel("grey", 3, 22),
            new ItemModel("black", 1, 52),
            new ItemModel("orange", 5, 55),
            new ItemModel("black", 1, 88),
            new ItemModel("black", 1, 91),
            new ItemModel("grey", 3, 121),
            new ItemModel("grey", 3, 130)];

    self.board = [{ Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" },
                { Num: 2, Color: "white" }, { Num: 4, Color: "lightblue" }, { Num: 6, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "lightblue" }, { Num: 1, Color: "white" },
                { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 3, Color: "lightgreen" }, { Num: 4, Color: "lightgreen" }, { Num: 6, Color: "lightgreen" }, { Num: 2, Color: "lightgreen" }, { Num: 3, Color: "lightgreen" }, { Num: 5, Color: "lightgreen" }, { Num: 6, Color: "lightgreen" }, { Num: 4, Color: "lightgreen" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" },
                { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "lightgreen" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 5, Color: "lightgreen" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" },
                { Num: 5, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "lightgreen" }, { Num: 5, Color: "white" }, { Num: 1, Color: "lightblue" }, { Num: 3, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "lightblue" }, { Num: 2, Color: "white" }, { Num: 5, Color: "lightgreen" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" },
                { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "lightgreen" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 5, Color: "lightgreen" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" },
                { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "lightgreen" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 2, Color: "lightgreen" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" },
                { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 6, Color: "lightgreen" }, { Num: 3, Color: "white" }, { Num: 5, Color: "lightblue" }, { Num: 1, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "lightblue" }, { Num: 6, Color: "white" }, { Num: 3, Color: "lightgreen" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" },
                { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 3, Color: "lightgreen" }, { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" }, { Num: 4, Color: "lightgreen" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" },
                { Num: 4, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "lightgreen" }, { Num: 5, Color: "lightgreen" }, { Num: 2, Color: "lightgreen" }, { Num: 3, Color: "lightgreen" }, { Num: 4, Color: "lightgreen" }, { Num: 6, Color: "lightgreen" }, { Num: 2, Color: "lightgreen" }, { Num: 5, Color: "lightgreen" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" },
                { Num: 5, Color: "white" }, { Num: 1, Color: "lightblue" }, { Num: 3, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 5, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "lightblue" }, { Num: 4, Color: "white" },
                { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, { Num: 6, Color: "white" }, { Num: 2, Color: "white" }, { Num: 4, Color: "white" }, { Num: 1, Color: "white" }, { Num: 3, Color: "white" }, { Num: 5, Color: "white" }, ];

    /*******************
    ***    Metoder   ***
    *******************/

    //ritar upp spelplanen
    self.drawGame = function () {

        var i = 0;
        var x = 0;
        var y = 0;

        var xs = (self.canvasDrawer.width / self.cols);
        var ys = (self.canvasDrawer.height / self.rows);
        var textoffsetx = xs / 2;
        var textoffsety = ys / 2;

        for (i = 0; i < self.board.length; i++) {

            var xo = x * xs;
            var yo = y * ys;

            var obj = self.board[i];

			var bgColor = self.logic.getBgColor(i);

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
		
		var needRedraw=false;
		
		//todo sortera things på storlek
		for (i = 0; i < self.items().length; i++) {
		var item =  self.items()[i];
		
		if(!self.logic.positionOutOfBounds(item.Pos)){
		var xo = self.logic.getColFromPos(item.Pos) * xs;	
        var yo = self.logic.getRowFromPos(item.Pos) * ys;

		var x= Math.floor(xo + (xs / 2));
		var y= Math.floor(yo + (ys / 2));
		
		if(item.TargetX!=x || item.TargetY!=y){
		item.TargetX=Math.floor(x);
		item.TargetY=Math.floor(y);
		item.Size=item.Size*3;
		}
				
		if(item.Targeted){
		//skip animation
		item.X=item.TargetX;
		item.Y=item.TargetY;
		item.Targeted=false;
		}
				
		self.canvasDrawer.circle(item.X, item.Y, item.Size, item.Color());

		if(item.TargetX!=item.X || item.TargetY!=item.Y || item.Size!= item.TargetSize){		
			item.approachTarget();			
			console.log("approaching after  " + item.X + " " +item.Y + " " +item.TargetX + " " +item.TargetX);					
			needRedraw=true;
			}
		}

		}
		
		if(needRedraw){
		setTimeout(self.drawGame,1000/60);
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

        self.logic.positionSelect(i);	
		self.status(self.logic.getStatus());
		self.drawGame();
    }
    
    //startar ett nytt spel
    self.initGame = function (item, event) {
       // self.items(JSON.parse(JSON.stringify(self.originalItems)));
		
		var items=[];
			//clone all items
		for(var i=0;i<self.originalItems.length;i++){
			items.push(self.originalItems[i].clone());
			}
			
		for(var i=0;i<self.players().length;i++){
			var p = self.players()[i];
			
			if(p.Name().toLowerCase()=="camilla"){
				p.Color("#F660AB");			
			}
			
			items.push(p);
			}
			
		self.items(items);
	
		var data = new LogicData();
		
		data.board=self.board;
		data.items=self.items;
		data.players=self.players;
		data.currentPlayer=self.currentPlayer;
		data.rows=self.rows;
		data.cols=self.cols;
	
		self.logic=new RepellLogic(data);
		
        var num = Math.floor(Math.random() * self.players().length);
        self.logic.selectUserByNum(num);
        
        self.logic.nextTurn();
		self.status(self.logic.getStatus());
        self.drawGame();
    }
	
	self.getNewPlayers =function(){
	    var list = [];
        for (var i = 0; i < self.numPlayers() ; i++){
            var p = new PlayerModel("Spelare " + (i + 1), self.colors[i], self.numStartDrops());
            list.push(p);
        }
		return list;
	}

    /********************************************
    Vy-hantering
    *********************************************/

	self.showViews=function(showNumPlayers,showNamePlayers,showGame){
		self.showNumPlayers(showNumPlayers);
        self.showNamePlayers(showNamePlayers);
        self.showGame(showGame);
	}
	
    //visar tredje vyn, själva spelet, samt startar spelet
    self.startGame = function (item, event) {
		self.showViews(false,false,true);
        self.initGame();
    };

    //visar andra vyn i spelstart-processen där man namnger användarna
    self.namePlayers= function (item, event) {
		self.showViews(false,true,false);
        self.players(self.getNewPlayers());
    };

    //visar första vyn i spelstart-processen
    self.configureGame = function () {
		self.showViews(true,false,false);
    }

    /********************************************
    Initialisering
    *********************************************/

    //initierar vymodellen
    self.init = function () {
        canvaselement.click(self.handleClick);
        self.canvasDrawer = new CanvasDrawer(canvaselement);
		self.configureGame();
    }

    self.init();
}

