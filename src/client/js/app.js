require = requirejs;

require.config({
	baseUrl: '',
	waitSeconds: 120,
	paths: {
		'socket': 'plugins/socket',
		'jquery': 'plugins/jquery.min',
		'json': 'plugins/json',
		'text': 'plugins/text',
		'html': 'plugins/html',
		'css': 'plugins/css',
		'bin': 'plugins/bin',
		'audio': 'plugins/audio',
		'worker': 'plugins/worker',
		'main': 'js/main',
		'helpers': 'js/misc/helpers',
		'particles': 'plugins/pixi.particles',
		'pixi': 'plugins/pixi.min'
	},
	shim: {
		'socket': {
			exports: 'io'
		},
		'jquery': {
			exports: '$'
		},
		'helpers': {
			deps: [
				'jquery'
			]
		},
		'pixi': {
			exports: 'PIXI'
		},
		'particles': {
			deps: [
				'pixi'
			]
		},
		'main': {
			deps: [
				'helpers',
				'js/input'
			]
		}
	}
});

require([
	'main'
], function(
	main
) {
	main.init();
});