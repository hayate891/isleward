define([
	'js/system/client',
	'js/system/events'
], function(
	client,
	events
) {
	return {
		type: 'gatherer',

		init: function() {
			this.obj.on('onKeyDown', this.onKeyDown.bind(this));
		},

		extend: function(msg) {
			events.emit('onShowProgress', 'Gathering...', msg.progress);
		},

		onKeyDown: function(key) {
			if (key != 'g')
				return;

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'gatherer',
					method: 'gather'
				}
			});
		}
	};
});