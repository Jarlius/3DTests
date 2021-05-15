const THREE = require('three');

const ObjectMaker = require('./objects.src.js');
const Raycaster = new THREE.Raycaster();

class State {
	constructor() {
		this.start = null;
	}
}

class Normal extends State {
	constructor() {
		super();
		this.lastclicked = [];
	}
	clickLeftDown(x,y,camhandler,width,height,scene) {
		ObjectMaker.setColor(this.lastclicked,0);
		const vector = new THREE.Vector2(
//			(x - offsetleft) / width * 2 - 1,
//			- (y - offsettop) / height * 2 + 1
			x / width * 2 - 1,
			- y / height * 2 + 1
		);
		Raycaster.setFromCamera( vector, camhandler.getCamera() );
		const intersects = Raycaster.intersectObjects( scene.children );
					
		if (intersects.length !== 0)
			this.start = intersects[0].object.position;
		else
			this.start = null;
	}
	clickLeftUp(x,y,camhandler) {
		if (this.start === null)
			return;
		const end = camhandler.getPlaneClick(x,y,this.start.y);

		this.lastclicked = ObjectMaker.findTiles(this.start,end);
		// change color of last clicked object TODO do colors better
		for (let i=0; i < this.lastclicked.length; i++) {
			this.lastclicked[i].material.color.r = 1;
//			this.lastclicked[i].onClick();
		}
	}
	pressV(scene) {
		ObjectMaker.setColor(this.lastclicked,0);
		this.lastclicked = [];
		return new BuildFloor(scene);
	}
	pressDelete(scene) {
		if (this.lastclicked === [])
			return;
		for (let i=0; i < this.lastclicked.length; i++) {
			scene.remove( this.lastclicked[i] );
			ObjectMaker.removeTile( this.lastclicked[i].position );
		}
		this.lastclicked = [];
	}
}

class BuildBase extends State {
	pressV(scene) {
		scene.remove(this.grid);
		return new Normal();
	}
}

class BuildFloor extends BuildBase {
	constructor(scene) {
		super();
		this.grid = ObjectMaker.makeYGrid();
		scene.add( this.grid );
	};
	clickLeftDown(x,y,camhandler) {
		this.start = camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
	}
	clickLeftUp(x,y,camhandler,scene) {
		if (this.start === null)
			return;
		const end = camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
		const newtiles = ObjectMaker.makeTile(end.x, end.z, this.start);
		for (let i=0; i < newtiles.length; i++)
			scene.add( newtiles[i] );
	}
	pressB(scene) {
		scene.remove(this.grid);
		return new BuildZWall(scene);
	}
	pressPlus() {
		ObjectMaker.incLevel(1);
		this.grid.position.set( 0, ObjectMaker.getLevel(), 0 );
	}
	pressMinus() {
		ObjectMaker.incLevel(-1);
		this.grid.position.set( 0, ObjectMaker.getLevel(), 0 );
	}
}

class BuildWall extends BuildBase {
	constructor(scene,grid) {
		super();
		this.grid = grid;
		scene.add( grid );
	}
	pressB(scene) {
		scene.remove(this.grid);
		return new BuildFloor(scene);
	}
}

class BuildXWall extends BuildWall {
	constructor(scene) {
		super(scene,ObjectMaker.makeXGrid());
	}
	clickLeftDown(x,y,camhandler) {
		console.log('x click');
		this.start = camhandler.getXclick(x,y,ObjectMaker.getXLevel());
	}
	clickLeftUp(x,y,camhandler,scene) {
		const end = camhandler.getXclick(x,y,ObjectMaker.getXLevel());
		ObjectMaker.makeXWall(this.start,end,scene);
	}
	pressN(scene) {
		scene.remove(this.grid);
		return new BuildZWall(scene);
	}
	pressPlus() {
		this.grid.position.set( ObjectMaker.incXlevel(1), 0, 0 );
	}
	pressMinus() {
		this.grid.position.set( ObjectMaker.incXlevel(-1), 0, 0 );
	}
}

class BuildZWall extends BuildWall {
	constructor(scene) {
		super(scene,ObjectMaker.makeZGrid());
	}
	clickLeftDown(x,y,camhandler) {
		console.log('z click');
		this.start = camhandler.getZclick(x,y,ObjectMaker.getZLevel());
	}
	clickLeftUp(x,y,camhandler,scene) {
		if (this.start === null)
			return;
		const end = camhandler.getZclick(x,y,ObjectMaker.getZLevel());
		ObjectMaker.makeZWall(this.start,end,scene);
	}
	pressN(scene) {
		scene.remove(this.grid);
		return new BuildXWall(scene);
	}
	pressPlus() {
		this.grid.position.set( 0, 0, ObjectMaker.incZlevel(1) );
	}
	pressMinus() {
		this.grid.position.set( 0, 0, ObjectMaker.incZlevel(-1) );
	}
}

exports.getStartingState = () => {
	return new Normal();
};
