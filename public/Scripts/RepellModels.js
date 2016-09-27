
function PlayerModel(name, c, drops) {
    var self = this;
    self.Name = ko.observable(name);
    self.Items = ko.observableArray([]);
    self.Pos = -1;
    self.Drops = ko.observable(drops);
    self.Color = ko.observable(c);
 	self.TargetSize=12;
	
	self.Targeted=true;
	self.setSize=function(){
	self.Size = self.TargetSize*10;
	};
	
	self.setSize();
	
	self.TargetX=0;
	self.TargetY=0;	
	self.X=0;
	self.Y=0;
	
	self.approachTarget=function(){	
		var scaleFactor=8;
		var diff = Math.abs(self.Size-self.TargetSize);
		var resize=Math.ceil(diff/scaleFactor);

		var xdiff = Math.abs(self.X-self.TargetX);
		var xresize=Math.ceil(xdiff/scaleFactor);

		var ydiff = Math.abs(self.Y-self.TargetY);
		var yresize=Math.ceil(ydiff/scaleFactor);

		if(self.Size<self.TargetSize)
			self.Size+=resize;
		else if(self.Size>self.TargetSize)
			self.Size-=resize;	

		if(self.X<self.TargetX)
			self.X+=xresize;
		else if(self.X>self.TargetX)
			self.X-=xresize;	
			
		if(self.Y<self.TargetY)
			self.Y+=yresize;
		else if(self.Y>self.TargetY)
			self.Y-=yresize;					
	};

    self.ItemSum = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.Items().length; i++) {
            sum += self.Items()[i].Value;
        }
        return sum;
    });
}

function ItemModel(c, v, p) {
	var self = this;
	self.Color = ko.observable(c);
    self.Value = v;
    self.Pos = p;
    self.Size = 7;
	self.TargetSize = 7;
	self.Targeted=true;
	self.clone=function(){
	return new ItemModel(self.Color(), self.Value, self.Pos);
	};
	
	self.TargetX=0;
	self.TargetY=0;	
	self.X=0;
	self.Y=0;
	
	self.approachTarget=function(){	
		var scaleFactor=8;
		var diff = Math.abs(self.Size-self.TargetSize);
		var resize=Math.ceil(diff/scaleFactor);

		var xdiff = Math.abs(self.X-self.TargetX);
		var xresize=Math.ceil(xdiff/scaleFactor);

		var ydiff = Math.abs(self.Y-self.TargetY);
		var yresize=Math.ceil(ydiff/scaleFactor);

		if(self.Size<self.TargetSize)
			self.Size+=resize;
		else if(self.Size>self.TargetSize)
			self.Size-=resize;	

		if(self.X<self.TargetX)
			self.X+=xresize;
		else if(self.X>self.TargetX)
			self.X-=xresize;	
			
		if(self.Y<self.TargetY)
			self.Y+=yresize;
		else if(self.Y>self.TargetY)
			self.Y-=yresize;					
	};
}


function LogicData(){

this.board=null;
this.items=null;
this.players=null;
this.currentPlayer=null;
this.rows=null;
this.cols=null;

}