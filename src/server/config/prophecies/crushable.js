define([
	
], function(
	
) {
	return {
		type: 'crushable',

		init: function() {
			
		},

		simplify: function() {
			return this.type;
		},

		events: {
			beforeTakeDamage: function(dmg, source) {
				dmg.amount *= 4;
			}
		}
	};
});