var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var express = require('express');

var app = express();


var http = require('http').Server(app);


http.listen(8001, function(){
  console.log('listening on *:8001');
});

app.use(express.static('public'));


var listener = io.listen(http);

listener.sockets.on('connection', function(socket){
  socket.on('client_data', function(data){
    console.log(data.line);
	 listener.sockets.emit('chat', {'line': data.line});	
  });
});

