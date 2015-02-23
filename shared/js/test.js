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
  'backbone',
  'underscore',
  'socketio',
  'box2d',
  'three',
  'stats',
  'app/car'

], function( $, Backbone, _, io, box2d, THREE, Stats, Car ) {

    console.log("hello");
    Car.hello();

	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;

	var container,stats;

	var camera, scene, loaded;
	var renderer;

	var mouseX = 0, mouseY = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var rotatingObjects = [];
	var morphAnimatedObjects = [];

	var clock = new THREE.Clock();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );


	var result = createLoadScene();


	var camera = result.camera;
	var scene = result.scene;


	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.domElement.style.position = "relative";
	document.body.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;


	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.right = '0px';
	stats.domElement.style.zIndex = 100;

	document.body.appendChild( stats.domElement );

	requestAnimationFrame(animate);


	function animate() {

		requestAnimationFrame( animate );

		render();
		stats.update();

	}

	function render() {

		var delta = clock.getDelta();

		camera.position.x += ( mouseX - camera.position.x ) * .001;
		camera.position.y += ( - mouseY - camera.position.y ) * .001;

		camera.lookAt( scene.position );

		renderer.render( scene, camera );

	}


	window.addEventListener( 'resize', onWindowResize, false );
	render();

	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function onDocumentMouseMove( event ) {

		mouseX = ( event.clientX - windowHalfX );
		mouseY = ( event.clientY - windowHalfY );

	}

	function createLoadScene() {

		var result = {

			scene:  new THREE.Scene(),
			camera: new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 1000 )
		};

		result.camera.position.z = 100;
		result.scene.add(camera);


		var object, geometry, material, light, count = 100, range = 200;

		material = new THREE.MeshLambertMaterial( { color:0xffffff } );
		geometry = new THREE.BoxGeometry( 5, 5, 5 );

		for( var i = 0; i < count; i++ ) {

			object = new THREE.Mesh( geometry, material );

			object.position.x = ( Math.random() - 0.5 ) * range;
			object.position.y = ( Math.random() - 0.5 ) * range;
			object.position.z = ( Math.random() - 0.5 ) * range;

			object.rotation.x = Math.random() * 6;
			object.rotation.y = Math.random() * 6;
			object.rotation.z = Math.random() * 6;

			object.matrixAutoUpdate = false;
			object.updateMatrix();

			result.scene.add( object );

		}

		result.scene.matrixAutoUpdate = false;

		light = new THREE.PointLight( 0xffffff );
		result.scene.add( light );

		light = new THREE.DirectionalLight( 0x111111 );
		light.position.x = 1;
		result.scene.add( light );


		return result;

	}



});