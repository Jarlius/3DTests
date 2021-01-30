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

const tol = 0.001;

const testSimple = (cam,click) => {
	const camang = cartesianToPolar(cam.x,cam.y,cam.z);
	const clickang = cartesianToPolar(click.x,click.y,click.z);
	const angdiff = getAngles(camang,clickang);
	const res = handler.checkAngles(camang,angdiff,-click.x);
	if (Math.abs(click.y+res.y) < tol && Math.abs(click.z+res.z) < tol)
		return true;
	return false;
};

const v = [
	['basic - angle should be close to -14.9,12.8',
		[2,-2,-4],[2,-2,-2]],
	['basic but different',
		[2,-5,-7],[2,-3,-2]],
	['first quadrant',
		[2,3,2],[2,4,5]],
	['accross good quadrants',
		[2,-2,3],[2,-4,-1]],
	['hard',
		[-2,-2,4],[2,-2,2]]
];
for (let i=0; i < v.length; i++) {
	const title = v[i][0];
	const cam = v[i][1];
	const click = v[i][2];
	const test = testSimple({x:cam[0],y:cam[1],z:cam[2]},{x:click[0],y:click[1],z:click[2]})
	console.log(title,test);
}

