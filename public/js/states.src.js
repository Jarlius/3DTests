const ObjectMaker = require('./objects.src.js');

class Normal {
	clickLeftDown() {
		console.log("normal mode");
	}
	pressV(grid,scene,lastclicked) {
		const newgrid = ObjectMaker.makeGrid();
		scene.add( newgrid );
		ObjectMaker.setColor(lastclicked,0);
		return {
			state: new BuildFloor(),
			grid: newgrid
		};
	}
	pressDelete(scene,lastclicked) {
		if (lastclicked === [])
			return;
		for (let i=0; i < lastclicked.length; i++) {
			scene.remove( lastclicked[i] );
			ObjectMaker.removeTile( lastclicked[i].position );
		}
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
