const THREE = require('three');

const Matrix3D = require('./matrix3d.src.js');

const grid_size = 20;
const tile_size = 2;
const padding = 0;
const block = tile_size + (2*padding);

//const green_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//const blue_material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const box_geometry = new THREE.BoxGeometry();
const plane_geometry = new THREE.PlaneGeometry( tile_size, tile_size );
const wire_geometry = new THREE.WireframeGeometry( box_geometry );

const floor = new Matrix3D();
const walls_x = new Matrix3D();
const walls_z = new Matrix3D();

exports.setColor = (objects,col) => {
	for (let i=0; i < objects.length; i++)
		objects[i].material.color.r = col;
};

var editlevel = 0;
var xlevel = 0;
var zlevel = 0;

function makeGrid() {
	return new THREE.GridHelper( grid_size*block, grid_size );
}

exports.getLevel = () => {
	return editlevel;
};
exports.getXLevel = () => {
	return xlevel;
};
exports.getZLevel = () => {
	return zlevel;
};

exports.incLevel = inc => {
	editlevel += block * inc;
};
exports.incZlevel = inc => {
	return zlevel += block * inc;
};
exports.incXlevel = inc => {
	return xlevel += block * inc;
};

exports.makeYGrid = () => {
	const grid = makeGrid();
	grid.position.set( 0, editlevel, 0);
	return grid;
};

exports.makeXGrid = () => {
	const grid = makeGrid();
	grid.position.set( xlevel, 0, 0 );
	grid.lookAt( xlevel, 1, 0 );
	grid.rotateZ( Math.PI/2 );
	return grid;
};

exports.makeZGrid = () => {
	const grid = makeGrid();
	grid.position.set( 0, 0, zlevel );
	grid.lookAt( 0, 1, zlevel );
	return grid;
};

function planeCoordToIndex(coord) {
	return {
		x: Math.floor(coord.x/block),
		y: Math.floor(coord.y/block),
		z: Math.floor(coord.z/block)
	};
}

function makeTile(tilekind) {
	// TODO need to learn matrix transforms to move the tile
	const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	material.side = THREE.DoubleSide;
	const tile = new THREE.Mesh( plane_geometry, material );
	tile.tilekind = tilekind;
	return tile;
}

exports.makeTile = (x,z, start) => { // TODO use startcooords (third arg) to create multiple tiles
	const start_x = Math.floor(start.x/block);
	const start_z = Math.floor(start.z/block);
	
	const tile_x = Math.floor(x/block);
	const tile_y = editlevel/block;
	const tile_z = Math.floor(z/block);

	var arr = [];

	for (let i = Math.min(start_x,tile_x); i <= Math.max(start_x,tile_x); i++)
		for (let j = Math.min(start_z,tile_z); j <= Math.max(start_z,tile_z); j++) {
			if (floor.has(i,tile_y,j))
				continue;

			const real_x = (i+0.5) * block;
			const real_z = (j+0.5) * block;

			const tile = makeTile('floor');
			tile.lookAt( 0, 1, 0 );
			tile.position.set( real_x, editlevel, real_z );
			tile.onClick = () => {
				console.log('floor');
			};

			floor.add(i,tile_y,j,tile);
			arr.push(tile);
		}

	return arr;
};

exports.removeTile = pos => {
	const tile = planeCoordToIndex(pos);
	floor.del(tile.x, tile.y, tile.z);
	walls_x.del(tile.x, tile.y, tile.z);
	walls_z.del(tile.x, tile.y, tile.z);
};

