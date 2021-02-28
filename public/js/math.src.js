const sq = a => {
	return a*a;
};
exports.pythHyp = (a,b) => {
	return Math.sqrt( a*a + b*b );
};
const pythLeg = (c,b) => {
	return Math.sqrt( c*c - b*b );
};
exports.toDeg = rad => {
	return rad*180/Math.PI;
};

const thetaNegToPos = angle => {
	return ( angle + (Math.PI*2) ) % (Math.PI*2)
};

// get the "absolute" click angle, not based on camera
exports.getAbsClickAngle = (cam,click) => {
	const phi = click.phi+(cam.phi-Math.PI/2);
	const hyp = Math.cos( click.theta );
	const far_leg = Math.sin( phi ) * hyp;
	const near_leg = Math.cos( phi ) * hyp;

	const abs_phi = Math.asin( far_leg );
	const phi_leg = Math.cos( abs_phi );
	const abs_theta = Math.acos( near_leg / phi_leg );

	return {
		theta: thetaNegToPos( Math.sign(click.theta)*abs_theta+cam.theta ),
		phi: abs_phi+Math.PI/2
	};
};

// get wall coordinates from (-90,90) angles and (+/-) distance
const getWallCoords = (theta,phi,distance) => {
	const click_r = ( distance / Math.cos(phi) ) / Math.cos(theta);
	const plane_r = pythLeg(click_r,distance);
		
	const x_leg = Math.tan(theta) * distance;
	const y_leg = Math.sin(phi) * click_r;
		
	// c^2 = a^2 + b^2 - 2*a*b*Math.cos(v)
	// Math.cos(v) = (a² + b² - c²)/2*a*b
	const plane_v = Math.acos(
		( sq(x_leg) + sq(plane_r) - sq(y_leg) ) /
		(2*x_leg*plane_r)
	);
	return {
		x: Math.sin(plane_v)*plane_r,
		y: Math.cos(plane_v)*plane_r
	};
};


exports.checkAngles = (theta,phi,distance) => {
	if (
		( distance < 0 && !(0 < theta && theta < Math.PI) ) ||
		( distance > 0 && !(Math.PI < theta && theta < Math.PI*2) )
	) {
		console.log('Bad angle!');
		return;
	}

	const center_theta = (theta % Math.PI) - Math.PI/2;
	const center_phi = phi - Math.PI/2;

	const wallXY = getWallCoords(center_theta,center_phi,distance);
	
	const negxsign = Math.floor( theta / Math.PI ) ? -1 : 1;
	
	return {
		x: Math.abs( wallXY.y ) * Math.sign(center_theta) * negxsign,
		y: Math.abs( wallXY.x ) * Math.sign(center_phi)
	};
};

