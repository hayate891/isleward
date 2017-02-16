define([
	
], function(
	
) {
	return {
		generate: function(item, blueprint) {
			item.level = blueprint.level || 1;
		}
	};
});