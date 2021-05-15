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

const tiles = new Matrix3D();
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

function makeTile() {
	// TODO need to learn matrix transforms to move the tile
	const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	material.side = THREE.DoubleSide;
	return new THREE.Mesh( plane_geometry, material );
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
			if (tiles.has(i,tile_y,j))
				continue;

			const real_x = (i+0.5) * block;
			const real_z = (j+0.5) * block;

			const tile = makeTile();
			tile.lookAt( 0, 1, 0 );
			tile.position.set( real_x, editlevel, real_z );
			tile.onClick = () => {
				console.log('floor');
			};

			tiles.add(i,tile_y,j,tile);
			arr.push(tile);
		}

	return arr;
};

exports.removeTile = pos => {
	const tile_x = Math.floor(pos.x/block);
	const tile_y = Math.floor(pos.y/block);
	const tile_z = Math.floor(pos.z/block);
	tiles.del(tile_x, tile_y, tile_z);
//	walls_horizontal.del(tile_x, tile_y, tile_z);
//	walls_vertical.del(tile_x, tile_y, tile_z);
};

exports.findTiles = (start,end) => {
	const start_x = Math.floor(start.x/block);
	const start_y = Math.floor(start.y/block);
	const start_z = Math.floor(start.z/block);
	const end_x = Math.floor(end.x/block);
	const end_z = Math.floor(end.z/block);

	var arr = [];

	for (let i = Math.min(start_x,end_x); i <= Math.max(start_x,end_x); i++)
		for (let j = Math.min(start_z,end_z); j <= Math.max(start_z,end_z); j++) {
			const tile = tiles.get(i,start_y,j);
			if (tile)
				arr.push(tile);
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

exports.makeXWall = (start, end) => {
	const wall = makeTile();
	wall.lookAt(1, 0, 0);
	wall.onClick = () => {
		console.log('X wall');
	};

	const start_coords = getVerticalWallCoords(start.z,start.y);
	const end_coords = getVerticalWallCoords(end.z,end.y);
	if ( !walls_x.add( xlevel, end_coords.y, end_coords.x ) )
		return false;
	console.log('adding');
	wall.position.set( xlevel, end_coords.y, end_coords.x );
	return wall;
}

exports.makeZWall = (start,end) => {
	const wall = makeTile();
	wall.onClick = () => {
		console.log('Z wall');
	};

	const start_coords = getVerticalWallCoords(start.x,start.y);
	const end_coords = getVerticalWallCoords(end.x,end.y);
	if ( !walls_z.add( end_coords.x, end_coords.y, zlevel ) )
		return false;
	
	wall.position.set( end_coords.x, end_coords.y, zlevel );
	return wall;
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
