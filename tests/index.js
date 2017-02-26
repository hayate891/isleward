var requirejs = require('requirejs');
var extend = require('extend');

global.extend = extend;

requirejs(['./tests', '../src/server/misc/helpers'], function(tests) {
	tests.init();
});