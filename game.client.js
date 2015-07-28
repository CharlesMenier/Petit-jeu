

/*************************************************************************/
/**								CONTROLS								**/	
/*************************************************************************/

Game.controls = {
	left	: false,
	up		: false,
	right	: false,
	down	: false,
	space	: false
};


/*************************************************************************/
/**							INITIALISATION								**/	
/*************************************************************************/

Game.play = function(canvas)
{	
	var context = canvas.getContext("2d");
	
	canvas.width = window.innerWidth - 20;
	canvas.height = window.innerHeight - 20;
		
	// setup an object to represent the room
	var room = {
		width	: 2000,
		height	: 1500,
		map		: new Game.Map(2000, 1500)
	};
	
	// generate the texture image for the room
	room.map.generate('#2A2B2B', '#2D2535');
	
	// setup player's origin random position
	var startX 	= Math.round(Math.random()*(room.width-5));
	var startY 	= Math.round(Math.random()*(room.height-5));
	player		= new Game.Player(startX, startY);
	
	// setup camera
	camera	= new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);
	camera.follow(player, canvas.width/2, canvas.height/2);
	
	// game update function
	var update = function()
	{
		var hasMoved = player.update(STEP, room.width, room.height);
		if(hasMoved)
		{
			socket.emit('move', { id: player.id, x: player.pos.x, y: player.pos.y } );
			camera.update();
		}
	}
	
	var draw = function()
	{
		
		// clear all the canvas
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		//redraw all the objects
		room.map.draw(context, camera.xView, camera.yView);
		player.draw(context, camera.xView, camera.yView);
		
		for(var i = 0; i < onlinePlayers.length; ++i)
		{
			onlinePlayers[i].draw(context, camera.xView, camera.yView);
		}
	}
	
	var init_timer = function()
	{
		setInterval(function()
		{
			_dt 		= new Date().getTime() - _dte;
			_dte 		= new Date().getTime();
			local_timer += _dt/1000.0;
		}, 4);
	}
	
		//Loop for the position/inputs/collisions
		// at 60fps
	var init_physics_loop = function()
	{
		setInterval(function()
		{
			update();
		}, INTERVAL);
	};
	
		//Loop for the rendering
		//draw all the objects
		// at 60fps
	var init_render_loop = function()
	{
			//Work out the delta time
		//dt = lastframetime ? ( (t - this.lastframetime)/1000.0).fixed() : 0.016;

			//Store the last frame time
		//lastframetime = t;
		
		setInterval(function()
		{
			draw();
		}, INTERVAL);
		
	};
		
	setEventListener(context);
	setIOHandler();
		
	init_physics_loop();
	init_render_loop();
	init_timer();
};


function _onKeyChange(e, value)
{
	switch(e.keyCode)
	{
		case 37: // left arrow
			Game.controls.left = value;
			break;
		case 38: // up arrow
			Game.controls.up = value;
			break;
		case 39: // right arrow
			Game.controls.right = value;
			break;
		case 40: // down arrow
			Game.controls.down = value;
			break;
	}
}

function _onResize(ctx)
{
	var width  = window.innerWidth - 20;
	var height = window.innerHeight - 20;
	ctx.canvas.width  = width;
	ctx.canvas.height = height;
	//ctx.translate(width/2,height/2);
}

function setEventListener(ctx)
{
	
	_onKeyDown	= function(event){ _onKeyChange(event, true); };
	_onKeyUp	= function(event){ _onKeyChange(event, false);};

	// bind keyEvents
	window.addEventListener("keydown", _onKeyDown, false);
	window.addEventListener("keyup", _onKeyUp, false);

	/*if(window.attachEvent) {
		window.attachEvent('onresize', _onResize(ctx));
	}
	else if(window.addEventListener) {
		window.addEventListener('resize', _onResize(ctx), true);
	}
	else {
		//The browser does not support Javascript event binding
		alert("Votre navigateur ne supporte pas les évènements.");
	}*/
}


function getPlayerFromId(id, array)
{
	for(var i = 0; i < array.length; ++i)
	{
		if(array[i].id === id)
			return array[i];
	}
	return false;
};
