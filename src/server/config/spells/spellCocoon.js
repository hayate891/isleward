define([
	
], function(
	
) {
	return {
		type: 'cocoon',

		cdMax: 7,
		manaCost: 0,

		range: 9,

		speed: 200,
		damage: 0,

		needLos: true,

		ttl: 75,

		cast: function(action) {
			var obj = this.obj;
			var target = action.target;

			var ttl = Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed;

			this.sendAnimation({
				caster: this.obj.id,
				components: [{
					idSource: this.obj.id,
					idTarget: target.id,
					type: 'projectile',
					ttl: ttl,
					particles: this.particles
				}, {
					type: 'attackAnimation',
					layer: 'projectiles',
					loop: -1,
					row: this.row,
					col: this.col
				}]
			});

			this.sendBump(target);

			this.queueCallback(this.explode.bind(this, target), ttl);

			return true;
		},
		explode: function(target) {
			if (this.obj.destroyed)
				return;

			var targetEffect = target.effects.addEffect({
				type: 'cocoon',
				ttl: this.ttl,
				source: this.obj
			});

			this.obj.instance.syncer.queue('onGetDamage', {
				id: target.id,
				event: true,
				text: 'cocooned'
			});

			target.aggro.tryEngage(this.obj, this.damage, this.threatMult);
		}
	};
});