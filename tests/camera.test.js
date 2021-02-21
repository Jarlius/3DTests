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
	const phi_click = click.phi-Math.PI/2;
	const theta_diff = click.theta-cam.theta;

	const far_leg = Math.sin(phi_click);
	const near_leg = Math.cos(theta_diff) * Math.cos(phi_click); // cos(theta_diff) = near / hyp
	const phi = Math.atan( far_leg / near_leg );
	// TODO put pythHyp, pythLeg and similar functions in separate file and import here
	const theta = Math.acos( Math.sqrt( (far_leg*far_leg) + (near_leg*near_leg) ) );

	let theta_sign = Math.sign( theta_diff );
	if (Math.abs( theta_diff ) > Math.PI)
		theta_sign = -theta_sign;
	
	return {
		theta: theta*theta_sign,
		phi: phi-(cam.phi-Math.PI/2) 
	};
};

const tol = 0.001;

const testSimple = (cam,click) => {
	const camang = cartesianToPolar(cam.x,cam.y,cam.z);
	const clickang = cartesianToPolar(click.x,click.y,click.z);
	const angdiff = getAngles(camang,clickang);

	if (camang.theta > Math.PI)
		camang.theta = camang.theta-Math.PI*2;

	const res = handler.checkAngles(camang,angdiff,-click.x);
	console.log('ans y:',click.y,res.y);
	console.log('ans z:',click.z,res.z);
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
		[-2,-2,4],[2,-2,2]],
	['mirrored hard',
		[-2,-2,-4],[2,-2,-2]],
	['other way',
		[-4,2,-3],[-3,5,-2]],
	['other, again',
		[-3,-2,-1],[-5,-6,4]],
	['other, accross good quadrants',
		[-1,4,10],[-2,-3,-5]],
	['accross quadrants, but not over 90 degrees',
		[-6,-2,2],[-6,2,-2]],
	['other, hard but not impossible',
		[2,2,-6],[-2,-2,-4]],
];
for (let i=0; i < v.length; i++) {
	const title = v[i][0];
	const cam = v[i][1];
	const click = v[i][2];
	const test = testSimple({x:cam[0],y:cam[1],z:cam[2]},{x:click[0],y:click[1],z:click[2]})
	console.log(title,test);
	console.log();
}

