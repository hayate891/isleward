define([
	
], function(
	
) {
	return {
		type: 'hardcore',

		init: function() {
			
		},

		simplify: function() {
			return this.type;
		},

		events: {
			afterDeath: function(event) {
				event.permadeath = true;
			}
		}
	};
});