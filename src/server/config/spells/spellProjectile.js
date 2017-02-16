define([
	
], function(
	
) {
	return {
		type: 'projectile',

		cdMax: 7,
		manaCost: 0,

		range: 9,

		speed: 150,
		damage: 1,

		row: 3,
		col: 0,

		needLos: true,

		cast: function(action) {
			var obj = this.obj;
			var target = action.target;

			var ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed) - 50;

			this.sendAnimation({
				caster: this.obj.id,
				components: [{
					idSource: this.obj.id,
					idTarget: target.id,
					type: 'projectile',
					ttl: ttl,
					projectileOffset: this.projectileOffset,
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

			this.queueCallback(this.explode.bind(this, target), ttl, null, target);

			return true;
		},
		explode: function(target) {
			if ((this.obj.destroyed) || (target.destroyed))
				return;

			var damage = this.getDamage(target);

			if (!target.stats) {
				console.log('has no stats???');
				console.log(target);
				return;
			}
			target.stats.takeDamage(damage, this.threatMult, this.obj);
		}
	};
});