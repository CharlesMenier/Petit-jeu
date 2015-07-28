/**											**/
/**		File containing definition for		**/
/**		all the game classes				**/

	//wrapper for the game "classes", "methods" and "objects"
Game	= {};

/*************************************************************************/
/**							RECTANGLE									**/	
/*************************************************************************/

//wrapper for Rectangle class
(function(){
	function Rectangle(left, top, width, height)
	{
		this.left	= left || 0;
		this.top	= top || 0;
		this.width	= width || 0;
		this.height	= height || 0;
		this.right	= this.left + this.width;
		this.bottom	= this.top + this.height;
	}
	
	Rectangle.prototype.set = function(left, top, /*optional*/width, /*opttional*/height)
	{
		this.left	= left;
		this.top	= top;
		this.width	= width || this.width;
		this.height	= height || this.height;
		this.right	= this.left + this.width;
		this.bottom	= this.top + this.height;
	}
	
	Rectangle.prototype.within = function(r)
	{
		return	(r.left <= this.left &&
				 r.right >= this.right &&
				 r.top <= this.top &&
				 r.bottom >= this.bottom);
	}
	
	Rectangle.prototype.overlaps = function(r)
	{
		return 	(this.left < r.right && 
				 r.left < this.right && 
				 this.top < r.bottom &&
				 r.top < this.bottom);
	}
	
	Game.Rectangle = Rectangle;
	
})();



/*************************************************************************/
/**								CAMERA									**/	
/*************************************************************************/

//wrapper for Camera class
(function(){
	
	var AXIS = {
		NONE: "none",
		HORIZONTAL: "horizontal",
		VERTICAL: "vertical",
		BOTH: "both"
	};
	
	//constructor
	function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight)
	{
		//position left-top coordinates
		this.xView = xView || 0;
		this.yView = yView || 0;
		
		//distance from followed object to border before camera starts moving
		this.xDeadZone = 0;		//min distance to horizontal borders
		this.yDeadZone = 0;		//min distance to vertical borders
		
		//viewport dimensions
		this.wView = canvasWidth;
		this.hView = canvasHeight;
		
		//allow camera movements in both axis (for future changes or bonuses)
		this.axis = AXIS.BOTH;
		
		//object followed (player)
		this.followed = null;
		
		//rectangle to represent the wiewport
		this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);
		
		//rectangle to represent the world
		this.worldRect = new Game.Rectangle(0, 0, worldWidth, worldHeight);
	}
	
	// set the followed object and the deadzones for borders
	Camera.prototype.follow = function(object, xDeadZone, yDeadZone)
	{
		this.followed = object;
		this.xDeadZone = xDeadZone;
		this.yDeadZone = yDeadZone;
	}
	
	Camera.prototype.update = function()
	{
		//follow the object if set up
		if(this.followed != null)
		{
			//camera horizontal movement
			if(this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH)
			{
				if(this.followed.pos.x - this.xView  + this.xDeadZone > this.wView)
					this.xView = this.followed.pos.x - (this.wView - this.xDeadZone);
				else if(this.followed.pos.x  - this.xDeadZone < this.xView)
					this.xView = this.followed.pos.x  - this.xDeadZone;
			}
			
			//camera vertical movement
			if(this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH)
			{
				if(this.followed.pos.y - this.yView + this.yDeadZone > this.hView)
					this.yView = this.followed.pos.y - (this.hView - this.yDeadZone);
				else if(this.followed.pos.y - this.yDeadZone < this.yView)
					this.yView = this.followed.pos.y - this.yDeadZone;
			}
		}
		
		this.viewportRect.set(this.xView, this.yView);
		
		if(!this.viewportRect.within(this.worldRect))
		{
			if(this.viewportRect.left < this.worldRect.left) 		this.xView = this.worldRect.left;
			if(this.viewportRect.top < this.worldRect.top)			this.yView = this.worldRect.top;
			if(this.viewportRect.right > this.worldRect.right)		this.xView = this.worldRect.right - this.wView;
			if(this.viewportRect.bottom > this.worldRect.bottom)	this.yView = this.worldRect.bottom - this.hView;
		}
	}
	
	Game.Camera = Camera;
	
})();



