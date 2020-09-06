const Vue = require('vue');

const app = new Vue({
	el: '#app',
	render: h => h('main-view'),
	data: {
		message: 'hello world'
	}
});//.$mount('#app');
