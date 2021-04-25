const ObjectMaker = require('./objects.src.js');

class Normal {
	clickLeftDown() {
		console.log("normal mode");
	}
	pressV(grid,scene) {
		const newgrid = ObjectMaker.makeGrid();
		scene.add( newgrid );
		return {
			state: new BuildBase(),
			grid: newgrid
		};
	}
}

class BuildBase {
	clickLeftDown() {
		console.log("floor build mode");
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

exports.getStartingState = Normal;
