const CameraHandler = require('../public/js/camera.src.js');

const handler = new CameraHandler(0,0);

const toDeg = rad => {
	return rad*180/Math.PI;
};

const cartesianToPolar = (x,y,z) => {
	const r_theta = Math.sqrt(x*x + z*z);
	const phi = Math.atan(r_theta/y);// felvänd?
	const theta = Math.atan(x/z);
	let quadrant;
	if (x > 0) {
		if (z > 0)
			quadrant = 0;
		else
			quadrant = Math.PI;
	} else {
		if (z < 0)
			quadrant = Math.PI;
		else
			quadrant = Math.PI*2;
	}
	let updown = 0;
	if (y < 0)
		updown = Math.PI;
	return {theta: theta + quadrant, phi: phi + updown};
};

// x argument and x_diff argument is 2 and -2, can be improved
const test = cartesianToPolar(2,-2,-4);
console.log(toDeg(test.theta),toDeg(test.phi));
const res = handler.checkAngles(test,{theta:0,phi:0},-2);
console.log(res);
