define([
	'server/components/inventory'
], function(
	inventory
) {
	var components = ['inventory', 'reputation'];

	return {
		stats: {
			succeeded: 0,
			failed: 0
		},

		init: function() {
			console.log('Testing Started');
			console.log();

			components.forEach(function(c) {
				this.runTest(c, require('server/components/' + c));
			}, this);

			console.log();
			console.log('Testing Completed');
			console.log('Succeeded: ' + this.stats.succeeded);
			console.log('Failed: ' + this.stats.failed);
		},

		runTest: function(testName, test) {
			for (var t in test) {
				try {
					if (test[t]()) {
						this.logError(testName, t);
						this.stats.failed++;
					}
					else
						this.stats.succeeded++;
				}
				catch (e) {
					this.stats.failed++;
					this.logError(testName, t, e);
				}
			}
		},

		logError: function(test, method, error) {
			var splitMethod = method.split('_');
			method = splitMethod[0];
			var variant = splitMethod[1];

			console.log('Failed: ' + test + '.' + method + ' (' + variant + ')');
			if (error)
				console.log(error);
		}
	};
});