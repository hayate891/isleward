define([
	
], function(
	
) {
	return {
		type: 'iceSpear',

		cdMax: 7,
		manaCost: 0,

		range: 9,

		speed: 70,
		damage: 1,

		freezeDuration: 10,

		needLos: true,

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
					row: 3,
					col: 0,
					ttl: ttl,
					particles: this.particles
				}, {
					type: 'attackAnimation',
					layer: 'projectiles',
					loop: -1,
					row: 3,
					col: 4
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
				type: 'slowed',
				ttl: this.freezeDuration
			});

			this.obj.instance.syncer.queue('onGetDamage', {
				id: target.id,
				event: true,
				text: 'slowed'
			});

			var damage = this.getDamage(target);
			target.stats.takeDamage(damage, this.threatMult, this.obj);
		}
	};
});