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
    'pixi': {exports: 'PIXI'},
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
    pixi: 'lib/pixi',

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
	'jquery',
  'pixi'
], function( CONFIG, $,PIXI) {
	var cbck = null;
	var socket = null;
  var circles=[];
  var KEYS_DOWN = [];
  var ACTION = {};

	//connect();

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
        }else if(payload.action==="dif"){
          circles=payload.data;
          //drawCircles(circles);
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

    //drawing elements
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");

    function drawCircle(x,y,radius){
        ctx.beginPath();
        ctx.fillStyle = "#FE8E9D";
        ctx.fill();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.stroke();
    }
    function drawSquare(x,y,angle,width,height){
      ctx.translate(x,y);
      ctx.rotate(angle);
      ctx.fillStyle = 'blue';
      ctx.fillRect(width / -2, height / -2, width, height);
      ctx.rotate(-angle);
      ctx.translate(-x,-y);
    }

    //control car from terminal

    $(document).keydown(function(e){
          switch(e.which){
            case 37: // left
            KEYS_DOWN['left'] = true;
            break;

            case 38: // up
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
  
    function parsekeys() {
      if(KEYS_DOWN['up']&&!KEYS_DOWN['down']){
        if(KEYS_DOWN['right']&&!KEYS_DOWN['left']){
          console.log("action upright");
          //remote.action("upright");
        }else if(!KEYS_DOWN['right']&&KEYS_DOWN['left']){
          console.log("action upleft")
          //remote.action("upleft");
        }else{
          console.log("action up")
          //remote.action("up");
        }
      }else if(!KEYS_DOWN['up']&&KEYS_DOWN['down']){
        if(KEYS_DOWN['right']&&!KEYS_DOWN['left']){
          console.log("action downright")
          //remote.action("downright");
        }else if(!KEYS_DOWN['right']&&KEYS_DOWN['left']){
          console.log("action downleft")
          //remote.action("downleft");
        }else{
          console.log("action down")
          //remote.action("down");
        }
      }else{
        if(KEYS_DOWN['right']&&!KEYS_DOWN['left']){
          console.log("action stopright")
          //remote.action("stopright");
        }else if(!KEYS_DOWN['right']&&KEYS_DOWN['left']){
          console.log("action stopleft")
          //remote.action("stopleft");
        }else{
          console.log("action stop")
          //remote.action("stop");
        }
      }
    }

});