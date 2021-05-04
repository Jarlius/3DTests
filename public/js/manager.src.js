const THREE = require('three');

const CameraHandler = require('./camera.src.js');
const ObjectMaker = require('./objects.src.js');
const States = require('./states.src.js');

function Manager(width, height, parent) {
	const renderer = new THREE.WebGLRenderer();
	const rendermap = new Map();
	const scene = new THREE.Scene();
	const camhandler = new CameraHandler(width, height);

	var rendering = false;

	// size is static, decided by view
	renderer.setSize(width, height);
	parent.appendChild(renderer.domElement);
	
	// maybe move to CameraHandler?
	
	camhandler.getCamera().position.set( 0, 2, 6 );
//	camhandler.getCamera().lookAt( -2, 0, 4 );
	camhandler.getCamera().lookAt( 2, 0, 4 );

	var cube = ObjectMaker.makeRotatingCube();
	scene.add( cube );// add without args places it on (0,0,0)
	scene.remove( cube );
/*
	for (var i=0; i < 8; i++)
		for (var j=0; j < 8; j++)
			scene.add( ObjectMaker.makeTile(i*4 - 4*4+2, 0, j*4 - 4*4+2) );
//*/
	// TODO add these to objects
	
//	scene.add( ObjectMaker.makeLine() );
	
	const render = () => {
		renderer.render( scene, camhandler.getCamera() );
/*		camhandler.render(camera => {
			renderer.render( scene, camera );
		});
*/	};

	var wallbuild = false;
	var start = null;
	var state = new States.getStartingState();

	this.clickLeftDown = (x,y) => {
		// TODO determine orientation here already
		start = state.clickLeftDown(x,y,camhandler,width,height,scene);
		render();
	};
	this.clickLeftUp = (x,y) => {
		// TODO different end y level depending on build
		state.clickLeftUp(x,y,camhandler,start,scene);
		render();
	};

	this.clickRightDown = (x,y) => {
		camhandler.rotationStart(x,y);
	};
	this.clickRightUp = () => {
		camhandler.rotationStop();
	};

	this.mouseMove = (x,y) => {
		if (camhandler.rotationMove(x,y))
			render();
	};	

	this.keyDown = key => {
		if (camhandler.hasMovement(key)) { // does the key control movement?
			if (rendermap.has(key)) // movement already being rendered
				return;
			rendermap.set(key, camhandler.getMovement(key));

			// TODO move render loop start to its own function?
			if (rendering)
				return;
			rendering = true;
			(loop = () => {
				if (!rendering)
					return;
				rendermap.forEach( value => { value(); });
				render();
				setTimeout(loop, 10)
			})();
		} else if (keyfuncs.has(key)) { // keys unrelated to camera
			keyfuncs.get(key)();
		}
	};
	this.keyUp = key => {
		rendermap.delete(key);
		if (rendermap.size === 0)
			rendering = false;
	};

	const keyfuncs = new Map();
	
	keyfuncs.set('V', () => {
		state = state.pressV(scene);
		render();
	});
	keyfuncs.set('+', () => {
		state.pressPlus();
		render();
	});
	keyfuncs.set('-', () => {
		state.pressMinus();
		render();
	});
	keyfuncs.set('DELETE', () => {
		state.pressDelete(scene);
		render();
	});
	keyfuncs.set('B', () => {
		if (state.pressB !== undefined) {
			result = state.pressB(scene);
			wallbuild = result.bool;
			state = result.state;
		}
	});
	keyfuncs.set('N', () => {
		state.pressN();
	});
	
	render();

}

module.exports = Manager;
