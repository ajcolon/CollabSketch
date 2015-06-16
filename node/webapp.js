var express = require('express');
var http = require('http');
var socketio = require('socket.io')(http);
var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);
var port = 1337;


app.use( express.static(__dirname+'/../app') );

//io
var strokes = [];
var clients = [];
var colors = ["#E87511", "#999999","#428bca","#5cb85c","#5bc0de","#f0ad4e","#d9534f","#76A23F","#C83000","#005AC9","#00A3AE"];


io.on('connection', function(client){
  console.log('a user connected: '+ client.id);
  var clientInfo = {color:colors[clients.length], id:client.id}
  clients.push(clientInfo);
  client.emit("clientInfo",clientInfo);
  client.on('clientName', onClientName);
  client.emit("allstrokes",strokes);
  client.on('disconnect', onClientDisconect);
  client.on('newPoint', newPoint);
  client.on('newStroke', newStroke);
  client.on('clearstrokes', clearstrokes);
});

function getClientIndexById(id){
  var clientIndex = null;
  for(var c=0; c< clients.length; c++){
    var client = clients[c];
    if(client.id === id){
      clientIndex = c;
    }
  }
  return clientIndex;
}

function onClientName(clientName){
  console.log("ClientName: "+ clientName);
  var clientId = getClientIndexById(this.id);
  clients[clientId].name = clientName;
  this.emit("clientsUpdate",clients);
  this.broadcast.emit("clientsUpdate",clients);
  console.log("Broadcasting clients: "+clients.length);
}

function newPoint(point){
  console.log("newpoint");
    strokes.push(point);
    this.broadcast.emit("drawNewPoint",point);
}

function newStroke(newStroke){
    console.log("New strokes By: "+ this.id);
    strokes.push(newStroke);
    this.broadcast.emit("drawNewStroke",newStroke);
}

function clearstrokes(){
    console.log('Current strokes: '+ strokes.length);
    strokes= [];
    console.log('Clear strokes Triggered By: '+ this.id);
    console.log('Clear strokes: '+ strokes.length);
    this.broadcast.emit("clearAllstrokes",null);
}

function onClientDisconect(){
    console.log('user disconnected: '+ this.id);
    for (var c=0;c<clients.length;c++){
      var client = clients[c];
      if(client.id === this.id){
        var index = clients.indexOf(client);
        if(index >=0){
          clients.splice(index,1);
          this.broadcast.emit("clientsUpdate",clients);
        }
      }
    }
}

server.listen(port, function() {
   console.log("Server listening on port: "+port);
});

