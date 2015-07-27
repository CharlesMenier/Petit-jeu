/**							**/
/**		GLOBAL VARIABLES	**/
/**							**/

var FPS			= 60;
var INTERVAL	= 1000/FPS;		//ms
var STEP		= INTERVAL/1000	//seconds
var MAXPLAYERS	= 10;
var NBPLAYER	= 0;

var onlinePlayers = [];
var player = {};
var camera = {};

var socket;