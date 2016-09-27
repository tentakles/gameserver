
function GameLobbyViewModel(socket) {

    var self = this;

    /*******************
     ***  Variabler  ***
     *******************/

    self.title = ko.observable("Mitt fina namn");
    self.showGame = ko.observable(false);
	self.startMode=ko.observable(true);		
	self.lobbyMode=ko.observable(false);	
	self.nickname=ko.observable("");
	self.chatRow=ko.observable("");	
	self.chats=ko.observableArray([]);
	
    /********************************************
    Initialisering
    *********************************************/

    //initierar vymodellen
    self.init = function () {	
       socket.on('chat', function(data){
	   self.chats.push(data);
   // $('#chat').append('<div id="">'+data.line+'</div>');
	// $('#chat').animate({ scrollTop: $('#chat').prop("scrollHeight") }, 500); 
  });
	 /*
	 
	   socket.on('chat', function(data){
    $('#chat').append('<div id="">'+data.line+'</div>');
	 $('#chat').animate({ scrollTop: $('#chat').prop("scrollHeight") }, 500); 
  });

  $(document).ready(function(){
    $('#send').click(function(e){
      socket.emit('client_data', {'line': $("#text").val()  });
	  $("#text").val(""); 
    });
  });
	 
	 */
	 
	 
    }

    self.init();	
	
	self.submitChat=function(){	
	 socket.emit('client_data', {'line':self.chatRow(),'user':self.nickname() });	 
	 self.chatRow("");
	};
	
	self.submitNickname=function(){	
	self.startMode(false);
	self.lobbyMode(true);
	}
}

