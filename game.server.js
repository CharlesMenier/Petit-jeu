var express 	= require('express');
var app			= express();
var http 		= require('http');
var server 		= http.Server(app);
var io 			= require('socket.io')(server);
//var UUID		= require('node-uuid');

require('./classes.js');

	//ARRAY CONTAINING ALL THE PLAYERS
	//FORM : socket -> player infos
	//ex : PLAYERS[<socket>] = {player1 object}
var PLAYERS 	= [];
var SOCKETS		= {};
var MESSAGES 	= {};
var MAXPLAYERS 	= 10;
var NBPLAYER	= 0;
var CHECK_FREQUENCY = 5000;		//check game variable every 5000ms

	//start listening on the port 3000
server.listen(3000, function(){ console.log('\t  Starting to listen on *: 3000..'); });

	//send the index file when someone connect
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

	//send all the other required files
app.get( '/*' , function( req, res, next ) {

		//This is the current file they have requested
	var file = req.params[0];

		//For debugging, we can track what files are requested.
	//console.log('\t :: Express :: file requested : ' + file);

		//Send the requesting client the file.
	res.sendFile( __dirname + '/' + file );

});

io.sockets.on('connection', function(client)
{	
	client.on('get infos', function(data)
	{
		if(NBPLAYER < MAXPLAYERS)
		{
				//we send the new player all the informations
			client.emit('get infos',
						{
							NBPLAYER 	: NBPLAYER+1,
							MAXPLAYERS	: MAXPLAYERS,
							PLAYERS		: PLAYERS
						});
		}
		else
		{
			client.emit('game full', 'Le jeu est plein.');
			client.disconnect();
		}
	});
		
		//change the name
	client.on('change name', function(data)
	{
		var p = getPlayer(data.id);
		if(!p) return;
		
		client.broadcast.emit('change name', {id:data.id, newid: data.newid});
		p.id = data.newid;
	});
	
	client.on('msg', function(data)
	{
		var p = getPlayer(data.id);
		if(!p) return;
		
		p.message = data.msg;
		if(data.msg != '')
		{
			console.log(data);
			var command		= data.msg.substr(0, 2);
			var msg			= data.msg.substr(3);
			switch(command)
			{
					//color change
				case '/c':
				console.log('color change');
					//var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(msg);
					if(true){ client.broadcast.emit('change color', { id: data.id, color: msg });
					console.log('ok');}
					break;
					
					//simple message
				default:
					client.broadcast.emit('msg', { id: p.id, msg: p.message } );
					break;
			}
		}
	});
	
	client.on('new player', function(data)
	{
		
			//we add the player to the server array
			//and the client socket in the server array
			//so that there is a link PLAYER[player] <-> SOCKET[player]
		var newPlayer = new Game.Player(data.x, data.y, data.id);
		SOCKETS[client.id] = newPlayer;
		PLAYERS.push(newPlayer);
	
			//we increment the number of players connected
		NBPLAYER++;
		console.log('\t :: Server :: New player connected (' + NBPLAYER + '/' + MAXPLAYERS + ')' );
	
			//the client is ready so we can tell
			//the others there is a new player
		client.broadcast.emit('new player', {id: data.id, x: data.x, y: data.y });		
	});
	
		//when a player move
	client.on('move', function(data){
		
		var movePlayer = getPlayer(data.id);
		if (!movePlayer) {
			console.log("Player not found: "+data.id);
			return;
		};

		movePlayer.pos = { x: data.x, y: data.y };
		client.broadcast.emit("move", {id: movePlayer.id, x: movePlayer.pos.x, y: movePlayer.pos.y });
	});
	
	/*
	client.on('rocket', function(data)
	{
		client.broadcast.emit('rocket', data);
	});
	*/
	
	client.on('disconnect', function()
	{
		if(NBPLAYER > 0)
		{
			NBPLAYER--;
			client.broadcast.emit('remove player', { id: SOCKETS[client.id].id });
			
			PLAYERS.splice(PLAYERS.indexOf(SOCKETS[client.id]), 1);
			delete SOCKETS[client.id];
		}
		
		if(NBPLAYER == 0)
		{
			SOCKETS = {};
			PLAYERS = [];
		}
	
		console.log('\t :: Server :: Player disconnected (' + NBPLAYER + '/' + MAXPLAYERS + ')' );
	});
	
	/*client.on('remove message', function(id)
	{
		var p = getPlayer(id);
		if (!p) {
			console.log("Player not found: "+id);
			return;
		};
		
		var msg = p.message;
		p.message = '';
		messages.splice(messages.indexOf(msg), 1);
	});*/
	
});

var init_check_loop = function()
{
	setInterval(function(){
		check_game_variables();			
	}, CHECK_FREQUENCY);
};

var check_game_variables = function()
{
	client.emit('check infos',
				{
						NBPLAYER 	: NBPLAYER,
						MAXPLAYERS	: MAXPLAYERS,
						PLAYERS		: PLAYERS
				});
};

var getPlayer = function(id)
{
	for(var i = 0; i < PLAYERS.length; ++i)
	{
		if(PLAYERS[i].id === id)
			return PLAYERS[i];
	}
	return false;
};

	//create a circle in the canvas
function fillCircle(x, y, r)
{
  var canvas = document.getElementById("canvas2");
  var context = canvas.getContext("2d");
  context.beginPath();
  context.fillStyle="#FF4422"
  context.arc(x, y, r, 0, 2 * Math.PI);
  context.fill();
}

init_check_loop();