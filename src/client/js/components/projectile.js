define([
	'js/rendering/effects'
], function(
	effects
) {
	var scale = 40;

	return {
		type: 'projectile',

		source: null,
		target: null,

		row: null,
		col: null,

		x: 0,
		y: 0,

		ttl: 50,
		endTime: 0,

		particles: null,

		init: function(blueprint) {
			if ((!this.source) || (!this.target)) {
				this.obj.destroyed = true;
				return;
			}

			this.endTime = +new Date + this.ttl;

			var source = this.source;
			this.x = source.x;
			this.y = source.y;

			if (blueprint.projectileOffset) {
				if ((source.sprite) && (source.sprite.scale.x < 0))
					blueprint.projectileOffset.x *= -1;

				this.x += (blueprint.projectileOffset.x || 0);
				this.y += (blueprint.projectileOffset.y || 0);
			}

			this.obj.x = this.x;
			this.obj.y = this.y;

			var particlesBlueprint = this.particles ? {
				blueprint: this.particles
			} : {
				blueprint: {
					color: {
						start: ['7a3ad3', '3fa7dd'],
						end: ['3fa7dd', '7a3ad3']
					},
					scale: {
						start: {
							min: 2,
							max: 14
						},
						end: {
							min: 0,
							max: 8
						}
					},
					lifetime: {
						min: 1,
						max: 3
					},
					alpha: {
						start: 0.7,
						end: 0
					},
					randomScale: true,
					randomColor: true,
					chance: 0.6
				}
			};

			this.particles = this.obj.addComponent('particles', particlesBlueprint);
			this.obj.addComponent('explosion', particlesBlueprint);

			effects.register(this);
		},

		renderManual: function() {
			var source = this.obj;
			var target = this.target;

			var dx = target.x - this.x;
			var dy = target.y - this.y;

			var ticksLeft = ~~((this.endTime - (+new Date)) / 16);

			if (ticksLeft <= 0) {
				this.obj.x = target.x;
				this.obj.y = target.y;
				this.particles.emitter.emit = false;
				if (!this.noExplosion)
					this.obj.explosion.explode();
				this.obj.destroyed = true;
			}
			else {
				dx /= ticksLeft;
				dy /= ticksLeft;

				this.x += dx;
				this.y += dy;

				this.obj.x = (~~((this.x * scale) / 4) * 4) / scale;
				this.obj.y = (~~((this.y * scale) / 4) * 4) / scale;
			}
		},

		destroy: function() {
			effects.unregister(this);
		}
	};
});