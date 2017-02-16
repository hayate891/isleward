define([
	
], function(
	
) {
	return {
		type: 'slowed',

		events: {
			beforeMove: function(targetPos) {
				if (Math.random() < 0.3)
					return;

				targetPos.success = false;
			},

			beforeDealDamage: function(damage) {
				if (!damage)
					return;
				
				if (Math.random() < 0.3)
					return;
				
				damage.failed = true;
			},

			beforeCastSpell: function(successObj) {
				if (Math.random() < 0.3)
					return;
				
				successObj.success = false;
			}
		}
	};
});