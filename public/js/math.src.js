exports.square = a => {
	return Math.pow(a,2);
};
exports.pythHyp = (a,b) => {
	return Math.sqrt( exports.square(a) + exports.square(b) );
};
exports.pythLeg = (c,b) => {
	return Math.sqrt( exports.square(c) - exports.square(b) );
};
exports.toDeg = rad => {
	return rad*180/Math.PI;
};

