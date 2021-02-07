const THREE = require('three');

// variables/functions stored outside of the class acts as private
// but what if several instances of a class? they must share the variable. sad.
// nvm you can put them in the class without this.
const ROTATION_SPEED = 0.01;
const MOVEMENT_SPEED = 0.05;

const FOV_DEGREES = 100;
const FOV_RADIANS = FOV_DEGREES * Math.PI/180;

const moveVertical = (camera, dy) => {
	camera.position.y += MOVEMENT_SPEED * dy;
};
const moveHorizontal = (camera, dx, dz) => {
	camera.position.x += MOVEMENT_SPEED * dx;
	camera.position.z += MOVEMENT_SPEED * dz;
};
const execWithDirection = (camera, func) => {
	const arr = new THREE.Vector3();
	const dir = camera.getWorldDirection(arr);
	func(new THREE.Vector2(dir.x, dir.z).normalize());
};

const getAngles = camera => {
	const arr = new THREE.Vector3();
	const dir = camera.getWorldDirection(arr);
	const phi = Math.acos(dir.y);
	const r_theta = Math.sqrt(Math.pow(dir.x,2) + Math.pow(dir.z,2));
	
	var theta = Math.acos(dir.z / r_theta);
	if (Math.sign(dir.x) === -1)
		theta = -theta;
	return { theta: theta, phi: phi };
};

const movements = new Map();

movements.set(' ', camera => { moveVertical( camera, 1 ); });
movements.set('SHIFT', camera => { moveVertical( camera, -1 ); });
movements.set('W', camera => {
	execWithDirection( camera, dir => {
		moveHorizontal( camera, dir.x, dir.y );
	});
});
movements.set('S', camera => {
	execWithDirection( camera, dir => {
		moveHorizontal( camera, -dir.x, -dir.y );
	});
});
movements.set('A', camera => {
	execWithDirection( camera, dir => {
		moveHorizontal( camera, dir.y, -dir.x );
	});
});
movements.set('D', camera => {
	execWithDirection( camera, dir => {
		moveHorizontal( camera, -dir.y, dir.x );
	});
});

const square = a => {
	return Math.pow(a,2);
};
const pythHyp = (a,b) => {
	return Math.sqrt( square(a) + square(b) );
};
const pythLeg = (c,b) => {
	return Math.sqrt( square(c) - square(b) );
};
const toDeg = rad => {
	return rad*180/Math.PI;
};

// TODO kanske göra en egen fil för matematiska beräkningar

