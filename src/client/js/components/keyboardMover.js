define([
	'js/input',
	'js/system/client',
	'js/misc/physics'
], function(
	input,
	client,
	physics
) {
	return {
		type: 'keyboardMover',

		path: [],
		moveCd: 0,
		moveCdMax: 8,
		direction: {
			x: 0,
			y: 0
		},

		update: function() {
			if (input.isKeyDown('esc')) {
				client.request({
					cpn: 'player',
					method: 'queueAction',
					data: {
						action: 'clearQueue',
						priority: true
					}
				});
			}

			if (this.moveCd > 0) {
				this.moveCd--;
				return;
			}

			this.keyMove();
		},

		bump: function(dx, dy) {
			if (this.obj.pather.path.length > 0)
				return;
			
			this.obj.addComponent('bumpAnimation', {
				deltaX: dx,
				deltaY: dy
			});
		},

		keyMove: function() {
			var delta = {
				x: input.getAxis('horizontal'),
				y: input.getAxis('vertical')
			};

			if ((!delta.x) && (!delta.y))
				return;

			this.direction.x = delta.x;
			this.direction.y = delta.y;

			var newX = this.obj.pather.pathPos.x + delta.x;
			var newY = this.obj.pather.pathPos.y + delta.y;

			if (physics.isTileBlocking(~~newX, ~~newY)) {
				this.bump(delta.x, delta.y)
				return;
			}

			this.moveCd = this.moveCdMax;

			this.addQueue(newX, newY);
		},
		addQueue: function(x, y) {
			this.obj.dirty = true;

			this.obj.pather.add(x, y);

			this.obj.pather.pathPos.x = x;
			this.obj.pather.pathPos.y = y;

			client.request({
				cpn: 'player',
				method: 'move',
				data: {
					x: x,
					y: y
				}
			});
		}
	};
});