/*************************************************************************/
/**								PLAYER									**/	
/*************************************************************************/

//wrapper for player class
(function(){
	
	function Player(x, y, id)
	{
		//the game in which the player is in
		this.game = null;
		
		//default name for the player
		this.id = id || 'Player'+NBPLAYER;
		
		//default color is yellow
		this.color = 'yellow';
		
		//the position of the player in the world
		// (x, y) = center
		this.pos = { 
			x : x,
			y : y
		};
		
		//the player movements
		this.move = {
			x: 0,
			y: 0
		};
		
		//size of the player
		this.size = {
			width	: 15,
			height 	: 15
		};
		
		//acceleration in pixels/frame
		this.accelerate	= 150;
		
		// speed limit
		// pixels/frame
		// 120p/s at 60fps
		this.speed = 2;
		
		//friction coeeficient
		this.friction = 0.98;
		
		//current message that is displayed
		this.message = '';
		
		//Duration of the message's display in ms
		this.displayTime = 5000;
		
		//direction of the player for the rockets
		//default movement is right direction (1,0)
		this.lastMove = {
			x 	: 1, 
			y	: 0
		};
		
		//rockets of the player
		this.rockets = [];
		
		//speed at which the player can fire rockets
		this.shotSpeed = 400;
		
	}
	
	Player.prototype.update = function(step, worldWidth, worldHeight)
	{
		//step parameter = time between frames ( in seconds )
		
		//save the old position
		var oldX = this.pos.x;
		var oldY = this.pos.y;
		
		// check controls and move the player accordingly
		if(Game.controls.up && this.move.y > -this.speed) 			this.move.y -= this.accelerate * step /30;
		else if(Game.controls.up && this.move.y <= -this.speed)		this.move.y = -this.speed;
		if(Game.controls.down && this.move.y < this.speed)			this.move.y += this.accelerate * step /30;
		else if(Game.controls.down && this.move.y >= this.speed)	this.move.y = this.speed;
		if(Game.controls.left && this.move.x > -this.speed) 		this.move.x -= this.accelerate * step /30;
		else if(Game.controls.left && this.move.y <= -this.speed)	this.move.x = -this.speed;
		if(Game.controls.right && this.move.x < this.speed)			this.move.x += this.accelerate * step /30;
		else if(Game.controls.right && this.move.y >= this.speed)	this.move.x = this.speed;
		
		// get the direction of the player
		var dir = { x : (this.pos.x - oldX)/this.accelerate, y : (this.pos.y - oldY)/this.accelerate };
		
		this.pos.x += this.move.x * this.accelerate * step;
		this.pos.y += this.move.y * this.accelerate * step;
		
		this.move.x *= this.friction;
		this.move.y *= this.friction;
		
		// save the current movement if there is one as the last move
		if(dir.x !== 0 || dir.y !== 0) 			this.lastMove = { x: dir.x, y: dir.y };
		
		// else if both axis differences are null, direction for rockets is the last move
		if(dir.x === 0 && dir.y === 0) 			dir = { x: this.lastMove.x, y: this.lastMove.y };
		
		//if(kb.keyCodes[kb.ALIAS['space']])	this.createRocket(this.pos.x, this.pos.y, 5, dir);
		
		// don't let the player leave the world's bondary
		if(this.pos.x - this.size.width/2 < 0)				this.pos.x = this.size.width/2;
		if(this.pos.y - this.size.height/2 < 0)				this.pos.y = this.size.height/2;
		if(this.pos.x + this.size.width/2 > worldWidth)		this.pos.x = worldWidth - this.size.width/2;
		if(this.pos.y + this.size.height/2 > worldHeight)	this.pos.y = worldHeight - this.size.height/2;
		
		return (oldX != this.pos.x || oldY != this.pos.y) ? true : false;	
	}
	
	Player.prototype.draw = function(ctx, xView, yView) 
	{
		// save the current context
		ctx.save();
		
		// set the player color as the current fillstyle
		ctx.fillStyle = this.color;
		
		// draw the player with converted world position to canvas position
		ctx.fillRect(	(this.pos.x - this.size.width/2) - xView,
						(this.pos.y - this.size.height/2) - yView,
						this.size.width,
						this.size.height
					);
		
		//draw the id/name
		ctx.fillText(	this.id,
						(this.pos.x - this.size.width/2) - xView + this.size.width/2,
						(this.pos.y - this.size.height/2) - yView - this.size.height/2
					);
					
		//DEBUG : draw the position of the player
		/*ctx.fillText(	'x='+this.pos.x+', y='+this.pos.y,
						(this.pos.x - this.size.width/2) - xView + this.size.width/2,
						(this.pos.y - this.size.height/2) - yView - this.size.height/2
					);
		ctx.fillText(	'top='+camera.yView+' left='+camera.xView+' right='+camera.xView+camera.wView,
						(this.pos.x - this.size.width/2) - xView,
						(this.pos.y - this.size.height/2) - yView + this.size.height + 5
					);*/
		
		//draw the message if there is one
		if(this.message !== '')
		{
			var self = this;
			ctx.fillStyle = 'white';
			ctx.fillText(	this.message,
							(this.pos.x - this.size.width/2) - xView,
							(this.pos.y - this.size.height/2) - yView - this.size.height*1.5
						);
						
			setTimeout(function(){
				self.message = '';
				socket.emit('msg', { id:self.id, msg: '' } );
			}, self.displayTime);
		}
					
		/*for(var i = 0; i < this.rockets.length; ++i)
		{
			var rocket = this.rockets[i];
			rocket.pos.x += rocket.direction.x * (rocket.speed);
			rocket.pos.y += rocket.direction.y * (rocket.speed);
			ctx.fillStyle = 'black';
			ctx.fillRect(rocket.pos.x - rocket.size.x/2, rocket.pos.y - rocket.size.y/2, rocket.size.x, rocket.size.y);
		}*/
		
		ctx.restore();
	}
	
	Game.Player = Player;
	
})();



