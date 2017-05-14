define([

], function(

) {
	return {
		type: 'charge',

		cdMax: 20,
		manaCost: 10,
		range: 9,

		damage: 5,
		speed: 70,

		stunDuration: 15,
		needLos: true,

		cast: function(action) {
			var obj = this.obj;
			var target = action.target;

			var x = obj.x;
			var y = obj.y;

			var dx = target.x - x;
			var dy = target.y - y;

			//We need to stop just short of the target
			var offsetX = 0;
			if (dx != 0)
				offsetX = dx / Math.abs(dx);

			var offsetY = 0;
			if (dy != 0)
				offsetY = dy / Math.abs(dy);

			var targetPos = {
				x: target.x,
				y: target.y
			};

			var physics = obj.instance.physics;
			//Check where we should land
			if (!this.isTileValid(physics, x, y, targetPos.x - offsetX, targetPos.y - offsetY)) {
				if (!this.isTileValid(physics, x, y, targetPos.x - offsetX, targetPos.y)) {
					targetPos.y -= offsetY;
				} else {
					targetPos.x -= offsetX;
				}
			} else {
				targetPos.x -= offsetX;
				targetPos.y -= offsetY;
			}

			var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			var ttl = distance * this.speed;

			var targetEffect = target.effects.addEffect({
				type: 'stunned'
			});

			var selfEffect = this.obj.effects.addEffect({
				type: 'stunned',
				noMsg: true
			});

			this.sendAnimation({
				id: this.obj.id,
				components: [{
					type: 'moveAnimation',
					idTarget: target.id,
					targetX: targetPos.x,
					targetY: targetPos.y,
					ttl: ttl
				}]
			});

			if (this.animation) {
				this.obj.instance.syncer.queue('onGetObject', {
					id: this.obj.id,
					components: [{
						type: 'animation',
						template: this.animation
					}]
				});
			}

			physics.removeObject(obj, obj.x, obj.y);

			this.queueCallback(this.reachDestination.bind(this, target, targetPos, targetEffect, selfEffect), ttl - 50);

			return true;
		},
		reachDestination: function(target, targetPos, targetEffect, selfEffect) {
			if (this.obj.destroyed)
				return;

			var obj = this.obj;

			obj.x = targetPos.x;
			obj.y = targetPos.y;

			var syncer = obj.syncer;
			syncer.o.x = targetPos.x;
			syncer.o.y = targetPos.y;

			obj.instance.physics.addObject(obj, obj.x, obj.y);

			obj.effects.removeEffect(selfEffect, true);

			this.obj.aggro.move();

			if (targetEffect)
				targetEffect.ttl = this.stunDuration;

			var damage = this.getDamage(target);
			target.stats.takeDamage(damage, this.threatMult, obj);
		},

		isTileValid: function(physics, fromX, fromY, toX, toY) {
			if (physics.isTileBlocking(toX, toY))
				return false;
			else
				return physics.hasLos(fromX, fromY, toX, toY);
		}
	};
});