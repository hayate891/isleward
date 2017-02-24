define([

], function(

) {
	return {
		type: 'fireblast',

		targetGround: true,

		radius: 2,
		pushback: 4,

		cast: function(action) {
			var obj = this.obj;

			var radius = this.radius;

			var x = obj.x;
			var y = obj.y;

			var physics = obj.instance.physics;
			var syncer = obj.instance.syncer;

			for (var i = x - radius; i <= x + radius; i++) {
				for (var j = y - radius; j <= y + radius; j++) {
					if (!physics.hasLos(~~x, ~~y, ~~i, ~~j))
						continue;

					var effect = {
						x: i,
						y: j,
						components: [{
							type: 'particles',
							blueprint: this.particles
						}]
					};

					if ((i != x) || (j != y))
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

						if (!m.aggro)
							continue;

						var isPlayer = !!this.obj.player;
						var isTargetPlayer = !!m.player;

						if ((!this.obj.aggro.willAttack(m)) && (isPlayer == isTargetPlayer))
							continue;

						var targetEffect = m.effects.addEffect({
							type: 'stunned',
							noMsg: true
						});

						var ttl = 350;

						var targetPos = {
							x: m.x,
							y: m.y
						};

						//Find out where the mob should end up
						var dx = m.x - obj.x;
						var dy = m.y - obj.y;

						while ((dx == 0) && (dy == 0)) {
							dx = ~~(Math.random() * 2) - 1;
							dy = ~~(Math.random() * 2) - 1;
						}

						dx = ~~(dx / Math.abs(dx));
						dy = ~~(dy / Math.abs(dy));
						for (var l = 0; l < this.pushback; l++) {
							if (physics.isTileBlocking(targetPos.x + dx, targetPos.y + dy, true)) {
								if (physics.isTileBlocking(targetPos.x + dx, targetPos.y)) {
									if (physics.isTileBlocking(targetPos.x, targetPos.y + dy)) {
										break;
									} else {
										dx = 0;
										targetPos.y += dy;
									}
								} else {
									dy = 0;
									targetPos.x += dx;
								}
							} else {
								targetPos.x += dx;
								targetPos.y += dy;
							}
						}

						m.clearQueue();

						this.sendAnimation({
							id: m.id,
							components: [{
								type: 'moveAnimation',
								targetX: targetPos.x,
								targetY: targetPos.y,
								ttl: ttl
							}]
						});

						var damage = this.getDamage(m);
						m.stats.takeDamage(damage, 1, obj);

						physics.removeObject(m, m.x, m.y);

						this.queueCallback(this.endEffect.bind(this, m, targetPos, targetEffect), ttl);
					}
				}
			}

			this.sendBump({
				x: x,
				y: y - 1
			});

			return true;
		},

		endEffect: function(target, targetPos, targetEffect) {
			target.effects.removeEffect(targetEffect, true);

			target.x = targetPos.x;
			target.y = targetPos.y;

			var syncer = target.syncer;
			syncer.o.x = targetPos.x;
			syncer.o.y = targetPos.y;

			target.instance.physics.addObject(target, target.x, target.y);
		}
	};
});