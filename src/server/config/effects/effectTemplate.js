define([
	
], function(
	
) {
	return {
		save: function() {
			if (!this.persist)
				return null;

			var values = {};
			for (var p in this) {
				var value = this[p];
				if ((typeof(value) == 'function') || (p == 'obj') || (p == 'events'))
					continue;

				values[p] = value;
			}

			return values;
		},

		simplify: function() {
			return this.type;
		}	
	};
});