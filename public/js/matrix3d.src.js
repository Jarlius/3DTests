/*
 * Class for storing data in 3 dimensions
 * using maps and sets to make space dynamic
 */
function Matrix3D() {
	const rootmap = new Map();

	this.add = (x,y,z, val) => {
		console.log('add',x,y,z);
		if (!rootmap.has(x))
			rootmap.set(x, new Map());
		const map_x = rootmap.get(x);
		if (!map_x.has(y))
			map_x.set(y, new Map());
		const map_y = map_x.get(y);
		if (map_y.has(z))
			return false;
		else {
			map_y.set(z, val);
			return true;
		}
	};

	this.del = (x,y,z) => {
		console.log('del',x,y,z);
		if (!rootmap.has(x))
			return false;
		const map_x = rootmap.get(x);
		if (!map_x.has(y))
			return false;
		const map_y = map_x.get(y);
		if (!map_y.has(z))
			return false;
		map_y.delete(z);
		if (map_y.size === 0)
			map_x.delete(y);
		if (map_x.size === 0)
			rootmap.delete(x);
		return true;
	};
	
	this.get = (x,y,z) => {
		console.log('get', x,y,z);
		if (!rootmap.has(x))
			return false;
		const map_x = rootmap.get(x);
		if (!map_x.has(y))
			return false;
		const map_y = map_x.get(y);
		if (!map_y.has(z))
			return false;
		return map_y.get(z);
	};

	// TODO use this technique more?
	this.has = (x,y,z) => {
		try {
			return rootmap.get(x).get(y).has(z);
		} catch (error) {
			return false;
		}
	};
};

module.exports = Matrix3D;
