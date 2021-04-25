const ObjectMaker = require('./objects.src.js');

function Normal() {
	this.clickLeftDown = () => {
		console.log("normal mode");
	};
	this.pressV = (grid,scene) => {
		const newgrid = ObjectMaker.makeGrid();
		scene.add( newgrid );
		return {
			state: new BuildBase(),
			grid: newgrid
		};
	};
};

function BuildBase() {
	this.clickLeftDown = () => {
		console.log("floor build mode");
	};
	this.pressV = (grid,scene) => {
		scene.remove(grid);
		return {
			state: new Normal(),
			grid: null
		};
	};
	this.pressPlus = (grid) => {
		ObjectMaker.incLevel(1);
		grid.position.set( 0, ObjectMaker.getLevel(), 0 );
	};
	this.pressMinus = (grid) => {
		ObjectMaker.incLevel(-1);
		grid.position.set( 0, ObjectMaker.getLevel(), 0 );
	};
};

exports.getStartingState = Normal;