/*************************************************************************/
/**								MAP										**/	
/*************************************************************************/

//wrapper for the map class
(function(){
	
	function Map(width, height)
	{
		// map dimensions
		this.width 	= width;
		this.height = height;
		
		//map texture
		this.image	= null;
	}
	
	Map.prototype.generate = function(color1, color2)
	{
		var ctx	= document.createElement("canvas").getContext("2d");
		ctx.canvas.width 	= this.width;
		ctx.canvas.height 	= this.height;
		
		var rows 	= ~~(this.width/44) + 1;
		var colums	= ~~(this.height/44) + 1;
		
		var color	= color1;
		ctx.save();
		ctx.fillStyle = color;
		
		for(var x = 0, i = 0; i < rows; x += 44, ++i)
		{
			ctx.beginPath();
			for(var y = 0, j = 0; j < colums; y += 44, ++j)
				ctx.rect(x, y, 40, 40);
			color = (color === color1 ? color2 : color1);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.closePath();
		}
		ctx.restore();
		
		//store the generate map as this image texture
		this.image = new Image();
		this.image.src = ctx.canvas.toDataURL("images/png");
		
		//clear context
		ctx = null;
	}
	
	Map.prototype.draw = function(ctx, xView, yView)
	{
		//easiest way : draw the entire map changing only the destination coordinate in canvas
		//ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height);
		
		// OR
		var sx, sy, dx, dy;
		var sWidth, sHeight, dWidth, dHeight;
		
		// offset point to crop the image
		sx = xView;
		sy = yView;
		
		// dimensions of cropped image			
		sWidth =  ctx.canvas.width;
		sHeight = ctx.canvas.height;

		// if cropped image is smaller than canvas we need to change the source dimensions
		if(this.image.width - sx < sWidth){
			sWidth = this.image.width - sx;
		}
		if(this.image.height - sy < sHeight){
			sHeight = this.image.height - sy; 
		}
		
		// location on canvas to draw the croped image
		dx = 0;
		dy = 0;
		// match destination with source to not scale the image
		dWidth = sWidth;
		dHeight = sHeight;									
		
		ctx.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
	}
	
	Game.Map = Map;
	
})();