//todo: include CONFIG 
var PORT = 9999;

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: PORT });

var clients = [];

//Only one target.
var target = null;

var count = 0;

wss.on('connection', function connection(ws) {
	console.log("Connection "+ws);
	
	var id = null;

 	ws.on('message', function incoming(message) {

		console.log("["+id+"] msg "+ message);

 		payload = JSON.parse(message);
 		if(payload.type==='remote'){
 			if(target===null){
 				console.log("Client tried connecting as remote, but there is no target.");
 				ws.send(JSON.stringify({'error':'No screen'}));
 				ws.close();
 			}else{
 				count++;
				ws.send(JSON.stringify({'id':count}));
				id = count;

				console.log("["+id+"] Connected as remote! ");

				clients[id] = ws;
				ws._id = id;
 			}

 		}else if(payload.type==='screen'){
 			closeScreen();
 			id = "SCREEN";
 			ws._id = id;
 			target = ws;
 		}else{
 			if(payload.action!==undefined){
 				if(target===null){
 					closeRemote(ws,'No screen');
 				}else{
 					//todo parse!
 					target.send(message);
 				}
 			}else{

				console.log("["+id+"] Bad message");
 			}
 		}
 		
	});

	ws.on('error', function error(){
		console.log("["+id+"] Error! ");
		clients[id] = undefined;
	});

	ws.on('close', function close(){
		console.log("["+id+"] Closed! ");
		if(id=="SCREEN"){
			closeScreen();
		}
		clients[id] = undefined;
	});
});

function closeRemote(client, reason){
	if(client!==undefined){
		console.log("["+client._id+"] Closing remote ("+reason+")");
		clients[id] = undefined;
		client.send(JSON.stringify({'error':'"+reason+"'}));
		client.close();
	}
}

function closeScreen(){
	if(target!==null){
		target.close();
		//close all remotes
		for( key in clients ){
			var client = clients[key];
			closeRemote(client, 'Screen closed');
		}
	}
}
