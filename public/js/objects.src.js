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
const walls_horizontal = new Matrix3D();
const walls_vertical = new Matrix3D();

exports.setColor = (objects,col) => {
	for (let i=0; i < objects.length; i++)
		objects[i].material.color.r = col;
};

var editlevel = 0;

exports.getLevel = () => {
	return editlevel;
};

exports.incLevel = inc => {
	editlevel += block * inc;
};

exports.makeGrid = () => {
	const grid = new THREE.GridHelper( grid_size*block, grid_size );
	grid.position.set( 0, editlevel, 0);
	return grid;
};

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

			// TODO need to learn matrix transforms to move the tile
			const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
			material.side = THREE.DoubleSide;
			const tile = new THREE.Mesh( plane_geometry, material );
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
	walls_horizontal.del(tile_x, tile_y, tile_z);
	walls_vertical.del(tile_x, tile_y, tile_z);
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

exports.makeWall = (x,z) => {
	const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	material.side = THREE.DoubleSide;
	const wall = new THREE.Mesh( plane_geometry, material );
	wall.onClick = () => {
		console.log('wall');
	};
	
	var tile_x = Math.floor(x/block);
	var tile_y = editlevel/block;
	var tile_z = Math.floor(z/block);

	var part_x = x % block;
	if (part_x < 0)
		part_x += block;
	var part_z = z % block;
	if (part_z < 0)
		part_z += block;

	var real_x;
	const real_y = editlevel + block/2;
	var real_z;
	
	const far = part_x + part_z > block;
	const right = part_x < part_z;
	var available;
	if (far && right || !far && !right) {
		wall.lookAt(0, 0, 1);
		tile_z += far;
		real_x = (tile_x + 0.5) * block;
		real_z = tile_z * block;
		available = walls_vertical.add(tile_x,tile_y,tile_z);
	} else {
		wall.lookAt(1, 0, 0);
		tile_x += far;
		real_x = tile_x * block;
		real_z = (tile_z + 0.5) * block;
		available = walls_horizontal.add(tile_x,tile_y,tile_z);
	}

	if (!available)
		return false;
	wall.position.set(real_x, real_y, real_z);

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
