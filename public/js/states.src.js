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
	clickLeftUp(start,end) {
		this.lastclicked = ObjectMaker.findTiles(start,end);
		// change color of last clicked object TODO do colors better
		for (let i=0; i < this.lastclicked.length; i++) {
			this.lastclicked[i].material.color.r = 1;
//			this.lastclicked[i].onClick();
		}
	}
	pressV(grid,scene) {
		const newgrid = ObjectMaker.makeGrid();
		scene.add( newgrid );
		ObjectMaker.setColor(this.lastclicked,0);
		this.lastclicked = [];
		return {
			state: new BuildFloor(),
			grid: newgrid
		};
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
	pressV(grid,scene) {
		scene.remove(grid);
		return {
			state: new Normal(),
			grid: null
		};
	}
	pressPlus(grid) {
		ObjectMaker.incLevel(1);
		grid.position.set( 0, ObjectMaker.getLevel(), 0 );
	}
	pressMinus(grid) {
		ObjectMaker.incLevel(-1);
		grid.position.set( 0, ObjectMaker.getLevel(), 0 );
	}
}

class BuildFloor extends BuildBase {
	pressB() {
		return {
			bool: true,
			state: new BuildWall()
		};
	}
}

class BuildWall extends BuildBase {
	pressB() {
		return {
			bool: false,
			state: new BuildFloor()
		};
	}
}

exports.getStartingState = Normal;
