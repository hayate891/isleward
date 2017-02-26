define([
	
], function(
	
) {
	return {
		generate: function(blueprint) {
			var result = {
				fireEvent: function() {}
			};

			blueprint.syncer = {};

			for (var p in blueprint) {
				var componentTemplate = require('../src/server/components/' + p);
				var component = extend(true, {}, componentTemplate, blueprint[p]);

				component.obj = result;			

				result[p] = component
			}

			return result;
		}
	};
});