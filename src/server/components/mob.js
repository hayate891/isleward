define([
	'items/generator'
], function(
	itemGenerator
) {
	var abs = Math.abs.bind(Math);
	var rnd = Math.random.bind(Math);
	var max = Math.max.bind(Math);

	return {
		type: 'mob',

		target: null,

		physics: null,

		originX: 0,
		originY: 0,

		walkDistance: 1,

		init: function(blueprint) {
			this.physics = this.obj.instance.physics;

			this.originX = this.obj.x;
			this.originY = this.obj.y;
		},

		update: function() {
			var target = null;
			if (this.obj.aggro)
				target = this.obj.aggro.getHighest();
			var goHome = false;
			if (target) {
				this.fight(target);
				return;
			} else if (this.target) {
				this.target = null;
				this.obj.clearQueue();
				goHome = true;
			}

			if (this.obj.actionQueue.length > 0)
				return;

			if ((!goHome) && (rnd() < 0.85))
				return;

			var walkDistance = this.walkDistance;
			if (walkDistance <= 0)
				return;

			var obj = this.obj;

			var toX = this.originX + ~~(rnd() * (walkDistance * 2)) - walkDistance;
			var toY = this.originY + ~~(rnd() * (walkDistance * 2)) - walkDistance;

			if (!this.physics.isCellOpen(toX, toY))
				return;

			var path = this.physics.getPath({
				x: obj.x,
				y: obj.y
			}, {
				x: toX,
				y: toY
			}, false);

			var pLen = path.length;
			for (var i = 0; i < pLen; i++) {
				var p = path[i];

				obj.queue({
					action: 'move',
					data: {
						x: p.x,
						y: p.y
					}
				});
			}
		},
		fight: function(target) {
			if (this.target != target) {
				this.obj.clearQueue();
				this.target = target;
			}
			//If the target is true, it means we can't reach the target and should wait for a new one
			if (this.target == true)
				return;

			var obj = this.obj;
			var x = obj.x;
			var y = obj.y;

			var tx = ~~target.x;
			var ty = ~~target.y;

			var distance = max(abs(x - tx), abs(y - ty));
			var furthestRange = obj.spellbook.getFurthestRange();
			var doesCollide = null;
			var hasLos = null;

			if (distance <= furthestRange) {
				doesCollide = this.physics.mobsCollide(x, y, obj);
				if (!doesCollide) {
					hasLos = this.physics.hasLos(x, y, tx, ty);
					if (hasLos) {
						if (rnd() < 0.65) {
							var spell = obj.spellbook.getRandomSpell(target);
							var success = obj.spellbook.cast({
								spell: spell,
								target: target
							});
							//null means we don't have LoS
							if (success != null)
								return;
							else
								hasLos = false;
						} else
							return;
					}
				}
			}

			var targetPos = this.physics.getClosestPos(x, y, tx, ty, target);
			if (!targetPos) {
				//Find a new target
				obj.aggro.ignore(target);
				//TODO: Don't skip a turn
				return;
			}
			var newDistance = max(abs(targetPos.x - tx), abs(targetPos.y - ty));

			if ((newDistance >= distance) && (newDistance > furthestRange)) {
				if (hasLos == null)
					hasLos = this.physics.hasLos(x, y, tx, ty);
				if (hasLos) {
					if (doesCollide == null)
						doesCollide = this.physics.mobsCollide(x, y, obj);
					if (!doesCollide) {
						obj.aggro.ignore(target);
						return;
					}
				} else {
					if (doesCollide == null)
						doesCollide = this.physics.mobsCollide(x, y, obj);
					if (!doesCollide) {
						obj.aggro.ignore(target);
						return;
					}
				}
			}

			var path = this.physics.getPath({
				x: x,
				y: y
			}, {
				x: targetPos.x,
				y: targetPos.y
			});
			if (path.length == 0) {
				obj.aggro.ignore(target);
				//TODO: Don't skip a turn
				return;
			}

			var p = path[0];
			obj.queue({
				action: 'move',
				data: {
					x: p.x,
					y: p.y
				}
			});
		}
	};
});