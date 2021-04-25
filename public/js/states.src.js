function Normal() {
	this.clickLeftDown = () => {
		console.log("normal mode");
	};
	this.clickV = () => {
		return new FloorBuild();
	};
};
exports.normal = Normal;

function FloorBuild() {
	this.clickLeftDown = () => {
		console.log("floor build mode");
	};
	this.clickV = () => {
		return new Normal();
	};
};
exports.floorbuild = FloorBuild;
