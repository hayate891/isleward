define([
	
], function(
	
) {
	return {
		type: 'stealth',

		events: {
			beforeDealDamage: function() {
				this.endCallback.time = 0;
			},
			beforeAggro: function(result) {
				result.success = false;
			}
		}
	};
});