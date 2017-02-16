define([
	'js/system/client',
	'js/system/events'
], function(
	client,
	events
) {
	return {
		type: 'dialogue',

		init: function() {

		},

		talk: function(target) {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'dialogue',
					method: 'talk',
					data: {
						target: target.id
					}
				}
			});
		},

		extend: function(blueprint) {
			events.emit('onGetTalk', blueprint.state);
		}
	};
});