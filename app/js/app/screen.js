//

require.config({
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  shim: {
    'underscore': {
      exports: '_'
    },

    'socketio': {
      exports: 'io'
    },

    'backbone': {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    }
  },
  paths: {

    socketio: 'lib/socketio',
    jquery: 'lib/jquery',
    underscore: 'lib/underscore',
    backbone: 'lib/backbone'
  }
});

//todo: enotni config fajli
var URL = 'ws://rgti.bigbuckduck.com';
var DEBUG = URL;//'ws://localhost';
var PORT = 9999;

define(["underscore", "backbone"], function(_, Backbone) {
  var socket = null;

  var cbck = null;

return {
    connect: function(_cbck){
      socket = new WebSocket(DEBUG+':'+PORT+'/');

      if(_cbck===undefined){
        cbck = function(e,p){};
      }else{
        cbck = _cbck;
      }

      socket.onopen = function(evt) { 
        console.log("OnOpen "+evt);
        socket.send(JSON.stringify({'type':'screen'}));
        cbck("open");
      }; 

      socket.onclose = function(evt) { 
        console.log("OnClose "+evt);
        cbck("close");
      };

      socket.onmessage = function(evt) { 
        console.log("MSG: "+evt.data);
        payload = JSON.parse(evt.data);
        if(payload.action!==undefined){
          cbck(payload.action,payload.id);
        }else{
          console.log("Error, bad type");
        }

      };

      socket.onerror = function(evt) { 
        console.log("Error: "+evt);
        cbck("error");
      };

    },


    close: function(){
      if(socket!==null){
        socket.close();
      }
    }

}});