const THREE = require('three');

const CameraHandler = require('./camera.src.js');
const ObjectMaker = require('./objects.src.js');
const States = require('./states.src.js');

const raycaster = new THREE.Raycaster();

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
	
	var grid = null;

	const render = () => {
		renderer.render( scene, camhandler.getCamera() );
/*		camhandler.render(camera => {
			renderer.render( scene, camera );
		});
*/	};

	var lastclicked = [];
	var wallbuild = false;
	var zwall = false;
	var start = null;
	var state = new States.getStartingState();

	this.clickLeftDown = (x,y) => {
		state.clickLeftDown();
		// TODO determine orientation here already
		if (grid !== null)
			start = camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
		else {
			ObjectMaker.setColor(lastclicked,0);
			lastclicked = [];
			start = null;
			render();

			const vector = new THREE.Vector2(
//				(x - offsetleft) / width * 2 - 1,
//				- (y - offsettop) / height * 2 + 1
				x / width * 2 - 1,
				- y / height * 2 + 1
			);
			raycaster.setFromCamera( vector, camhandler.getCamera() );
			const intersects = raycaster.intersectObjects( scene.children );
			
			// change color of last clicked object TODO do colors better
			
			if (intersects.length !== 0)
				start = intersects[0].object.position;
		}
	};
	this.clickLeftUp = (x,y) => {
		if (grid !== null) {// place an object
			// TODO different end y level depending on build
			const end = camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
			if (wallbuild) {
				const newtile = ObjectMaker.makeWall(end.x, end.z);
				if (zwall) {
					camhandler.getZclick(x,y,start.z);
				} else {
					camhandler.getXclick(x,y,start.x);
				}
//*
				if (newtile) {
//					camhandler.getXclick(x,y,newtile.position.x);
					scene.add( newtile );
				}
//*/
			} else {
				const newtiles = ObjectMaker.makeTile(end.x, end.z, start);
				for (let i=0; i < newtiles.length; i++)
					scene.add( newtiles[i] );
			}
		} else {// click an object
			if (start === null)
				return;

			const end = camhandler.getPlaneClick(x,y,start.y);

			lastclicked = ObjectMaker.findTiles(start,end);

			for (let i=0; i < lastclicked.length; i++) {
				lastclicked[i].material.color.r = 1;
//				lastclicked[i].onClick();
			}
		}
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
		const result = state.pressV(grid,scene);
		state = result.state;
		grid = result.grid;
		ObjectMaker.setColor(lastclicked,0);
		lastclicked = [];
		render();
	});
	keyfuncs.set('+', () => {
		state.pressPlus(grid);
		render();
	});
	keyfuncs.set('-', () => {
		state.pressMinus(grid);
		render();
	});
	keyfuncs.set('DELETE', () => {
		if (lastclicked === [])
			return;
		for (let i=0; i < lastclicked.length; i++) {
			scene.remove( lastclicked[i] );
			ObjectMaker.removeTile( lastclicked[i].position );
		}
		lastclicked = [];
		render();
	});
	keyfuncs.set('B', () => {
		if (state.pressB !== undefined) {
			result = state.pressB();
			wallbuild = result.bool;
			state = result.state;
		}
	});
	keyfuncs.set('N', () => {
		zwall = !zwall;
		console.log('z-wall:', zwall);
	});
	
	render();

}

module.exports = Manager;
