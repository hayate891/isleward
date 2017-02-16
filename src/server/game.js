define([
	'items/lootRoller'
], function(
	lootRoller
) {
	return {
		interval: null,
		init: function() {
			this.interval = setInterval(this.update.bind(this), 1000);
		},

		update: function() {
			lootRoller.update();
		}
	};
});