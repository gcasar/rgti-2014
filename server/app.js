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
     new b2Vec2(0, 0)    //gravity
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
	for( var k in clients ){
		send(clients[k], JSON.stringify({action:'tick'}));
	}

	world.Step(
         1 / 60   //frame-rate
      ,  10       //velocity iterations
      ,  10       //position iterations
   );
   world.ClearForces();
}

setInterval(update, 1000/60);


function simpleupdate() {

	

	for(var c in cars){
		//set car controls according to player input

		if(ACTION[c]=="up"){
            cars[c].accelerate=ACC_ACCELERATE;
            cars[c].steer=STEER_NONE;
        }else if(ACTION[c]=="upleft"){
            cars[c].accelerate=ACC_ACCELERATE;
            cars[c].steer=STEER_LEFT;
        }else if(ACTION[c]=="upright"){
            cars[c].accelerate=ACC_ACCELERATE;
            cars[c].steer=STEER_RIGHT;
        }else if(ACTION[c]=="down"){
            cars[c].accelerate=ACC_BRAKE;
            cars[c].steer=STEER_NONE;
        }else if(ACTION[c]=="downleft"){
            cars[c].accelerate=ACC_BRAKE;
            cars[c].steer=STEER_LEFT;
        }else if(ACTION[c]=="downright"){
            cars[c].accelerate=ACC_BRAKE;
            cars[c].steer=STEER_RIGHT;
        }else if(ACTION[c]=="stop"){
            cars[c].accelerate=ACC_NONE;
            cars[c].steer=STEER_NONE;
        }else if(ACTION[c]=="stopleft"){
            cars[c].accelerate=ACC_NONE;
            cars[c].steer=STEER_LEFT;
        }else if(ACTION[c]=="stopright"){
            cars[c].accelerate=ACC_NONE;
            cars[c].steer=STEER_RIGHT;
        }
        car = cars[c];
        if(car!==undefined)
        	cars[c].update(1/60);
    }

   world.Step(
         1 / 60   //frame-rate
      ,  10       //velocity iterations
      ,  10       //position iterations
   );
   world.ClearForces();
 
}; // update()


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

function BoxProp(pars){
    /*
   static rectangle shaped prop
     
     pars:
     size - array [width, height]
     position - array [x, y], in world meters, of center
    */
    this.size=pars.size;


    
    //initialize body
    var bdef=new box2d.b2BodyDef();
    bdef.position=new box2d.b2Vec2(pars.position[0], pars.position[1]);
    bdef.angle=0;
    bdef.fixedRotation=true;

    bdef.type = box2d.b2Body.b2_staticBody;
    this.body=b2world.CreateBody(bdef);
    
    //initialize shape
    var fixdef=new box2d.b2FixtureDef;
    fixdef.shape=new box2d.b2PolygonShape();
    fixdef.shape.SetAsBox(this.size[0]/2, this.size[1]/2);
    fixdef.restitution=0.4; //positively bouncy!
    this.body.CreateFixture(fixdef);
    return this;  
};

function Wheel(pars){
    /*
    wheel object 
          
    pars:
    
    car - car this wheel belongs to
    x - horizontal position in meters relative to car's center
    y - vertical position in meters relative to car's center
    width - width in meters
    length - length in meters
    revolving - does this wheel revolve when steering?
    powered - is this wheel powered?
    */

    this.position=[pars.x, pars.y];
    this.car=pars.car;
    this.revolving=pars.revolving;
    this.powered=pars.powered;

    //initialize body
    var def=new box2d.b2BodyDef();
    def.type = box2d.b2Body.b2_dynamicBody;
    def.position=this.car.body.GetWorldPoint(new box2d.b2Vec2(this.position[0], this.position[1]));
    def.angle=this.car.body.GetAngle();
    this.body=b2world.CreateBody(def);
    
    //initialize shape
    var fixdef= new box2d.b2FixtureDef;
    fixdef.density=1;
    fixdef.isSensor=true; //wheel does not participate in collision calculations: resulting complications are unnecessary
    fixdef.shape=new box2d.b2PolygonShape();
    fixdef.shape.SetAsBox(pars.width/2, pars.length/2);
    this.body.CreateFixture(fixdef);

    //create joint to connect wheel to body
    if(this.revolving){
        var jointdef=new box2d.b2RevoluteJointDef();
        jointdef.Initialize(this.car.body, this.body, this.body.GetWorldCenter());
        jointdef.enableMotor=false; //we'll be controlling the wheel's angle manually
    }else{
        var jointdef=new box2d.b2PrismaticJointDef();
        jointdef.Initialize(this.car.body, this.body, this.body.GetWorldCenter(), new box2d.b2Vec2(1, 0));
        jointdef.enableLimit=true;
        jointdef.lowerTranslation=jointdef.upperTranslation=0;
    }
    b2world.CreateJoint(jointdef);



}

