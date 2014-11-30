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
  },

  WS_PORT: 9999
};

require.config(config);



require([
  'jquery',
  'app/car',
  'app/remote'

], function( $, Car, remote) {

	var KEYS_DOWN = [];

	remote.connect(function(event,data){
		if(event=="connected"){
			//test
			//ekran.close();
		}
	});

  
	$(document).ready(function(){

		init();
	    
		$("#gor").mousedown(function(){
       		KEYS_DOWN['up'] = true;
       		parsekeys();
		});
		$("#gor").mouseup(function(){
			KEYS_DOWN['up'] = false;
       		parsekeys();
		});
		$("#dol").mousedown(function(){
			KEYS_DOWN['down'] = true;
       		parsekeys();
		});
		$("#dol").mousedown(function(){
			KEYS_DOWN['down'] = false;
       		parsekeys();
		});
		$("#levo").mousedown(function(){
			KEYS_DOWN['left'] = true;
       		parsekeys();
		});
		$("#levo").mousedown(function(){
			KEYS_DOWN['left'] = false;
       		parsekeys();
		});
		$("#desno").mousedown(function(){
			KEYS_DOWN['right'] = true;
       		parsekeys();
		});
		$("#desno").mouseup(function(){
			KEYS_DOWN['right'] = false;
       		parsekeys();
		});
	});


    function init() {


       $(document).keydown(function(e){
       		switch(e.which){
       			case 37: // left
       			remote.action("left");
       			KEYS_DOWN['left'] = true;
		        break;

		        case 38: // up
       			remote.action("up");
       			KEYS_DOWN['up'] = true;
		        break;

		        case 39: // right
       			KEYS_DOWN['right'] = true;
		        break;

		        case 40: // down

       			KEYS_DOWN['down'] = true;
		        break;

		        default: return; // exit this handler for other keys
		    }
		    parsekeys();
		    e.preventDefault(); // prevent the default action (scroll / move caret)
       });

       $(document).keyup(function(e){

       		switch(e.which){
       			case 37: // left
       			KEYS_DOWN['left'] = false;
		        break;

		        case 38: // up

       			KEYS_DOWN['up'] = false;
		        break;

		        case 39: // right
       			KEYS_DOWN['right'] = false;
		        break;

		        case 40: // down

       			KEYS_DOWN['down'] = false;
		        break;

		        default: return; // exit this handler for other keys
		    }
		    parsekeys();
		    e.preventDefault(); // prevent the default action (scroll / move caret)
       });
     
    }; // init()
  
  	function parsekeys() {
  		if(KEYS_DOWN['up']&&!KEYS_DOWN['down']){
	    	if(KEYS_DOWN['right']&&!KEYS_DOWN['left']){
	    		remote.action("upright");
	    	}else if(!KEYS_DOWN['right']&&KEYS_DOWN['left']){
	    		remote.action("upleft");
	    	}else{
	    		remote.action("up");
	    	}
	    }else if(!KEYS_DOWN['up']&&KEYS_DOWN['down']){
	    	if(KEYS_DOWN['right']&&!KEYS_DOWN['left']){
	    		remote.action("downright");
	    	}else if(!KEYS_DOWN['right']&&KEYS_DOWN['left']){
	    		remote.action("downleft");
	    	}else{
	    		remote.action("down");
	    	}
	    }else{
	    	if(KEYS_DOWN['right']&&!KEYS_DOWN['left']){
	    		remote.action("stopright");
	    	}else if(!KEYS_DOWN['right']&&KEYS_DOWN['left']){
	    		remote.action("stopleft");
	    	}else{
	    		remote.action("stop");
	    	}
	    }
  	}




});