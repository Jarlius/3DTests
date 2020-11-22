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

// get screen angles between camera center and click
// TODO test more angles for +/- errors
const getAngles = (cam,click) =>  {
	const phi_c = click.phi-Math.PI/2;
	const theta_d = click.theta-cam.theta;

	const phi = Math.atan(
		Math.sin(phi_c) / // far leg
		( Math.cos(theta_d) * Math.cos(phi_c) ) // near leg
	);
	const theta = Math.atan( Math.cos(phi) * Math.tan(theta_d) );
	
	return {
		theta: theta,
		phi: phi-(cam.phi-Math.PI/2) 
	};
};

// x argument and x_diff argument is 2 and -2, can be automated later
const cam = cartesianToPolar(2,-2,-4);
const click = cartesianToPolar(2,-2,-2);
const test = getAngles(cam,click);

console.log('resulting click angle should be close to -14.9,12.8');
console.log('theta',toDeg(test.theta));
console.log('phi',toDeg(test.phi));

const res = handler.checkAngles(cam,{theta:test.theta,phi:test.phi},-2); // here is the -2 x_diff
console.log(res);
