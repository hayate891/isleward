define([
	
], function(
	
) {
	return {
		type: 'events',

		list: [],

		simplify: function(self) {
			if (!self)
				return;

			var result = {
				type: 'events'
			};

			if (this.list.length > 0) {
				result.list = this.list.map(l => ({
					name: l.name,
					description: l.description
				}));
			}

			return result;
		},

		save: function() {
			return null;
		},

		events: {
			afterMove: function() {
				var events = this.obj.instance.events;
				var closeEvents = events.getCloseEvents(this.obj);
				if (!closeEvents)
					return;

				closeEvents.forEach(function(c) {
					this.list.push(c);

					this.obj.syncer.setArray(true, 'events', 'updateList', {
						name: c.config.name,
						description: c.config.description
					});
				}, this);
			}
		}	
	};
});