define([
	
], function(
	
) {
	return {
		type: 'resourceNode',

		collisionEnter: function(obj) {
			if (!obj.player)
				return;

			obj.gatherer.enter(this.obj);
		},

		collisionExit: function(obj) {
			if (!obj.player)
				return;

			obj.gatherer.exit(this.obj);
		},

		simplify: function() {
			return {
				type: 'resourceNode'
			};
		}
	};
});