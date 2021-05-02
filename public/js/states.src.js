const ObjectMaker = require('./objects.src.js');

class Normal {
	constructor() {
		this.lastclicked = [];
	}
	clickLeftDown() {
		ObjectMaker.setColor(this.lastclicked,0);
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
