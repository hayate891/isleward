define([
	'globals',
	'server',
	'world/atlas',
	'components/components',
	'leaderboard/leaderboard',
	'security/io'
], function(
	globals,
	server,
	atlas,
	components,
	leaderboard,
	io
) {
	return {
		init: function() {
			io.init(this.onDbReady.bind(this));
		},

		onDbReady: function() {
			setInterval(function() {
				global.gc();
			}, 60000);
			
			globals.init();
			components.init(this.onComponentsReady.bind(this));
		},
		onComponentsReady: function() {
			server.init(this.onServerReady.bind(this));
		},
		onServerReady: function() {
			atlas.init();
			leaderboard.init();
		}
	};
});