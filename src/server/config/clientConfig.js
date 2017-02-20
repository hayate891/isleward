define([
	'misc/events'
], function(
	events
) {
	return {
		resourceList: [],

		init: function() {
			events.emit('onBeforeGetResourceList', this.resourceList);
		},

		getResourcesList: function(msg) {
			msg.callback(this.resourceList);
		}
	};
});