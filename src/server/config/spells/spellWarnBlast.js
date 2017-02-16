define([

], function(

) {
	return {
		type: 'warnBlast',

		needLos: false,

		range: 100,

		castingEffect: null,

		statType: 'agi',
		statMult: 1,
		targetGround: true,

		damage: 10,

		delay: 10,

		radius: 1,

		cast: function(action) {
			var obj = this.obj;

			var physics = obj.instance.physics;

			var target = action.target;
			var x = target.x;
			var y = target.y;

			var radius = this.radius;

			var xMin = x - radius;
			var xMax = x + radius;

			var yMin = y - radius;
			var yMax = y + radius;

			var attackTemplate = this.attackTemplate;
			if (attackTemplate)
				attackTemplate = attackTemplate.split(' ');
			var count = -1;

			for (var i = xMin; i <= xMax; i++) {
				for (var j = yMin; j <= yMax; j++) {
					count++;

					if (!physics.hasLos(x, y, i, j))
						continue;
					else if ((attackTemplate) && (attackTemplate[count] == 'x'))
						continue;

					if ((attackTemplate) && (~~attackTemplate[count] > 0)) {
						this.queueCallback(this.spawnWarning.bind(this, i, j), ~~attackTemplate[count] * 350);
						continue;
					}
					else
						this.spawnWarning(i, j);
				}
			}

			this.sendBump(target);

			return true;
		},

		spawnWarning: function(x, y) {
			var obj = this.obj;
			var syncer = obj.instance.syncer;

			var effect = {
				x: x,
				y: y,
				components: [{
					type: 'particles',
					noExplosion: true,
					ttl: this.delay * 175 / 16,
					blueprint: this.particles
				}]
			};

			console.log(this.particles);

			syncer.queue('onGetObject', effect);

			this.queueCallback(this.onWarningOver.bind(this, x, y), this.delay * 350);
		},

		onWarningOver: function(x, y) {
			var obj = this.obj;

			var physics = obj.instance.physics;
			var syncer = obj.instance.syncer;

			var effect = {
				x: x,
				y: y,
				components: [{
					type: 'attackAnimation',
					destroyObject: true,
					row: [10, 10, 10, 10, 10, 10, 10, 8, 8, 8, 7, 7, 7][~~(Math.random() * 13)],
					col: 4,
					frameDelay: 4 + ~~(Math.random() * 7)
				}]
			};

			syncer.queue('onGetObject', effect);

			var mobs = physics.getCell(x, y);
			var mLen = mobs.length;
			for (var k = 0; k < mLen; k++) {
				var m = mobs[k];

				//Maybe we killed something?
				if (!m) {
					mLen--;
					continue;
				} else if (!m.aggro)
					continue;
				else if ((!m.aggro.willAttack(this.obj)) && (!!this.obj.player == !!m.player))
					continue;

				var damage = this.getDamage(m);
				m.stats.takeDamage(damage, 1, obj);
			}
		}
	};
});