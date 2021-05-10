const THREE = require('three');

const ObjectMaker = require('./objects.src.js');
const Raycaster = new THREE.Raycaster();

class Normal {
	constructor() {
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
			return intersects[0].object.position;
		return null;
	}
	clickLeftUp(x,y,camhandler,start) {
		if (start === null)
			return;
		const end = camhandler.getPlaneClick(x,y,start.y);

		this.lastclicked = ObjectMaker.findTiles(start,end);
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

class BuildBase {
	clickLeftDown(x,y,camhandler) {
		return camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
	}
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
	clickLeftUp(x,y,camhandler,start,scene) {
		const end = camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
		const newtiles = ObjectMaker.makeTile(end.x, end.z, start);
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
	clickLeftUp(x,y,camhandler,start,scene) {
		const end = camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
		const newtile = ObjectMaker.makeWall(end.x, end.z);
		if (newtile) {
//			camhandler.getXclick(x,y,newtile.position.x);
			scene.add( newtile );
		}

		if (this.zwall) {
			console.log('z click');
			camhandler.getZclick(x,y,start.z);
		} else {
			console.log('x click');
			camhandler.getXclick(x,y,start.x);
		}
	}
	pressB(scene) {
		scene.remove(this.grid);
		return new BuildFloor(scene);
	}
}

class BuildXWall extends BuildWall {
	constructor(scene) {
		super(scene,ObjectMaker.makeXGrid());
		this.zwall = false;
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
		this.zwall = true;
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

exports.getStartingState = Normal;
