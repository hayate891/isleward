define([

], function(

) {
	return {
		type: 'reflectDamage',

		cdMax: 0,
		manaCost: 0,

		duration: 10,

		targetGround: true,

		cast: function(action) {
			var selfEffect = this.obj.effects.addEffect({
				type: 'reflectDamage',
				threatMult: this.threatMult
			});

			var ttl = this.duration * 350;

			if (this.animation) {
				this.obj.instance.syncer.queue('onGetObject', {
					id: this.obj.id,
					components: [{
						type: 'animation',
						template: this.animation
					}]
				});
			}

			this.queueCallback(this.endEffect.bind(this, selfEffect), ttl - 50);

			return true;
		},
		endEffect: function(selfEffect) {
			if (this.obj.destroyed)
				return;

			var obj = this.obj;

			obj.effects.removeEffect(selfEffect);
		}
	};
});