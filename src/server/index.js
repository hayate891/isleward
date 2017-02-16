var requirejs = require('requirejs');

global.io = true;

requirejs(['./startup', './globals'], function(startup) {
	startup.init();
});