exports.findTiles = (start,end,kind) => {
	var start_x;
	var start_y;
	var end_x;
	var end_y;
	var level;
	var addTile;
	switch (kind) {
	case 'floor':
		start_x = Math.floor(start.x/block);
		start_y = Math.floor(start.z/block);
		end_x = Math.floor(end.x/block);
		end_y = Math.floor(end.z/block);
		if (start.y != end.y)
			return [];
		level = Math.floor(start.y/block);
		addTile = (x,y) => floor.get(x,level,y);
		break;
	case 'xwall':
		start_x = Math.floor(start.z/block);
		start_y = Math.floor(start.y/block);
		end_x = Math.floor(end.z/block);
		end_y = Math.floor(end.y/block);
		if (start.x != end.x)
			return [];
		level = Math.floor(start.x/block);
		addTile = (x,y) => walls_x.get(level,y,x);
		break;
	case 'zwall':
		start_x = Math.floor(start.x/block);
		start_y = Math.floor(start.y/block);
		end_x = Math.floor(end.x/block);
		end_y = Math.floor(end.y/block);
		if (start.z != end.z)
			return [];
		level = Math.floor(start.z/block);
		addTile = (x,y) => walls_z.get(x,y,level);
		break;
	default:
		console.warn('bad tile kind');
		return [];
	}

	var arr = [];

	for (let i = Math.min(start_x,end_x); i <= Math.max(start_x,end_x); i++) {
		for (let j = Math.min(start_y,end_y); j <= Math.max(start_y,end_y); j++) {
			let tile = addTile(i,j);
			if (tile)
				arr.push(tile);
		}
	}
	
	return arr;
};

function getVerticalWallCoords(x,y) {
	const tile_x = x - (x % block);
	const tile_y = y - (y % block);
	return {
		x: tile_x + (block/2 * Math.sign(x)),
		y: tile_y + (block/2 * Math.sign(y))
	}
}

function makeWall(start,end,func) {
	const x_max = Math.max(start.x,end.x);
	const y_max = Math.max(start.y,end.y);
	for (let i = Math.min(start.x,end.x); i <= x_max; i += block) {
		for (let j = Math.min(start.y,end.y); j <= y_max; j += block) {
			func(i,j);
		}
	}
}

exports.makeXWall = (start, end, scene) => {
	const start_coords = getVerticalWallCoords(start.z,start.y);
	const end_coords = getVerticalWallCoords(end.z,end.y);
	makeWall(start_coords,end_coords, (x,y) => {
		const norm_x = Math.floor(xlevel/block);
		const norm_y = Math.floor(y/block);
		const norm_z = Math.floor(x/block);
		if (!walls_x.has( norm_x, norm_y, norm_z )) {
			const wall = makeTile('xwall');
			wall.lookAt(1, 0, 0);
			wall.onClick = () => {
				console.log('X wall');
			};
			wall.position.set( xlevel, y, x );
			walls_x.add(
				norm_x,
				norm_y,
				norm_z,
				wall
			);
			scene.add(wall);
		}
	});
}

exports.makeZWall = (start, end, scene) => {
	const start_coords = getVerticalWallCoords(start.x,start.y);
	const end_coords = getVerticalWallCoords(end.x,end.y);
	makeWall(start_coords,end_coords, (x,y) => {
		const norm_x = Math.floor(x/block);
		const norm_y = Math.floor(y/block);
		const norm_z = Math.floor(zlevel/block);
		if (!walls_z.has( norm_x, norm_y, norm_z )) {
			const wall = makeTile('zwall');
			wall.onClick = () => {
				console.log('Z wall');
			};
			wall.position.set( x, y, zlevel );
			console.log(x,y,zlevel);
			walls_z.add(
				norm_x,
				norm_y,
				norm_z,
				wall
			);
			scene.add(wall);
		}
	});
};

exports.makeRotatingCube = () => {
	const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	const cube = new THREE.Mesh( box_geometry, material );
	cube.onClick = () => {
		cube.rotation.x += 0.1;
		cube.rotation.y += 0.1;
	};
	return cube;
};

exports.makeLine = () => {
//	var material = new THREE.LineBasicMaterial( { color: 0x00ffff } );
	const line = new THREE.LineSegments( wire_geometry );
	line.position.set(0,3,0);
	line.onClick = () => {
		console.log('nay');
	};
	return line;
};
