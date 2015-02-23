//Config file

define([], function(){
return {

	LOCAL: true,

	SERVER_URL: LOCAL ?'localhost':'rgti.bigbuckduck.com',
	SERVER_PROTOCOL: 'http',
	SERVER_PORT: 9999,

	DEBUG: true
}});