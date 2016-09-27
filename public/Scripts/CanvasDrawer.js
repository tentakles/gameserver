function CanvasDrawer(canvaselement) {

    var self = this;

    self.canvas = null;
    self.width = null;
    self.height = null;

    self.circle = function (x, y, r, c) {
        self.canvas.beginPath();
        self.canvas.fillStyle = c;
        self.canvas.arc(x, y, r, 0, Math.PI * 2, true);
		self.canvas.fill();
		self.canvas.stroke();
        self.canvas.closePath();       
    }

    self.rect = function (x, y, w, h, c) {
		self.canvas.beginPath();
        self.canvas.rect(x, y, w, h);
        self.canvas.fillStyle = c;
        self.canvas.fillRect(x, y, w, h)
        self.canvas.stroke();
	    self.canvas.closePath();  
    }

    self.text = function (text, x, y, c) {
        self.canvas.fillStyle = c;
        self.canvas.fillText(text, x, y);
    }

    self.clear = function () {
        self.canvas.clearRect(0, 0, self.width, self.height);
    }

    self.init = function () {
        self.canvas = canvaselement[0].getContext("2d");
        self.width = canvaselement.width();
        self.height = canvaselement.height();
    }

    self.init();
}
