// Configure Require.js
var config = {
  shim: {
    'socketio': {
      exports: 'io'
    },
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    'stats': { exports: 'Stats' },
    // --- Use shim to mix together all THREE.js subcomponents
    'threeCore': { exports: 'THREE' },
    'BinaryLoader': { deps: ['threeCore'], exports: 'THREE' },
  },
  paths: {
    jquery: 'lib/jquery',
    socketio: 'lib/socketio',
    underscore: 'lib/underscore',
    backbone: 'lib/backbone',
    box2d: 'lib/box2d',
    gamejs: 'lib/gamejs.min',

    three: 'lib/three',
    threeCore: 'lib/three.min',
    BinaryLoader: 'lib/loaders/BinaryLoader',
    shaders: 'shaders',

    //
    stats: 'lib/stats.min',
  }
};

require.config(config);



require([
	'config',
	'jquery'
], function( CONFIG, $) {
	var cbck = null;
	var socket = null;

	connect();

	function connect(_cbck){
      socket = new WebSocket('ws://'+CONFIG.SERVER_URL+':'+CONFIG.SERVER_PORT+'/');

      if(_cbck===undefined){
        cbck = function(e,p){};
      }else{
        cbck = _cbck;
      }

      socket.onopen = function(evt) { 
        console.log("OnOpen "+evt);
        socket.send(JSON.stringify({'type':'remote'}));
        cbck("open");
      }; 

      socket.onclose = function(evt) { 
        console.log("OnClose "+evt);
        cbck("close");
      };

      socket.onmessage = function(evt) { 
        console.log("MSG: "+evt.data);
        payload = JSON.parse(evt.data);
        if(payload.id!==undefined){
          id = payload.id;
          console.log("Connected as "+id);
          cbck("connected");
        }else{
          console.log("Error, bad type");
        }

      };

      socket.onerror = function(evt) { 
        console.log("Error: "+evt);
        cbck("error");
      };

    }

    var action = function(type){
      if(socket!==null){

        console.log("action "+type);
        socket.send(JSON.stringify({'action':type, 'id':id}));
      }
    }

});