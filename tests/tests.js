define([
	'server/components/inventory'
], function(
	inventory
) {
	return {
		init: function() {
			this.runTest('inventory', inventory);
		},

		runTest: function(testName, test) {
			for (var t in test) {
				try {
					if (test[t]())
						this.logError(testName, t);
				}
				catch (e) {
					this.logError(testName, t, e);
				}
			}
		},

		logError: function(test, method, error) {
			console.log(test + '.' + method + ' failed');
			if (error)
				console.log(error);
		}
	};
});