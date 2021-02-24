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
exports.thetaNegToPos = angle => {
	return ( angle+ (Math.PI*2) ) % (Math.PI*2)
};
