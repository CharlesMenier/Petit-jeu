/**										**/
/**			SOCKET HANDLING				**/
/**										**/

function setIOHandler()
{
	socket = io();
	
		// Socket connection successful
	socket.on("connect", client_connect);
	
		//get the current game infos
	socket.on('get infos', client_get_infos);
	
		//get the current game infos
	socket.on('check infos', client_check_infos);
	
		//game is full
	socket.on('game full', client_game_full);

		// Socket to change the username
	socket.on("change name", client_change_name);
	
		// Socket disconnection
	//socket.on("disconnect", client_disconnect);

		// New player message received
	socket.on('new player', client_new_player);

		// Player move message received
	socket.on("move", client_move_player);

		// Player removed message received
	socket.on("remove player", client_remove_player);
	
		// Message received
	socket.on('msg', client_message_received);
	
		// Color change for a player
	socket.on('change color', client_change_color);
	
	// Rocket created by other player
	//socket.on('rocket', this.client_create_rocket.bind(this));
};

/*game.prototype.client_create_rocket = function(data)
{
	var p = this.getPlayer(data.id);
	if(!p)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	
	p.createRocket(p.pos.x, p.pos.y, data.speed, data.direction);
};*/


function client_message_received(data)
{
	var p = getPlayerFromId(data.id, onlinePlayers);
	if(!p)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	p.message = data.msg;
	setTimeout(function()
	{
		p.message = '';
		client_remove_message(data);
	}, p.displayTime);
};

function client_remove_message(data)
{
	socket.emit('msg', { id: data.id, msg: '' } );
};

function client_change_color(data)
{
	var p = getPlayerFromId(data.id, onlinePlayers);
	if(!p)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	p.color = data.color;
};

function client_connect()
{
	socket.emit('get infos', { id: player.id, x: player.pos.x, y: player.pos.y } );
};


function client_game_full(data)
{
	alert(data);
}

function client_check_infos(data)
{
		//we copy the data received from server locally
	MAXPLAYER	= data.MAXPLAYER;
	NBPLAYER	= data.NBPLAYER;
	local_timer = data.TIMER.time;
	_dt			= data.TIMER.dt;
	_dte		= data.TIMER.dte;
	
		//we clear the array for the check loop
	onlinePlayers = [];
	
		// we add all the other players to the local array
	for(var i = 0; i < data.PLAYERS.length; ++i)
	{
		var current = data.PLAYERS[i];
		if(current.id != player.id)
		{
			var p = new Game.Player(current.pos.x, current.pos.y, current.id);
			onlinePlayers.push(p);
		}
	}
};

function client_get_infos(data)
{
	client_check_infos(data);
	
		//we set a default name for the user
		//so that there is no double
	var p = getPlayerFromId('Player'+NBPLAYER, onlinePlayers);
	if(!p)	player.id = 'Player'+NBPLAYER;
	else	player.id = 'Player'+Math.floor((Math.random() * 30) + 10);
	
		//once all the data is acknowledged
		//the client tells the server he is ready
	socket.emit('new player', { id: player.id, x: player.pos.x, y: player.pos.y });
}

function client_change_name(data)
{
	var p = getPlayerFromId(data.id, onlinePlayers);
	if(p) p.id = data.newid;
}
/*
function client_disconnect()
{
	this.socket.emit('disconnect', this.localPlayer.id);
	console.log("Player disconnect");
};
*/
function client_new_player(data)
{
	console.log("New player connected : "+ data.id);
	var newP = new Game.Player(data.x, data.y, data.id);
	onlinePlayers.push(newP);
};

function client_remove_player(data)
{
	var playerToRemove = getPlayerFromId(data.id, onlinePlayers);
	if(!playerToRemove)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	
	console.log("Player disconnected : "+ data.id);
	onlinePlayers.splice(onlinePlayers.indexOf(playerToRemove), 1);
};

function client_move_player(data)
{
	var playerToMove = getPlayerFromId(data.id, onlinePlayers);
	if(!playerToMove)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	
	playerToMove.pos = { x: data.x, y: data.y };
};