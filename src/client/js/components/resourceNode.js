define([
	
], function(
	
) {
	return {
		type: 'resourceNode',

		init: function() {
			this.obj.addComponent('particles', {
				chance: 0.1,
				blueprint: {
					color: {
						start: 'f2f5f5'
					},
					alpha: {
						start: 0.75,
						end: 0.2
					},
					scale: {
						start: 6,
						end: 2
					},
					lifetime: {
						min: 1,
						max: 3
					},
					chance: 0.025
				}
			});
		}	
	};
});