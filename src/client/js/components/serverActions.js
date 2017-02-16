define([
	'js/system/events',
	'js/system/client'
], function(
	events,
	client
) {
	return {
		type: 'serverActions',

		actions: [],

		init: function(blueprint) {
			events.on('onKeyUp', this.onKeyUp.bind(this));
		},

		onKeyUp: function(key) {
			this.actions.forEach(function(a) {
				if (a.key != key)
					return;

				client.request({
					cpn: 'player',
					method: 'performAction',
					data: a.action
				});
			}, this);
		},

		extend: function(blueprint) {
			if (blueprint.addActions) {
				blueprint.addActions.forEach(function(a) {
					var exists = this.actions.some(function(ta) {
						return ((ta.targetId == a.targetId) && (ta.cpn == a.cpn) && (ta.method == a.method));
					});
					if (exists)
						return;

					this.actions.push(a);
				}, this);

				delete blueprint.addActions;
			}

			if (blueprint.removeActions) {
				blueprint.removeActions.forEach(function(a) {
				this.actions.spliceWhere(function(ta) {
						return ((ta.targetId == a.targetId) && (ta.cpn == a.cpn) && (ta.method == a.method));
					});
				}, this);

				delete blueprint.removeActions;
			}
		}
	};
});