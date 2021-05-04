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
	constructor(scene) {
		this.grid = ObjectMaker.makeGrid();
		scene.add( this.grid );
	}
	clickLeftDown(x,y,camhandler) {
		return camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
	}
	pressV(scene) {
		scene.remove(this.grid);
		return new Normal();
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

class BuildFloor extends BuildBase {
	clickLeftUp(x,y,camhandler,start,scene) {
		const end = camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
		const newtiles = ObjectMaker.makeTile(end.x, end.z, start);
		for (let i=0; i < newtiles.length; i++)
			scene.add( newtiles[i] );
	}
	pressB(scene) {
		scene.remove(this.grid);
		return {
			bool: true,
			state: new BuildWall(scene)
		};
	}
}

class BuildWall extends BuildBase {
	constructor(scene) {
		super(scene);
		this.zwall = false;
	}
	clickLeftUp(x,y,camhandler,start,scene) {
		const end = camhandler.getPlaneClick(x,y,ObjectMaker.getLevel());
		const newtile = ObjectMaker.makeWall(end.x, end.z);
		if (newtile) {
//			camhandler.getXclick(x,y,newtile.position.x);
			scene.add( newtile );
		}

		if (this.zwall) {
			camhandler.getZclick(x,y,start.z);
		} else {
			camhandler.getXclick(x,y,start.x);
		}
	}
	pressB(scene) {
		scene.remove(this.grid);
		return {
			bool: false,
			state: new BuildFloor(scene)
		};
	}
	pressN() {
		this.zwall = !this.zwall;
		console.log('z-wall:', this.zwall);
	}
}

exports.getStartingState = Normal;
