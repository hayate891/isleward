define([

], function(

) {
	var cpnSmokePatch = {
		type: 'smokePatch',

		contents: [],

		applyDamage: function(o, amount) {
			o.stats.takeDamage(amount, 1, this.caster);
		},

		collisionEnter: function(o) {
			if (!o.aggro)
				return;

			var isPlayer = !!this.caster.player;
			var isTargetPlayer = !!o.player;

			if ((!this.caster.aggro.willAttack(o)) && (isPlayer == isTargetPlayer))
				return;

			this.contents.push(o);
		},

		collisionExit: function(o) {
			var contents = this.contents;
			var cLen = contents.length;
			for (var i = 0; i < cLen; i++) {
				if (contents[i] == o) {
					contents.splice(i, 1);
					return;
				}
			}
		},

		update: function() {
			if (this.caster.destroyed)
				return;

			var stats = this.caster.stats;

			var contents = this.contents;
			var cLen = contents.length;
			for (var i = 0; i < cLen; i++) {
				var c = contents[i];

				var damage = this.getDamage(c);
				this.applyDamage(c, damage);
			}
		}
	};

	return {
		type: 'smokeBomb',

		cdMax: 20,
		manaCost: 0,

		damage: 1,
		duration: 10,

		radius: 1,
		targetGround: true,

		cast: function(action) {
			var obj = this.obj;

			var radius = this.radius;

			var x = obj.x;
			var y = obj.y;

			var objects = this.obj.instance.objects;
			var patches = [];

			var physics = this.obj.instance.physics;

			for (var i = x - radius; i <= x + radius; i++) {
				var dx = Math.abs(x - i);
				for (var j = y - radius; j <= y + radius; j++) {
					var distance = dx + Math.abs(j - y);

					if (distance > radius + 1)
						continue;

					if (!physics.hasLos(x, y, i, j))
						continue;

					var patch = objects.buildObjects([{
						x: i,
						y: j,
						properties: {
							cpnHealPatch: cpnSmokePatch,
							cpnParticles: {
								simplify: function() {
									return {
										type: 'particles',
										blueprint: this.blueprint
									};
								},
								blueprint: this.particles
							}
						},
						extraProperties: {
							smokePatch: {
								caster: obj,
								statType: this.statType,
								getDamage: this.getDamage.bind(this)
							}
						}
					}]);

					patches.push(patch);
				}
			}

			this.sendBump({
				x: x,
				y: y - 1
			});

			this.queueCallback(null, this.duration * 350, this.endEffect.bind(this, patches), null, true);

			return true;
		},
		endEffect: function(patches) {
			var pLen = patches.length;
			for (var i = 0; i < pLen; i++) {
				patches[i].destroyed = true;
			}
		}
	};
});