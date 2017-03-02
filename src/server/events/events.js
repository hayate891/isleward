define([
	
], function(
	
) {
	return {
		configs: null,

		init: function(instance) {
			this.instance = instance;

			var configs = null;
			try {
				configs = require('../config/maps/' + this.instance.map.name + '/events');
			}
			catch (e) {}

			if (!configs)
				return;

			this.configs = extend(true, [], configs);
			this.configs.forEach(c => (c.ttl = 10));
		},

		update: function() {
			var configs = this.configs;
			if (!configs)
				return;

			var cLen = configs.length;
			for (var i = 0; i < cLen; i++) {
				var c = configs[i];
				if (c.event)
					continue;
				else if (c.ttl > 0) {
					c.ttl--;
					continue;
				}

				c.event = this.startEvent(c);
			}
		}, 

		startEvent: function(config) {
			return {};
		}
	};
});