define([

], function(

) {
	return {
		type: 'stealth',

		cdMax: 0,
		manaCost: 0,

		duration: 10,

		targetGround: true,

		cast: function(action) {
			//Clear Aggro
			this.obj.aggro.die();

			var ttl = this.duration * 350;
			var endCallback = this.queueCallback(this.endEffect.bind(this), ttl - 50);

			this.obj.effects.addEffect({
				type: 'stealth',
				endCallback: endCallback
			});		

			return true;
		},
		endEffect: function() {
			if (this.obj.destroyed)
				return;

			var obj = this.obj;

			obj.effects.removeEffectByName('stealth');
			this.obj.aggro.move();
		}
	};
});