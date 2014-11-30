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
var DEBUG = 'ws://localhost';
var PORT = 9999;

define(["underscore", "backbone"], function(_, Backbone) {
  var socket = null;
  var id = null;

return {
    connect: function(){
      socket = new WebSocket(DEBUG+':'+PORT+'/');

      socket.onopen = function(evt) { 
        console.log("OnOpen "+evt);
        socket.send(JSON.stringify({'type':'remote'}));
      }; 

      socket.onclose = function(evt) { 
        console.log("OnClose "+evt);
      };

      socket.onmessage = function(evt) { 
        console.log("MSG: "+evt.data);
        payload = JSON.parse(evt.data);
        if(payload.id!==undefined){
          id = payload.id;
          console.log("Connected as "+id);
        }else{
          console.log("Error, bad type");
        }

      };

      socket.onerror = function(evt) { 
        console.log("Error: "+evt);
      };

    },

    action: function(type){
      if(socket!==null){
        socket.send(JSON.stringify({'action':'"+type+"', 'id':'"+id+"'}));
      }
    }

}});