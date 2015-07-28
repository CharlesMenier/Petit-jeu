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

	//TIMER VARIABLES
var local_timer	= 0.016;
var _dt			= new Date().getTime();
var _dte		= new Date().getTime();