exports.sq = a => {
	return a*a;
};
exports.pythHyp = (a,b) => {
	return Math.sqrt( a*a + b*b );
};
exports.pythLeg = (c,b) => {
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

