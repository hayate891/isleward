define([

], function(

) {
	var cpnFirePatch = {
		type: 'firePatch',

		collisionEnter: function(o) {
			if ((o.player) || (!o.stats))
				return;

			o.stats.takeDamage(amount, 1, this.caster);
		}
	};

	return {
		type: 'slowBlast',

		intCd: 0,
		intCdMax: 1,
		thickness: 2,
		casting: false,
		radius: 0,

		needLos: false,

		range: 100,

		castingEffect: null,

		update: function() {
			if (!this.casting)
				return;

			if (this.intCd > 0) {
				this.intCd--;
				return;
			} else
				this.intCd = this.intCdMax;

			for (var a = 0; a < this.thickness; a++) {
				this.radius++;
				var radius = this.radius;

				var obj = this.obj;

				var x = obj.x;
				var y = obj.y;

				var physics = obj.instance.physics;
				var syncer = obj.instance.syncer;

				var xMin = x - radius;
				var yMin = y - radius;
				var xMax = x + radius;
				var yMax = y + radius;

				var success = false;

				for (var i = xMin; i <= xMax; i++) {
					var dx = Math.abs(x - i);
					for (var j = yMin; j <= yMax; j++) {
						var dy = Math.abs(y - j);

						if (Math.random() < 0.35)
							continue;

						var distance = ~~Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
						if (distance != radius)
							continue;

						if (!physics.hasLos(x, y, i, j))
							continue;

						success = true;

						var effect = {
							x: i,
							y: j,
							components: [{
								type: 'attackAnimation',
								destroyObject: true,
								row: [10, 10, 10, 10, 10, 10, 10, 8, 8, 8, 7, 7, 7][~~(Math.random() * 13)],
								col: 4,
								frameDelay: 1 + ~~(Math.random() * 10)
							}, {
								type: 'particles',
								noExplosion: true,
								blueprint: this.particles
							}]
						};

						syncer.queue('onGetObject', effect);

						var mobs = physics.getCell(i, j);
						var mLen = mobs.length;
						for (var k = 0; k < mLen; k++) {
							var m = mobs[k];

							//Maybe we killed something?
							if (!m) {
								mLen--;
								continue;
							}
							else if (!m.player)
								continue;

							var damage = this.getDamage(m);
							m.stats.takeDamage(damage, 1, obj);
						}
					}
				}

				if (!success) {
					this.casting = false;
					this.castingEffect.destroyed = true;
					return;
				}
			}

			this.sendBump({
				x: x,
				y: y + 1
			});

			return true;
		},

		cast: function(action) {
			this.castingEffect = this.obj.effects.addEffect({
				type: 'casting'
			});

			this.casting = true;
			this.radius = 0;
			this.intCd = 0;

			return true;
		}
	};
});