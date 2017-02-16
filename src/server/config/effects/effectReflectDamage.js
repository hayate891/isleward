define([
	
], function(
	
) {
	return {
		type: 'reflectDamage',

		events: {
			beforeTakeDamage: function(damage, source) {
				damage.amount *= 0.5;
				source.stats.takeDamage(damage, this.threatMult, this.obj);

				damage.failed = true;

				this.obj.instance.syncer.queue('onGetDamage', {
					id: this.obj.id,
					event: true,
					text: 'reflect'
				});
			}
		}
	};
});