Wheel.prototype.setAngle=function(angle){
    /*
    angle - wheel angle relative to car, in degrees
    */
    this.body.SetAngle(this.car.body.GetAngle()+radians(angle));
};

Wheel.prototype.getLocalVelocity=function(){
    /*returns get velocity vector relative to car
    */
    var res=this.car.body.GetLocalVector(this.car.body.GetLinearVelocityFromLocalPoint(new box2d.b2Vec2(this.position[0], this.position[1])));
    return [res.x, res.y];
};

Wheel.prototype.getDirectionVector=function(){
    /*
    returns a world unit vector pointing in the direction this wheel is moving
    */
    return rotate((this.getLocalVelocity()[1]>0) ? [0, 1]:[0, -1] , this.body.GetAngle()) ;
};


Wheel.prototype.getKillVelocityVector=function(){
    /*
    substracts sideways velocity from this wheel's velocity vector and returns the remaining front-facing velocity vector
    */
    var velocity=this.body.GetLinearVelocity();
    var sideways_axis=this.getDirectionVector();
    var dotvec = new THREE.Vector2(velocity.x, velocity.y);
    var sidevec = new THREE.Vector2(sideways_axis[0], sideways_axis[1]);
    var dotprod= dotvec.dot(sidevec);
    return [sideways_axis[0]*dotprod, sideways_axis[1]*dotprod];
};

Wheel.prototype.killSidewaysVelocity=function(){
    /*
    removes all sideways velocity from this wheels velocity
    */
    var kv=this.getKillVelocityVector();
    this.body.SetLinearVelocity(new box2d.b2Vec2(kv[0], kv[1]));

};


function Car(pars){
    /*
    pars is an object with possible attributes:
    
    width - width of the car in meters
    length - length of the car in meters
    position - starting position of the car, array [x, y] in meters
    angle - starting angle of the car, degrees
    max_steer_angle - maximum angle the wheels turn when steering, degrees
    max_speed       - maximum speed of the car, km/h
    power - engine force, in newtons, that is applied to EACH powered wheel
    wheels - wheel definitions: [{x, y, rotatable, powered}}, ...] where
             x is wheel position in meters relative to car body center
             y is wheel position in meters relative to car body center
             revolving - boolean, does this turn rotate when steering?
             powered - is force applied to this wheel when accelerating/braking?
    */

    //state of car controls
    this.steer=STEER_NONE;
    this.accelerate=ACC_NONE;
    
    this.max_steer_angle=pars.max_steer_angle;
    this.max_speed=pars.max_speed;
    this.power=pars.power;
    this.wheel_angle=0;//keep track of current wheel angle relative to car.
                       //when steering left/right, angle will be decreased/increased gradually over 200ms to prevent jerkyness.
    
    //initialize body
    var def=new box2d.b2BodyDef();
    def.type = box2d.b2Body.b2_dynamicBody;
    def.position=new box2d.b2Vec2(pars.position[0], pars.position[1]);
    def.angle=radians(pars.angle); 
    def.linearDamping=0.15;  //gradually reduces velocity, makes the car reduce speed slowly if neither accelerator nor brake is pressed
    def.bullet=true; //dedicates more time to collision detection - car travelling at high speeds at low framerates otherwise might teleport through obstacles.
    def.angularDamping=0.3;
    this.body=b2world.CreateBody(def);
    
    //initialize shape
    var fixdef= new box2d.b2FixtureDef();
    fixdef.density = 1.0;
    fixdef.friction = 0.3; //friction when rubbing agaisnt other shapes
    fixdef.restitution = 0.4;  //amount of force feedback when hitting something. >0 makes the car bounce off, it's fun!
    fixdef.shape=new box2d.b2PolygonShape;
    fixdef.shape.SetAsBox(pars.width/2, pars.length/2);
    this.body.CreateFixture(fixdef);
    
    //initialize wheels
    this.wheels=[]
    var wheeldef, i;
    for(i=0;i<pars.wheels.length;i++){
        wheeldef=pars.wheels[i];
        wheeldef.car=this;
        this.wheels.push(new Wheel(wheeldef));
    }
}