function CameraHandler(width, height) {
	const camera = new THREE.PerspectiveCamera(
		FOV_DEGREES,						// Field of view, FOV
		width/height,						// Aspect ratio - anti-squish
		0.1,								// render closeness
		1000								// render distance
	);
	this.getCamera = () => { return camera; };

	const FOV_HORIZONTAL = 2 * Math.atan( Math.tan( FOV_RADIANS / 2 ) * camera.aspect );

	var rotationCenter = null;
	var rotationOrigin = null;
	
	this.rotationStart = (x, y) => {
		// store starting coordinates that will act as center
		rotationCenter = { x: x, y: y };
		rotationOrigin = getAngles(camera);
	};
	this.rotationStop = () => {
		rotationCenter = null;
	};
	this.rotationMove = (x_in, y_in) => {
		if (rotationCenter === null)
			return false;
		const x = (x_in - rotationCenter.x) * ROTATION_SPEED;
		const y = (y_in - rotationCenter.y) * ROTATION_SPEED;

		const theta = rotationOrigin.theta + x;
		const phi = Math.min( Math.max( rotationOrigin.phi - y, 0.0001), Math.PI - 0.0001);

		camera.lookAt(// TODO only use lookAt in the beginning
			camera.position.x + Math.sin( theta ) * Math.sin( phi ),
			camera.position.y + Math.cos( phi ),
			camera.position.z + Math.cos( theta ) * Math.sin( phi )
		);
		return true;
	};
	
	const getCamAngles = (x,y) => {
		const depth_y = height/2 / Math.tan( FOV_RADIANS/2 );
		const cam_phi = - Math.atan( ((height/2) - y) / depth_y );
		
		const depth_x = width/2 / Math.tan( FOV_HORIZONTAL/2 );
		const depth_r = Math.sqrt( Math.pow(((height/2) - y), 2) + Math.pow(depth_x,2) );
		const cam_theta = Math.atan( ((width/2) - x) / depth_r);
		
		return {
			theta: cam_theta,
			phi: cam_phi
		};
	};
	this.getPlaneClick = (x,y,editlevel) => {
		const angles = getAngles(camera);
		const y_diff = camera.position.y - editlevel;
		
		const camang = getCamAngles(x,y);
		const plane_y = Math.tan( Math.PI - (angles.phi+camang.phi) ) * y_diff;
		const cam_r = Math.sqrt( Math.pow(y_diff, 2) + Math.pow(plane_y, 2) );
		const plane_x = Math.tan( camang.theta ) * cam_r;
		
		const real_x = Math.cos( angles.theta ) * plane_x 
				 + Math.cos( angles.theta - Math.PI/2 ) * plane_y;
		const real_z = Math.sin( angles.theta ) * plane_x 
				 + Math.sin( angles.theta - Math.PI/2 ) * plane_y;

		return {
			x: real_x + camera.position.x,
			z: - real_z + camera.position.z
		};	
	};
	this.getXclick = (x,y,xlevel) => {
		const angles = getAngles(camera);
		const camang = getCamAngles(x,y);
//		const x_diff = camera.position.x - xlevel;
		// TODO stop replacing once it works properly
		const xrep = 2;
		const x_diff = camera.position.x - xrep;
//		console.log(x_diff);

		const result = this.checkAngles(angles,camang,x_diff);
//*
		if (result !== undefined) {
			console.log(
				camera.position.y - result.y,
				camera.position.z - result.z
			);
		}
//*/
	};
	
	this.checkAngles = (angles,camang,x_diff) => {
		console.log(toDeg(angles.theta),toDeg(angles.phi));
		console.log(toDeg(camang.theta),toDeg(camang.phi));
		
		const absang = this.getAbsClickAngle(angles,camang);
		console.log('absang',toDeg(absang.theta),toDeg(absang.phi));
		
		if (
			( x_diff < 0 && !(0 < absang.theta && absang.theta < Math.PI) ) ||
			( x_diff > 0 && !(-Math.PI < absang.theta && absang.theta < 0) )
		) {
			console.log('Bad angle!');
			return;
		}

		const center_theta = absang.theta - Math.PI/2;
		const center_phi = absang.phi - Math.PI/2;

		const click_r = ( x_diff / Math.cos(center_phi) ) / Math.cos(center_theta);
		const plane_r = pythLeg(click_r,x_diff);
		
		const z_leg = Math.tan(center_theta) * x_diff;
		const y_leg = Math.sin(center_phi) * click_r;
		
		// c^2 = a^2 + b^2 - 2*a*b*Math.cos(v)
		// Math.cos(v) = (a² + b² - c²)/2*a*b
		const plane_v = Math.acos(
			(square(z_leg)+square(plane_r)-square(y_leg)) /
			(2*z_leg*plane_r)
		);
		
		return {
			y: Math.abs( Math.sin(plane_v)*plane_r ) * Math.sign(center_phi),
			z: Math.abs( Math.cos(plane_v)*plane_r ) * Math.sign(center_theta)
		};
	};

	// get the "absolute" click angle, not based on camera
	this.getAbsClickAngle = (cam,click) => {
		const phi = click.phi+(cam.phi-Math.PI/2);
		const hyp = Math.cos( click.theta );
		const far_leg = Math.sin( phi ) * hyp;
		const near_leg = Math.cos( phi ) * hyp;

		const abs_phi = Math.asin( far_leg );
		const phi_leg = Math.cos( abs_phi );
		const abs_theta = Math.acos( near_leg / phi_leg );

		return {
			theta: Math.sign(click.theta)*abs_theta+cam.theta,
			phi: abs_phi+Math.PI/2
		};
	};

	this.hasMovement = (key) => {
		return movements.has(key);
	};
	this.getMovement = (key) => {
		if (!movements.has(key))
			return null;
		return () => movements.get(key)(camera);
	};
/*
	this.render = renderfunc => {
		renderfunc(camera)
	};
//*/
}

module.exports = CameraHandler;
