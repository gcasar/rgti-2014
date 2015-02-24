//This file mixes CommonJS and RequireJS include formats so we can have the best of both worlds.
//All "common" code (shared between client and server) uses RequireJS format.

var requirejs = require('requirejs');

requirejs.config({
	paths: {
		box2d: '../shared/js/lib/box2d'
	}
});

var Box2D = requirejs('box2d');
var CONFIG = requirejs('../app/js/config');

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: CONFIG.SERVER_PORT });

var clients = [];
var count = 0;
var players=[];


wss.on('connection', function connection(ws) {
	console.log("Connection "+ws);
	
	var id = null;

 	ws.on('message', function incoming(message) {

		console.log("["+id+"] msg "+ message);

 		payload = JSON.parse(message);
 		if(payload.type==='remote'){

			count++;
			ws.send(JSON.stringify({'id':count}));
			id = count;

			console.log("["+id+"] Client connected!");

			clients[id] = ws;
			ws._id = id;

            players[id] = new Circle({'position':[10+Math.random()*800, 10]})

 		}
	});

	ws.on('error', function error(){
		console.log("["+id+"] Error! ");
		clients[id] = undefined;
	});

	ws.on('close', function close(){
		console.log("["+id+"] Closed! ");
		clients[id] = undefined;
	});
});
var box2d=Box2D;
var b2Vec2 = Box2D.b2Vec2
, b2BodyDef = Box2D.b2BodyDef
, b2Body = Box2D.b2Body
, b2FixtureDef = Box2D.b2FixtureDef
, b2Fixture = Box2D.b2Fixture
, b2World = Box2D.b2World
, b2MassData = Box2D.b2MassData
, b2PolygonShape = Box2D.b2PolygonShape
, b2CircleShape = Box2D.b2CircleShape
, b2DebugDraw = Box2D.b2DebugDraw
  ;
 
world = new b2World(
     new b2Vec2(0,10)    //gravity
  ,  true                 //allow sleep
);

function send(ws, payload){
	try{
		ws.send(payload);
	}catch( e ){
		//todo
	}
}


var update = function(){

    positions=[];
    for(var c in clients){
        var pos=[ players[c].body.GetWorldCenter().x , players[c].body.GetWorldCenter().y];
        positions.push(pos);
    }

	for( var k in clients ){


		send(clients[k], JSON.stringify({action:'dif',data:positions}));
	}

	world.Step(
         1 / 60   //frame-rate
      ,  10       //velocity iterations
      ,  10       //position iterations
   );
   world.ClearForces();
}

setInterval(update, 1000/60);


function radians(deg){
	return deg * Math.PI / 180;
}

function rotate(vec, angle){
	var theta = angle;


	var cs = Math.cos(theta);
	var sn = Math.sin(theta);

	var x = vec[0];
	var y = vec[0];

	var px = x * cs - y * sn; 
	var py = x * sn + y * cs;
	return [px,py];
}


function Circle(pars){
    //initialize body
    var def=new box2d.b2BodyDef();
    def.type = box2d.b2Body.b2_dynamicBody;
    def.position=new box2d.b2Vec2(pars.position[0], pars.position[1]);
    def.linearDamping=0.15;  //gradually reduces velocity, makes the car reduce speed slowly if neither accelerator nor brake is pressed
    def.bullet=true; //dedicates more time to collision detection - car travelling at high speeds at low framerates otherwise might teleport through obstacles.
    def.angularDamping=0.3;
    this.body=world.CreateBody(def);
    
    //initialize shape
    var fixdef= new box2d.b2FixtureDef();
    fixdef.density = 1.0;
    fixdef.friction = 0.3; //friction when rubbing agaisnt other shapes
    fixdef.restitution = 0.4;  //amount of force feedback when hitting something. >0 makes the car bounce off, it's fun!
    fixdef.shape=new box2d.b2CircleShape;
    fixdef.shape.m_radius=1;
    this.body.CreateFixture(fixdef);
    
}