Car.prototype.getPoweredWheels=function(){
    //return array of powered wheels
    var retv=[];
    for(var i=0;i<this.wheels.length;i++){
        if(this.wheels[i].powered){
            retv.push(this.wheels[i]);
        }
    }
    return retv;
};

Car.prototype.getLocalVelocity=function(){
    /*
    returns car's velocity vector relative to the car
    */
    var retv=this.body.GetLocalVector(this.body.GetLinearVelocityFromLocalPoint(new box2d.b2Vec2(0, 0)));
    return [retv.x, retv.y];
};

Car.prototype.getRevolvingWheels=function(){
    //return array of wheels that turn when steering
    var retv=[];
    for(var i=0;i<this.wheels.length;i++){
        if(this.wheels[i].revolving){
            retv.push(this.wheels[i]);
        }
    }
    return retv;
};

Car.prototype.getSpeedKMH=function(){
    var velocity=this.body.GetLinearVelocity();
    var tmp = new THREE.Vector2(velocity.x, velocity.y);
    var len=tmp.length();
    return (len/1000)*3600;
};


Car.prototype.setSpeed=function(speed){
    /*
    speed - speed in kilometers per hour
    */
    var velocity=this.body.GetLinearVelocity();
    var tmp = new THREE.Vector2(velocity.x, velocity.y);
    tmp.normalize();
    velocity=[tmp.x,tmp.y];
    velocity=new box2d.b2Vec2(velocity[0]*((speed*1000.0)/3600.0),
                              velocity[1]*((speed*1000.0)/3600.0));
    this.body.SetLinearVelocity(velocity);

};

Car.prototype.update=function(msDuration){
    
        //1. KILL SIDEWAYS VELOCITY
        
        //kill sideways velocity for all wheels
        var i;
        for(i=0;i<this.wheels.length;i++){
            this.wheels[i].killSidewaysVelocity();
        }
    
        //2. SET WHEEL ANGLE
  
        //calculate the change in wheel's angle for this update, assuming the wheel will reach is maximum angle from zero in 200 ms
        var incr=(this.max_steer_angle/200) * msDuration;
        
        if(this.steer==STEER_RIGHT){
            this.wheel_angle=-this.max_steer_angle //increment angle without going over max steer
        }else if(this.steer==STEER_LEFT){
            this.wheel_angle=this.max_steer_angle //decrement angle without going over max steer
        }else{
            this.wheel_angle=0;        
        }

        //update revolving wheels
        var wheels=this.getRevolvingWheels();
        for(i=0;i<wheels.length;i++){
            wheels[i].setAngle(this.wheel_angle);
        }
        
        //3. APPLY FORCE TO WHEELS
        var base_vect; //vector pointing in the direction force will be applied to a wheel ; relative to the wheel.
        
        //if accelerator is pressed down and speed limit has not been reached, go forwards
        if((this.accelerate==ACC_ACCELERATE) && (this.getSpeedKMH() < this.max_speed)){
            base_vect=[0, -1];
        }
        else if(this.accelerate==ACC_BRAKE){
            //braking, but still moving forwards - increased force
            if(this.getLocalVelocity()[1]<0)base_vect=[0, 1.3];
            //going in reverse - less force
            else base_vect=[0, 0.7];
        }
        else base_vect=[0, 0];

        //multiply by engine power, which gives us a force vector relative to the wheel
        var fvect=[this.power*base_vect[0], this.power*base_vect[1]];

        //apply force to each wheel
        wheels=this.getPoweredWheels();
        for(i=0;i<wheels.length;i++){
           var position=wheels[i].body.GetWorldCenter();
           wheels[i].body.ApplyForce(wheels[i].body.GetWorldVector(new box2d.b2Vec2(fvect[0], fvect[1])), position );
        }
        
        //if going very slow, stop - to prevent endless sliding
        if( (this.getSpeedKMH()<4) &&(this.accelerate==ACC_NONE)){
            this.setSpeed(0);
        }

};

