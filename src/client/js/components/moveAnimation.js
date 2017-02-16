define([

], function(

) {
	return {
		type: 'moveAnimation',

		targetX: 0,
		targetY: 0,

		x: 0,
		y: 0,

		ttl: 50,
		endTime: 0,

		particles: null,

		init: function(blueprint) {
			this.particles = this.obj.addComponent('particles', {
				blueprint: {
					scale: {
						start: {
							min: 6,
							max: 16
						},
						end: {
							min: 0,
							max: 10
						}
					},
					opacity: {
						start: 0.05,
						end: 0
					},
					lifetime: {
						min: 1,
						max: 2
					},
					speed: {
						start: {
							min: 2,
							max: 20
						},
						end: {
							min: 0,
							max: 8
						}
					},
					color: {
						start: 'fcfcfc',
						end: 'c0c3cf'
					},
					randomScale: true,
					randomSpeed: true,
					chance: 0.4
				}
			});

			this.endTime = +new Date + this.ttl;

			var obj = this.obj;
			this.x = obj.x;
			this.y = obj.y;

			if (this.targetX > this.x) {
				this.obj.flipX = false;
			}
			else if (this.targetX < this.x)
				this.obj.flipX = true;

			this.obj.setSpritePosition();
		},

		update: function() {
			var source = this.obj;
			var target = this.target;

			var dx = this.targetX - this.x;
			var dy = this.targetY - this.y;

			var ticksLeft = ~~((this.endTime - (+new Date)) / 16);

			if (ticksLeft <= 0) {
				this.obj.x = this.targetX;
				this.obj.y = this.targetY;

				this.obj.setSpritePosition();

				this.destroyed = true;
				this.particles.destroyed = true;

				//Sometimes we just move to a point without exploding
				if (target) {
					target.addComponent('explosion', {
						new: true,
						blueprint: {
							r: 242,
							g: 245,
							b: 245
						}
					}).explode();
				}
			} else {
				dx /= ticksLeft;
				dy /= ticksLeft;

				this.x += dx;
				this.y += dy;

				this.obj.x = (~~((this.x * 32) / 8) * 8) / 32;
				this.obj.y = (~~((this.y * 32) / 8) * 8) / 32;

				this.obj.setSpritePosition();
			}
		}
	};
});