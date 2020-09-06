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
}

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
//		const x_diff = camera.position.x - xlevel;
		// TODO stop replacing once it works properly
		const xrep = -2;
		const x_diff = camera.position.x - xrep;
//		console.log(x_diff);

		// check if the theta angle is bad
		const plane_click = this.getPlaneClick(x,y,0);
		if (
			x_diff === 0 ||
			(x_diff > 0 && plane_click.x > camera.position.x) ||
			(x_diff < 0 && plane_click.x < camera.position.x)
		)
			return;// signal bad angle? TODO
		
		const camang = getCamAngles(x,y);
		let pre_theta = angles.theta - Math.PI/2;
		if (x_diff > 0)
			pre_theta -= Math.PI;
		pre_theta = pre_theta % (Math.PI*2);
		if (pre_theta < -Math.PI)
			pre_theta += Math.PI*2;
		const theta = pre_theta;
		const phi = angles.phi - Math.PI/2;
		// check if the cam angle is bad TODO maybe allow this in the future
		if (Math.abs(theta) > Math.PI/2)
			return;
		console.log('theta',toDeg(theta),toDeg(camang.theta));
//		console.log(toDeg(phi));

		const diff_r = x_diff / Math.cos( phi );
		const cam_r = diff_r / Math.cos( theta );
		const plane_r = pythLeg(cam_r,x_diff);
		console.log('camr',diff_r,cam_r,plane_r);

		// TODO det kanske är bäst att sätta all sin till abs, och göra +/- efteråt

		const cam_y = Math.sin( phi ) * cam_r;//+ camera.position.y;
		const cam_z = pythLeg( plane_r, cam_y );// TODO fixa +/-
//		console.log('cams',cam_y,cam_z);

		// x_diff is the hypothenuse in a horizontal triangle created by theta
		const r_leg = Math.cos( theta ) * Math.abs( x_diff );
		const y_diff = Math.abs( Math.tan( phi + camang.phi ) ) * r_leg;
		const y_r = pythHyp(x_diff,y_diff);
//		console.log('y_r',y_r);

		// distance from camera to x_plane along the center y-axis
		const z_r = x_diff / Math.cos( theta );
		const phi_r = z_r / Math.cos( phi + camang.phi );
		const phi_y = pythLeg( phi_r, z_r );
		console.log('phi,ydiff',phi_y,y_diff);// y_diff negativt. påverkar det nåt?
		
		// theta_r is the hypothenuse of a triangle on the x plane
		const theta_r = pythHyp(cam_z,phi_y - y_diff);
		console.log('thetar',theta_r);
		// with all sides known, angles can be found on the theta_r-cam triangle
		const gamma = Math.acos(
			(square(theta_r) + square(phi_r) - square(y_r))
			/ (2*theta_r*phi_r)
		);
		// the angle between the z-axis and theta_r finds the camang.theta_r length
		const psi = Math.acos( cam_z / theta_r );
		console.log('psi',toDeg(psi));
		
		// allt hittills är rätt. förutom +/- TODO
		
//		console.log(toDeg(gamma),toDeg(theta),toDeg(camang.theta));
		
		const click_r = (phi_r / Math.sin( gamma - (-camang.theta) )) * Math.sin( camang.theta );
		const whole_r = Math.sign( theta ) * theta_r + click_r;
		console.log('test',Math.sign( theta ),theta_r);
//		console.log(Math.sign( theta ) * theta_r,click_r);

		// TODO ah! det är för att whole_r går från 2 till -4
		// vilket egentligen är 6 men blir till 4		
//		console.log( Math.cos(psi)*theta_r,Math.cos(psi)*click_r);

//*
		console.log(
			Math.cos( psi ) * whole_r + camera.position.z,
			Math.sign( phi + camang.phi ) * ( Math.sin( psi ) * whole_r - y_diff ) + camera.position.y
		);
//*/
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
