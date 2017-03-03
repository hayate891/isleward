define([
	'js/system/events'
], function(
	events
) {
	return {
		type: 'events',
		list: [],

		init: function() {
			this.list.forEach(function(q) {
				events.emit('onObtainEvent', q);
			});
		},

		extend: function(blueprint) {
			if (blueprint.updateList) {
				blueprint.updateList.forEach(function(q) {
					events.emit('onObtainEvent', q);
					this.list.push(q);
				}, this);
			}	
		}	
	};
});