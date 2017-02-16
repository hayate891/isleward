var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '',
    nodeRequire: require
});

global.io = true;
var instancer = null;

requirejs([
	'extend', 'misc/helpers', 'components/components', 'world/instancer', 'security/io'
], function(
	extend, helpers, components, _instancer, io
) {
	var onDbReady = function() {
		global.extend = extend;
		global._ = helpers;
		require('../misc/random');
		
		instancer = _instancer;

		components.init(function() {
			process.send({
				method: 'onReady'
			});
		});

		setInterval(function() {
			global.gc();
		}, 60000);
	};

	io.init(onDbReady);
});

process.on('message', (m) => {
	if (m.method) {
		instancer[m.method](m.args);
	}
});