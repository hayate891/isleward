define([
	
], function(
	
) {
	return {
		type: 'stunned',

		events: {
			beforeMove: function(targetPos) {
				targetPos.success = false;
			},

			beforeDealDamage: function(damage) {
				if (damage)
					damage.failed = true;
			},

			beforeCastSpell: function(successObj) {		
				successObj.success = false;
			}
		}
	};
});