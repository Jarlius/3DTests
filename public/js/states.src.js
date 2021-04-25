const ObjectMaker = require('./objects.src.js');

// TODO idea: if state functions are used to lead the main program to other states,
// is it really important to export each state? maybe only export the initial state?

function Normal() {
	this.clickLeftDown = () => {
		console.log("normal mode");
	};
	this.clickV = (grid,scene) => {
		const newgrid = ObjectMaker.makeGrid();
		scene.add( newgrid );
		return {
			state: new FloorBuild(),
			grid: newgrid
		};
	};
};
exports.normal = Normal;

function FloorBuild() {
	this.clickLeftDown = () => {
		console.log("floor build mode");
	};
	this.clickV = (grid,scene) => {
		scene.remove(grid);
		return {
			state: new Normal(),
			grid: null
		};
	};
};
exports.floorbuild = FloorBuild;
