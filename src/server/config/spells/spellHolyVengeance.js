define([

], function(

) {
	return {
		type: 'holyVengeance',

		cdMax: 0,
		manaCost: 0,

		duration: 10,

		targetFriendly: true,

		cast: function(action) {
			var target = action.target;
			if (!target.effects)
				target = this.obj;

			if (this.animation) {
				this.obj.instance.syncer.queue('onGetObject', {
					id: this.obj.id,
					components: [{
						type: 'animation',
						template: this.animation
					}]
				});
			}

			var selfEffect = target.effects.addEffect({
				type: 'holyVengeance',
				ttl: this.duration
			});

			return true;
		}
	};
});