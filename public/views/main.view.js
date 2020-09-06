const Vue = require('vue');

const Manager = require('../js/manager.src.js');

// TODO set width, height, x, y to values of the 3D window - not the whole window
/*			var tar = event.target;
			this.manager.clickLeft(
				  ( (event.clientX - tar.offsetLeft) / tar.offsetWidth ) * 2 - 1,
				- ( (event.clientY - tar.offsetTop) / tar.offsetHeight ) * 2 + 1
			);
*/

Vue.component('main-view', {
	data() {
		return {
			manager: null,
		}
	},
	methods: {
		mouseDown(event) {
			switch (event.button) {
			case 0:
				this.manager.clickLeftDown(event.clientX, event.clientY);
				break;
			case 2:
				this.manager.clickRightDown(event.clientX, event.clientY);
				break;
			default:
				break;
			}
		},
		mouseUp(event) {
			switch (event.button) {
			case 0:
				this.manager.clickLeftUp(event.clientX, event.clientY);
				break;
			case 2:
				this.manager.clickRightUp();
				break;
			default:
				break;
			}
		},
		mouseMove(event) {
			this.manager.mouseMove(event.clientX, event.clientY);
		},
		keyDown(event) {
			if (event.key === ' ')
				event.preventDefault();
			this.manager.keyDown(event.key.toUpperCase());
		},
		keyUp(event) {
			this.manager.keyUp(event.key.toUpperCase());
		},
		noMenu(event) {
			event.preventDefault();
		}
	},
	mounted() {
		this.manager = new Manager(window.innerWidth, window.innerHeight, this.$refs['parent']);
	},
	render(h) {
		return h('div', {
				attrs: {
					id: 'big',
					tabindex: '0'
				},
				ref: 'parent',
				on: {
					mousedown: this.mouseDown,
					mouseup: this.mouseUp,
					mousemove: this.mouseMove,
					keydown: this.keyDown,
					keyup: this.keyUp,
					contextmenu: this.noMenu
				}
			}
		);
	},
});
